"use server";

import { db } from "@/db";
import { promoCodes, bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { OFFERS_PROMO_CODES } from "@/features/offers/promo-codes";
import { isDbAvailable, isUuid, requireAdmin, type CmsResponse } from "./shared";

export interface CmsPromoCode {
  id: string;
  code: string;
  label: string | null;
  discountPercent: number | null;
  discountAmount: string | null;
  eligibleOfferIds: string[] | null;
  expiresAt: Date | null;
  maxUses: number | null;
  isActive: boolean;
  usageCount: number;
  source: "database" | "static";
}

/** Lists DB promo codes plus static fallbacks (static ones are read-only and shadowed by same-code DB rows). */
export async function getCmsPromoCodes(): Promise<CmsPromoCode[]> {
  await requireAdmin();
  const result: CmsPromoCode[] = [];
  const dbCodes = new Set<string>();
  if (isDbAvailable()) {
    try {
      const rows = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
      for (const row of rows) {
        dbCodes.add(row.code);
        result.push({
          ...row,
          usageCount: await db.$count(bookings, eq(bookings.promoCode, row.code)),
          source: "database",
        });
      }
    } catch (err) {
      console.error("getCmsPromoCodes error:", err);
    }
  }
  for (const [code, rule] of Object.entries(OFFERS_PROMO_CODES)) {
    if (dbCodes.has(code)) continue;
    result.push({
      id: `static-${code}`,
      code,
      label: null,
      discountPercent: rule.discountPercent ?? null,
      discountAmount: rule.discountAmount !== undefined ? rule.discountAmount.toFixed(2) : null,
      eligibleOfferIds: rule.eligibleOfferIds ?? null,
      expiresAt: rule.expiresAt ? new Date(rule.expiresAt) : null,
      maxUses: rule.maxUses ?? null,
      isActive: true,
      usageCount: 0,
      source: "static",
    });
  }
  return result;
}

export interface PromoCodeInput {
  id?: string;
  code: string;
  label?: string;
  discountPercent?: number | null;
  discountAmount?: string | null;
  eligibleOfferIds?: string[] | null;
  expiresAt?: string | null;
  maxUses?: number | null;
  isActive?: boolean;
}

/** Creates or updates a promo code. Saving a static code's name creates a DB override for it. */
export async function upsertCmsPromoCode(input: PromoCodeInput): Promise<CmsResponse> {
  try {
    await requireAdmin();
    const code = input.code?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9_-]{3,32}$/.test(code)) return { success: false, error: "Code must be 3-32 letters, numbers, - or _." };
    const percent = input.discountPercent ?? null;
    const amount = input.discountAmount && Number(input.discountAmount) > 0 ? Number(input.discountAmount) : null;
    if ((percent === null) === (amount === null)) return { success: false, error: "Set either a percentage or a fixed amount discount." };
    if (percent !== null && (!Number.isInteger(percent) || percent < 1 || percent > 100)) return { success: false, error: "Percentage must be between 1 and 100." };
    if (input.maxUses != null && (!Number.isInteger(input.maxUses) || input.maxUses < 1)) return { success: false, error: "Max uses must be a positive whole number." };
    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) return { success: false, error: "Invalid expiry date." };
    if (!isDbAvailable()) return { success: true, message: "Promo saved in preview mode." };

    const payload = {
      code,
      label: input.label?.trim() || null,
      discountPercent: percent,
      discountAmount: amount !== null ? amount.toFixed(2) : null,
      eligibleOfferIds: input.eligibleOfferIds && input.eligibleOfferIds.length ? input.eligibleOfferIds : null,
      expiresAt,
      maxUses: input.maxUses ?? null,
      isActive: input.isActive ?? true,
    };
    if (isUuid(input.id)) {
      await db.update(promoCodes).set(payload).where(eq(promoCodes.id, input.id!));
    } else {
      await db.insert(promoCodes).values(payload).onConflictDoUpdate({ target: promoCodes.code, set: payload });
    }
    revalidatePath("/admin/offers");
    return { success: true, message: "Promo code saved." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function togglePromoCodeStatus(id: string, isActive: boolean): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { success: false, error: "Static codes must be saved as a database promo before they can be toggled." };
    if (isDbAvailable()) await db.update(promoCodes).set({ isActive }).where(eq(promoCodes.id, id));
    revalidatePath("/admin/offers");
    return { success: true, message: `Promo ${isActive ? "activated" : "disabled"}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCmsPromoCode(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { success: false, error: "Static codes are defined in code and cannot be deleted. Override and disable them instead." };
    if (isDbAvailable()) await db.delete(promoCodes).where(eq(promoCodes.id, id));
    revalidatePath("/admin/offers");
    return { success: true, message: "Promo code deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
