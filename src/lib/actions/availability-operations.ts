"use server";

import { and, eq, gt, lt, ne, or } from "drizzle-orm";
import { db } from "@/db";
import {
  bookings,
  bookingSessions,
  studios,
  studioBlackouts,
  equipment,
} from "@/db/schema";
import { isDbAvailable } from "./shared";
import { getPlatformSettings } from "./platform-settings-operations";

const ALL_TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
];

function parseDubaiDateTime(dateIso: string, slotLabel: string): Date | null {
  try {
    const trimmed = slotLabel.trim();
    const match12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
    let hours = 10;
    let minutes = 0;
    if (match12) {
      hours = Number(match12[1]);
      minutes = Number(match12[2]);
      const mod = match12[3].toUpperCase();
      if (mod === "PM" && hours < 12) hours += 12;
      if (mod === "AM" && hours === 12) hours = 0;
    } else {
      const match24 = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
      if (!match24) return null;
      hours = Number(match24[1]);
      minutes = Number(match24[2]);
    }
    const d = new Date(
      `${dateIso}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+04:00`
    );
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export interface StudioSlotAvailabilityInput {
  date: string;
  durationHours?: number;
  studioId?: string;
  podcastSetId?: string;
}

export interface StudioSlotAvailabilityResult {
  unavailableSlots: string[];
  blackoutReason?: string;
  turnaroundBufferMinutes: number;
}

export async function getStudioSlotAvailability(
  input: StudioSlotAvailabilityInput
): Promise<StudioSlotAvailabilityResult> {
  const durationHours = Math.max(1, Number(input.durationHours || 1));
  const settings = await getPlatformSettings().catch(() => ({ turnaroundBufferMinutes: 30 }));
  const turnaroundBufferMinutes = Number(settings?.turnaroundBufferMinutes ?? 30);

  if (!input.date || !isDbAvailable()) {
    return { unavailableSlots: [], turnaroundBufferMinutes };
  }

  try {
    let resolvedStudioUuid: string | undefined;
    if (input.studioId || input.podcastSetId) {
      const lookupSlug = input.studioId || input.podcastSetId;
      if (lookupSlug && db.query?.studios?.findFirst) {
        const found = await db.query.studios.findFirst({
          where: or(eq(studios.id, lookupSlug), eq(studios.slug, lookupSlug)),
        });
        resolvedStudioUuid = found?.id;
      }
    }

    const dayStart = new Date(`${input.date}T00:00:00+04:00`);
    const dayEnd = new Date(`${input.date}T23:59:59+04:00`);
    if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
      return { unavailableSlots: [], turnaroundBufferMinutes };
    }

    const busyWindows: Array<{ start: number; end: number; reason?: string }> = [];
    const bufferMs = turnaroundBufferMinutes * 60 * 1000;
    const lookbackStart = new Date(dayStart.getTime() - 24 * 3600_000 - bufferMs);

    // 1. Check Studio Blackouts
    if (typeof db.select === "function") {
      const blackouts = await db
        .select({
          studioId: studioBlackouts.studioId,
          podcastSetId: studioBlackouts.podcastSetId,
          title: studioBlackouts.title,
          startTime: studioBlackouts.startTime,
          endTime: studioBlackouts.endTime,
        })
        .from(studioBlackouts)
        .where(
          and(
            lt(studioBlackouts.startTime, dayEnd),
            gt(studioBlackouts.endTime, dayStart)
          )
        );

      for (const b of blackouts) {
        const appliesToStudio =
          !b.studioId ||
          (resolvedStudioUuid && b.studioId === resolvedStudioUuid) ||
          (input.podcastSetId && b.podcastSetId === input.podcastSetId) ||
          (input.studioId && b.podcastSetId === input.studioId);

        if (!appliesToStudio) continue;
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        if (bStart < dayEnd.getTime() && bEnd > dayStart.getTime()) {
          busyWindows.push({ start: bStart, end: bEnd, reason: b.title });
        }
      }

      // 2. Check Active Bookings
      const activeBookings = await db
        .select({
          id: bookings.id,
          studioId: bookings.studioId,
          scheduledAt: bookings.scheduledAt,
          durationHours: bookings.durationHours,
          status: bookings.status,
        })
        .from(bookings)
        .where(
          and(
            ne(bookings.status, "cancelled"),
            lt(bookings.scheduledAt, dayEnd),
            gt(bookings.scheduledAt, lookbackStart)
          )
        );

      for (const bk of activeBookings) {
        if (!bk.studioId || !resolvedStudioUuid || bk.studioId !== resolvedStudioUuid) {
          continue;
        }
        const bkStart = new Date(bk.scheduledAt).getTime();
        const bkEnd = bkStart + Math.max(1, Number(bk.durationHours || 1)) * 3600_000 + bufferMs;
        if (bkStart < dayEnd.getTime() && bkEnd > dayStart.getTime()) {
          busyWindows.push({ start: bkStart - bufferMs, end: bkEnd });
        }
      }

      // 3. Check Multi-Session Bookings
      const sessions = await db
        .select({
          studioId: bookingSessions.studioId,
          scheduledAt: bookingSessions.scheduledAt,
          durationHours: bookingSessions.durationHours,
        })
        .from(bookingSessions)
        .where(
          and(
            lt(bookingSessions.scheduledAt, dayEnd),
            gt(bookingSessions.scheduledAt, lookbackStart)
          )
        );

      for (const s of sessions) {
        if (!s.studioId || !resolvedStudioUuid || s.studioId !== resolvedStudioUuid) {
          continue;
        }
        const sStart = new Date(s.scheduledAt).getTime();
        const sEnd = sStart + Math.max(1, Number(s.durationHours || 1)) * 3600_000 + bufferMs;
        if (sStart < dayEnd.getTime() && sEnd > dayStart.getTime()) {
          busyWindows.push({ start: sStart - bufferMs, end: sEnd });
        }
      }
    }

    const unavailableSlots: string[] = [];
    let blackoutReason: string | undefined;

    for (const slot of ALL_TIME_SLOTS) {
      const slotStart = parseDubaiDateTime(input.date, slot);
      if (!slotStart) continue;
      const startMs = slotStart.getTime();
      const endMs = startMs + durationHours * 3600_000;

      const conflict = busyWindows.find((w) => startMs < w.end && endMs > w.start);
      if (conflict) {
        unavailableSlots.push(slot);
        if (conflict.reason && !blackoutReason) {
          blackoutReason = conflict.reason;
        }
      }
    }

    return {
      unavailableSlots,
      blackoutReason,
      turnaroundBufferMinutes,
    };
  } catch (error) {
    if (typeof console.warn === "function") {
      console.warn("[getStudioSlotAvailability] Fallback:", (error as Error)?.message);
    }
    return { unavailableSlots: [], turnaroundBufferMinutes };
  }
}

export interface GearRangeAvailabilityResult {
  unavailableIds: string[];
  bookedQuantities: Record<string, number>;
}

export async function getUnavailableEquipmentIdsForRange(
  pickupDate: string,
  returnDate: string
): Promise<GearRangeAvailabilityResult> {
  if (!pickupDate || !returnDate || !isDbAvailable()) {
    return { unavailableIds: [], bookedQuantities: {} };
  }

  try {
    const reqStart = new Date(`${pickupDate}T00:00:00+04:00`).getTime();
    const reqEnd = new Date(`${returnDate}T23:59:59+04:00`).getTime();
    if (Number.isNaN(reqStart) || Number.isNaN(reqEnd) || reqEnd < reqStart) {
      return { unavailableIds: [], bookedQuantities: {} };
    }

    const bookedQuantities: Record<string, number> = {};

    if (typeof db.select === "function") {
      const [allGear, activeBookings] = await Promise.all([
        db.select().from(equipment),
        db.select().from(bookings).where(ne(bookings.status, "cancelled")),
      ]);

      const idToSlug = new Map<string, string>();
      const stockBySlug = new Map<string, number>();
      for (const item of allGear) {
        idToSlug.set(item.id, item.slug);
        const qty = Number(
          ("totalQuantity" in item ? (item as Record<string, unknown>).totalQuantity : undefined) ?? 1
        );
        stockBySlug.set(item.slug, qty);
        stockBySlug.set(item.id, qty);
      }

      for (const bk of activeBookings) {
        const bkStart = new Date(bk.scheduledAt).getTime();
        const rentalDays = Math.max(1, Math.ceil(Number(bk.durationHours || 24) / 24));
        const bkEnd = bkStart + rentalDays * 86_400_000;
        if (reqStart < bkEnd && reqEnd > bkStart) {
          if (Array.isArray(bk.equipmentIds)) {
            for (const eqId of bk.equipmentIds) {
              bookedQuantities[eqId] = (bookedQuantities[eqId] || 0) + 1;
              const slug = idToSlug.get(eqId);
              if (slug && slug !== eqId) {
                bookedQuantities[slug] = (bookedQuantities[slug] || 0) + 1;
              }
            }
          }
        }
      }

      const unavailableIds: string[] = [];
      for (const [key, bookedQty] of Object.entries(bookedQuantities)) {
        const stock = stockBySlug.get(key) ?? 1;
        if (bookedQty >= stock) {
          unavailableIds.push(key);
        }
      }

      return { unavailableIds, bookedQuantities };
    }

    return { unavailableIds: [], bookedQuantities: {} };
  } catch (error) {
    if (typeof console.warn === "function") {
      console.warn("[getUnavailableEquipmentIdsForRange] Fallback:", (error as Error)?.message);
    }
    return { unavailableIds: [], bookedQuantities: {} };
  }
}
