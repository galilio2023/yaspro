import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { sendBookingConfirmationNotification } from "@/lib/notifications";
import { revalidatePath, updateTag } from "next/cache";
import crypto from "crypto";

interface WebhookPayload {
  event: string;
  referenceCode?: string;
  bookingId?: string;
  paymentReference?: string;
  amount?: string | number;
  currency?: string;
  customerEmail?: string;
  status?: string;
}

/**
 * Validates HMAC SHA-256 signature when WEBHOOK_SECRET is configured.
 */
function verifyHmacSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.includes("whsec_xxx")) {
    // If webhook secret is not configured in local/staging, permit processing
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, "hex"),
      Buffer.from(signatureHeader.replace(/^sha256=/, ""), "hex")
    );
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

  // 1. Verify HMAC signature ahead of processing
  const signatureHeader = request.headers.get("x-signature") || request.headers.get("x-hub-signature-256");
  if (!verifyHmacSignature(rawBodyText, signatureHeader)) {
    return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  // 2. Parse JSON body
  let body: WebhookPayload;
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

    // ── Payment Reconciliation Event Handler ─────────────────────────────────
    if (event === "payment.completed" || event === "payment.success" || event === "checkout.session.completed") {
      const targetReference = body.referenceCode;
      const targetId = body.bookingId;

      if (!targetReference && !targetId) {
        return NextResponse.json(
          { success: false, error: "Missing booking referenceCode or bookingId in payment payload" },
          { status: 400 }
        );
      }

      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
        // Find matching booking
        const bookingRecord = await db.query.bookings.findFirst({
          where: or(
            targetReference ? eq(bookings.referenceCode, targetReference) : undefined,
            targetId ? eq(bookings.id, targetId) : undefined
          ),
          with: {
            user: true,
          },
        });

        if (!bookingRecord) {
          return NextResponse.json(
            { success: false, error: "Booking record not found for reconciliation" },
            { status: 404 }
          );
        }

        const reconciledReference = body.paymentReference || `PAY-WH-${Date.now().toString(36).toUpperCase()}`;

        // Idempotency check: if already paid with same paymentReference, skip redundant updates
        if (bookingRecord.paymentStatus === "paid" && bookingRecord.paymentReference === reconciledReference) {
          return NextResponse.json({
            success: true,
            event,
            bookingReference: bookingRecord.referenceCode,
            status: "already_reconciled",
            timestamp: new Date().toISOString(),
          });
        }

        // Validate amount match if passed in payload
        if (body.amount !== undefined) {
          const payloadAmt = Number(body.amount);
          const bookingAmt = Number(bookingRecord.totalAmount);
          const depositAmt = Math.round(bookingAmt * 0.5);

          // Allow either full or deposit amount match
          if (!isNaN(payloadAmt) && payloadAmt !== bookingAmt && payloadAmt !== depositAmt) {
            console.warn(`Webhook amount mismatch: received ${payloadAmt}, expected ${bookingAmt} or ${depositAmt}`);
          }
        }

        // Determine target status: default to "paid" for payment.completed unless explicitly a partial deposit
        const isPartialDeposit =
          body.amount !== undefined && Number(body.amount) < Number(bookingRecord.totalAmount);
        const targetPaymentStatus = isPartialDeposit ? "deposit_paid" : "paid";

        // Update booking status in database
        await db
          .update(bookings)
          .set({
            paymentStatus: targetPaymentStatus,
            status: "confirmed",
            paymentReference: reconciledReference,
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, bookingRecord.id));

        // Purge caches
        try {
          updateTag("studios");
          revalidatePath("/admin/bookings");
          revalidatePath("/portal");
        } catch (cacheErr) {
          console.warn("Webhook cache revalidation notice:", cacheErr);
        }

        // Send email call sheet notification to verified customer account only
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
          notificationSentTo: recipientEmail || "skipped_no_user_email",
          timestamp: new Date().toISOString(),
        });
      }

      // Preview / Offline DB mode simulation
      return NextResponse.json({
        success: true,
        event,
        referenceCode: targetReference || targetId,
        paymentStatus: "paid",
        status: "confirmed (preview mode)",
        timestamp: new Date().toISOString(),
      });
    }

    // Default acknowledgement for SMPTE / telemetry / other production events
    return NextResponse.json({
      success: true,
      event,
      timestamp: new Date().toISOString(),
      status: "acknowledged",
      relayNodes: ["dxb-edge-01", "ruh-edge-02"],
    });
  } catch (error) {
    console.error("Webhook processing failure:", error);
    return NextResponse.json(
      { success: false, error: "Internal webhook processing error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Yas Pro Production Event Bridge & Payment Webhooks",
    version: "2.1.0",
    supportedEvents: [
      "payment.completed",
      "payment.success",
      "checkout.session.completed",
      "telemetry.smpte",
      "ob_van.dispatch",
    ],
    timestamp: new Date().toISOString(),
  });
}
