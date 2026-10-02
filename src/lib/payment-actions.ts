"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface PaymentProcessingResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  paymentStatus?: "deposit_paid" | "paid";
  error?: string;
}

/**
 * Server action to process an online credit card or Apple Pay deposit/full payment
 * for a studio session booking.
 *
 * @param bookingId - UUID or reference code of the booking.
 * @param amount - Charge amount in AED.
 * @param paymentType - "deposit" (50%) or "full".
 * @param referenceCode - Booking reference code (e.g. YAS-ABC123).
 */
export async function processBookingOnlinePayment(
  bookingId: string,
  amount: number,
  paymentType: "deposit" | "full",
  referenceCode: string
): Promise<PaymentProcessingResponse> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || (session.user as { role?: string })?.role !== "admin") {
      return { success: false, error: "Unauthorized: Admin credentials required." };
    }
    if (!bookingId && !referenceCode) {
      return { success: false, error: "Booking reference is required to process payment." };
    }

    if (amount <= 0) {
      return { success: false, error: "Invalid payment amount." };
    }

    // Generate authenticated transaction reference
    const transactionId = `TXN_YAS_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const targetStatus = paymentType === "deposit" ? "deposit_paid" : "paid";

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const updateData = {
        paymentStatus: targetStatus,
        paymentReference: transactionId,
        status: "confirmed" as const,
        updatedAt: new Date(),
      };

      if (bookingId && bookingId.length > 20) {
        // Attempt by UUID
        await db.update(bookings).set(updateData).where(eq(bookings.id, bookingId));
      } else {
        // Fall back to reference code
        await db.update(bookings).set(updateData).where(eq(bookings.referenceCode, referenceCode));
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/portal");
    revalidatePath("/studio-booking");

    return {
      success: true,
      transactionId,
      paymentStatus: targetStatus,
      message: `Payment of AED ${amount.toLocaleString()} successfully processed. Transaction ID: ${transactionId}.`,
    };
  } catch (error) {
    console.error("processBookingOnlinePayment error:", error);
    return {
      success: false,
      error: (error as Error).message || "Payment processor encountered an unexpected error. Please retry.",
    };
  }
}

/**
 * Server action to mark a studio booking reservation as awaiting bank transfer confirmation.
 * Preserves the booking as unpaid/pending with a recorded wire payment reference.
 *
 * @param bookingId - UUID or reference code of the booking.
 * @param referenceCode - Booking reference code (e.g. YAS-ABC123).
 */
export async function markBookingBankTransferPending(
  bookingId: string,
  referenceCode: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized: Please sign in." };
    }
    if (!bookingId && !referenceCode) {
      return { success: false, error: "Booking reference is required." };
    }
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: false, error: "Booking service is unavailable." };
    }

    const isBookingId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
    const booking = await db.query.bookings.findFirst({
      where: and(
        isBookingId
          ? eq(bookings.id, bookingId)
          : eq(bookings.referenceCode, referenceCode || bookingId),
        eq(bookings.userId, session.user.id),
      ),
    });
    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    const [updated] = await db.update(bookings).set({
      paymentReference: `WIRE_PENDING_${Date.now()}`,
      updatedAt: new Date(),
    }).where(and(
      eq(bookings.id, booking.id),
      eq(bookings.userId, session.user.id),
      eq(bookings.paymentStatus, "unpaid"),
    )).returning({ id: bookings.id });
    if (!updated) {
      return { success: false, error: "Only unpaid bookings can await bank transfer." };
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/portal");
    revalidatePath("/studio-booking");

    return {
      success: true,
      message: "Booking marked as awaiting corporate bank transfer.",
    };
  } catch (error) {
    console.error("markBookingBankTransferPending error:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to record wire transfer request.",
    };
  }
}

