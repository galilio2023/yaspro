"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  bookings,
  bookingSessions,
  users,
  studios,
  type Booking,
} from "@/db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

export interface EnrichedBooking extends Booking {
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  userCompany?: string | null;
  studioName?: string | null;
  packageName?: string | null;
  schedule?: (typeof bookingSessions.$inferSelect & { studioName: string | null })[];
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

      const schedule = records.length ? await db
        .select({ session: bookingSessions, studioName: studios.name })
        .from(bookingSessions)
        .leftJoin(studios, eq(bookingSessions.studioId, studios.id))
        .where(inArray(bookingSessions.bookingId, records.map((record) => record.booking.id)))
        .orderBy(asc(bookingSessions.position)) : [];

      return records.map((r) => {
        let guestName = r.userName;
        let guestEmail = r.userEmail;
        let guestPhone = r.userPhone;
        let guestCompany = r.userCompany;
        let packageName: string | null = null;

        const notes = r.booking.specialRequests || "";

        if (!guestEmail && notes.includes("[Contact: ")) {
          const match = notes.match(/\[Contact:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/);
          if (match) {
            guestName = match[1]?.trim() || guestName;
            guestEmail = match[2]?.trim() || guestEmail;
            guestPhone = match[3]?.trim() || guestPhone;
            guestCompany = match[4]?.trim() || guestCompany;
          }
        } else if (!guestName && notes.includes("Client: ")) {
          const clientMatch = notes.match(/Client:\s*([^|]+)/);
          if (clientMatch) guestName = clientMatch[1].trim();
          const compMatch = notes.match(/Company:\s*([^|]+)/);
          if (compMatch && compMatch[1].trim() !== "N/A") guestCompany = compMatch[1].trim();
        }

        if (notes.includes("Package: ")) {
          const pkgMatch = notes.match(/Package:\s*([^|]+)/);
          if (pkgMatch) packageName = pkgMatch[1].trim();
        }

        return {
          ...r.booking,
          schedule: schedule.filter((item) => item.session.bookingId === r.booking.id)
            .map((item) => ({ ...item.session, studioName: item.studioName })),
          userName: guestName,
          userEmail: guestEmail,
          userPhone: guestPhone,
          userCompany: guestCompany,
          studioName: r.studioName,
          packageName,
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
