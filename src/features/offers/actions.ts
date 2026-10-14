"use server";

import { db } from "@/db";
import { bookings, studios } from "@/db/schema";
import { eq } from "drizzle-orm";
import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { createZiinaPaymentIntent } from "@/lib/ziina";
import { OFFERS_AND_BUNDLES, OFFERS_PROMO_CODES } from "./data";
import { z } from "zod";

const offersBookingSchema = z.object({
  offerId: z.string().min(1, "Offer or Bundle selection is required"),
  date: z.string().min(1, "Booking date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
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

    // Calculate Pricing with UAE VAT (5%)
    let basePrice = offer.price;
    let discount = 0;

    if (validated.promoCode) {
      const promo = OFFERS_PROMO_CODES[validated.promoCode.toUpperCase().trim()];
      if (promo) {
        if (promo.discountPercent) {
          discount = Math.round((basePrice * promo.discountPercent) / 100);
        } else if (promo.discountAmount) {
          discount = Math.min(basePrice, promo.discountAmount);
        }
      }
    }

    const subtotalAfterDiscount = Math.max(0, basePrice - discount);
    const vatRate = 0.05;
    const vatAmount = Math.round(subtotalAfterDiscount * vatRate * 100) / 100;
    const grandTotal = Math.round((subtotalAfterDiscount + vatAmount) * 100) / 100;

    // Generate readable reference code: YAS-OFR-XXXXXX
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referenceCode = `YAS-OFR-${randomHex}`;

    // Scheduled timestamp
    const scheduledAt = new Date(`${validated.date}T12:00:00Z`);

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

    let bookingId: string | undefined;

    // Save to database
    try {
      const [newBooking] = await db
        .insert(bookings)
        .values({
          referenceCode,
          studioId: studioId || undefined,
          sessionType: offer.category === "bundle" ? "commercial" : "video_production",
          status: "pending",
          scheduledAt,
          durationHours: offer.hours,
          headcount: 2,
          specialRequests: specialNotesCombined,
          totalAmount: grandTotal.toFixed(2),
          currency: "AED",
          paymentStatus: "unpaid",
        })
        .returning({ id: bookings.id });

      if (newBooking) {
        bookingId = newBooking.id;
      }
    } catch (dbError) {
      console.error("Database insert error in submitOffersBooking:", dbError);
      // Generate a mock UUID fallback if db is not connected
      bookingId = crypto.randomUUID();
    }

    // Ziina Payment Intent
    let paymentUrl: string | undefined;
    if (validated.initiatePayment && bookingId) {
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
          console.warn("Ziina payment intent generation warning:", ziinaRes.error);
        }
      } catch (payErr) {
        console.error("Error creating Ziina payment intent for offer:", payErr);
      }
    }

    return {
      success: true,
      referenceCode,
      bookingId,
      totalAmount: grandTotal,
      paymentUrl,
    };
  } catch (error) {
    console.error("Error submitting offer booking:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message || "Validation failed." };
    }
    return { success: false, message: "Failed to submit booking. Please try again." };
  }
}
