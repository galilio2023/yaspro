"use server";

import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { db } from "@/db";
import { bookings, bookingSessions, inquiries, users, studios, studioBlackouts, type SessionType, type InquiryType } from "@/db/schema";
import { generateBookingReference } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq, and, inArray, or, isNull } from "drizzle-orm";
import { checkRateLimit, checkIdempotency, getClientIdentifier } from "@/lib/rate-limit";
import { sendBookingConfirmationNotification, sendInquiryNotification } from "@/lib/notifications";
import {
  bookingSubmissionSchema,
  inquirySubmissionSchema,
  type BookingSubmissionInput,
  type InquirySubmissionInput,
} from "./validations";

import type { StudioItem } from "@/features/booking/types";
import { STUDIOS, calculateBookingPrice } from "@/features/booking/constants";
import { getPlatformSettings } from "@/lib/actions/platform-settings-operations";

/**
 * Recalculate price server-side based on canonical pricing rules
 */
function calculateServerPrice(data: BookingSubmissionInput, selectedStudio?: StudioItem): number {
  if (typeof calculateBookingPrice === "function") {
    return calculateBookingPrice(data, selectedStudio).total;
  }
  const studio = selectedStudio || (STUDIOS || []).find((s) => s.id === data.studioId) || (STUDIOS || [])[0];
  const studioRate = studio ? studio.rate : 800;
  return studioRate * (data.durationHours || 1);
}

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  warning?: string;
  referenceCode?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

export async function createBooking(rawInput: unknown): Promise<ActionResponse<{ bookingId?: string }>> {
  const clientId = await getClientIdentifier();

  // 1. Rate limit by client IP: max 5 booking attempts per 10 minutes
  const rateLimit = checkRateLimit(`booking:${clientId}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many booking requests. Please wait ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} before submitting another reservation.`,
    };
  }

  const parsed = bookingSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid booking submission. Please check all required fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // 2. Idempotency guard: block duplicate identical submission from same email & studio within 60 seconds
  const idempotencyKey = `booking:${data.email.toLowerCase()}:${data.studioId}:${data.scheduledAt}`;
  if (!checkIdempotency(idempotencyKey, 60_000)) {
    return {
      success: false,
      message: "A booking with these details is already being processed. Please check your email or wait a moment.",
    };
  }

  const referenceCode = generateBookingReference();

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      // Resolve CMS IDs from the wizard and slugs from existing booking links.
      const selectedSlug = data.studioId || "studio-a";
      const isStudioUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedSlug);
      const studioRecord = await db.query.studios.findFirst({
        where: isStudioUuid ? eq(studios.id, selectedSlug) : eq(studios.slug, selectedSlug),
      });

      if (!studioRecord || studioRecord.isActive === false) {
        return { success: false, message: "This studio is no longer available. Please select another studio." };
      }
      const calculatedTotal = calculateServerPrice(data, {
        id: studioRecord.id,
        slug: studioRecord.slug,
        name: studioRecord.name,
        desc: studioRecord.description || "",
        rate: Number(studioRecord.hourlyRate),
      });

      // 4. Overlap & Conflict Check: Prevent double-booking for the same studio stage
      if (studioRecord?.id) {
        const requestedStart = new Date(data.scheduledAt || Date.now());
        const requestedEnd = new Date(requestedStart.getTime() + data.durationHours * 60 * 60 * 1000);

        if (requestedStart.getTime() < Date.now() - 60 * 60 * 1000) {
          return { success: false, message: "Please choose a session time in the future." };
        }

        // Fetch active bookings for this studio
        const existingBookings = await db
          .select({
            id: bookings.id,
            scheduledAt: bookingSessions.scheduledAt,
            durationHours: bookingSessions.durationHours,
            status: bookings.status,
            paymentStatus: bookings.paymentStatus,
            paymentReference: bookings.paymentReference,
            createdAt: bookings.createdAt,
          })
          .from(bookings)
          .innerJoin(bookingSessions, eq(bookingSessions.bookingId, bookings.id))
          .where(
            and(
              eq(bookingSessions.studioId, studioRecord.id),
              inArray(bookings.status, ["confirmed", "pending"])
            )
          );

        // Unpaid, untouched "pending" holds expire after 2 hours so spam cannot lock the calendar.
        const HOLD_TTL_MS = 2 * 60 * 60 * 1000;
        const isStaleHold = (b: (typeof existingBookings)[number]) =>
          b.status === "pending" &&
          b.paymentStatus === "unpaid" &&
          !b.paymentReference &&
          b.createdAt instanceof Date &&
          Date.now() - b.createdAt.getTime() > HOLD_TTL_MS;

        // Fetch platform settings for turnaround buffer
        let turnaroundBufferMs = 0;
        try {
          const settings = await getPlatformSettings();
          if (settings.turnaroundBufferMinutes && settings.turnaroundBufferMinutes > 0) {
            turnaroundBufferMs = settings.turnaroundBufferMinutes * 60 * 1000;
          }
        } catch {
          // Fall back gracefully if settings table is read during bootstrapping
        }

        // Check if any existing active booking overlaps with [requestedStart, requestedEnd] including buffer
        const hasConflict = existingBookings.some((b) => {
          if (isStaleHold(b)) return false;
          const bookedStart = new Date(b.scheduledAt);
          const bookedEndWithBuffer = new Date(bookedStart.getTime() + b.durationHours * 60 * 60 * 1000 + turnaroundBufferMs);
          const requestedEndWithBuffer = new Date(requestedEnd.getTime() + turnaroundBufferMs);
          return requestedStart < bookedEndWithBuffer && requestedEndWithBuffer > bookedStart;
        });

        if (hasConflict) {
          return {
            success: false,
            message: `This soundstage (${studioRecord.name || selectedSlug}) is already reserved during your selected time window (or is within the required stage reset turnaround buffer). Please select an alternate time slot or choose another studio.`,
          };
        }

        // Check for active maintenance or studio blackout windows
        if (typeof db.select === "function") {
          try {
            const activeBlackouts = await db
              .select({
                id: studioBlackouts.id,
                title: studioBlackouts.title,
                startTime: studioBlackouts.startTime,
                endTime: studioBlackouts.endTime,
              })
              .from(studioBlackouts)
              .where(
                or(
                  eq(studioBlackouts.studioId, studioRecord.id),
                  isNull(studioBlackouts.studioId)
                )
              );

            const hasBlackoutConflict = activeBlackouts.some((b) => {
              const bStart = new Date(b.startTime);
              const bEnd = new Date(b.endTime);
              return requestedStart < bEnd && requestedEnd > bStart;
            });

            if (hasBlackoutConflict) {
              return {
                success: false,
                message: `This soundstage (${studioRecord.name || selectedSlug}) is temporarily closed for maintenance or blackout during your selected time window. Please choose another date or stage.`,
              };
            }
          } catch (blackoutErr) {
            if (typeof console.warn === "function") {
              console.warn("[createBooking] Blackout check failed:", (blackoutErr as Error)?.message);
            }
            return { success: false, message: "Unable to verify studio availability. Please try again later." };
          }
        }
      }

      // Only a verified session can attach a booking to an account.
      const session = await auth.api.getSession({ headers: await headers() });
      const resolvedUserId = session?.user?.id || null;

      // 6. Create booking with the resolved studio UUID
      const allSelectedEquipmentIds = [
        ...(data.selectedCrewEquipmentIds || []),
        ...(data.selectedGearPackage && data.selectedGearPackage !== "none" ? [data.selectedGearPackage] : []),
      ];

      const catalogNotes = [
        data.selectedCrewEquipmentIds?.length ? `Crew/Equip: [${data.selectedCrewEquipmentIds.join(", ")}]` : "",
        data.selectedPropIds?.length ? `Props: [${data.selectedPropIds.join(", ")}]` : "",
        data.selectedAddonIds?.length ? `Addons: [${data.selectedAddonIds.join(", ")}]` : "",
      ].filter(Boolean).join(" | ");

      const combinedSpecialRequests = resolvedUserId
        ? (catalogNotes ? `[${catalogNotes}] ${data.specialRequests || ""}`.trim() : data.specialRequests)
        : `[Contact: ${data.firstName} ${data.lastName} | ${data.email} | ${data.phone} | ${data.company || ""}]${catalogNotes ? ` [${catalogNotes}]` : ""} ${data.specialRequests || ""}`.trim();

      const [newBooking] = await db
        .insert(bookings)
        .values({
          referenceCode,
          userId: resolvedUserId,
          studioId: studioRecord?.id,
          sessionType: data.sessionType as SessionType,
          scheduledAt: new Date(data.scheduledAt || Date.now()),
          durationHours: data.durationHours,
          headcount: data.headcount,
          equipmentIds: allSelectedEquipmentIds,
          crewNotes: catalogNotes || null,
          needsEditing: data.needsEditing,
          needsColorGrading: data.needsColorGrading,
          needsSoundMastering: data.needsSoundMastering,
          propsNotes: data.propsNotes,
          specialRequests: combinedSpecialRequests,
          totalAmount: calculatedTotal.toFixed(2),
          status: "pending",
        })
        .returning();

      if (!resolvedUserId && newBooking?.id) {
        await issueBookingPaymentCapability(newBooking.id);
      }
      revalidatePath("/studio-booking");

      // Dispatch automated Call Sheet notification
      try {
        await sendBookingConfirmationNotification(
          {
            referenceCode,
            totalAmount: calculatedTotal.toFixed(2),
            scheduledAt: new Date(data.scheduledAt || Date.now()),
            durationHours: data.durationHours,
            sessionType: data.sessionType,
            propsNotes: data.propsNotes,
            specialRequests: data.specialRequests,
          },
          data.email
        );
      } catch (notifyErr) {
        console.error("Booking notification dispatch error:", notifyErr);
      }

      return {
        success: true,
        referenceCode,
        message: "Your studio session request has been received. Complete the payment to confirm your slot.",
        data: { bookingId: newBooking?.id },
      };
    }

    // Without a database nothing can be saved: never report a fake success in production.
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        message: "Booking is temporarily unavailable. Please contact our concierge directly.",
      };
    }
    return {
      success: true,
      referenceCode,
      message: "Booking received in preview mode.",
    };
  } catch (error) {
    console.error("Booking error:", error);
    return {
      success: false,
      message: "We encountered an issue saving your booking reservation. Please try again or contact our concierge directly.",
    };
  }
}

export async function submitInquiry(rawInput: unknown): Promise<ActionResponse> {
  const clientId = await getClientIdentifier();

  // Rate limit: max 5 inquiries per 10 minutes per IP
  const rateLimit = checkRateLimit(`inquiry:${clientId}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many inquiry requests. Please wait ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} before submitting another message.`,
    };
  }

  const parsed = inquirySubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please ensure all required contact fields are properly filled.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Idempotency: block duplicate identical inquiry from same email within 60s
  const idempotencyKey = `inquiry:${data.email.toLowerCase()}:${data.inquiryType}:${data.message.slice(0, 50)}`;
  if (!checkIdempotency(idempotencyKey, 60_000)) {
    return {
      success: false,
      message: "Your inquiry is already being processed by our team. Please wait a few moments.",
    };
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.insert(inquiries).values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        inquiryType: data.inquiryType as InquiryType,
        message: data.message,
      });
    }

    revalidatePath("/contact");

    // Dispatch automated lead notification to studio operations
    try {
      await sendInquiryNotification({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        inquiryType: data.inquiryType,
        message: data.message,
      });
    } catch (notifyErr) {
      console.error("Inquiry notification error:", notifyErr);
    }

    return {
      success: true,
      message: "Thank you! Our production team will contact you within 24 hours.",
    };
  } catch (error) {
    console.error("Inquiry error:", error);
    return {
      success: false,
      message: "We could not send your message. Please try again or contact our concierge directly.",
    };
  }
}

/**
 * Synchronize registered user profile info directly into the users table
 */
export async function syncUserProfile(input: {
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  role?: "client";
}): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const targetUserId = session?.user?.id;
    if (!targetUserId) {
      return { success: false, message: "Unauthorized: Active session required." };
    }
    const name = input.name?.trim();
    if (name !== undefined && !name) {
      return { success: false, message: "Name cannot be empty." };
    }

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (name !== undefined) updateData.name = name;
      if (input.phone !== undefined) updateData.phone = input.phone.trim() || null;
      if (input.company !== undefined) updateData.company = input.company.trim() || null;

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, targetUserId));
    }
    revalidatePath("/account");
    return { success: true, message: "Profile information synchronized in database." };
  } catch (err) {
    console.error("syncUserProfile error:", err);
    return { success: false, message: "Failed to synchronize profile details." };
  }
}

export { type BookingSubmissionInput, type InquirySubmissionInput };
