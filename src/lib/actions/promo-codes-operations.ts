"use server";

import { db } from "@/db";
import { promoCodes, promoUsages, type PromoCode, type PromoUsage } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";
import { z } from "zod";

const createPromoSchema = z.object({
  code: z.string().trim().min(2, "Code must be at least 2 characters").max(30),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discountValue: z.number().positive("Discount must be greater than 0"),
  minSpend: z.number().nonnegative().default(0),
  applicableTypes: z.array(z.string()).default(["all"]),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CreatePromoInput = z.infer<typeof createPromoSchema>;

/**
 * Retrieves all promo codes from the database.
 */
export async function getCmsPromoCodes(): Promise<PromoCode[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      return await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
    }
    return [];
  } catch (error) {
    console.error("getCmsPromoCodes error:", error);
    return [];
  }
}

/**
 * Creates a new promo code.
 */
export async function createCmsPromoCode(rawInput: unknown): Promise<CmsResponse<PromoCode>> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const parsed = createPromoSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
    }

    const data = parsed.data;
    const cleanCode = data.code.toUpperCase();

    // Check uniqueness
    const existing = await db.query.promoCodes.findFirst({
      where: eq(promoCodes.code, cleanCode),
    });
    if (existing) {
      return { success: false, error: `Promo code "${cleanCode}" already exists.` };
    }

    const [created] = await db
      .insert(promoCodes)
      .values({
        code: cleanCode,
        discountType: data.discountType,
        discountValue: data.discountValue.toFixed(2),
        minSpend: data.minSpend.toFixed(2),
        applicableTypes: data.applicableTypes,
        maxUses: data.maxUses || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      })
      .returning();

    revalidatePath("/admin/promos");
    return { success: true, message: `Promo code ${created.code} created successfully!`, data: created };
  } catch (error) {
    console.error("createCmsPromoCode error:", error);
    return { success: false, error: (error as Error).message || "Failed to create promo code." };
  }
}

/**
 * Toggles a promo code's active status.
 */
export async function toggleCmsPromoCodeStatus(id: string, isActive: boolean): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db.update(promoCodes).set({ isActive }).where(eq(promoCodes.id, id));
    revalidatePath("/admin/promos");
    return { success: true, message: `Promo code status updated to ${isActive ? "active" : "inactive"}.` };
  } catch (error) {
    console.error("toggleCmsPromoCodeStatus error:", error);
    return { success: false, error: (error as Error).message || "Failed to toggle status." };
  }
}

/**
 * Deletes a promo code.
 */
export async function deleteCmsPromoCode(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db.delete(promoCodes).where(eq(promoCodes.id, id));
    revalidatePath("/admin/promos");
    return { success: true, message: "Promo code deleted successfully." };
  } catch (error) {
    console.error("deleteCmsPromoCode error:", error);
    return { success: false, error: (error as Error).message || "Failed to delete promo code." };
  }
}

/**
 * Retrieves promo code usage redemption history.
 */
export async function getCmsPromoUsages(): Promise<PromoUsage[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      return await db.select().from(promoUsages).orderBy(desc(promoUsages.usedAt));
    }
    return [];
  } catch (error) {
    console.error("getCmsPromoUsages error:", error);
    return [];
  }
}
