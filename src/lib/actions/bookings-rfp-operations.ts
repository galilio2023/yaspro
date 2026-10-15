"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  bookings,
  bookingSessions,
  users,
  studios,
  bookingStatusEnum,
  sessionTypeEnum,
  type Booking,
} from "@/db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, isUuid, requireAdmin, type CmsResponse } from "./shared";
import { replaceBookingNotes } from "../booking-notes";
import { generateBookingReference } from "@/lib/utils";

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

        if (!guestEmail && /\[Contact(?: URI)?: /.test(notes)) {
          const match = notes.match(/\[Contact( URI)?:\s*([^|]+)\|\s*([^|]+)\|\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/);
          if (match) {
            const fields = match.slice(2).map((field) => {
              const value = field?.trim();
              if (!value || !match[1]) return value;
              try {
                return decodeURIComponent(value);
              } catch {
                return value;
              }
            });
            guestName = fields[0] || guestName;
            guestEmail = fields[1] || guestEmail;
            guestPhone = fields[2] || guestPhone;
            guestCompany = fields[3] || guestCompany;
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

export interface CmsBookingInput {
  id?: string;
  studioId?: string | null;
  sessionType: Booking["sessionType"];
  status?: Booking["status"];
  scheduledAt: string;
  durationHours: number;
  headcount: number;
  totalAmount: string;
  paymentStatus?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
  notes?: string;
}

function validateCmsBooking(input: CmsBookingInput): string | null {
  if (!sessionTypeEnum.enumValues.includes(input.sessionType)) return "Invalid session type.";
  if (input.status !== undefined && !bookingStatusEnum.enumValues.includes(input.status)) return "Invalid booking status.";
  if (input.paymentStatus !== undefined && !["unpaid", "deposit_paid", "paid", "refunded"].includes(input.paymentStatus)) return "Invalid payment status.";
  if (input.studioId != null && !isUuid(input.studioId)) return "Invalid studio id.";
  if (!input.scheduledAt || Number.isNaN(new Date(input.scheduledAt).getTime())) return "A valid scheduled date and time is required.";
  if (!Number.isInteger(input.durationHours) || input.durationHours < 1 || input.durationHours > 720) return "Duration must be between 1 and 720 hours.";
  if (!Number.isInteger(input.headcount) || input.headcount < 1) return "Headcount must be at least 1.";
  const amount = Number(input.totalAmount);
  if (!Number.isFinite(amount) || amount < 0) return "Total amount must be a valid non-negative number.";
  return null;
}

/**
 * Creates a manual (walk-in / phone) booking from the admin panel.
 * Contact details are stored in the same "[Contact: ...]" header the public flows use.
 */
export async function createCmsBooking(input: CmsBookingInput): Promise<CmsResponse> {
  try {
    await requireAdmin();
    const invalid = validateCmsBooking(input);
    if (invalid) return { success: false, error: invalid };
    if (!input.contactName?.trim()) return { success: false, error: "Client name is required." };
    if (!isDbAvailable()) return { success: true, message: "Booking created in preview mode." };

    const contact = [input.contactName, input.contactEmail || "-", input.contactPhone || "-", input.contactCompany || ""]
      .map((v) => (v ?? "").trim())
      .join(" | ");
    const specialRequests = `[Contact: ${contact}]${input.notes?.trim() ? ` ${input.notes.trim()}` : ""}`;

    await db.insert(bookings).values({
      referenceCode: generateBookingReference(),
      studioId: input.studioId || null,
      sessionType: input.sessionType,
      status: input.status ?? "confirmed",
      scheduledAt: new Date(input.scheduledAt),
      durationHours: input.durationHours,
      headcount: input.headcount,
      totalAmount: Number(input.totalAmount).toFixed(2),
      paymentStatus: input.paymentStatus ?? "unpaid",
      specialRequests,
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, message: "Manual booking created." };
  } catch (error) {
    console.error("createCmsBooking error:", error);
    return { success: false, error: "Failed to create booking." };
  }
}

/**
 * Edits core booking details (reschedule, studio, headcount, amount, notes).
 * Booking-session mirrors are kept in sync by the database triggers.
 */
export async function updateCmsBookingDetails(id: string, input: CmsBookingInput): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { success: false, error: "Invalid booking id." };
    const invalid = validateCmsBooking(input);
    if (invalid) return { success: false, error: invalid };
    if (isDbAvailable()) {
      const [existing] = await db.select({ specialRequests: bookings.specialRequests }).from(bookings).where(eq(bookings.id, id)).limit(1);
      if (!existing) return { success: false, error: "Booking not found." };
      await db.update(bookings).set({
        studioId: input.studioId || null,
        sessionType: input.sessionType,
        scheduledAt: new Date(input.scheduledAt),
        durationHours: input.durationHours,
        headcount: input.headcount,
        totalAmount: Number(input.totalAmount).toFixed(2),
        specialRequests: input.notes === undefined ? existing.specialRequests : replaceBookingNotes(existing.specialRequests, input.notes),
        updatedAt: new Date(),
      }).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    return { success: true, message: "Booking details updated." };
  } catch (error) {
    console.error("updateCmsBookingDetails error:", error);
    return { success: false, error: "Failed to update booking details." };
  }
}

/** Permanently deletes a booking (sessions cascade). Intended for test/duplicate records. */
export async function deleteCmsBooking(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { success: false, error: "Invalid booking id." };
    if (isDbAvailable()) {
      await db.delete(bookings).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true, message: "Booking deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
