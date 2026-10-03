"use server";

import { db } from "@/db";
import {
  influencers,
  type Influencer,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { isUuid, isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves the creator and influencer roster from Neon PostgreSQL or catalog fallback.
 *
 * @returns Array of influencer profiles.
 */
export async function getCmsInfluencers(): Promise<Influencer[]> {
  if (isDbAvailable()) {
    const records = await db.select().from(influencers).orderBy(desc(influencers.createdAt));
    if (records && records.length > 0) return records;
  }

  return INFLUENCERS_DATA.map((inf) => ({
    id: inf.id,
    slug: inf.slug,
    name: inf.name,
    role: inf.role || null,
    arabicRole: null,
    nationality: inf.nationality || null,
    flag: inf.flag || null,
    bio: inf.bio || null,
    arabicBio: null,
    imageUrl: inf.avatar || null,
    totalFollowers: inf.totalFollowers || null,
    rawFollowers: Math.round(inf.rawFollowers) || null,
    instagramHandle: inf.instagram || null,
    youtubeHandle: inf.youtube || null,
    tiktokHandle: inf.tiktok || null,
    collaborations: inf.collaborations || [],
    signatureProductions: inf.signatureProductions || [],
    demographics: (inf.demographics as unknown as Record<string, unknown>) || {},
    isFeatured: true,
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates an influencer record in Neon PostgreSQL.
 *
 * @param data - Partial influencer record containing required name and slug.
 * @returns CMS response confirming status.
 */
export async function upsertCmsInfluencer(data: Partial<Influencer> & { name: string; slug: string }): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: true, message: "Creator profile updated in preview mode." };
    }

    const payload = {
      name: data.name,
      slug: data.slug,
      role: data.role || null,
      arabicRole: data.arabicRole || null,
      nationality: data.nationality || null,
      flag: data.flag || null,
      bio: data.bio || null,
      arabicBio: data.arabicBio || null,
      imageUrl: data.imageUrl || null,
      totalFollowers: data.totalFollowers || null,
      rawFollowers: data.rawFollowers || null,
      instagramHandle: data.instagramHandle || null,
      youtubeHandle: data.youtubeHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      collaborations: data.collaborations || [],
      signatureProductions: data.signatureProductions || [],
      demographics: data.demographics || {},
      isFeatured: data.isFeatured ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(influencers).set(payload).where(eq(influencers.id, data.id!));
    } else {
      await db.insert(influencers).values(payload).onConflictDoUpdate({
        target: influencers.slug,
        set: payload,
      });
    }

    revalidatePath("/influencers");
    revalidatePath("/admin/influencers");
    updateTag("influencers");
    updateTag(`influencer:${data.slug}`);
    return { success: true, message: "Creator updated successfully in Neon DB." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a creator profile from Neon PostgreSQL.
 *
 * @param id - UUID or slug of the creator profile to remove.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsInfluencer(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      if (isUuid(id)) {
        await db.delete(influencers).where(eq(influencers.id, id));
      } else {
        await db.delete(influencers).where(eq(influencers.slug, id));
      }
    }
    revalidatePath("/influencers");
    revalidatePath("/admin/influencers");
    updateTag("influencers");
    return { success: true, message: "Creator profile removed from directory." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
