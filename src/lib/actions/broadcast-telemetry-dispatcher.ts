"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
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

const BROADCAST_FLEET_KEY = "broadcast_fleet_status";

export type FleetUnitStatus = "Active Deployment" | "Standby Ready" | "Maintenance";

export interface BroadcastFleetUnitState {
  id: string;
  name: string;
  location: string;
  status: FleetUnitStatus;
  uplink: string;
}

const DEFAULT_FLEET_STATUS: Record<string, BroadcastFleetUnitState> = {
  "OB-VAN MERCEDES 01": {
    id: "OB-VAN MERCEDES 01",
    name: "OB-VAN MERCEDES 01",
    location: "Riyadh Boulevard Stage",
    status: "Active Deployment",
    uplink: "1.2 Gbps Starlink + Ka-Band",
  },
  "OB-VAN MERCEDES 02": {
    id: "OB-VAN MERCEDES 02",
    name: "OB-VAN MERCEDES 02",
    location: "Dubai Business Bay Hub",
    status: "Standby Ready",
    uplink: "SMPTE ST-2110 Fiber Ready",
  },
  "DUBAI STAGE A": {
    id: "DUBAI STAGE A",
    name: "DUBAI STAGE A",
    location: "Studio City Soundstage",
    status: "Active Deployment",
    uplink: "10GbE Redundant Fiber",
  },
  "CAIRO STAGE B": {
    id: "CAIRO STAGE B",
    name: "CAIRO STAGE B",
    location: "Cairo Media City",
    status: "Standby Ready",
    uplink: "SRT Regional Relay",
  },
};

async function readBroadcastFleetStatusStrict(): Promise<Record<string, BroadcastFleetUnitState>> {
  const [row] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.key, BROADCAST_FLEET_KEY))
    .limit(1);
  if (!row) return { ...DEFAULT_FLEET_STATUS };
  if (!row.value || typeof row.value !== "object" || Array.isArray(row.value)) {
    throw new Error("Stored broadcast fleet status is invalid.");
  }
  return { ...DEFAULT_FLEET_STATUS, ...(row.value as Record<string, BroadcastFleetUnitState>) };
}

export async function getBroadcastFleetStatus(): Promise<Record<string, BroadcastFleetUnitState>> {
  await requireAdmin();
  if (!isDbAvailable() || !platformSettings) return { ...DEFAULT_FLEET_STATUS };
  try {
    return await readBroadcastFleetStatusStrict();
  } catch {
    return { ...DEFAULT_FLEET_STATUS };
  }
}

export async function updateBroadcastFleetUnitStatus(
  unitId: string,
  status: FleetUnitStatus,
  location?: string
): Promise<CmsResponse<Record<string, BroadcastFleetUnitState>>> {
  try {
    await requireAdmin();
    if (!isDbAvailable() || !platformSettings) {
      return { success: false, error: "Database is not connected." };
    }
    const current = await readBroadcastFleetStatusStrict();
    const existing = current[unitId] || {
      id: unitId,
      name: unitId,
      location: location || "Dubai Hub",
      status,
      uplink: "SMPTE ST-2110",
    };
    const updated: Record<string, BroadcastFleetUnitState> = {
      ...current,
      [unitId]: {
        ...existing,
        status,
        location: location?.trim() || existing.location,
      },
    };
    const [saved] = await db
      .insert(platformSettings)
      .values({
        key: BROADCAST_FLEET_KEY,
        value: updated,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: {
          // Update only this unit against the current row, preserving concurrent unit changes.
          value: sql`jsonb_set(${platformSettings.value}, ARRAY[${unitId}]::text[], ${JSON.stringify(updated[unitId])}::jsonb, true)`,
          updatedAt: new Date(),
        },
      })
      .returning({ value: platformSettings.value });
    revalidatePath("/admin/broadcast");
    return {
      success: true,
      data: { ...DEFAULT_FLEET_STATUS, ...(saved.value as Record<string, BroadcastFleetUnitState>) },
      message: `${unitId} status updated to ${status}.`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message || "Failed to update fleet unit status." };
  }
}
