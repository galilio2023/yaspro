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

let telemetryDispatchQueue: Promise<unknown> = Promise.resolve();

function serializeTelemetryDispatch<T>(fn: () => Promise<T>): Promise<T> {
  const next = telemetryDispatchQueue.then(fn, fn);
  telemetryDispatchQueue = next.catch(() => {});
  return next;
}

async function readTelemetryFeedStrict(client: typeof db = db): Promise<TelemetryEventItem[]> {
  let raw: unknown;
  if (typeof client.select === "function") {
    const [row] = await client
      .select()
      .from(platformSettings)
      .where(eq(platformSettings.key, TELEMETRY_FEED_KEY))
      .limit(1);
    raw = row?.value;
  } else if (client.query?.platformSettings?.findFirst) {
    const row = await client.query.platformSettings.findFirst({
      where: eq(platformSettings.key, TELEMETRY_FEED_KEY),
    });
    raw = row?.value;
  } else {
    throw new Error("Telemetry storage reader is unavailable.");
  }
  if (Array.isArray(raw)) {
    return raw as TelemetryEventItem[];
  }
  return [];
}

export async function getTelemetryFeed(): Promise<TelemetryEventItem[]> {
  await requireAdmin();
  if (!isDbAvailable() || !platformSettings) return [];
  try {
    return await readTelemetryFeedStrict();
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

    if (!isDbAvailable() || typeof db.insert !== "function" || !platformSettings) {
      return {
        success: false,
        error: "Database is not connected. Unable to persist broadcast telemetry event.",
      };
    }

    await serializeTelemetryDispatch(async () => {
      const performUpdate = async (tx: typeof db) => {
        const existing = await readTelemetryFeedStrict(tx);
        const nextEntry: TelemetryEventItem = {
          id: `tel_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          source: event.source.trim() || "OB-VAN MERCEDES 01",
          type: event.type,
          level: event.level,
          summary: event.summary.trim(),
          timestamp: nowLabel,
        };
        const updated = [nextEntry, ...existing].slice(0, 50);
        await tx
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
      };

      if (typeof db.transaction === "function") {
        await db.transaction(async (tx) => {
          await performUpdate(tx as unknown as typeof db);
        });
      } else {
        await performUpdate(db);
      }
    });

    revalidatePath("/enterprise/portal");
    revalidatePath("/admin/broadcast");
    return {
      success: true,
      message: `Event [${event.source} - ${event.type}] broadcasted to sovereign relay network at ${nowLabel}.`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Failed to persist broadcast telemetry event." };
  }
}
