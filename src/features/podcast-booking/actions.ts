"use server";

import { db } from "@/db";
import { bookings, studios } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { createZiinaPaymentIntent } from "@/lib/ziina";
import { PODCAST_SERVICES, PODCAST_ADDONS, PODCAST_PROMO_CODES, PODCAST_STUDIOS } from "./data";
import { z } from "zod";

const podcastSessionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  durationHours: z.number().int().min(1).max(12).default(1),
  headcount: z.number().int().min(1).max(10).default(2),
  studioKey: z.string().min(1, "Studio is required"),
  serviceKey: z.string().min(1, "Service package is required"),
  addons: z.record(z.string(), z.number()).default({}),
  notes: z.string().optional(),
});

const podcastBookingInputSchema = z.object({
  sessions: z.array(podcastSessionSchema).min(1, "At least one session is required"),
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(6, "Valid phone number is required"),
  specialRequests: z.string().optional(),
  promoCode: z.string().optional(),
  initiatePayment: z.boolean().optional().default(false),
  paymentType: z.enum(["deposit", "full"]).optional().default("full"),
});

export type PodcastBookingInput = z.infer<typeof podcastBookingInputSchema>;

export interface PodcastBookingResult {
  success: boolean;
  message?: string;
  referenceCode?: string;
  bookingId?: string;
  totalAmount?: number;
  paymentUrl?: string;
}

function calculateSessionPrice(session: z.infer<typeof podcastSessionSchema>): number {
  const service = PODCAST_SERVICES.find((s) => s.key === session.serviceKey) || PODCAST_SERVICES[0];
  const serviceRate = service.price;
  const duration = Math.max(1, session.durationHours);
  const serviceCost = serviceRate * duration;

  let addonsCost = 0;
  for (const [addonKey, qty] of Object.entries(session.addons)) {
    if (qty > 0) {
      const addon = PODCAST_ADDONS.find((a) => a.key === addonKey);
      if (addon) {
        addonsCost += addon.priceNum * qty;
      }
    }
  }

  return serviceCost + addonsCost;
}

export async function createPodcastBooking(rawInput: unknown): Promise<PodcastBookingResult> {
  const parsed = podcastBookingInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, message: errorMsg || "Invalid booking details." };
  }

  const { sessions: sessionList, fullName, email, phone, specialRequests, promoCode, initiatePayment, paymentType } = parsed.data;

  // 1. Calculate server-verified total price
  let subtotal = 0;
  for (const s of sessionList) {
    subtotal += calculateSessionPrice(s);
  }

  let discount = 0;
  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    const rule = PODCAST_PROMO_CODES[code];
    if (rule) {
      if (rule.percent) {
        discount = Math.round((subtotal * rule.percent) / 100);
      } else if (rule.flat) {
        discount = Math.min(subtotal, rule.flat);
      }
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  // Generate reference POD-XXXXXX
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceCode = `POD-${randomSuffix}`;

  try {
    const primarySession = sessionList[0];
    const studioKey = primarySession.studioKey;
    const studioMeta = PODCAST_STUDIOS.find((s) => s.key === studioKey);

    // Parse scheduled date and time
    let scheduledDate = new Date();
    try {
      // Date string format YYYY-MM-DD
      const datePart = primarySession.date;
      // Time string format "5:30 PM"
      const timePart = primarySession.timeSlot;
      const [rawTime, modifier] = timePart.split(" ");
      let [hours, minutes] = rawTime.split(":").map(Number);
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      scheduledDate = new Date(`${datePart}T${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}:00`);
    } catch {
      scheduledDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    let studioDbId: string | null = null;

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      // Try to find matching studio record by slug
      const foundStudio = await db.query.studios.findFirst({
        where: or(eq(studios.slug, studioKey), eq(studios.slug, "studio-b")),
      });
      if (foundStudio) {
        studioDbId = foundStudio.id;
      }

      // Build structured notes for admin & client transparency
      const sessionsSummary = sessionList
        .map((s, idx) => {
          const svc = PODCAST_SERVICES.find((srv) => srv.key === s.serviceKey)?.title || s.serviceKey;
          const st = PODCAST_STUDIOS.find((std) => std.key === s.studioKey)?.name || s.studioKey;
          const addonsList = Object.entries(s.addons)
            .filter(([, qty]) => qty > 0)
            .map(([k, qty]) => `${k} (x${qty})`)
            .join(", ");
          return `Session ${idx + 1}: [Studio: ${st}] [Setup: ${s.headcount} seats] [Time: ${s.date} ${s.timeSlot} (${s.durationHours}h)] [Service: ${svc}] ${addonsList ? `[Addons: ${addonsList}]` : ""}`;
        })
        .join("\n");

      const contactMeta = `[Contact: ${fullName} | ${email} | ${phone}]`;
      const fullNotes = `${contactMeta}\n${sessionsSummary}\n${specialRequests ? `Special Requests: ${specialRequests}` : ""}`;

      const inserted = await db
        .insert(bookings)
        .values({
          referenceCode,
          studioId: studioDbId,
          sessionType: "podcast",
          status: "pending",
          scheduledAt: scheduledDate,
          durationHours: primarySession.durationHours,
          headcount: primarySession.headcount,
          totalAmount: grandTotal.toFixed(2),
          currency: "AED",
          paymentStatus: "unpaid",
          specialRequests: fullNotes,
        })
        .returning({ id: bookings.id });

      const bookingId = inserted[0]?.id;

      if (bookingId) {
        await issueBookingPaymentCapability(bookingId);

        let paymentUrl: string | undefined = undefined;
        if (initiatePayment) {
          const ziinaRes = await createZiinaPaymentIntent(
            bookingId,
            grandTotal,
            paymentType || "full",
            referenceCode
          );
          if (ziinaRes.success && ziinaRes.paymentUrl) {
            paymentUrl = ziinaRes.paymentUrl;
          }
        }

        return {
          success: true,
          referenceCode,
          bookingId,
          totalAmount: grandTotal,
          paymentUrl,
        };
      }
    }

    // In preview/dev mode without DB
    return {
      success: true,
      referenceCode,
      bookingId: `demo-${randomSuffix}`,
      totalAmount: grandTotal,
    };
  } catch (error) {
    console.error("createPodcastBooking error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to record podcast booking. Please try again.",
    };
  }
}
