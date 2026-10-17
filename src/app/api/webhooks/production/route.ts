import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendBookingConfirmationNotification } from "@/lib/notifications";
import { revalidatePath, updateTag } from "next/cache";
import crypto from "crypto";

interface ZiinaWebhookPayload {
  event?: string;
  data?: {
    id?: string;
    amount?: number;
    currency_code?: string;
    status?: string;
    metadata?: { bookingId?: string; referenceCode?: string; paymentType?: string };
  };
}

/**
 * Validates Ziina's `X-Hmac-Signature` header: hex-encoded HMAC-SHA256 of the raw body,
 * keyed with the secret supplied when the webhook was registered (WEBHOOK_SECRET).
 */
function verifyHmacSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    // Only permit bypass in explicit test environments or unconfigured local sandboxes
    const isLocalOrTestDb =
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes("ep-xxx") ||
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("postgresql://test:");

    const isPermittedBypass =
      process.env.ALLOW_UNSIGNED_WEBHOOKS === "true" ||
      (process.env.NODE_ENV !== "production" && isLocalOrTestDb);

    if (isPermittedBypass) {
      return true;
    }

    console.error("WEBHOOK_SECRET is not configured while running in production database environment. Webhook rejected.");
    return false;
  }
  if (!signatureHeader) {
    return false;
  }

  try {
    const computed = Buffer.from(
      crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex"),
      "hex"
    );
    const provided = Buffer.from(signatureHeader.trim().replace(/^sha256=/, ""), "hex");
    return provided.length === computed.length && crypto.timingSafeEqual(computed, provided);
  } catch (err) {
    console.error("Webhook signature verification error:", err);
    return false;
  }
}

export async function POST(request: Request) {
  let rawBodyText = "";
  try {
    rawBodyText = await request.text();
  } catch {
    return NextResponse.json({ success: false, error: "Failed to read request body" }, { status: 400 });
  }

  // 1. Verify HMAC signature ahead of processing (Ziina sends X-Hmac-Signature)
  const signatureHeader =
    request.headers.get("x-hmac-signature") ||
    request.headers.get("x-signature") ||
    request.headers.get("x-hub-signature-256");
  if (!verifyHmacSignature(rawBodyText, signatureHeader)) {
    return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  // 2. Parse JSON body
  let body: ZiinaWebhookPayload;
  try {
    body = JSON.parse(rawBodyText);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON format" }, { status: 400 });
  }

  try {
    const { event } = body;
    if (!event) {
      return NextResponse.json({ success: false, error: "Missing event identifier" }, { status: 400 });
    }

    // ── Ziina payment reconciliation ─────────────────────────────────────────
    if (event === "payment_intent.status.updated") {
      const data = body.data;
      const intentId = data?.id;
      if (!intentId) {
        return NextResponse.json({ success: false, error: "Missing payment intent id" }, { status: 400 });
      }

      // Only a completed payment confirms a booking; acknowledge everything else.
      if (data?.status !== "completed") {
        return NextResponse.json({ success: true, event, status: "ignored_non_completed" });
      }

      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
        return NextResponse.json({ success: false, error: "Booking service is unavailable." }, { status: 503 });
      }

      // The intent id is stored on the booking when the intent is created.
      const bookingRecord = await db.query.bookings.findFirst({
        where: eq(bookings.paymentReference, intentId),
        with: { user: true },
      });

      if (!bookingRecord) {
        return NextResponse.json(
          { success: false, error: "Booking record not found for reconciliation" },
          { status: 404 }
        );
      }

      const intent = bookingRecord.paymentIntent;
      if (!intent || !Number.isFinite(intent.depositPercent) ||
          intent.depositPercent < 10 || intent.depositPercent > 100 ||
          !Number.isSafeInteger(intent.amountFils) || intent.amountFils <= 0) {
        return NextResponse.json(
          { success: false, error: "Stored payment intent terms are unavailable" },
          { status: 422 }
        );
      }

      // Amount validation in fils against what this booking can legitimately be charged.
      const totalAed = Math.round(Number(bookingRecord.totalAmount));
      const totalFils = totalAed * 100;
      const depositFils = Math.round((totalAed * intent.depositPercent) / 100) * 100;
      const paidAmount = Number(data.amount);
      let targetPaymentStatus: "paid" | "deposit_paid" | null = null;

      const expectedAmount = intent.targetStatus === "deposit_paid"
        ? depositFils
        : bookingRecord.paymentStatus === "deposit_paid" ? totalFils - depositFils : totalFils;
      const alreadyReconciled = bookingRecord.paymentStatus === intent.targetStatus &&
        bookingRecord.status === "confirmed";

      if (Number.isFinite(totalAed) && totalAed > 0 &&
          (intent.targetStatus === "paid" || intent.targetStatus === "deposit_paid") &&
          paidAmount === intent.amountFils &&
          (alreadyReconciled || paidAmount === expectedAmount)) {
        targetPaymentStatus = intent.targetStatus;
      }

      if (!targetPaymentStatus || (data.currency_code && data.currency_code !== "AED")) {
        console.error(
          `Webhook amount/currency mismatch for ${bookingRecord.referenceCode}: received ${data.amount} ${data.currency_code}`
        );
        // 422: not retried as a transient failure, but NOT confirmed either.
        return NextResponse.json(
          { success: false, error: "Payment amount does not match booking" },
          { status: 422 }
        );
      }

      if (alreadyReconciled) {
        return NextResponse.json({
          success: true,
          event,
          bookingReference: bookingRecord.referenceCode,
          status: "already_reconciled",
        });
      }

      await db
        .update(bookings)
        .set({
          paymentStatus: targetPaymentStatus,
          status: "confirmed",
          paymentReference: intentId,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingRecord.id));

      try {
        updateTag("studios");
        revalidatePath("/admin/bookings");
        revalidatePath("/account");
      } catch (cacheErr) {
        console.warn("Webhook cache revalidation notice:", cacheErr);
      }

      const recipientEmail = bookingRecord.user?.email;
      if (recipientEmail) {
        await sendBookingConfirmationNotification(
          {
            referenceCode: bookingRecord.referenceCode,
            totalAmount: bookingRecord.totalAmount,
            currency: bookingRecord.currency,
            scheduledAt: bookingRecord.scheduledAt,
            durationHours: bookingRecord.durationHours,
            sessionType: bookingRecord.sessionType,
            propsNotes: bookingRecord.propsNotes,
            specialRequests: bookingRecord.specialRequests,
          },
          recipientEmail
        );
      }

      return NextResponse.json({
        success: true,
        event,
        bookingReference: bookingRecord.referenceCode,
        paymentStatus: targetPaymentStatus,
        status: "confirmed",
      });
    }

    // Any other event: acknowledge so the sender does not retry.
    return NextResponse.json({ success: true, event, status: "acknowledged" });
  } catch (error) {
    console.error("Webhook processing failure:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "online" });
}
