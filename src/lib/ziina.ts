"use server";

import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
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

/**
 * Creates a Ziina payment intent or simulates an instant UAE payment rail session.
 * Ziina charges are denominated in fils (1 AED = 100 fils).
 *
 * @param bookingId - UUID or reference code of the booking.
 * @param amountAed - Charge amount in AED.
 * @param paymentType - "deposit" (50%) or "full".
 * @param referenceCode - Booking reference code (e.g. YAS-ABC123).
 */
export async function createZiinaPaymentIntent(
  bookingId: string,
  amountAed: number,
  paymentType: "deposit" | "full",
  referenceCode: string
): Promise<ZiinaPaymentIntentResponse> {
  try {
    if (!bookingId && !referenceCode) {
      return { success: false, error: "Booking reference is required to initiate Ziina payment." };
    }

    if (amountAed <= 0) {
      return { success: false, error: "Invalid payment amount." };
    }

    const ziinaApiKey = process.env.ZIINA_API_KEY;
    const isSimulateEnabled = process.env.ZIINA_SIMULATE === "true" || process.env.NODE_ENV === "test";

    const isLiveKey = Boolean(ziinaApiKey && !ziinaApiKey.includes("ziina_xxx") && !ziinaApiKey.startsWith("your_"));

    // 1. Live Ziina API Key branch
    if (isLiveKey) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yaspro.ae";
      const amountInFils = Math.round(amountAed * 100);
      const idempotencyKey = `ziina-${bookingId || referenceCode}-${paymentType}-${amountInFils}`;

      const response = await fetch("https://api.ziina.com/v1/payment_intent", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ziinaApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: amountInFils,
          currency_code: "AED",
          message: `Yas Productions Studio Booking [${referenceCode}]`,
          success_url: `${baseUrl}/studio-booking?status=success&ref=${referenceCode}`,
          cancel_url: `${baseUrl}/studio-booking?status=cancelled&ref=${referenceCode}`,
          metadata: {
            bookingId,
            referenceCode,
            paymentType,
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

      if (data.redirect_url) {
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

    // 2. Explicit simulation branch (allowed only with ZIINA_SIMULATE=true or in test environments)
    if (isSimulateEnabled) {
      const transactionId = `ZIINA_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const targetStatus = paymentType === "deposit" ? "deposit_paid" : "paid";

      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
        const updateData = {
          paymentStatus: targetStatus,
          paymentReference: transactionId,
          status: "confirmed" as const,
          updatedAt: new Date(),
        };

        if (bookingId && bookingId.length > 20) {
          await db.update(bookings).set(updateData).where(eq(bookings.id, bookingId));
        } else {
          await db.update(bookings).set(updateData).where(eq(bookings.referenceCode, referenceCode));
        }

        try {
          updateTag("studios");
        } catch (e) {
          console.warn("Cache tag update notice:", e);
        }
      }

      revalidatePath("/admin/bookings");
      revalidatePath("/portal");
      revalidatePath("/studio-booking");

      return {
        success: true,
        transactionId,
        paymentStatus: targetStatus,
        message: `Ziina UAE Simulation of AED ${amountAed.toLocaleString()} completed successfully. Transaction ID: ${transactionId}.`,
      };
    }

    // 3. In production without API key and without explicit simulation flag, do not mark as paid
    return {
      success: false,
      error: "Ziina payment configuration is missing. Please contact Yas Productions support.",
    };
  } catch (error) {
    console.error("createZiinaPaymentIntent error:", error);
    return {
      success: false,
      error: (error as Error).message || "Ziina payment gateway error. Please retry.",
    };
  }
}
