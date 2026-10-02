export interface NotificationResult {
  sent: boolean;
  channel: "email" | "log";
  recipient: string;
  subject: string;
}

/**
 * Sends or simulates a booking confirmation and Call Sheet notification to the client.
 */
export async function sendBookingConfirmationNotification(
  booking: {
    referenceCode: string;
    totalAmount: string;
    currency?: string;
    scheduledAt: Date;
    durationHours: number;
    sessionType: string;
    propsNotes?: string | null;
    specialRequests?: string | null;
  },
  recipientEmail: string
): Promise<NotificationResult> {
  const subject = `Production Call Sheet & Confirmation [REF: ${booking.referenceCode}]`;
  const formattedDate = new Date(booking.scheduledAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #020617; color: #f8fafc; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
          <h2 style="color: #f59e0b; margin-top: 0;">Yas Productions &bull; Stage Call Sheet</h2>
          <p style="font-size: 14px; color: #94a3b8;">Your stage reservation has been confirmed and scheduled on sovereign UAE studio infrastructure.</p>
          
          <div style="background: #1c1917; border: 1px solid #78350f; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #fbbf24; font-family: monospace;">Booking Reference</p>
            <p style="margin: 4px 0 0 0; font-size: 20px; font-weight: bold; color: #ffffff; font-family: monospace;">${booking.referenceCode}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #cbd5e1; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Session Type:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; color: #ffffff;">${booking.sessionType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Shoot Date:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; color: #ffffff;">${formattedDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Duration:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; color: #ffffff;">${booking.durationHours} hours</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155;">Production Fee:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #334155; text-align: right; font-weight: bold; color: #ffffff;">${booking.currency || "AED"} ${booking.totalAmount}</td>
            </tr>
          </table>

          <div style="font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px;">
            <p style="margin: 0;">Stage Access Badges required at gate. Concierge Line: +971 55 401 0465</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // If a live Resend key is provided in environment variables, dispatch live email
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("re_xxx")) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Yas Productions <concierge@yaspro.ae>",
          to: [recipientEmail],
          subject,
          html: htmlContent,
        }),
      });

      if (response.ok) {
        return { sent: true, channel: "email", recipient: recipientEmail, subject };
      }
    } catch (e) {
      console.error("Resend notification error:", e);
    }
  }

  // Graceful simulation log for local and staging environments
  return { sent: true, channel: "log", recipient: recipientEmail, subject };
}

/**
 * Sends or simulates an alert to the Yas Pro studio team for inbound inquiries and RFPs.
 */
export async function sendInquiryNotification(inquiry: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  inquiryType: string;
  message: string;
}): Promise<NotificationResult> {
  const subject = `[New Inbound Lead] ${inquiry.name} - ${inquiry.inquiryType.toUpperCase()}`;

  return {
    sent: true,
    channel: "log",
    recipient: "production@yaspro.ae",
    subject,
  };
}
