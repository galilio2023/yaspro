"use server";

import { getCurrentSession } from "@/lib/actions/shared";
import { hasBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

export interface ZiinaPaymentIntentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentIntentId?: string;
  transactionId?: string;
  paymentStatus?: "deposit_paid" | "paid";
  message?: string;
  error?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Creates a Ziina payment intent (or a simulated one outside production).
 * Ziina charges are denominated in fils (1 AED = 100 fils).
 *
 * The charge amount is ALWAYS derived server-side from the booking record:
 * the client-supplied amount is ignored so it cannot be tampered with.
 *
 * @param bookingId - UUID or reference code of the booking.
 * @param _clientAmountAed - Ignored (kept for call-site compatibility).
 * @param paymentType - "deposit" (50%) or "full" (remaining balance).
 * @param referenceCode - Booking reference code (e.g. YAS-ABC123).
 */
export async function createZiinaPaymentIntent(
  bookingId: string,
  _clientAmountAed: number,
  paymentType: "deposit" | "full",
  referenceCode: string
): Promise<ZiinaPaymentIntentResponse> {
  try {
    if (!bookingId && !referenceCode) {
      return { success: false, error: "Booking reference is required to initiate Ziina payment." };
    }
    if (paymentType !== "deposit" && paymentType !== "full") {
      return { success: false, error: "Invalid payment type." };
    }
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: false, error: "Booking service is unavailable." };
    }

    const booking = await db.query.bookings.findFirst({
      where: UUID_RE.test(bookingId)
        ? eq(bookings.id, bookingId)
        : eq(bookings.referenceCode, referenceCode || bookingId),
    });
    if (!booking) {
      return { success: false, error: "Booking not found." };
    }
    const authorized = booking.userId
      ? (await getCurrentSession())?.user?.id === booking.userId
      : await hasBookingPaymentCapability(booking.id);
    if (!authorized) {
      return { success: false, error: "Unauthorized to pay for this booking." };
    }
    if (booking.status === "cancelled") {
      return { success: false, error: "This booking was cancelled." };
    }
    if (booking.paymentStatus === "paid") {
      return { success: false, error: "This booking is already fully paid." };
    }

    // Server-authoritative amount (AED, whole numbers).
    const total = Math.round(Number(booking.totalAmount));
    const deposit = Math.round(total * 0.5);
    let amountAed: number;
    if (booking.paymentStatus === "deposit_paid") {
      amountAed = total - deposit; // remaining balance
    } else {
      amountAed = paymentType === "deposit" ? deposit : total;
    }
    if (!Number.isFinite(amountAed) || amountAed <= 0) {
      return { success: false, error: "Invalid payment amount." };
    }
    const targetStatus: "deposit_paid" | "paid" =
      booking.paymentStatus !== "deposit_paid" && paymentType === "deposit" ? "deposit_paid" : "paid";

    const ziinaApiKey = process.env.ZIINA_API_KEY;
    const isLiveKey = Boolean(ziinaApiKey && !ziinaApiKey.includes("ziina_xxx") && !ziinaApiKey.startsWith("your_"));
    // Simulation can NEVER run in production, even if the flag is set by mistake.
    const isSimulateEnabled =
      process.env.NODE_ENV === "test" ||
      (process.env.ZIINA_SIMULATE === "true" && process.env.NODE_ENV !== "production");

    // 1. Live Ziina API Key branch
    if (isLiveKey) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yaspro.ae";
      const amountInFils = amountAed * 100;
      const idempotencyKey = `ziina-${booking.id}-${targetStatus}-${amountInFils}`;

      const response = await fetch("https://api-v2.ziina.com/api/payment_intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ziinaApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: amountInFils,
          currency_code: "AED",
          message: `Yas Productions Studio Booking [${booking.referenceCode}]`,
          success_url: `${baseUrl}/studio-booking?status=success&ref=${booking.referenceCode}`,
          cancel_url: `${baseUrl}/studio-booking?status=cancelled&ref=${booking.referenceCode}`,
          metadata: {
            bookingId: booking.id,
            referenceCode: booking.referenceCode,
            paymentType: targetStatus,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Ziina API error response:", response.status, errorText);
        return {
          success: false,
          error: `Ziina payment gateway returned status ${response.status}. Please retry.`,
        };
      }

      const data = await response.json();

      if (data.redirect_url && data.id) {
        // Persist the intent id so the webhook can match the payment back to this booking.
        const updated = await db
          .update(bookings)
          .set({ paymentReference: String(data.id), updatedAt: new Date() })
          .where(and(eq(bookings.id, booking.id), eq(bookings.paymentStatus, booking.paymentStatus)))
          .returning({ id: bookings.id });
        if (updated.length === 0) {
          return { success: false, error: "Booking payment changed. Please retry." };
        }

        return {
          success: true,
          paymentUrl: data.redirect_url,
          paymentIntentId: data.id,
        };
      }

      return {
        success: false,
        error: "Failed to generate redirect URL from Ziina response.",
      };
    }

    // 2. Simulation branch (non-production only)
    if (isSimulateEnabled) {
      const transactionId = `ZIINA_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      await db
        .update(bookings)
        .set({
          paymentStatus: targetStatus,
          paymentReference: transactionId,
          status: "confirmed" as const,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));

      try {
        updateTag("studios");
      } catch (e) {
        console.warn("Cache tag update notice:", e);
      }
      revalidatePath("/admin/bookings");
      revalidatePath("/account");
      revalidatePath("/studio-booking");

      return {
        success: true,
        transactionId,
        paymentStatus: targetStatus,
        message: `Ziina UAE Simulation of AED ${amountAed.toLocaleString()} completed successfully. Transaction ID: ${transactionId}.`,
      };
    }

    // 3. No API key and no (permitted) simulation: never mark as paid
    return {
      success: false,
      error: "Ziina payment configuration is missing. Please contact Yas Productions support.",
    };
  } catch (error) {
    console.error("createZiinaPaymentIntent error:", error);
    return {
      success: false,
      error: "Ziina payment gateway error. Please retry.",
    };
  }
}
