"use server";

import { getPlatformSettings } from "@/lib/actions/platform-settings-operations";
import { getCurrentSession } from "@/lib/actions/shared";
import { hasBookingPaymentCapability } from "@/lib/booking-payment-capability";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

export interface BookingPaymentQuote {
  paymentStatus: string;
  depositPercent: number;
  vatRatePercent: number;
  options: {
    type: "deposit" | "full";
    amountAed: number;
    targetStatus: "deposit_paid" | "paid";
  }[];
}

export interface ZiinaPaymentIntentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentIntentId?: string;
  transactionId?: string;
  paymentStatus?: "deposit_paid" | "paid";
  message?: string;
  error?: string;
  quote?: BookingPaymentQuote;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class BookingPaymentError extends Error {}

async function loadBookingPaymentQuote(bookingId: string, referenceCode: string) {
  if (!bookingId && !referenceCode) {
    throw new BookingPaymentError("Booking reference is required to initiate Ziina payment.");
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
    throw new BookingPaymentError("Booking service is unavailable.");
  }
  const booking = await db.query.bookings.findFirst({
    where: UUID_RE.test(bookingId)
      ? eq(bookings.id, bookingId)
      : eq(bookings.referenceCode, referenceCode || bookingId),
  });
  if (!booking) throw new BookingPaymentError("Booking not found.");
  const authorized = booking.userId
    ? (await getCurrentSession())?.user?.id === booking.userId
    : await hasBookingPaymentCapability(booking.id);
  if (!authorized) throw new BookingPaymentError("Unauthorized to pay for this booking.");
  if (booking.status === "cancelled") throw new BookingPaymentError("This booking was cancelled.");
  if (booking.paymentStatus === "paid") throw new BookingPaymentError("This booking is already fully paid.");
  if (booking.paymentStatus !== "unpaid" && booking.paymentStatus !== "deposit_paid") {
    throw new BookingPaymentError("This booking is not available for payment.");
  }

  const { depositPercent, vatRatePercent } = await getPlatformSettings();
  const total = Math.round(Number(booking.totalAmount));
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(depositPercent) ||
      depositPercent < 10 || depositPercent > 100) {
    throw new BookingPaymentError("Invalid payment amount or deposit settings.");
  }
  const deposit = Math.round(total * depositPercent / 100);
  const remaining = booking.paymentStatus === "deposit_paid" ? total - deposit : total;
  if (remaining <= 0) throw new BookingPaymentError("No outstanding balance is available for payment.");
  const quote: BookingPaymentQuote = {
    paymentStatus: booking.paymentStatus,
    depositPercent,
    vatRatePercent,
    options: [],
  };
  if (booking.paymentStatus === "unpaid" && deposit > 0 && deposit < total) {
    quote.options.push({ type: "deposit", amountAed: deposit, targetStatus: "deposit_paid" });
  }
  quote.options.push({ type: "full", amountAed: remaining, targetStatus: "paid" });
  return { booking, quote };
}

/** Returns only the authorized booking's current payment choices and amounts. */
export async function getBookingPaymentQuote(
  bookingId: string,
  referenceCode: string,
): Promise<{ quote?: BookingPaymentQuote; error?: string }> {
  try {
    const { quote } = await loadBookingPaymentQuote(bookingId, referenceCode);
    return { quote };
  } catch (error) {
    return { error: error instanceof BookingPaymentError ? error.message : "Unable to load booking payment." };
  }
}

/**
 * Creates a Ziina payment intent (or a simulated one outside production).
 * Ziina charges are denominated in fils (1 AED = 100 fils).
 *
 * The charge amount is ALWAYS derived server-side from the booking record:
 * the displayed status and amount must still match the current quote.
 *
 * @param bookingId - UUID or reference code of the booking.
 * @param expectedPayment - Payment status and amount displayed by the modal.
 * @param paymentType - Configured deposit or full outstanding balance.
 * @param referenceCode - Booking reference code (e.g. YAS-ABC123).
 */
export async function createZiinaPaymentIntent(
  bookingId: string,
  expectedPayment: { paymentStatus: string; amountAed: number },
  paymentType: "deposit" | "full",
  referenceCode: string
): Promise<ZiinaPaymentIntentResponse> {
  try {
    if (paymentType !== "deposit" && paymentType !== "full") {
      return { success: false, error: "Invalid payment type." };
    }
    const { booking, quote } = await loadBookingPaymentQuote(bookingId, referenceCode);
    const option = quote.options.find((option) => option.type === paymentType);
    if (!expectedPayment || expectedPayment.paymentStatus !== quote.paymentStatus ||
        !option || expectedPayment.amountAed !== option.amountAed) {
      return { success: false, quote, error: "Booking payment changed. Review the updated amount and retry." };
    }
    const { amountAed, targetStatus } = option;

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

      const updated = await db
        .update(bookings)
        .set({
          paymentStatus: targetStatus,
          paymentReference: transactionId,
          status: "confirmed" as const,
          updatedAt: new Date(),
        })
        .where(and(eq(bookings.id, booking.id), eq(bookings.paymentStatus, booking.paymentStatus)))
        .returning({ id: bookings.id });
      if (updated.length === 0) {
        return { success: false, error: "Booking payment changed. Please retry." };
      }

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
      error: error instanceof BookingPaymentError ? error.message : "Ziina payment gateway error. Please retry.",
    };
  }
}
