"use server";

import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

import {
  type PlatformPaymentSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from "@/lib/types/platform-settings";

export type { PlatformPaymentSettings };

/** Retrieves active platform settings with built-in fallbacks */
export async function getPlatformSettings(): Promise<PlatformPaymentSettings> {
  if (!isDbAvailable()) {
    return DEFAULT_PLATFORM_SETTINGS;
  }

  try {
    const row = await db
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, "payment_config"))
      .limit(1);

    if (row.length > 0 && row[0].value) {
      return {
        ...DEFAULT_PLATFORM_SETTINGS,
        ...(row[0].value as Partial<PlatformPaymentSettings>),
      };
    }
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || "";
    // If the table doesn't exist yet on the remote database, lazily ensure it exists
    if (errorMsg.includes('relation "platform_settings" does not exist')) {
      try {
        await db.execute(
          `CREATE TABLE IF NOT EXISTS "platform_settings" (
            "key" text PRIMARY KEY NOT NULL,
            "value" jsonb NOT NULL,
            "updated_at" timestamp DEFAULT now() NOT NULL
          );`
        );
      } catch (createErr) {
        console.warn("[platform-settings] Auto-migration skipped:", (createErr as Error)?.message);
      }
    } else {
      console.warn("[platform-settings] Database read error, using defaults:", errorMsg);
    }
  }

  return DEFAULT_PLATFORM_SETTINGS;
}

/** Updates platform settings */
export async function updatePlatformSettings(
  input: Partial<PlatformPaymentSettings>
): Promise<CmsResponse<PlatformPaymentSettings>> {
  await requireAdmin();

  if (!isDbAvailable()) {
    return { success: false, error: "Database is not configured." };
  }

  try {
    const current = await getPlatformSettings();
    const updated: PlatformPaymentSettings = {
      ...current,
      ...input,
      depositPercent: Math.max(10, Math.min(100, Number(input.depositPercent ?? current.depositPercent))),
      vatRatePercent: Math.max(0, Math.min(30, Number(input.vatRatePercent ?? current.vatRatePercent))),
      turnaroundBufferMinutes: Math.max(0, Math.min(180, Number(input.turnaroundBufferMinutes ?? current.turnaroundBufferMinutes))),
    };

    await db
      .insert(platformSettings)
      .values({
        key: "payment_config",
        value: updated,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: {
          value: updated,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/admin/settings");
    revalidatePath("/studio-booking");
    revalidatePath("/offers");
    revalidatePath("/podcast-booking");

    return {
      success: true,
      data: updated,
      message: "Platform settings updated successfully.",
    };
  } catch (err) {
    console.error("updatePlatformSettings error:", err);
    return { success: false, error: "Failed to update platform settings." };
  }
}
