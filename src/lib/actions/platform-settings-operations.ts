"use server";

import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

import {
  type PlatformPaymentSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from "@/lib/types/platform-settings";

export type { PlatformPaymentSettings };

/** Uses defaults only when a successful read finds no configured settings. */
export async function getPlatformSettings(): Promise<PlatformPaymentSettings> {
  if (!isDbAvailable()) {
    throw new Error("Payment settings are unavailable. Please try again later.");
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
  } catch (err) {
    console.error("[platform-settings] Database read failed:", err);
    throw new Error("Payment settings are unavailable. Please try again later.");
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

  if (input.iban !== undefined && (typeof input.iban !== "string" || !z.iban().safeParse(input.iban.replace(/\s/g, "").toUpperCase()).success)) {
    return { success: false, error: "Enter a valid IBAN." };
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
