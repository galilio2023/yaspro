import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import "@/lib/deployment-environment";

const TTL_SECONDS = 60 * 60 * 24;
const cookieName = (bookingId: string) => `booking-payment-${bookingId}`;

function sign(bookingId: string, expires: string): string {
  const secret = process.env.BETTER_AUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-booking-capability-secret" : undefined);
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required for guest payments.");
  return createHmac("sha256", secret).update(`booking-payment:${bookingId}:${expires}`).digest("hex");
}

// Internal helper: only called after this request creates a guest booking.
export async function issueBookingPaymentCapability(bookingId: string): Promise<void> {
  const expires = String(Date.now() + TTL_SECONDS * 1000);
  (await cookies()).set(cookieName(bookingId), `${expires}.${sign(bookingId, expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function hasBookingPaymentCapability(bookingId: string): Promise<boolean> {
  const token = (await cookies()).get(cookieName(bookingId))?.value;
  if (!token) return false;
  const [expires, signature, extra] = token.split(".");
  if (extra !== undefined || !/^\d+$/.test(expires) || !/^[a-f0-9]{64}$/.test(signature || "")) return false;
  if (!Number.isSafeInteger(Number(expires)) || Number(expires) <= Date.now()) return false;
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(bookingId, expires), "hex"));
}
