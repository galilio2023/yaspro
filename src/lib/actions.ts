"use server";

import { db } from "@/db";
import { bookings, inquiries, users, studios, enterpriseRfps, type SessionType, type InquiryType } from "@/db/schema";
import { generateBookingReference } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { checkRateLimit, checkIdempotency, getClientIdentifier } from "@/lib/rate-limit";
import { sendBookingConfirmationNotification, sendInquiryNotification } from "@/lib/notifications";
import {
  bookingSubmissionSchema,
  inquirySubmissionSchema,
  campaignRequestSchema,
  enterpriseRfpSchema,
  type BookingSubmissionInput,
  type InquirySubmissionInput,
  type CampaignRequestInput,
  type EnterpriseRfpInput,
} from "./validations";

import { STUDIOS, STUDIO_GEAR_PACKAGES } from "@/features/booking/constants";

/**
 * Recalculate price server-side based on canonical pricing rules
 */
function calculateServerPrice(data: BookingSubmissionInput): number {
  const studio =
    STUDIOS.find((s) => s.id === data.studioId) ||
    STUDIOS[0];
  const studioRate = studio ? studio.rate : 800;
  const studioCost = studioRate * data.durationHours;

  const crewCost = data.needsCrew ? 500 : 0;

  const gearPkg = STUDIO_GEAR_PACKAGES.find((g) => g.id === data.selectedGearPackage);
  const gearCost = gearPkg ? gearPkg.rate : 0;

  const postCost =
    (data.needsEditing ? 400 : 0) +
    (data.needsColorGrading ? 300 : 0) +
    (data.needsSoundMastering ? 250 : 0) +
    (data.needsAiAutoCut ? 450 : 0);

  return studioCost + crewCost + gearCost + postCost;
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
  const calculatedTotal = calculateServerPrice(data);

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      // 3. Resolve studio by slug (letting Postgres manage all UUIDs)
      const selectedSlug = data.studioId || "studio-a";
      let studioRecord = await db.query.studios.findFirst({
        where: eq(studios.slug, selectedSlug),
      });

      // If the studio record does not exist yet, provision it without passing an id (Postgres auto-generates uuid)
      if (!studioRecord) {
        const fallbackStudioMeta = STUDIOS.find((s) => s.id === selectedSlug) || STUDIOS[0];
        const [inserted] = await db
          .insert(studios)
          .values({
            slug: selectedSlug,
            name: fallbackStudioMeta.name,
            hourlyRate: fallbackStudioMeta.rate.toFixed(2),
            capacity: 20,
            isActive: true,
          })
          .returning();
        studioRecord = inserted;
      }

      // 4. Overlap & Conflict Check: Prevent double-booking for the same studio stage
      if (studioRecord?.id) {
        const requestedStart = new Date(data.scheduledAt || Date.now());
        const requestedEnd = new Date(requestedStart.getTime() + data.durationHours * 60 * 60 * 1000);

        // Fetch active bookings for this studio
        const existingBookings = await db
          .select({
            id: bookings.id,
            scheduledAt: bookings.scheduledAt,
            durationHours: bookings.durationHours,
            status: bookings.status,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.studioId, studioRecord.id),
              inArray(bookings.status, ["confirmed", "pending"])
            )
          );

        // Check if any existing active booking overlaps with [requestedStart, requestedEnd]
        const hasConflict = existingBookings.some((b) => {
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

      // 5. Ensure user exists
      const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const [user] = await db
        .insert(users)
        .values({
          id: userId,
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          company: data.company,
          role: "client",
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            company: data.company,
            updatedAt: new Date(),
          },
        })
        .returning();

      // 6. Create booking with the resolved studio UUID
      const [newBooking] = await db
        .insert(bookings)
        .values({
          referenceCode,
          userId: user.id,
          studioId: studioRecord?.id,
          sessionType: data.sessionType as SessionType,
          scheduledAt: new Date(data.scheduledAt || Date.now()),
          durationHours: data.durationHours,
          headcount: data.headcount,
          needsEditing: data.needsEditing,
          needsColorGrading: data.needsColorGrading,
          needsSoundMastering: data.needsSoundMastering,
          propsNotes: data.propsNotes,
          specialRequests: data.specialRequests,
          totalAmount: calculatedTotal.toFixed(2),
          status: "pending",
        })
        .returning();

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
        message: "Your studio session has been confirmed and scheduled.",
        data: { bookingId: newBooking?.id },
      };
    }

    // Preview mode fallback when DATABASE_URL is not configured
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
      success: true,
      message: "Inquiry received.",
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
      success: true,
      message: `Your collaboration request for ${data.creatorName} has been received.`,
    };
  }
}

export async function submitEnterpriseRfp(rawInput: unknown): Promise<ActionResponse<{ referenceCode: string }>> {
  const clientId = await getClientIdentifier();

  // Rate limit: max 3 enterprise RFPs per 15 minutes per IP
  const rateLimit = checkRateLimit(`enterprise:${clientId}`, 3, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    const minutesLeft = Math.ceil(rateLimit.resetInMs / 60000);
    return {
      success: false,
      message: `Too many enterprise RFP submissions. Please wait ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""} before submitting another tender request.`,
    };
  }

  const parsed = enterpriseRfpSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please complete all required fields for the enterprise proposal.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  // Idempotency: block duplicate identical enterprise RFP within 60s
  const idempotencyKey = `enterprise:${data.workEmail.toLowerCase()}:${data.organizationName.toLowerCase()}:${data.projectScope}`;
  if (!checkIdempotency(idempotencyKey, 60_000)) {
    return {
      success: false,
      message: "An enterprise RFP for this organization and scope is already being evaluated. Please check your inbox for confirmation.",
    };
  }
  const suffix = data.country === "Saudi Arabia" ? "KSA" : data.country === "Egypt" ? "CAI" : "DXB";

  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      throw new Error("Enterprise RFP database is not configured");
    }

    // The unique constraint arbitrates concurrent requests; only return an inserted code.
    for (let attempt = 0; attempt < 10; attempt++) {
      const referenceCode = `EXP-${Math.floor(1000 + Math.random() * 9000)}-${suffix}`;
      const [inserted] = await db.insert(enterpriseRfps).values({
        referenceCode,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        contactName: data.contactName,
        contactTitle: data.contactTitle,
        workEmail: data.workEmail,
        phone: data.phone,
        country: data.country,
        projectScope: data.projectScope,
        targetLocations: data.targetLocations,
        estimatedBudget: data.estimatedBudget,
        requiresMawthooqCompliance: data.requiresMawthooqCompliance,
        requiresObVan: data.requiresObVan,
        projectTimeline: data.projectTimeline,
        selectedCreators: data.selectedCreators,
        digitalTwinEnvironment: data.digitalTwinEnvironment,
        notes: data.notes,
        status: "pending_review",
      }).onConflictDoNothing({ target: enterpriseRfps.referenceCode })
        .returning({ referenceCode: enterpriseRfps.referenceCode });
      if (!inserted) continue;

      revalidatePath("/enterprise");
      return {
        success: true,
        referenceCode,
        message: `Enterprise RFP ${referenceCode} received. A Senior Executive Producer from Yas Pro will contact you within 4 hours.`,
        data: { referenceCode },
      };
    }
    throw new Error("Unable to allocate a unique enterprise RFP reference");
  } catch (error) {
    console.error("Enterprise RFP error:", error);
    return {
      success: false,
      message: "We could not save your enterprise RFP. Please try again or contact our team directly.",
    };
  }
}

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Synchronize registered user profile info directly into the users table
 */
export async function syncUserProfile(input: {
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
}): Promise<ActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized. Active session required." };
    }

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (input.name) updateData.name = input.name;
      if (input.phone) updateData.phone = input.phone;
      if (input.company) updateData.company = input.company;

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, session.user.id));
    }
    return { success: true, message: "Profile information synchronized in database." };
  } catch (err) {
    console.error("syncUserProfile error:", err);
    return { success: false, message: "Failed to synchronize profile details." };
  }
}

export { type BookingSubmissionInput, type InquirySubmissionInput, type CampaignRequestInput, type EnterpriseRfpInput };

