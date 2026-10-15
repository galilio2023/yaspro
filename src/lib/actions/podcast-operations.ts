"use server";

import { db } from "@/db";
import { podcastSets, podcastAddons, studios, type PodcastSet, type PodcastAddonEntity } from "@/db/schema";
import { PODCAST_STUDIOS, PODCAST_ADDONS, PODCAST_SERVICES } from "@/features/podcast-booking/data";
import type { PodcastStudio, PodcastAddon } from "@/features/podcast-booking/types";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensurePodcastCatalog } from "@/lib/podcast-catalog";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

// ─── Podcast Studios Operations ───────────────────────────────────────────────

/**
 * Returns all podcast studio sets from the database, falling back to static PODCAST_STUDIOS.
 */
export async function getCmsPodcastSets(): Promise<PodcastStudio[]> {
  if (!isDbAvailable()) {
    return PODCAST_STUDIOS;
  }

  try {
    await ensurePodcastCatalog();
    const rows = await db
      .select()
      .from(podcastSets)
      .orderBy(asc(podcastSets.sortOrder), asc(podcastSets.name));

    return rows.map((r) => ({
      key: r.id,
      name: r.name,
      seats: r.seats,
      location: r.location,
      image: r.image || "/images/studios/nature-grid.jpg",
      gradient: r.gradient || "linear-gradient(135deg,#3a2a1a 0%,#5a4a3a 100%)",
      description: r.description || "",
      isAvailable: r.isAvailable,
    }));
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "";
    if (msg.includes('relation "podcast_sets" does not exist')) {
      try {
        await db.execute(
          `CREATE TABLE IF NOT EXISTS "podcast_sets" (
            "id" text PRIMARY KEY NOT NULL,
            "name" text NOT NULL,
            "seats" integer DEFAULT 2 NOT NULL,
            "location" text DEFAULT 'Iris Bay - Business Bay, Dubai' NOT NULL,
            "image" text,
            "gradient" text,
            "description" text,
            "is_available" boolean DEFAULT true NOT NULL,
            "sort_order" integer DEFAULT 0 NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );`
        );
      } catch (createErr) {
        console.warn("[podcast-operations] Table auto-create skipped:", (createErr as Error)?.message);
      }
    } else {
      console.warn("[podcast-operations] Falling back to static studios:", msg);
    }
    return PODCAST_STUDIOS;
  }
}

/**
 * Create or update a podcast studio set. Requires Admin authentication.
 */
export async function upsertCmsPodcastSet(data: {
  id: string;
  name: string;
  seats: number;
  location?: string;
  image?: string;
  gradient?: string;
  description?: string;
  isAvailable?: boolean;
}): Promise<CmsResponse<PodcastSet>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected. Studio changes cannot be persisted." };
    }

    await ensurePodcastCatalog();

    const cleanId = data.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!cleanId || !data.name.trim()) {
      return { success: false, error: "Unique Set Key and Name are required." };
    }

    const row = await db.transaction(async (tx) => {
      const [saved] = await tx
        .insert(podcastSets)
        .values({
          id: cleanId,
          name: data.name.trim(),
          seats: data.seats || 2,
          location: data.location?.trim() || "Iris Bay - Business Bay, Dubai",
          image: data.image?.trim() || "/images/studios/nature-grid.jpg",
          gradient: data.gradient?.trim() || "linear-gradient(135deg,#3a2a1a 0%,#5a4a3a 100%)",
          description: data.description?.trim() || "",
          isAvailable: data.isAvailable ?? true,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: podcastSets.id,
          set: {
            name: data.name.trim(),
            seats: data.seats || 2,
            location: data.location?.trim() || "Iris Bay - Business Bay, Dubai",
            image: data.image?.trim() || "/images/studios/nature-grid.jpg",
            gradient: data.gradient?.trim() || "linear-gradient(135deg,#3a2a1a 0%,#5a4a3a 100%)",
            description: data.description?.trim() || "",
            isAvailable: data.isAvailable ?? true,
            updatedAt: new Date(),
          },
        })
        .returning();

      // Keep the scheduling resource aligned with CMS keys and capacity.
      await tx.insert(studios).values({
        slug: cleanId,
        name: saved.name,
        capacity: saved.seats,
        hourlyRate: String(PODCAST_SERVICES.find((service) => service.key === "recording")!.price),
        category: "podcast",
        imageUrl: saved.image,
      }).onConflictDoUpdate({
        target: studios.slug,
        set: { name: saved.name, capacity: saved.seats, imageUrl: saved.image },
        setWhere: eq(studios.category, "podcast"),
      });
      return saved;
    });

    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true, data: row };
  } catch (err) {
    console.error("[podcast-operations] upsert set error:", err);
    return { success: false, error: (err as Error).message || "Failed to save podcast set." };
  }
}

/**
 * Toggle podcast set availability.
 */
export async function togglePodcastSetAvailability(
  id: string,
  isAvailable: boolean
): Promise<CmsResponse<void>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected." };
    }

    await ensurePodcastCatalog();

    await db
      .update(podcastSets)
      .set({ isAvailable, updatedAt: new Date() })
      .where(eq(podcastSets.id, id));

    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Delete a podcast set.
 */
export async function deleteCmsPodcastSet(id: string): Promise<CmsResponse<void>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected." };
    }

    await ensurePodcastCatalog();

    await db.transaction(async (tx) => {
      await tx.update(studios).set({ isActive: false }).where(eq(studios.slug, id));
      await tx.delete(podcastSets).where(eq(podcastSets.id, id));
    });
    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ─── Podcast Addons Operations ────────────────────────────────────────────────

/**
 * Returns all podcast post-production addons from DB, falling back to static PODCAST_ADDONS.
 */
export async function getCmsPodcastAddons(): Promise<PodcastAddon[]> {
  if (!isDbAvailable()) {
    return PODCAST_ADDONS.map((a) => ({ ...a, isActive: true }));
  }

  try {
    await ensurePodcastCatalog();
    const rows = await db
      .select()
      .from(podcastAddons)
      .orderBy(asc(podcastAddons.sortOrder), asc(podcastAddons.title));

    return rows.map((r) => ({
      key: r.id,
      title: r.title,
      desc: r.desc || "",
      priceNum: r.priceNum,
      priceDisplay: r.priceDisplay,
      unit: r.unit,
      gradient: r.gradient || "linear-gradient(135deg,#2a1a3a 0%,#4a3a5a 100%)",
      vimeoEmbed: r.vimeoEmbed || undefined,
      isActive: r.isActive,
    }));
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "";
    if (msg.includes('relation "podcast_addons" does not exist')) {
      try {
        await db.execute(
          `CREATE TABLE IF NOT EXISTS "podcast_addons" (
            "id" text PRIMARY KEY NOT NULL,
            "title" text NOT NULL,
            "desc" text,
            "price_num" integer NOT NULL,
            "price_display" text NOT NULL,
            "unit" text DEFAULT 'per asset' NOT NULL,
            "gradient" text,
            "vimeo_embed" text,
            "is_active" boolean DEFAULT true NOT NULL,
            "sort_order" integer DEFAULT 0 NOT NULL,
            "created_at" timestamp DEFAULT now() NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );`
        );
      } catch (createErr) {
        console.warn("[podcast-operations] Addon auto-create skipped:", (createErr as Error)?.message);
      }
    } else {
      console.warn("[podcast-operations] Falling back to static addons:", msg);
    }
    return PODCAST_ADDONS.map((a) => ({ ...a, isActive: true }));
  }
}

/**
 * Create or update a podcast add-on. Requires Admin authentication.
 */
export async function upsertCmsPodcastAddon(data: {
  id: string;
  title: string;
  desc?: string;
  priceNum: number;
  priceDisplay?: string;
  unit?: string;
  gradient?: string;
  vimeoEmbed?: string;
  isActive?: boolean;
}): Promise<CmsResponse<PodcastAddonEntity>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected. Add-on changes cannot be persisted." };
    }

    await ensurePodcastCatalog();

    const cleanId = data.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!cleanId || !data.title.trim()) {
      return { success: false, error: "Unique Add-on Key and Title are required." };
    }

    const priceNum = Math.max(0, Math.round(data.priceNum));
    const priceDisplay = data.priceDisplay?.trim() || `AED ${priceNum.toLocaleString("en-US")}`;
    const unit = data.unit?.trim() || "per asset";

    const [row] = await db
      .insert(podcastAddons)
      .values({
        id: cleanId,
        title: data.title.trim(),
        desc: data.desc?.trim() || "",
        priceNum,
        priceDisplay,
        unit,
        gradient: data.gradient?.trim() || "linear-gradient(135deg,#2a1a3a 0%,#4a3a5a 100%)",
        vimeoEmbed: data.vimeoEmbed?.trim() || null,
        isActive: data.isActive ?? true,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: podcastAddons.id,
        set: {
          title: data.title.trim(),
          desc: data.desc?.trim() || "",
          priceNum,
          priceDisplay,
          unit,
          gradient: data.gradient?.trim() || "linear-gradient(135deg,#2a1a3a 0%,#4a3a5a 100%)",
          vimeoEmbed: data.vimeoEmbed?.trim() || null,
          isActive: data.isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning();

    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true, data: row };
  } catch (err) {
    console.error("[podcast-operations] upsert addon error:", err);
    return { success: false, error: (err as Error).message || "Failed to save podcast add-on." };
  }
}

/**
 * Toggle podcast add-on active status.
 */
export async function togglePodcastAddonStatus(
  id: string,
  isActive: boolean
): Promise<CmsResponse<void>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected." };
    }

    await ensurePodcastCatalog();

    await db
      .update(podcastAddons)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(podcastAddons.id, id));

    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Delete a podcast add-on.
 */
export async function deleteCmsPodcastAddon(id: string): Promise<CmsResponse<void>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected." };
    }

    await ensurePodcastCatalog();

    await db.delete(podcastAddons).where(eq(podcastAddons.id, id));
    revalidatePath("/admin/podcast");
    revalidatePath("/podcast-production");
    revalidatePath("/podcast-booking");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
