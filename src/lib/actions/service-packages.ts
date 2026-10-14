"use server";

import { db } from "@/db";
import { servicePackages, type ServicePackage } from "@/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import { PODCAST_SERVICES } from "@/features/podcast-booking/data";
import { SOCIAL_MEDIA_PACKAGES } from "@/features/social-media-packages/data/packages";

/**
 * Seed initial service packages if the table is currently empty.
 */
async function seedInitialPackagesIfEmpty() {
  try {
    const existing = await db.select().from(servicePackages).limit(1);
    if (existing.length > 0) return;

    const toInsert = [];

    // 1. Podcast Services
    for (const svc of PODCAST_SERVICES) {
      toInsert.push({
        id: `podcast-${svc.key}`,
        pillar: "podcast",
        title: svc.title,
        arabicTitle: null,
        subtitle: svc.sub,
        price: String(svc.price),
        currency: "AED",
        badge: svc.badge || null,
        hours: 1,
        episodesCount: 1,
        deliverables: svc.highlights || svc.features.map((f) => f.text),
        arabicDeliverables: [],
        imageUrl: "/images/studios/nature-grid.jpg",
        isActive: true,
        isFeatured: svc.best || false,
        sortOrder: toInsert.length,
      });
    }

    // 2. Offers & Bundles
    for (const offer of OFFERS_AND_BUNDLES.slice(0, 6)) {
      toInsert.push({
        id: `offer-${offer.id}`,
        pillar: "offers",
        title: offer.name,
        arabicTitle: offer.nameAr || null,
        subtitle: offer.tagline,
        price: String(offer.price),
        currency: "AED",
        badge: offer.badge || null,
        hours: offer.hours || null,
        episodesCount: null,
        deliverables: offer.features,
        arabicDeliverables: offer.featuresAr || [],
        imageUrl: offer.image || null,
        isActive: true,
        isFeatured: offer.id === "5-hour-bundles",
        sortOrder: toInsert.length,
      });
    }

    // 3. Social Media Retainers
    for (const pkg of SOCIAL_MEDIA_PACKAGES) {
      toInsert.push({
        id: `social-${pkg.id}`,
        pillar: "social_media",
        title: `${pkg.nameEn} Social Retainer`,
        arabicTitle: pkg.nameAr,
        subtitle: pkg.taglineEn,
        price: String(pkg.monthlyPrice || 0),
        currency: "AED",
        badge: pkg.isPopular ? "Most Popular" : null,
        hours: pkg.specsHighlights.filming.includes("4h") ? 4 : 8,
        episodesCount: null,
        deliverables: pkg.features.map((f) => f.labelEn),
        arabicDeliverables: pkg.features.map((f) => f.labelAr),
        imageUrl: "/images/offers/social-retainer.webp",
        isActive: true,
        isFeatured: pkg.isPopular || false,
        sortOrder: toInsert.length,
      });
    }

    if (toInsert.length > 0) {
      await db.insert(servicePackages).values(toInsert).onConflictDoNothing();
      console.log(`[Seed] Seeded ${toInsert.length} service packages into Neon DB.`);
    }
  } catch (err) {
    console.error("Failed to seed initial packages:", err);
  }
}

/**
 * Retrieves all packages for the admin CMS.
 */
export async function getCmsPackages(): Promise<ServicePackage[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await seedInitialPackagesIfEmpty();
      return await db
        .select()
        .from(servicePackages)
        .orderBy(asc(servicePackages.sortOrder), desc(servicePackages.createdAt));
    }
  } catch (error) {
    console.error("getCmsPackages error:", error);
  }

  return [];
}

/**
 * Retrieves public active packages filtered by pillar.
 */
export async function getPublicServicePackages(pillar?: string): Promise<ServicePackage[]> {
  try {
    if (isDbAvailable()) {
      const conditions = [eq(servicePackages.isActive, true)];
      if (pillar) {
        conditions.push(eq(servicePackages.pillar, pillar));
      }

      return await db
        .select()
        .from(servicePackages)
        .where(and(...conditions))
        .orderBy(asc(servicePackages.sortOrder), desc(servicePackages.createdAt));
    }
  } catch (error) {
    console.error("getPublicServicePackages error:", error);
  }

  return [];
}

export interface CreatePackageInput {
  id?: string;
  pillar: "podcast" | "offers" | "social_media" | "soundstage" | "broadcast" | "gear" | "production";
  title: string;
  arabicTitle?: string | null;
  subtitle?: string | null;
  price: number | string;
  currency?: string;
  badge?: string | null;
  hours?: number | null;
  episodesCount?: number | null;
  deliverables?: string[];
  arabicDeliverables?: string[];
  imageUrl?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
}

/**
 * Creates a new service package.
 */
export async function createCmsPackage(
  input: CreatePackageInput
): Promise<CmsResponse & { pkg?: ServicePackage }> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const rawId = input.id?.trim()
      ? input.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : `${input.pillar}-${input.title.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const [record] = await db
      .insert(servicePackages)
      .values({
        id: rawId,
        pillar: input.pillar,
        title: input.title.trim(),
        arabicTitle: input.arabicTitle?.trim() || null,
        subtitle: input.subtitle?.trim() || null,
        price: String(input.price),
        currency: input.currency || "AED",
        badge: input.badge?.trim() || null,
        hours: input.hours ?? null,
        episodesCount: input.episodesCount ?? null,
        deliverables: input.deliverables || [],
        arabicDeliverables: input.arabicDeliverables || [],
        imageUrl: input.imageUrl?.trim() || null,
        isActive: input.isActive ?? true,
        isFeatured: input.isFeatured ?? false,
      })
      .returning();

    revalidatePath("/offers");
    revalidatePath("/podcast-booking");
    revalidatePath("/social-media-packages");
    revalidatePath("/admin/packages");

    return {
      success: true,
      message: `Package "${input.title}" created successfully.`,
      pkg: record,
    };
  } catch (error) {
    console.error("createCmsPackage error:", error);
    return { success: false, error: (error as Error).message || "Failed to create package." };
  }
}

export interface UpdatePackageInput extends Partial<CreatePackageInput> {
  id: string;
}

/**
 * Updates an existing service package.
 */
export async function updateCmsPackage(
  input: UpdatePackageInput
): Promise<CmsResponse & { pkg?: ServicePackage }> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.arabicTitle !== undefined) updateData.arabicTitle = input.arabicTitle?.trim() || null;
    if (input.subtitle !== undefined) updateData.subtitle = input.subtitle?.trim() || null;
    if (input.price !== undefined) updateData.price = String(input.price);
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.badge !== undefined) updateData.badge = input.badge?.trim() || null;
    if (input.hours !== undefined) updateData.hours = input.hours;
    if (input.episodesCount !== undefined) updateData.episodesCount = input.episodesCount;
    if (input.deliverables !== undefined) updateData.deliverables = input.deliverables;
    if (input.arabicDeliverables !== undefined) updateData.arabicDeliverables = input.arabicDeliverables;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl?.trim() || null;
    if (input.pillar !== undefined) updateData.pillar = input.pillar;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.isFeatured !== undefined) updateData.isFeatured = input.isFeatured;

    const [record] = await db
      .update(servicePackages)
      .set(updateData)
      .where(eq(servicePackages.id, input.id))
      .returning();

    revalidatePath("/offers");
    revalidatePath("/podcast-booking");
    revalidatePath("/social-media-packages");
    revalidatePath("/admin/packages");

    return {
      success: true,
      message: `Package "${record.title}" updated successfully.`,
      pkg: record,
    };
  } catch (error) {
    console.error("updateCmsPackage error:", error);
    return { success: false, error: (error as Error).message || "Failed to update package." };
  }
}

/**
 * Toggles active status of a service package.
 */
export async function toggleCmsPackageStatus(
  id: string,
  isActive: boolean
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db
      .update(servicePackages)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(servicePackages.id, id));

    revalidatePath("/offers");
    revalidatePath("/podcast-booking");
    revalidatePath("/social-media-packages");
    revalidatePath("/admin/packages");

    return { success: true, message: `Package status set to ${isActive ? "active" : "disabled"}.` };
  } catch (error) {
    console.error("toggleCmsPackageStatus error:", error);
    return { success: false, error: (error as Error).message || "Failed to toggle status." };
  }
}

/**
 * Deletes a service package.
 */
export async function deleteCmsPackage(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db.delete(servicePackages).where(eq(servicePackages.id, id));

    revalidatePath("/offers");
    revalidatePath("/podcast-booking");
    revalidatePath("/social-media-packages");
    revalidatePath("/admin/packages");

    return { success: true, message: "Package removed successfully." };
  } catch (error) {
    console.error("deleteCmsPackage error:", error);
    return { success: false, error: (error as Error).message || "Failed to delete package." };
  }
}
