"use server";

import { db } from "@/db";
import { studioBlackouts, type StudioBlackout } from "@/db/schema";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

export interface StudioBlackoutItem {
  id: string;
  studioId: string | null;
  podcastSetId: string | null;
  title: string;
  reason: string | null;
  startTime: string; // ISO
  endTime: string; // ISO
  allDay: boolean;
  createdAt: string;
}

/**
 * Returns all active and scheduled studio blackouts.
 */
export async function getStudioBlackouts(): Promise<StudioBlackoutItem[]> {
  if (!isDbAvailable()) {
    return [];
  }

  try {
    const rows = await db
      .select()
      .from(studioBlackouts)
      .orderBy(studioBlackouts.startTime);

    return rows.map((r) => ({
      id: r.id,
      studioId: r.studioId,
      podcastSetId: r.podcastSetId,
      title: r.title,
      reason: r.reason,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      allDay: r.allDay,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (err: unknown) {
    const msg = (err as Error)?.message || "";
    if (msg.includes('relation "studio_blackouts" does not exist')) {
      try {
        await db.execute(
          `CREATE TABLE IF NOT EXISTS "studio_blackouts" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            "studio_id" uuid,
            "podcast_set_id" text,
            "title" text NOT NULL,
            "reason" text,
            "start_time" timestamp NOT NULL,
            "end_time" timestamp NOT NULL,
            "all_day" boolean DEFAULT false NOT NULL,
            "created_by_id" text,
            "created_at" timestamp DEFAULT now() NOT NULL
          );`
        );
      } catch (createErr) {
        console.warn("[blackout-operations] Table auto-create skipped:", (createErr as Error)?.message);
      }
    } else {
      console.warn("[blackout-operations] getStudioBlackouts error:", msg);
    }
    return [];
  }
}

/**
 * Create a new blackout lockout period. Requires Admin authentication.
 */
export async function createStudioBlackout(data: {
  studioId?: string | null;
  podcastSetId?: string | null;
  title: string;
  reason?: string;
  startTime: string; // ISO or YYYY-MM-DD
  endTime: string; // ISO or YYYY-MM-DD
  allDay?: boolean;
}): Promise<CmsResponse<StudioBlackout>> {
  try {
    const session = await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected. Blackout cannot be saved." };
    }

    if (!data.title?.trim()) {
      return { success: false, error: "Lockout Title is required." };
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return { success: false, error: "Invalid start or end time range." };
    }

    const [row] = await db
      .insert(studioBlackouts)
      .values({
        studioId: data.studioId || null,
        podcastSetId: data.podcastSetId || null,
        title: data.title.trim(),
        reason: data.reason?.trim() || null,
        startTime: start,
        endTime: end,
        allDay: data.allDay ?? false,
        createdById: session?.user?.id || null,
      })
      .returning();

    revalidatePath("/admin/blackouts");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/podcast");
    return { success: true, data: row };
  } catch (err) {
    console.error("[blackout-operations] createStudioBlackout error:", err);
    return { success: false, error: (err as Error).message || "Failed to create studio lockout." };
  }
}

/**
 * Delete a studio blackout by ID. Requires Admin authentication.
 */
export async function deleteStudioBlackout(id: string): Promise<CmsResponse<void>> {
  try {
    await requireAdmin();

    if (!isDbAvailable()) {
      return { success: false, error: "Database not connected." };
    }

    await db.delete(studioBlackouts).where(eq(studioBlackouts.id, id));
    revalidatePath("/admin/blackouts");
    revalidatePath("/admin/bookings");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
