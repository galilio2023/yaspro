import "server-only";

import { db } from "@/db";
import { promoCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { OffersPromoRule } from "./promo-codes";

/**
 * Reads an admin-managed promo rule. Fails safe: any DB problem returns null so the
 * static fallback rules in promo-codes.ts still apply.
 */
export async function readDbPromoRule(code: string): Promise<OffersPromoRule | null> {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) return null;
    const [row] = await db.select().from(promoCodes).where(eq(promoCodes.code, code)).limit(1);
    if (!row) return null;
    return {
      discountPercent: row.discountPercent ?? undefined,
      discountAmount: row.discountAmount ? Number(row.discountAmount) : undefined,
      eligibleOfferIds: row.eligibleOfferIds && row.eligibleOfferIds.length ? row.eligibleOfferIds : undefined,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : undefined,
      maxUses: row.maxUses ?? undefined,
      isActive: row.isActive,
    };
  } catch {
    return null;
  }
}
