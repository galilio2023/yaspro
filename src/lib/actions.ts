"use server";

import { db } from "@/db";
import { bookings, inquiries, users, studios, enterpriseRfps, type SessionType, type InquiryType } from "@/db/schema";
import { generateBookingReference } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
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
  const parsed = bookingSubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid booking submission. Please check all required fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const referenceCode = generateBookingReference();
  const calculatedTotal = calculateServerPrice(data);

  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      // 1. Ensure user exists
      const [user] = await db
        .insert(users)
        .values({
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          company: data.company,
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

      // 2. Resolve studio by slug (letting Postgres manage all UUIDs)
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

      // 3. Create booking with the auto-generated studio UUID
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
  const parsed = inquirySubmissionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please ensure all required contact fields are properly filled.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

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
  const parsed = campaignRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please complete all required fields for the collaboration brief.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

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
  const parsed = enterpriseRfpSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Please complete all required fields for the enterprise proposal.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
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

export { type BookingSubmissionInput, type InquirySubmissionInput, type CampaignRequestInput, type EnterpriseRfpInput };

