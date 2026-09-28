import { headers } from "next/headers";

interface RateLimitRecord {
  timestamps: number[];
}

interface IdempotencyRecord {
  lastSeen: number;
}

// In-memory maps for sliding window rate limiting and idempotency cooldowns
const rateLimitMap = new Map<string, RateLimitRecord>();
const idempotencyMap = new Map<string, IdempotencyRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();

    for (const [key, record] of rateLimitMap.entries()) {
      // Discard timestamps older than 1 hour
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 60 * 1000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }

    for (const [key, record] of idempotencyMap.entries()) {
      // Discard idempotency records older than 10 minutes
      if (now - record.lastSeen > 10 * 60 * 1000) {
        idempotencyMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Extracts a client identifier (IP address) from request headers.
 */
export async function getClientIdentifier(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
    const cfConnectingIp = headerList.get("cf-connecting-ip");
    if (cfConnectingIp) {
      return cfConnectingIp.trim();
    }
  } catch {
    // In test environments or when headers are unavailable
  }
  return "127.0.0.1";
}

/**
 * Checks and records a request against a sliding-window rate limit.
 *
 * @param key - Unique rate-limit identifier (e.g., `booking:${clientIp}`).
 * @param maxRequests - Maximum requests allowed within the window.
 * @param windowMs - Time window in milliseconds.
 * @returns Object indicating if the request is permitted, remaining requests, and retry delay.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  let record = rateLimitMap.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetInMs = Math.max(0, windowMs - (now - oldestTimestamp));
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetInMs: windowMs,
  };
}

/**
 * Enforces an idempotency cooldown to prevent identical back-to-back submissions.
 *
 * @param key - Unique operation signature (e.g. `inquiry:${email}:${sha256(message)}`).
 * @param cooldownMs - Cooldown duration in milliseconds (default: 60,000ms = 1 min).
 * @returns `true` if this submission is permitted, `false` if it is a duplicate within the cooldown window.
 */
export function checkIdempotency(key: string, cooldownMs = 60_000): boolean {
  const now = Date.now();
  const existing = idempotencyMap.get(key);

  if (existing && now - existing.lastSeen < cooldownMs) {
    return false; // Duplicate rejected
  }

  idempotencyMap.set(key, { lastSeen: now });
  return true;
}

/**
 * Resets rate limit and idempotency maps (primarily for test isolation).
 */
export function resetRateLimitStore(): void {
  rateLimitMap.clear();
  idempotencyMap.clear();
}
