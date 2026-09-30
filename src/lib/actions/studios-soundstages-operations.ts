"use server";

import { db } from "@/db";
import {
  studios,
  type Studio,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { STUDIOS } from "@/features/booking/constants";
import { isUuid, isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves all studio soundstages from Neon PostgreSQL with fallback to static configurations.
 *
 * @returns Array of Studio records.
 */
export async function getCmsStudios(): Promise<Studio[]> {
  if (isDbAvailable()) {
    const records = await db.select().from(studios).orderBy(desc(studios.createdAt));
    if (records && records.length > 0) return records;
  }

  // Fallback to STUDIOS catalog converted to Studio schema format
  return STUDIOS.map((s) => ({
    id: s.id,
    slug: s.id,
    name: s.name,
    arabicName: null,
    description: s.desc || null,
    arabicDescription: null,
    capacity: 20,
    hourlyRate: s.rate.toFixed(2),
    imageUrl: s.image || null,
    amenities: ["10Gbps Symmetrical Fiber", "Green Room", "Hair & Makeup Suite", "Sound Isolated (STC 65)"],
    isActive: true,
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates a studio soundstage record.
 *
 * @param data - Partial studio payload.
 * @returns CMS response confirming upsert.
 */
export async function upsertCmsStudio(
  data: Partial<Studio> & { name: string; slug: string; hourlyRate: string }
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: true, message: "Studio updated in preview mode." };
    }

    const payload = {
      slug: data.slug,
      name: data.name,
      arabicName: data.arabicName || null,
      description: data.description || null,
      arabicDescription: data.arabicDescription || null,
      capacity: data.capacity || 20,
      hourlyRate: data.hourlyRate,
      imageUrl: data.imageUrl || null,
      amenities: data.amenities || [],
      isActive: data.isActive ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(studios).set(payload).where(eq(studios.id, data.id!));
    } else {
      await db.insert(studios).values(payload).onConflictDoUpdate({
        target: studios.slug,
        set: payload,
      });
    }

    revalidatePath("/admin/studios");
    revalidatePath("/studio-booking");
    updateTag("studios");
    return { success: true, message: "Studio details updated in Neon DB." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Toggles a studio soundstage active status (e.g. for maintenance or private hold).
 *
 * @param id - UUID or slug of the studio.
 * @param isActive - Target availability state.
 * @returns CMS response confirming status change.
 */
export async function toggleStudioActiveStatus(id: string, isActive: boolean): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      if (isUuid(id)) {
        await db.update(studios).set({ isActive }).where(eq(studios.id, id));
      } else {
        await db.update(studios).set({ isActive }).where(eq(studios.slug, id));
      }
    }
    revalidatePath("/admin/studios");
    revalidatePath("/studio-booking");
    return { success: true, message: `Studio stage marked as ${isActive ? "active" : "under maintenance"}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
