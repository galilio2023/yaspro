"use server";

import { db } from "@/db";
import {
  blockedSchedules,
  studios,
  type BlockedSchedule,
} from "@/db/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

export interface EnrichedBlockedSchedule extends BlockedSchedule {
  studioName?: string | null;
}

/**
 * Retrieves all blocked schedules and maintenance blackouts for admin CMS.
 */
export async function getCmsBlockedSchedules(): Promise<EnrichedBlockedSchedule[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      const records = await db
        .select({
          blocked: blockedSchedules,
          studioName: studios.name,
        })
        .from(blockedSchedules)
        .leftJoin(studios, eq(blockedSchedules.studioId, studios.id))
        .orderBy(desc(blockedSchedules.startDate));

      return records.map((r) => ({
        ...r.blocked,
        studioName: r.studioName || null,
      }));
    }
  } catch (error) {
    console.error("getCmsBlockedSchedules error:", error);
  }

  return [];
}

/**
 * Retrieves public blocked dates for customer booking calendars.
 * Can filter by specific studio or booking scope.
 */
export async function getPublicBlockedDates(params?: {
  studioId?: string;
  scope?: string;
}): Promise<BlockedSchedule[]> {
  try {
    if (isDbAvailable()) {
      const conditions = [];

      if (params?.studioId) {
        conditions.push(
          or(isNull(blockedSchedules.studioId), eq(blockedSchedules.studioId, params.studioId))
        );
      }

      if (params?.scope) {
        conditions.push(
          or(eq(blockedSchedules.scope, "all"), eq(blockedSchedules.scope, params.scope))
        );
      }

      return await db
        .select()
        .from(blockedSchedules)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(blockedSchedules.startDate));
    }
  } catch (error) {
    console.error("getPublicBlockedDates error:", error);
  }

  return [];
}

export interface CreateBlockedScheduleInput {
  studioId?: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string | null;
  endTime?: string | null;
  reason: string;
  scope?: "all" | "studio_booking" | "podcast_booking" | "gear_rental";
}

/**
 * Creates a blackout schedule to block booking calendar dates.
 */
export async function createBlockedSchedule(
  input: CreateBlockedScheduleInput
): Promise<CmsResponse & { blockedSchedule?: EnrichedBlockedSchedule }> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const [record] = await db
      .insert(blockedSchedules)
      .values({
        studioId: input.studioId || null,
        startDate: input.startDate,
        endDate: input.endDate,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        reason: input.reason.trim(),
        scope: input.scope || "all",
      })
      .returning();

    // Revalidate booking client wizards and admin
    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/offers");
    revalidatePath("/admin/schedule");
    revalidatePath("/admin/bookings");

    return {
      success: true,
      message: `Dates ${input.startDate} to ${input.endDate} successfully blocked.`,
      blockedSchedule: {
        ...record,
        studioName: null,
      },
    };
  } catch (error) {
    console.error("createBlockedSchedule error:", error);
    return { success: false, error: (error as Error).message || "Failed to create blackout schedule." };
  }
}

/**
 * Removes a blackout schedule, reopening the dates for client booking.
 */
export async function deleteBlockedSchedule(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db.delete(blockedSchedules).where(eq(blockedSchedules.id, id));

    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/offers");
    revalidatePath("/admin/schedule");
    revalidatePath("/admin/bookings");

    return { success: true, message: "Blackout schedule removed. Dates are now open." };
  } catch (error) {
    console.error("deleteBlockedSchedule error:", error);
    return { success: false, error: (error as Error).message || "Failed to remove blackout." };
  }
}
