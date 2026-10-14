"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  bookings,
  bookingSessions,
  users,
  studios,
  podcastBookings,
  offerClaims,
  bookingStatusEnum,
  sessionTypeEnum,
  type Booking,
} from "@/db/schema";
import { eq, desc, asc, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

export interface EnrichedBooking extends Booking {
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userCompany?: string | null;
  studioName?: string | null;
  schedule?: (typeof bookingSessions.$inferSelect & { studioName: string | null })[];
  podcastDetails?: {
    packageName?: string;
    includeVideo?: boolean;
    needsEditing?: boolean;
    needsSocialClips?: boolean;
    sessionsCount?: number;
  } | null;
  offerDetails?: {
    offerTitle?: string;
    offerCategory?: string;
    originalPrice?: string;
    discountAmount?: string | null;
  } | null;
}

/**
 * Retrieves all studio reservations from Neon PostgreSQL joined with client contact details.
 *
 * @returns Array of booking records ordered by creation date.
 */
export async function getCmsBookings(): Promise<EnrichedBooking[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      const records = await db
        .select({
          booking: bookings,
          userName: users.name,
          userEmail: users.email,
          userPhone: users.phone,
          userCompany: users.company,
          studioName: studios.name,
        })
        .from(bookings)
        .leftJoin(users, eq(bookings.userId, users.id))
        .leftJoin(studios, eq(bookings.studioId, studios.id))
        .orderBy(desc(bookings.createdAt));

      let schedule: { session: typeof bookingSessions.$inferSelect; studioName: string | null }[] = [];
      try {
        if (records.length) {
          schedule = await db
            .select({ session: bookingSessions, studioName: studios.name })
            .from(bookingSessions)
            .leftJoin(studios, eq(bookingSessions.studioId, studios.id))
            .where(inArray(bookingSessions.bookingId, records.map((record) => record.booking.id)))
            .orderBy(asc(bookingSessions.position));
        }
      } catch (err) {
        console.warn("Could not load booking sessions schedule:", err);
      }
      const refCodes = records.map((r) => r.booking.referenceCode).filter(Boolean);

      let podcasts: (typeof podcastBookings.$inferSelect)[] = [];
      let offers: (typeof offerClaims.$inferSelect)[] = [];

      try {
        if (refCodes.length) {
          [podcasts, offers] = await Promise.all([
            db.select().from(podcastBookings).where(inArray(podcastBookings.referenceCode, refCodes)),
            db.select().from(offerClaims).where(inArray(offerClaims.referenceCode, refCodes)),
          ]);
        }
      } catch (err) {
        console.warn("Could not load supplementary podcast/offer records:", err);
      }

      return records.map((r) => {
        let guestName = r.userName;
        let guestEmail = r.userEmail;
        let guestPhone = r.userPhone;
        let guestCompany = r.userCompany;
        if (!guestEmail && r.booking.specialRequests?.startsWith("[Contact: ")) {
          const match = r.booking.specialRequests.match(/\[Contact:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/);
          if (match) {
            guestName = match[1]?.trim() || guestName;
            guestEmail = match[2]?.trim() || guestEmail;
            guestPhone = match[3]?.trim() || guestPhone;
            guestCompany = match[4]?.trim() || guestCompany;
          }
        }

        const matchingPodcast = podcasts.find((p) => p.referenceCode === r.booking.referenceCode);
        const matchingOffer = offers.find((o) => o.referenceCode === r.booking.referenceCode);

        return {
          ...r.booking,
          schedule: schedule.filter((item) => item.session.bookingId === r.booking.id)
            .map((item) => ({ ...item.session, studioName: item.studioName })),
          userName: guestName,
          userEmail: guestEmail,
          userPhone: guestPhone,
          userCompany: guestCompany,
          studioName: r.studioName,
          podcastDetails: matchingPodcast
            ? {
                packageName: matchingPodcast.packageName,
                includeVideo: matchingPodcast.includeVideo,
                needsEditing: matchingPodcast.needsEditing,
                needsSocialClips: matchingPodcast.needsSocialClips,
                sessionsCount: matchingPodcast.sessionsCount,
              }
            : null,
          offerDetails: matchingOffer
            ? {
                offerTitle: matchingOffer.offerTitle,
                offerCategory: matchingOffer.offerCategory,
                originalPrice: matchingOffer.originalPrice,
                discountAmount: matchingOffer.discountAmount,
              }
            : null,
        };
      });
    }
  } catch (e) {
    console.error("getCmsBookings error:", e);
  }
  return [];
}

/**
 * Fetches all bookings belonging to a specific client user for the portal dashboard.
 *
 * @param userId - The authenticated user's ID.
 * @returns Array of bookings ordered by scheduled date descending.
 */
export async function getClientBookings(userId: string): Promise<Booking[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized: Active session required.");
    }
    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "admin" && session.user.id !== userId) {
      throw new Error("Forbidden: Access denied to other client bookings.");
    }

    if (isDbAvailable()) {
      return await db
        .select()
        .from(bookings)
        .where(eq(bookings.userId, userId))
        .orderBy(desc(bookings.scheduledAt));
    }
  } catch (e) {
    console.error("getClientBookings error:", e);
  }
  return [];
}

/**
 * Updates the approval status of a studio booking reservation.
 *
 * @param id - UUID of the booking.
 * @param status - Updated lifecycle status ("pending" | "confirmed" | "cancelled" | "completed").
 * @returns CMS response confirming status transition.
 */
export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed"): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    return { success: true, message: `Booking status changed to ${status}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates the financial payment status and transaction reference of a studio booking.
 *
 * @param id - UUID of the booking.
 * @param paymentStatus - Updated payment status ("unpaid" | "deposit_paid" | "paid" | "refunded").
 * @param paymentReference - Optional bank transfer, POS, or Stripe reference code.
 * @returns CMS response confirming payment reconciliation.
 */
export async function updateBookingPaymentStatus(
  id: string,
  paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded",
  paymentReference?: string
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      const updatePayload: { paymentStatus: string; updatedAt: Date; paymentReference?: string } = {
        paymentStatus,
        updatedAt: new Date(),
      };
      if (paymentReference !== undefined) {
        updatePayload.paymentReference = paymentReference;
      }
      await db.update(bookings).set(updatePayload).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    return { success: true, message: `Payment status updated to ${paymentStatus}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export interface ManualBookingInput {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;
  studioId?: string | null;
  sessionType: (typeof sessionTypeEnum.enumValues)[number];
  scheduledAt: Date;
  durationHours: number;
  headcount: number;
  totalAmount: string;
  currency?: string;
  notes?: string;
  status?: (typeof bookingStatusEnum.enumValues)[number];
  paymentStatus?: "unpaid" | "deposit_paid" | "paid" | "refunded";
}

/**
 * Creates a booking manually from the admin CMS dashboard.
 */
export async function createManualCmsBooking(
  input: ManualBookingInput
): Promise<CmsResponse & { booking?: EnrichedBooking }> {
  try {
    await requireAdmin();
    const referenceCode = `YAS-ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const specialRequests = `[Contact: ${input.clientName} | ${input.clientEmail} | ${input.clientPhone}${
      input.clientCompany ? ` | ${input.clientCompany}` : ""
    }] ${input.notes || ""}`.trim();

    if (isDbAvailable()) {
      const newBooking = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(bookings)
          .values({
            referenceCode,
            studioId: input.studioId || null,
            sessionType: input.sessionType,
            scheduledAt: input.scheduledAt,
            durationHours: input.durationHours,
            headcount: input.headcount,
            totalAmount: input.totalAmount,
            currency: input.currency || "AED",
            status: input.status || "confirmed",
            paymentStatus: input.paymentStatus || "unpaid",
            specialRequests,
          })
          .returning();

        if (inserted && input.studioId) {
          await tx.insert(bookingSessions).values({
            bookingId: inserted.id,
            studioId: input.studioId,
            scheduledAt: input.scheduledAt,
            durationHours: input.durationHours,
            headcount: input.headcount,
            position: 1,
            status: inserted.status,
          }).onConflictDoNothing({
            target: [bookingSessions.bookingId, bookingSessions.position],
          });
        }

        return inserted;
      });

      revalidatePath("/admin/bookings");
      revalidatePath("/admin");
      return {
        success: true,
        message: `Booking ${referenceCode} created successfully.`,
        booking: {
          ...newBooking,
          userName: input.clientName,
          userEmail: input.clientEmail,
          userPhone: input.clientPhone,
          userCompany: input.clientCompany || null,
          studioName: null,
          schedule: [],
          podcastDetails: null,
          offerDetails: null,
        },
      };
    }

    return { success: false, error: "Database not available" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export interface UpdateBookingDetailsInput {
  id: string;
  studioId?: string | null;
  sessionType?: (typeof sessionTypeEnum.enumValues)[number];
  scheduledAt?: Date;
  durationHours?: number;
  headcount?: number;
  totalAmount?: string;
  notes?: string;
  status?: (typeof bookingStatusEnum.enumValues)[number];
  paymentStatus?: "unpaid" | "deposit_paid" | "paid" | "refunded";
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
}

/**
 * Updates full booking reservation details from admin CMS.
 */
export async function updateCmsBookingDetails(
  input: UpdateBookingDetailsInput
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.transaction(async (tx) => {
        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };
        if (input.studioId !== undefined) updateData.studioId = input.studioId;
        if (input.sessionType !== undefined) updateData.sessionType = input.sessionType;
        if (input.scheduledAt !== undefined) updateData.scheduledAt = input.scheduledAt;
        if (input.durationHours !== undefined) updateData.durationHours = input.durationHours;
        if (input.headcount !== undefined) updateData.headcount = input.headcount;
        if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.paymentStatus !== undefined) updateData.paymentStatus = input.paymentStatus;

        if (input.clientName || input.clientEmail || input.notes !== undefined) {
          updateData.specialRequests = `[Contact: ${input.clientName || ""} | ${input.clientEmail || ""} | ${
            input.clientPhone || ""
          }${input.clientCompany ? ` | ${input.clientCompany}` : ""}] ${input.notes || ""}`.trim();
        }

        const [updatedBooking] = await tx.update(bookings).set(updateData)
          .where(eq(bookings.id, input.id)).returning();
        if (!updatedBooking) throw new Error("Booking not found.");

        if (input.studioId === null) {
          await tx.delete(bookingSessions).where(and(
            eq(bookingSessions.bookingId, input.id),
            eq(bookingSessions.position, 1)
          ));
        } else if (
          updatedBooking.studioId &&
          [input.studioId, input.scheduledAt, input.durationHours, input.headcount, input.status]
            .some((value) => value !== undefined)
        ) {
          const sessionPayload = {
            studioId: updatedBooking.studioId,
            scheduledAt: updatedBooking.scheduledAt,
            durationHours: updatedBooking.durationHours,
            headcount: updatedBooking.headcount,
            status: updatedBooking.status,
          };
          await tx.insert(bookingSessions).values({
            bookingId: input.id,
            position: 1,
            ...sessionPayload,
          }).onConflictDoUpdate({
            target: [bookingSessions.bookingId, bookingSessions.position],
            set: sessionPayload,
          });
        }
      });
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, message: "Booking details updated successfully." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a booking record and associated session schedules.
 */
export async function deleteCmsBooking(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.delete(bookingSessions).where(eq(bookingSessions.bookingId, id));
      await db.delete(bookings).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, message: "Booking reservation deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

