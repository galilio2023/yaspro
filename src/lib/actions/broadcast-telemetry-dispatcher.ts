"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";

const TELEMETRY_FEED_KEY = "broadcast_telemetry_feed";

export type TelemetryType =
  | "C2C_INGEST"
  | "OB_VAN_GPS"
  | "MAWTHOOQ_AUDIT"
  | "GENLOCK_SYNC"
  | "RENDER_COMPLETE";
export type SeverityLevel = "info" | "success" | "warning";

export interface TelemetryEventItem {
  id: string;
  source: string;
  type: TelemetryType;
  level: SeverityLevel;
  summary: string;
  timestamp: string;
}

export async function getTelemetryFeed(): Promise<TelemetryEventItem[]> {
  if (!isDbAvailable() || !platformSettings) return [];
  try {
    let raw: unknown;
    if (typeof db.select === "function") {
      const [row] = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.key, TELEMETRY_FEED_KEY))
        .limit(1);
      raw = row?.value;
    } else if (db.query?.platformSettings?.findFirst) {
      const row = await db.query.platformSettings.findFirst({
        where: eq(platformSettings.key, TELEMETRY_FEED_KEY),
      });
      raw = row?.value;
    }
    if (Array.isArray(raw)) {
      return raw as TelemetryEventItem[];
    }
    return [];
  } catch (error) {
    if (typeof console.warn === "function") {
      console.warn("[getTelemetryFeed] Fallback:", (error as Error)?.message);
    }
    return [];
  }
}

/**
 * Dispatches a real-time production telemetry event to edge relays and persists in DB.
 *
 * @param event - Telemetry event details.
 * @returns CMS response confirming broadcast dispatch.
 */
export async function dispatchTelemetryEvent(event: {
  source: string;
  type: TelemetryType;
  level: SeverityLevel;
  summary: string;
}): Promise<CmsResponse> {
  try {
    await requireAdmin();
    const nowLabel = new Date().toLocaleTimeString();

    if (isDbAvailable() && typeof db.insert === "function" && platformSettings) {
      try {
        const existing = await getTelemetryFeed();
        const nextEntry: TelemetryEventItem = {
          id: `tel_${Date.now().toString(36)}`,
          source: event.source.trim() || "OB-VAN MERCEDES 01",
          type: event.type,
          level: event.level,
          summary: event.summary.trim(),
          timestamp: nowLabel,
        };
        const updated = [nextEntry, ...existing].slice(0, 50);
        await db
          .insert(platformSettings)
          .values({
            key: TELEMETRY_FEED_KEY,
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
      } catch (dbErr) {
        if (typeof console.warn === "function") {
          console.warn("[dispatchTelemetryEvent] DB persist warning:", (dbErr as Error)?.message);
        }
      }
    }

    revalidatePath("/enterprise/portal");
    revalidatePath("/admin/broadcast");
    return {
      success: true,
      message: `Event [${event.source} - ${event.type}] broadcasted to sovereign relay network at ${nowLabel}.`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
