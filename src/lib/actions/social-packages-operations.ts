"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import {
  SOCIAL_MEDIA_PACKAGES,
  type SocialMediaPackage,
  type PackageFeature,
} from "@/features/social-media-packages/data/packages";
import { isDbAvailable, requireAdmin } from "./shared";

const SOCIAL_PACKAGES_KEY = "social_media_packages_catalog";

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneDefaultPackages(): SocialMediaPackage[] {
  return SOCIAL_MEDIA_PACKAGES.map((pkg) => ({
    ...pkg,
    isActive: pkg.isActive !== false,
    specsHighlights: { ...pkg.specsHighlights },
    features: pkg.features.map((f) => ({ ...f })),
  }));
}

export async function getCmsSocialPackages(): Promise<SocialMediaPackage[]> {
  if (!isDbAvailable()) {
    return cloneDefaultPackages();
  }

  try {
    let raw: unknown;
    if (typeof db.select === "function") {
      const [row] = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, SOCIAL_PACKAGES_KEY))
        .limit(1);
      raw = row?.value;
    } else if (db.query?.platformSettings?.findFirst) {
      const row = await db.query.platformSettings.findFirst({
        where: eq(platformSettings.key, SOCIAL_PACKAGES_KEY),
      });
      raw = row?.value;
    }
    if (Array.isArray(raw) && raw.length > 0) {
      return (raw as SocialMediaPackage[]).map((pkg) => ({
        ...pkg,
        isActive: pkg.isActive !== false,
      }));
    }
    return cloneDefaultPackages();
  } catch (error) {
    console.warn("[getCmsSocialPackages] DB fallback:", (error as Error)?.message);
    return cloneDefaultPackages();
  }
}

async function saveSocialPackagesToDb(list: SocialMediaPackage[]): Promise<void> {
  if (!isDbAvailable()) return;

  await db
    .insert(platformSettings)
    .values({
      key: SOCIAL_PACKAGES_KEY,
      value: list,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: {
        value: list,
        updatedAt: new Date(),
      },
    });
}

function revalidateSocialPaths() {
  try {
    revalidatePath("/social-media-packages");
    revalidatePath("/admin/offers");
    revalidatePath("/services");
  } catch {
    // Ignore outside Next request context
  }
}

export interface UpsertSocialPackageInput {
  id: string;
  nameEn: string;
  nameAr?: string;
  taglineEn: string;
  taglineAr?: string;
  monthlyPrice: number | null;
  yearlyPricePerMonth: number | null;
  isPopular?: boolean;
  isActive?: boolean;
  ctaTextEn?: string;
  ctaTextAr?: string;
  ctaType?: "purchase" | "contact";
  specsHighlights: {
    reels: string;
    posts: string;
    stories: string;
    filming: string;
  };
  features: PackageFeature[];
}

export async function upsertCmsSocialPackage(
  input: UpsertSocialPackageInput
): Promise<{ success: boolean; error?: string; item?: SocialMediaPackage }> {
  await requireAdmin();

  const id = normalizeSlug(input.id || input.nameEn);
  const nameEn = (input.nameEn || "").trim();
  const nameAr = (input.nameAr || input.nameEn || "").trim();
  const taglineEn = (input.taglineEn || "").trim();
  const taglineAr = (input.taglineAr || input.taglineEn || "").trim();

  if (!id || !nameEn) {
    return { success: false, error: "Package ID and English name are required." };
  }

  try {
    const current = await getCmsSocialPackages();
    const item: SocialMediaPackage = {
      id,
      nameEn,
      nameAr,
      taglineEn,
      taglineAr,
      monthlyPrice:
        input.monthlyPrice !== null && Number.isFinite(Number(input.monthlyPrice))
          ? Number(input.monthlyPrice)
          : null,
      yearlyPricePerMonth:
        input.yearlyPricePerMonth !== null && Number.isFinite(Number(input.yearlyPricePerMonth))
          ? Number(input.yearlyPricePerMonth)
          : null,
      isPopular: Boolean(input.isPopular),
      isActive: input.isActive !== false,
      ctaTextEn: (input.ctaTextEn || (input.ctaType === "contact" ? "Contact Sales" : "Purchase Plan")).trim(),
      ctaTextAr: (input.ctaTextAr || (input.ctaType === "contact" ? "تواصل مع المبيعات" : "اشتراك في الباقة")).trim(),
      ctaType: input.ctaType === "contact" ? "contact" : "purchase",
      specsHighlights: {
        reels: (input.specsHighlights?.reels || "4 Reels").trim(),
        posts: (input.specsHighlights?.posts || "12 Posts").trim(),
        stories: (input.specsHighlights?.stories || "20 Stories").trim(),
        filming: (input.specsHighlights?.filming || "1 Full Day").trim(),
      },
      features: Array.isArray(input.features) ? input.features.filter((f) => f.labelEn.trim()) : [],
    };

    const idx = current.findIndex((p) => p.id === id);
    if (idx >= 0) {
      current[idx] = item;
    } else {
      current.push(item);
    }

    await saveSocialPackagesToDb(current);
    revalidateSocialPaths();
    return { success: true, item };
  } catch (error) {
    console.error("[upsertCmsSocialPackage] Error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to save social media package." };
  }
}

export async function toggleSocialPackageStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const current = await getCmsSocialPackages();
    const idx = current.findIndex((p) => p.id === id);
    if (idx < 0) return { success: false, error: "Social media package not found." };
    current[idx] = { ...current[idx], isActive };
    await saveSocialPackagesToDb(current);
    revalidateSocialPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error)?.message || "Failed to update social package status." };
  }
}

export async function deleteCmsSocialPackage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const current = await getCmsSocialPackages();
    const next = current.filter((p) => p.id !== id);
    if (next.length === 0) {
      return { success: false, error: "At least one social media package must remain in the catalog." };
    }
    await saveSocialPackagesToDb(next);
    revalidateSocialPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error)?.message || "Failed to delete social media package." };
  }
}
