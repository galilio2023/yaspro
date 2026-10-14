"use server";

import { db } from "@/db";
import { bookings, offerClaims } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { createZiinaPaymentIntent } from "@/lib/ziina";
import { OFFERS_AND_BUNDLES, STANDARD_TIME_SLOTS } from "./data";
import { randomUUID } from "node:crypto";
import { OffersPromoError, resolveOffersPromo } from "./promo-codes";
import { getOffersDiscount } from "./pricing";
import type { AppliedOffersPromo } from "./types";
import { z } from "zod";

const offersBookingSchema = z.object({
  offerId: z.string().min(1, "Offer or Bundle selection is required"),
  date: z.iso.date("Booking date must be a valid YYYY-MM-DD date").refine(
    (date) => date >= new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 10),
    "Booking date cannot be in the past.",
  ),
  timeSlot: z.string().regex(/^(1[0-2]|[1-9]):([0-5]\d) (AM|PM)$/, "Invalid time slot format."),
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(6, "Valid phone number is required"),
  company: z.string().optional(),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional(),
  initiatePayment: z.boolean().optional().default(false),
});

export type OffersBookingInput = z.infer<typeof offersBookingSchema>;

export interface OffersBookingResult {
  success: boolean;
  message?: string;
  referenceCode?: string;
  bookingId?: string;
  totalAmount?: number;
  paymentUrl?: string;
  paymentFailed?: boolean;
}

export async function submitOffersBooking(input: OffersBookingInput): Promise<OffersBookingResult> {
  try {
    const validated = offersBookingSchema.parse(input);
    const offer = OFFERS_AND_BUNDLES.find((o) => o.id === validated.offerId);

    if (!offer) {
      return { success: false, message: "The selected offer or bundle is invalid." };
    }

    const allowedSlots = offer.restrictedHours?.slots.length ? offer.restrictedHours.slots : STANDARD_TIME_SLOTS;
    if (!allowedSlots.includes(validated.timeSlot)) {
      return { success: false, message: "The selected time slot is not available for this offer." };
    }
    const dayOfWeek = new Date(`${validated.date}T00:00:00Z`).getUTCDay();
    if (offer.restrictedDays?.length && !offer.restrictedDays.includes(dayOfWeek)) {
      return { success: false, message: "The selected day is not available for this offer." };
    }

    const toMinutes = (slot: string) => {
      const [time, period] = slot.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      return (hours % 12 + (period === "PM" ? 12 : 0)) * 60 + minutes;
    };
    const slotMinutes = toMinutes(validated.timeSlot);
    if (offer.restrictedHours && (
      slotMinutes < toMinutes(offer.restrictedHours.start) ||
      slotMinutes >= toMinutes(offer.restrictedHours.end)
    )) {
      return { success: false, message: "The selected time is outside this offer's available hours." };
    }
    const hours = String(Math.floor(slotMinutes / 60)).padStart(2, "0");
    const minutes = String(slotMinutes % 60).padStart(2, "0");
    const scheduledAt = new Date(`${validated.date}T${hours}:${minutes}:00+04:00`);
    const referenceCode = `YAS-OFR-${randomUUID().toUpperCase()}`;

    // Find default studio for offers / stage allocation
    let studioId: string | undefined;
    try {
      const defaultStudio = await db.query.studios.findFirst();
      if (defaultStudio) {
        studioId = defaultStudio.id;
      }
    } catch (err) {
      console.warn("Could not fetch default studio from DB:", err);
    }

    const specialNotesCombined = [
      `Package: ${offer.name} (${offer.hours} hrs)`,
      `Client: ${validated.firstName} ${validated.lastName}`,
      `Company: ${validated.company || "N/A"}`,
      `Slot: ${validated.timeSlot}`,
      validated.specialRequests ? `Special Requests: ${validated.specialRequests}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    // Serialize redemptions for a code and save its usage with the booking.
    // A failed insert rolls back the transaction and cannot produce a success.
    const { bookingId, grandTotal } = await db.transaction(async (tx) => {
      let promo: AppliedOffersPromo | null = null;
      if (validated.promoCode) {
        const code = validated.promoCode.trim().toUpperCase();
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`offers-promo:${code}`}))`);
        promo = await resolveOffersPromo(code, offer.id,
          (promoCode) => tx.$count(bookings, eq(bookings.promoCode, promoCode)));
      }
      const discount = getOffersDiscount(offer.price, promo);
      const subtotal = Math.max(0, offer.price - discount);
      const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
      const grandTotal = Math.round((subtotal + vatAmount) * 100) / 100;

      const [newBooking] = await tx
        .insert(bookings)
        .values({
          referenceCode,
          studioId,
          sessionType: offer.category === "bundle" ? "commercial" : "video_production",
          status: "pending",
          scheduledAt,
          durationHours: offer.hours,
          headcount: 2,
          specialRequests: specialNotesCombined,
          totalAmount: grandTotal.toFixed(2),
          currency: "AED",
          paymentStatus: "unpaid",
          promoCode: promo?.code,
        })
        .returning({ id: bookings.id });
      if (!newBooking?.id) throw new Error("Booking insert did not return an ID.");

      // Record in dedicated offer_claims table if available in DB (isolated savepoint)
      try {
        if (offerClaims && tx.insert) {
          const insertPayload = {
            referenceCode,
            offerId: offer.id,
            offerTitle: offer.name,
            offerCategory: (offer.category === "bundle" ? "bundle" : "special") as "bundle" | "special",
            sessionsCount: 1,
            sessionsSchedule: [
              {
                position: 1,
                date: validated.date,
                timeSlot: validated.timeSlot,
                studioId: studioId || "studio-a",
                notes: validated.specialRequests,
              },
            ],
            name: `${validated.firstName} ${validated.lastName}`,
            email: validated.email,
            phone: validated.phone,
            company: validated.company || null,
            notes: validated.specialRequests || null,
            originalPrice: offer.price.toFixed(2),
            discountAmount: discount.toFixed(2),
            totalAmount: grandTotal.toFixed(2),
            currency: "AED",
            promoCode: promo?.code || null,
            status: "pending" as const,
            paymentStatus: "unpaid",
          };

          if (typeof tx.transaction === "function") {
            await tx.transaction(async (subTx) => {
              await subTx.insert(offerClaims).values(insertPayload);
            });
          } else {
            await tx.insert(offerClaims).values(insertPayload);
          }
        }
      } catch {
        // Ignored if offerClaims table isn't migrated yet or mock isn't provided
      }

      return { bookingId: newBooking.id, grandTotal };
    });

    // Ziina Payment Intent
    let paymentUrl: string | undefined;
    let paymentFailed = false;
    if (validated.initiatePayment) {
      try {
        await issueBookingPaymentCapability(bookingId);
        const ziinaRes = await createZiinaPaymentIntent(
          bookingId,
          grandTotal,
          "full",
          referenceCode
        );

        if (ziinaRes.success && ziinaRes.paymentUrl) {
          paymentUrl = ziinaRes.paymentUrl;
        } else {
          paymentFailed = true;
          console.warn("Ziina payment intent generation warning:", ziinaRes.error);
        }
      } catch (payErr) {
        paymentFailed = true;
        console.error("Error creating Ziina payment intent for offer:", payErr);
      }
    }

    return {
      success: true,
      referenceCode,
      bookingId,
      totalAmount: grandTotal,
      paymentUrl,
      paymentFailed,
    };
  } catch (error) {
    console.error("Error submitting offer booking:", error);
    if (error instanceof OffersPromoError) return { success: false, message: error.message };
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message || "Validation failed." };
    }
    return { success: false, message: "Failed to submit booking. Please try again." };
  }
}

export async function validateOffersPromoCode(code: string, offerId: string): Promise<{
  success: boolean;
  promo?: AppliedOffersPromo;
  message?: string;
}> {
  try {
    const input = z.object({ code: z.string().trim().min(1), offerId: z.string().min(1) }).parse({ code, offerId });
    if (!OFFERS_AND_BUNDLES.some((offer) => offer.id === input.offerId)) {
      return { success: false, message: "The selected offer or bundle is invalid." };
    }
    const promo = await resolveOffersPromo(input.code, input.offerId,
      (promoCode) => db.$count(bookings, eq(bookings.promoCode, promoCode)));
    return { success: true, promo };
  } catch (error) {
    return { success: false, message: error instanceof OffersPromoError ? error.message : "Unable to validate promotional code. Please try again." };
  }
}
