"use server";

import { db } from "@/db";
import { bookings, bookingSessions, studios, studioBlackouts, promoCodes } from "@/db/schema";
import { eq, or, isNull, sql } from "drizzle-orm";
import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { createZiinaPaymentIntent, getBookingPaymentQuote } from "@/lib/ziina";
import { PODCAST_SERVICES, PODCAST_PROMO_CODES } from "./data";
import { getCmsPodcastSets, getCmsPodcastAddons, getCmsPodcastServices } from "@/lib/actions/podcast-operations";
import type { PodcastAddon, PodcastService } from "./types";
import { z } from "zod";

const podcastSessionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  durationHours: z.number().int().min(1).max(12).default(1),
  headcount: z.number().int().min(1).max(10).default(2),
  studioKey: z.string().min(1, "Invalid studio"),
  serviceKey: z.string().min(1, "Invalid service package"),
  addons: z.record(z.string(), z.number().int().min(0)).default({}),
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
  paymentFailed?: boolean;
}

export async function resolvePodcastPromoRule(
  rawCode: string
): Promise<{ code: string; percent?: number; flat?: number; label?: string } | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("ep-xxx") &&
    promoCodes &&
    typeof db.select === "function"
  ) {
    try {
      const rows = await db.select().from(promoCodes).where(sql`lower(${promoCodes.code}) = ${code.toLowerCase()}`);
      const row = Array.isArray(rows) ? rows[0] : undefined;
      if (row) {
        if (row.isActive === false || row.eligibleOfferIds?.length) return null;
        if (row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now()) return null;
        if (row.maxUses != null && typeof db.$count === "function") {
          const used = await db.$count(bookings, eq(bookings.promoCode, code));
          if (used >= row.maxUses) return null;
        }
        return {
          code,
          percent: row.discountPercent ?? undefined,
          flat: row.discountAmount ? Number(row.discountAmount) : undefined,
          label: row.label ?? `${code} Applied`,
        };
      }
    } catch {
      // Fall back to static PODCAST_PROMO_CODES
    }
  }

  const staticRule = PODCAST_PROMO_CODES[code];
  if (staticRule) {
    return {
      code,
      percent: staticRule.percent,
      flat: staticRule.flat,
      label: staticRule.percent
        ? `${staticRule.percent}% Discount Applied`
        : staticRule.flat
          ? `AED ${staticRule.flat} Discount Applied`
          : `${code} Applied`,
    };
  }
  return null;
}

function calculateSessionPrice(
  session: z.infer<typeof podcastSessionSchema>,
  addons: PodcastAddon[],
  services: PodcastService[] = PODCAST_SERVICES
): number {
  const service = services.find((s) => s.key === session.serviceKey) ?? PODCAST_SERVICES.find((s) => s.key === session.serviceKey);
  const serviceRate = service?.price ?? 0;
  const duration = Math.max(1, session.durationHours);
  const serviceCost = serviceRate * duration;

  let addonsCost = 0;
  for (const [addonKey, qty] of Object.entries(session.addons)) {
    if (qty > 0) {
      const addon = addons.find((a) => a.key === addonKey);
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

  const [catalogStudios, catalogAddons, catalogServices] = await Promise.all([
    getCmsPodcastSets(),
    getCmsPodcastAddons(),
    typeof getCmsPodcastServices === "function" ? getCmsPodcastServices() : Promise.resolve(PODCAST_SERVICES),
  ]);
  for (const session of sessionList) {
    const studio = catalogStudios.find((item) => item.key === session.studioKey);
    if (!studio || studio.isAvailable === false) {
      return { success: false, message: "The selected studio is unavailable. Please select another studio." };
    }
    if (studio.seats < session.headcount) {
      return { success: false, message: "The selected studio cannot fit all guests." };
    }
    const service = catalogServices.find((item) => item.key === session.serviceKey);
    if (!service || service.isActive === false) {
      return { success: false, message: "Invalid service package" };
    }
    for (const [key, quantity] of Object.entries(session.addons)) {
      const addon = catalogAddons.find((item) => item.key === key);
      if (!addon || (quantity > 0 && addon.isActive === false)) {
        return { success: false, message: "The selected add-on is unavailable." };
      }
      if (!/reel|cover|hour|minute/.test(addon.unit) && quantity > 1) {
        return { success: false, message: "This add-on allows a maximum quantity of one" };
      }
    }
  }

  // 1. Calculate server-verified total price
  let subtotal = 0;
  for (const s of sessionList) {
    subtotal += calculateSessionPrice(s, catalogAddons, catalogServices);
  }

  let discount = 0;
  let resolvedPromoCode: string | undefined = undefined;
  if (promoCode) {
    const rule = await resolvePodcastPromoRule(promoCode);
    if (!rule) {
      return { success: false, message: "Invalid or expired promo code. Please review your booking." };
    }
    resolvedPromoCode = rule.code;
    if (rule.percent) {
      discount = Math.round((subtotal * rule.percent) / 100);
    } else if (rule.flat) {
      discount = Math.min(subtotal, rule.flat);
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  // Generate reference POD-XXXXXX
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceCode = `POD-${randomSuffix}`;

  try {
    const primarySession = sessionList[0];
    const parseScheduledDate = (session: (typeof sessionList)[number]) => {
      try {
        const [rawTime, modifier] = session.timeSlot.split(" ");
        const [hour, minutes] = rawTime.split(":").map(Number);
        let hours = hour;
        if (!/^(?:[1-9]|1[0-2]):[0-5][0-9] (?:AM|PM)$/.test(session.timeSlot)) {
          throw new Error("Invalid time slot");
        }
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        const scheduledDate = new Date(`${session.date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+04:00`);
        if (Number.isNaN(scheduledDate.getTime())) throw new Error("Invalid date");
        return scheduledDate;
      } catch {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
    };

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const schedule: Omit<typeof bookingSessions.$inferInsert, "bookingId">[] = [];
      for (const [index, session] of sessionList.entries()) {
        const foundStudio = await db.query.studios.findFirst({
          where: eq(studios.slug, session.studioKey),
        });
        const studioDbId = foundStudio?.id;
        if (!studioDbId || foundStudio.isActive === false) {
          return { success: false, message: "The selected studio is unavailable. Please select another studio." };
        }
        if (foundStudio.capacity < session.headcount) {
          return { success: false, message: "The selected studio cannot fit all guests." };
        }
        const sessionStart = parseScheduledDate(session);
        const sessionEnd = new Date(sessionStart.getTime() + session.durationHours * 60 * 60 * 1000);

        if (typeof db.select === "function") {
          try {
            const blackouts = await db
              .select({
                id: studioBlackouts.id,
                startTime: studioBlackouts.startTime,
                endTime: studioBlackouts.endTime,
              })
              .from(studioBlackouts)
              .where(
                or(
                  eq(studioBlackouts.studioId, studioDbId),
                  eq(studioBlackouts.podcastSetId, session.studioKey),
                  isNull(studioBlackouts.studioId)
                )
              );

            const hasBlackout = blackouts.some((b) => {
              const bStart = new Date(b.startTime);
              const bEnd = new Date(b.endTime);
              return sessionStart < bEnd && sessionEnd > bStart;
            });

            if (hasBlackout) {
              return {
                success: false,
                message: `The selected studio (${foundStudio.name || session.studioKey}) has a scheduled maintenance or blackout window at that time. Please pick another date or time slot.`,
              };
            }
          } catch (blackoutErr) {
            if (typeof console.warn === "function") {
              console.warn("[createPodcastBooking] Blackout check failed:", (blackoutErr as Error)?.message);
            }
            return { success: false, message: "Unable to verify studio availability. Please try again later." };
          }
        }

        schedule.push({
          studioId: studioDbId,
          position: index + 1,
          scheduledAt: sessionStart,
          durationHours: session.durationHours,
          headcount: session.headcount,
        });
      }

      // Build structured notes for admin & client transparency
      const sessionsSummary = sessionList
        .map((s, idx) => {
          const svc = catalogServices.find((srv) => srv.key === s.serviceKey)?.title || PODCAST_SERVICES.find((srv) => srv.key === s.serviceKey)?.title || s.serviceKey;
          const st = catalogStudios.find((std) => std.key === s.studioKey)?.name || s.studioKey;
          const addonsList = Object.entries(s.addons)
            .filter(([, qty]) => qty > 0)
            .map(([k, qty]) => `${k} (x${qty})`)
            .join(", ");
          return `Session ${idx + 1}: [Studio: ${st}] [Setup: ${s.headcount} seats] [Time: ${s.date} ${s.timeSlot} (${s.durationHours}h)] [Service: ${svc}] ${addonsList ? `[Addons: ${addonsList}]` : ""}`;
        })
        .join("\n");

      const contactMeta = `[Contact: ${fullName} | ${email} | ${phone}]`;
      const fullNotes = `${contactMeta}\n${sessionsSummary}\n${specialRequests ? `Special Requests: ${specialRequests}` : ""}`;

      const bookingId = await db.transaction(async (tx) => {
        const [inserted] = await tx.insert(bookings).values({
          referenceCode,
          studioId: schedule[0].studioId,
          sessionType: "podcast",
          status: "pending",
          scheduledAt: schedule[0].scheduledAt,
          durationHours: primarySession.durationHours,
          headcount: primarySession.headcount,
          totalAmount: grandTotal.toFixed(2),
          currency: "AED",
          paymentStatus: "unpaid",
          promoCode: resolvedPromoCode ?? null,
          specialRequests: fullNotes,
        }).returning({ id: bookings.id });
        if (!inserted) throw new Error("Failed to save booking.");
        // The database trigger stores session 1 for every studio booking.
        if (schedule.length > 1) {
          await tx.insert(bookingSessions).values(schedule.slice(1).map((session) => ({
            ...session,
            bookingId: inserted.id,
          })));
        }
        return inserted.id;
      });

      if (bookingId) {
        await issueBookingPaymentCapability(bookingId);

        let paymentUrl: string | undefined = undefined;
        if (initiatePayment) {
          const { quote, error } = await getBookingPaymentQuote(bookingId, referenceCode);
          const option = quote?.options.find((option) => option.type === paymentType);
          const ziinaRes = quote && option
            ? await createZiinaPaymentIntent(
                bookingId,
                { paymentStatus: quote.paymentStatus, amountAed: option.amountAed },
                option.type,
                referenceCode
              )
            : { success: false, error: error || "Payment option is unavailable." };
          if (!ziinaRes.success) {
            return {
              success: false,
              paymentFailed: true,
              bookingId,
              referenceCode,
              totalAmount: grandTotal,
              message: `Your reservation is saved but unpaid. ${ziinaRes.error || ziinaRes.message || "Payment could not be started. Please contact the concierge."}`,
            };
          }
          if (ziinaRes.paymentUrl) {
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
