import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { sendBookingConfirmationNotification } from "@/lib/notifications";
import { revalidatePath, updateTag } from "next/cache";

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

export async function POST(request: Request) {
  try {
    const body: WebhookPayload = await request.json();

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

        // Update booking status in database
        await db
          .update(bookings)
          .set({
            paymentStatus: "paid",
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

        // Send email call sheet notification to customer
        const recipientEmail =
          body.customerEmail ||
          bookingRecord.user?.email ||
          "client@yaspro.ae";

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

        return NextResponse.json({
          success: true,
          event,
          bookingReference: bookingRecord.referenceCode,
          paymentStatus: "paid",
          status: "confirmed",
          notificationSentTo: recipientEmail,
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
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Invalid webhook payload format" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "Yas Pro Production Event Bridge & Payment Webhooks",
    version: "2.0.0",
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
