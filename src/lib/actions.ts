"use server";

import { issueBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { db } from "@/db";
import {
  bookings,
  bookingSessions,
  inquiries,
  campaignInquiries,
  users,
  studios,
  promoCodes,
  type SessionType,
  type InquiryType,
  type InquiryPillar,
} from "@/db/schema";
import { generateBookingReference } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { checkRateLimit, checkIdempotency, getClientIdentifier } from "@/lib/rate-limit";
import { sendBookingConfirmationNotification, sendInquiryNotification } from "@/lib/notifications";
import {
  bookingSubmissionSchema,
  inquirySubmissionSchema,
  campaignRequestSchema,
  serviceInquirySubmissionSchema,
  type BookingSubmissionInput,
  type InquirySubmissionInput,
  type CampaignRequestInput,
  type ServiceInquirySubmissionInput,
} from "./validations";

import type { StudioItem } from "@/features/booking/types";
import { STUDIOS, calculateBookingPrice } from "@/features/booking/constants";

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
      let studioRecord = await db.query.studios.findFirst({
        where: isStudioUuid ? eq(studios.id, selectedSlug) : eq(studios.slug, selectedSlug),
      });

      if (!studioRecord) {
        // Try finding by name or fallback to first studio if using catalog integer ID
        const matchedStudio = (STUDIOS || []).find((s) => s.id === selectedSlug || s.slug === selectedSlug);
        if (matchedStudio) {
          const matchSlug = matchedStudio.slug || "studio-a";
          studioRecord = await db.query.studios.findFirst({
            where: eq(studios.slug, matchSlug),
          });
        }
      }

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

        // Check if any existing active booking overlaps with [requestedStart, requestedEnd]
        const hasConflict = existingBookings.some((b) => {
          if (isStaleHold(b)) return false;
          const bookedStart = new Date(b.scheduledAt);
          const bookedEnd = new Date(bookedStart.getTime() + b.durationHours * 60 * 60 * 1000);
          return requestedStart < bookedEnd && requestedEnd > bookedStart;
        });

        if (hasConflict) {
          return {
            success: false,
            message: `This soundstage (${studioRecord.name || selectedSlug}) is already reserved during your selected time window. Please select an alternate time slot or choose another studio.`,
          };
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

      // Map numerical sessionType IDs or strings to valid SessionType enum values
      const sessionTypeMap: Record<string, SessionType> = {
        "98": "photography",
        "95": "video_production",
        "84": "commercial",
        "100": "podcast",
        "podcast": "podcast",
        "video_production": "video_production",
        "photography": "photography",
        "interview": "interview",
        "commercial": "commercial",
        "music_video": "music_video",
      };
      const resolvedSessionType = sessionTypeMap[data.sessionType] || "video_production";

      const [newBooking] = await db
        .insert(bookings)
        .values({
          referenceCode,
          userId: resolvedUserId,
          studioId: studioRecord?.id,
          sessionType: resolvedSessionType,
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

export async function submitInfluencerCampaignRequest(rawInput: unknown): Promise<ActionResponse> {
  const clientId = await getClientIdentifier();

  // Rate limit: max 5 campaign briefs per 10 minutes per IP
  const rateLimit = checkRateLimit(`campaign:${clientId}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many collaboration requests. Please wait ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} before submitting another brief.`,
    };
  }

  const parsed = campaignRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please complete all required fields for the collaboration brief.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Idempotency: block duplicate identical campaign request within 60s
  const idempotencyKey = `campaign:${data.email.toLowerCase()}:${data.creatorId}:${data.brandName.toLowerCase()}`;
  if (!checkIdempotency(idempotencyKey, 60_000)) {
    return {
      success: false,
      message: "A collaboration request for this brand and creator is already submitted. Our talent team is reviewing it.",
    };
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      try {
        if (campaignInquiries && typeof db.insert === "function") {
          await db.insert(campaignInquiries).values({
            pillar: "influencers",
            targetId: data.creatorId,
            targetName: data.creatorName,
            name: data.contactName,
            email: data.email,
            phone: data.phone,
            company: data.brandName,
            budgetRange: data.budgetTier,
            message: `[Influencer Campaign RFP for ${data.creatorName}]\nObjective: ${data.campaignObjective}\nBudget Tier: ${data.budgetTier}\nTarget Facility: ${data.targetStudio || "N/A"}\nDetails: ${data.message || "None"}`,
          });
        }
      } catch {
        // Ignored if campaignInquiries table is not yet migrated in database
      }

      // Backward-compatible mirror into inquiries table
      await db.insert(inquiries).values({
        name: `${data.contactName} (${data.brandName})`,
        email: data.email,
        phone: data.phone,
        company: data.brandName,
        inquiryType: "studio_booking",
        message: `[Influencer Campaign RFP for ${data.creatorName}]\nObjective: ${data.campaignObjective}\nBudget Tier: ${data.budgetTier}\nTarget Facility: ${data.targetStudio || "N/A"}\nDetails: ${data.message || "None"}`,
      });
    }

    return {
      success: true,
      message: `Your collaboration request for ${data.creatorName} has been submitted to Yas Pro talent management.`,
    };
  } catch (error) {
    console.error("Campaign RFP submission error:", error);
    return {
      success: false,
      message: "We could not submit your collaboration request. Please try again or contact our team directly.",
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
  role?: "client" | "enterprise";
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
      const currentUser = db.query?.users
        ? await db.query.users.findFirst({ where: eq(users.id, targetUserId) })
        : null;

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (name !== undefined) updateData.name = name;
      if (input.phone !== undefined) updateData.phone = input.phone.trim() || null;
      if (input.company !== undefined) updateData.company = input.company.trim() || null;

      // Role change safeguards:
      // 1. Administrators can NEVER have their role altered via client profile sync
      if (currentUser?.role !== "admin") {
        if (input.role === "enterprise") {
          const companyName = input.company?.trim() || currentUser?.company?.trim();
          if (!companyName || companyName.length < 2) {
            return { success: false, message: "Company name (at least 2 characters) is required for Enterprise accounts." };
          }
          updateData.role = "enterprise";
        } else if (input.role === "client") {
          // Prevent accidental downgrades from enterprise without admin action
          if (currentUser?.role !== "enterprise") {
            updateData.role = "client";
          }
        }
      }

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

export async function submitServiceInquiry(rawInput: unknown): Promise<ActionResponse> {
  const clientId = await getClientIdentifier();

  // Rate limit: max 5 inquiries per 10 minutes per IP
  const rateLimit = checkRateLimit(`service-inquiry:${clientId}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many inquiry requests. Please wait ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} before submitting another message.`,
    };
  }

  const parsed = serviceInquirySubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please ensure all required fields are properly filled.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Idempotency: block duplicate identical inquiry from same email within 60s
  const idempotencyKey = `service-inquiry:${data.email.toLowerCase()}:${data.pillar}:${data.message.slice(0, 50)}`;
  if (!checkIdempotency(idempotencyKey, 60_000)) {
    return {
      success: false,
      message: "Your inquiry is already being processed by our team. Please wait a few moments.",
    };
  }

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      try {
        if (campaignInquiries && typeof db.insert === "function") {
          await db.insert(campaignInquiries).values({
            pillar: data.pillar as InquiryPillar,
            targetId: data.targetId || null,
            targetName: data.targetName || null,
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            company: data.company || null,
            budgetRange: data.budgetRange || null,
            timeline: data.timeline || null,
            goals: data.goals || [],
            message: data.message,
          });
        }
      } catch {
        // Ignored if campaignInquiries table is not yet migrated in database
      }

      // Mirror to inquiries for standard inbox
      await db.insert(inquiries).values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        inquiryType: "general",
        message: `[Pillar: ${data.pillar}]${data.targetName ? ` Target: ${data.targetName}` : ""}\n${data.message}`,
      });
    }

    return {
      success: true,
      message: "Thank you! Our production concierge will reach out within 24 hours.",
    };
  } catch (error) {
    console.error("Service inquiry error:", error);
    return {
      success: false,
      message: "We could not send your message. Please try again or contact our concierge directly.",
    };
  }
}

/**
 * Universal Promo Code Validator across all platforms
 */
export async function validateUniversalPromoCode(code: string, applicableType: string = "all"): Promise<{
  valid: boolean;
  code?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  message?: string;
}> {
  if (!code || !code.trim()) {
    return { valid: false, message: "Please provide a valid promo code." };
  }

  const cleanCode = code.trim().toUpperCase();

  // 1. Database promo code lookup first so all CMS controls, limits, expiries, and active toggles apply
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const dbPromo = await db.query.promoCodes.findFirst({
        where: eq(promoCodes.code, cleanCode),
      });

      if (dbPromo) {
        if (!dbPromo.isActive) {
          return { valid: false, message: "This promo code is currently inactive." };
        }
        if (dbPromo.expiresAt && new Date(dbPromo.expiresAt).getTime() < Date.now()) {
          return { valid: false, message: "This promo code has expired." };
        }
        if (dbPromo.maxUses !== null && dbPromo.usedCount >= dbPromo.maxUses) {
          return { valid: false, message: "This promo code has reached its maximum redemptions." };
        }
        if (applicableType !== "all" && dbPromo.applicableTypes && Array.isArray(dbPromo.applicableTypes)) {
          const types = dbPromo.applicableTypes as string[];
          if (!types.includes("all") && !types.includes(applicableType)) {
            return { valid: false, message: `This promo code is not valid for ${applicableType.replace("_", " ")}.` };
          }
        }

        return {
          valid: true,
          code: dbPromo.code,
          discountType: dbPromo.discountType as "percentage" | "fixed",
          discountValue: Number(dbPromo.discountValue),
          message: `Promo code ${dbPromo.code} applied!`,
        };
      }
    }
  } catch (err) {
    console.warn("DB promo lookup error, falling back:", err);
  }

  // 2. Offline / mock fallback for development without a configured database
  const staticPromos: Record<string, { type: "percentage" | "fixed"; value: number }> = {
    "YASPRO10": { type: "percentage", value: 10 },
    "YAS20": { type: "percentage", value: 20 },
    "CREATOR50": { type: "fixed", value: 50 },
    "VIPYAS": { type: "percentage", value: 25 },
    "RAMADAN": { type: "percentage", value: 15 },
  };

  if ((!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) && staticPromos[cleanCode]) {
    return {
      valid: true,
      code: cleanCode,
      discountType: staticPromos[cleanCode].type,
      discountValue: staticPromos[cleanCode].value,
      message: `Promo code ${cleanCode} applied!`,
    };
  }

  return { valid: false, message: "Invalid promo code or no longer active." };
}

export { type BookingSubmissionInput, type InquirySubmissionInput, type CampaignRequestInput, type ServiceInquirySubmissionInput };

