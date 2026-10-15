"use server";

import { db } from "@/db";
import { offers } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import type { OfferBundleItem } from "@/features/offers/types";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

export interface CmsOfferItem extends OfferBundleItem {
  source: "database" | "static";
  sortOrder?: number;
}

export interface CmsOfferInput {
  id?: string;
  category: "bundle" | "offer";
  name: string;
  nameAr: string;
  tagline?: string | null;
  taglineAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  savings?: string | null;
  savingsAr?: string | null;
  hours: number;
  badge?: string | null;
  badgeAr?: string | null;
  image?: string | null;
  features: string[];
  featuresAr?: string[];
  restrictedDays?: number[] | null;
  restrictionNoteEn?: string | null;
  restrictionNoteAr?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

/** Lists database offers plus built-in static fallbacks for admin management */
export async function getCmsOffers(): Promise<CmsOfferItem[]> {
  await requireAdmin();
  const result: CmsOfferItem[] = [];
  const dbIds = new Set<string>();

  if (isDbAvailable()) {
    try {
      const rows = await db
        .select()
        .from(offers)
        .orderBy(asc(offers.sortOrder), desc(offers.createdAt));

      for (const row of rows) {
        dbIds.add(row.id);
        result.push({
          id: row.id,
          category: row.category as "bundle" | "offer",
          name: row.name,
          nameAr: row.nameAr,
          tagline: row.tagline ?? "",
          taglineAr: row.taglineAr ?? "",
          description: row.description ?? "",
          descriptionAr: row.descriptionAr ?? "",
          price: Number(row.price),
          originalPrice: row.originalPrice ? Number(row.originalPrice) : undefined,
          savings: row.savings ?? undefined,
          savingsAr: row.savingsAr ?? undefined,
          hours: row.hours,
          badge: row.badge ?? undefined,
          badgeAr: row.badgeAr ?? undefined,
          image: row.image || "/images/offers/5-hour-bundles.webp",
          features: (row.features as string[]) || [],
          featuresAr: (row.featuresAr as string[]) || [],
          restrictedDays: (row.restrictedDays as number[]) ?? undefined,
          restrictionNoteEn: row.restrictionNoteEn ?? undefined,
          restrictionNoteAr: row.restrictionNoteAr ?? undefined,
          isActive: row.isActive,
          sortOrder: row.sortOrder,
          source: "database",
        });
      }
    } catch (err) {
      console.error("getCmsOffers error:", err);
    }
  }

  // Include static packages that aren't shadowed by database entries
  for (const staticItem of OFFERS_AND_BUNDLES) {
    if (dbIds.has(staticItem.id)) continue;
    result.push({
      ...staticItem,
      isActive: staticItem.isActive ?? true,
      source: "static",
    });
  }

  return result;
}

/** Create or update an offer/bundle */
export async function upsertCmsOffer(input: CmsOfferInput): Promise<CmsResponse<{ id: string }>> {
  await requireAdmin();

  if (!input.name || input.name.trim().length === 0) {
    return { success: false, error: "English package title is required." };
  }
  if (!input.nameAr || input.nameAr.trim().length === 0) {
    return { success: false, error: "Arabic package title is required." };
  }

  const priceNum = Number(input.price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return { success: false, error: "Price must be a valid positive number in AED." };
  }

  const hoursNum = Number(input.hours);
  if (isNaN(hoursNum) || hoursNum < 1) {
    return { success: false, error: "Session hours must be at least 1 hour." };
  }

  const originalPriceNum =
    input.originalPrice !== undefined && input.originalPrice !== null && String(input.originalPrice).trim() !== ""
      ? Number(input.originalPrice)
      : null;

  // Generate slug ID if not provided
  let id = input.id?.trim();
  if (!id) {
    id = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!id) id = `offer-${Date.now()}`;
  }

  if (!isDbAvailable()) {
    return { success: false, error: "Database connection is not configured." };
  }

  try {
    const payload = {
      id,
      category: input.category || "bundle",
      name: input.name.trim(),
      nameAr: input.nameAr.trim(),
      tagline: input.tagline?.trim() || null,
      taglineAr: input.taglineAr?.trim() || null,
      description: input.description?.trim() || null,
      descriptionAr: input.descriptionAr?.trim() || null,
      price: priceNum.toFixed(2),
      originalPrice: originalPriceNum ? originalPriceNum.toFixed(2) : null,
      savings: input.savings?.trim() || null,
      savingsAr: input.savingsAr?.trim() || null,
      hours: hoursNum,
      badge: input.badge?.trim() || null,
      badgeAr: input.badgeAr?.trim() || null,
      image: input.image?.trim() || "/images/offers/5-hour-bundles.webp",
      features: input.features.filter((f) => f && f.trim().length > 0),
      featuresAr: (input.featuresAr || []).filter((f) => f && f.trim().length > 0),
      restrictedDays: input.restrictedDays || null,
      restrictionNoteEn: input.restrictionNoteEn?.trim() || null,
      restrictionNoteAr: input.restrictionNoteAr?.trim() || null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      updatedAt: new Date(),
    };

    await db
      .insert(offers)
      .values({
        ...payload,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: offers.id,
        set: payload,
      });

    revalidatePath("/admin/offers");
    revalidatePath("/offers");

    return {
      success: true,
      data: { id },
      message: `Package "${input.name}" saved successfully.`,
    };
  } catch (err) {
    console.error("upsertCmsOffer error:", err);
    return { success: false, error: "Failed to save offer package." };
  }
}

/** Toggle active / disabled status of an offer */
export async function toggleOfferStatus(id: string, isActive: boolean): Promise<CmsResponse> {
  await requireAdmin();
  if (!isDbAvailable()) {
    return { success: false, error: "Database connection is not configured." };
  }

  try {
    const existing = await db.select().from(offers).where(eq(offers.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(offers)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(offers.id, id));
    } else {
      // If it was a static bundle, insert it into the database with the toggled state
      const staticItem = OFFERS_AND_BUNDLES.find((o) => o.id === id);
      if (!staticItem) {
        return { success: false, error: `Offer "${id}" not found.` };
      }
      await db.insert(offers).values({
        id: staticItem.id,
        category: staticItem.category,
        name: staticItem.name,
        nameAr: staticItem.nameAr,
        tagline: staticItem.tagline,
        taglineAr: staticItem.taglineAr,
        description: staticItem.description,
        descriptionAr: staticItem.descriptionAr,
        price: staticItem.price.toFixed(2),
        originalPrice: staticItem.originalPrice ? staticItem.originalPrice.toFixed(2) : null,
        savings: staticItem.savings || null,
        savingsAr: staticItem.savingsAr || null,
        hours: staticItem.hours,
        badge: staticItem.badge || null,
        badgeAr: staticItem.badgeAr || null,
        image: staticItem.image,
        features: staticItem.features,
        featuresAr: staticItem.featuresAr,
        restrictedDays: staticItem.restrictedDays || null,
        restrictionNoteEn: staticItem.restrictionNoteEn || null,
        restrictionNoteAr: staticItem.restrictionNoteAr || null,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");

    return {
      success: true,
      message: isActive ? `Package enabled.` : `Package paused/disabled.`,
    };
  } catch (err) {
    console.error("toggleOfferStatus error:", err);
    return { success: false, error: "Failed to update package status." };
  }
}

/** Delete an offer package */
export async function deleteCmsOffer(id: string): Promise<CmsResponse> {
  await requireAdmin();
  if (!isDbAvailable()) {
    return { success: false, error: "Database connection is not configured." };
  }

  try {
    const existing = await db.select().from(offers).where(eq(offers.id, id)).limit(1);

    if (existing.length > 0) {
      await db.delete(offers).where(eq(offers.id, id));
    } else {
      // If it was a static package, insert it as disabled so it no longer shows
      const staticItem = OFFERS_AND_BUNDLES.find((o) => o.id === id);
      if (staticItem) {
        await db.insert(offers).values({
          id: staticItem.id,
          category: staticItem.category,
          name: staticItem.name,
          nameAr: staticItem.nameAr,
          tagline: staticItem.tagline,
          taglineAr: staticItem.taglineAr,
          description: staticItem.description,
          descriptionAr: staticItem.descriptionAr,
          price: staticItem.price.toFixed(2),
          hours: staticItem.hours,
          features: staticItem.features,
          featuresAr: staticItem.featuresAr,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");

    return { success: true, message: `Package deleted.` };
  } catch (err) {
    console.error("deleteCmsOffer error:", err);
    return { success: false, error: "Failed to delete package." };
  }
}
