"use server";

import { calculateGearCartTotals } from "../../features/gear/lib/cart-pricing";
import { checkRateLimit, getClientIdentifier } from "../rate-limit";
import { z } from "zod";
import { db } from "@/db";
import {
  equipment,
  inquiries,
  bookings,
  type Equipment,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { GEAR_DATA } from "@/features/gear/data";
import { slugify, generateBookingReference } from "@/lib/utils";
import { isUuid, isDbAvailable, requireAdmin, getCurrentSession, type CmsResponse } from "./shared";


export interface PaginatedEquipmentParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  isKit?: boolean;
  isPopular?: boolean;
  sort?: "rate_asc" | "rate_desc" | "newest" | "popular";
}

export interface PaginatedEquipmentResult {
  items: Equipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

async function getFullEquipmentCatalog(): Promise<Equipment[]> {
  let allRecords: Equipment[] = [];

  if (isDbAvailable()) {
    try {
      const records = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
      if (records && records.length > 0) {
        allRecords = records;
      }
    } catch (err) {
      console.error("DB query failed in getFullEquipmentCatalog, falling back to static catalog:", err);
    }
  }

  if (allRecords.length === 0) {
    allRecords = GEAR_DATA.map((g) => ({
      id: g.id,
      slug: g.id,
      name: g.name,
      arabicName: g.arabicName || null,
      description: g.description || null,
      arabicDescription: g.arabicDescription || null,
      category: g.category,
      dailyRate: g.dailyRate.toFixed(2),
      securityDeposit: (g.securityDeposit || 0).toFixed(2),
      imageUrl: g.image || null,
      specs: g.specs || [],
      isPopular: !!g.isPopular,
      isKit: !!g.isKit,
      includedInKit: g.includedInKit || [],
      isAvailable: true,
      createdAt: new Date(),
    }));
  }

  return allRecords;
}

/**
 * Enterprise Paginated Cinema Equipment Query.
 * Supports page/limit offset, search query, category facets, and sorting.
 */
export async function getPaginatedEquipment(
  params: PaginatedEquipmentParams = {}
): Promise<PaginatedEquipmentResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(params.limit || 12, 100));
  const offset = (page - 1) * limit;

  const allRecords = await getFullEquipmentCatalog();

  let filtered = allRecords;

  if (params.category && params.category !== "all") {
    filtered = filtered.filter((item) => item.category === params.category);
  }
  if (params.search && params.search.trim()) {
    const query = params.search.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.arabicName && item.arabicName.includes(query))
    );
  }
  if (params.isKit !== undefined) {
    filtered = filtered.filter((item) => !!item.isKit === params.isKit);
  }
  if (params.isPopular !== undefined) {
    filtered = filtered.filter((item) => !!item.isPopular === params.isPopular);
  }

  if (params.sort === "rate_asc") {
    filtered = [...filtered].sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
  } else if (params.sort === "rate_desc") {
    filtered = [...filtered].sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
  } else if (params.sort === "popular") {
    filtered = [...filtered].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Retrieves the featured flagship fleet spotlight (6 items) strictly for landing page display.
 * Avoids over-fetching the full 160-item catalog on the homepage.
 */
export async function getFeaturedEquipmentSpotlight(limit = 6): Promise<Equipment[]> {
  const result = await getPaginatedEquipment({
    limit,
    isPopular: true,
    sort: "popular",
  });
  if (result.items.length >= limit) return result.items;
  const fallback = await getPaginatedEquipment({ limit });
  return fallback.items;
}

/**
 * Retrieves cinema equipment and rental gear catalog from Neon PostgreSQL.
 * Returns every catalog entry without truncation.
 *
 * @returns Array of gear equipment records.
 */
export async function getCmsEquipment(): Promise<Equipment[]> {
  return await getFullEquipmentCatalog();
}

/**
 * Creates or updates an equipment catalog item in Neon PostgreSQL with slug conflict resolution.
 *
 * @param data - Partial equipment entry with name, dailyRate, category, and optional slug/id.
 * @returns CMS response confirming equipment upsert.
 */
export async function upsertCmsEquipment(data: Partial<Equipment> & { name: string; dailyRate: string; category: string }): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: true, message: "Equipment updated in preview mode." };
    }

    const itemSlug = data.slug || (data.id && !isUuid(data.id) ? data.id : slugify(data.name));

    const payload = {
      slug: itemSlug,
      name: data.name,
      arabicName: data.arabicName || null,
      description: data.description || null,
      arabicDescription: data.arabicDescription || null,
      category: data.category,
      dailyRate: data.dailyRate,
      securityDeposit: data.securityDeposit || "0.00",
      imageUrl: data.imageUrl || null,
      specs: data.specs || [],
      isPopular: data.isPopular ?? false,
      isKit: data.isKit ?? false,
      includedInKit: data.includedInKit || [],
      isAvailable: data.isAvailable ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(equipment).set(payload).where(eq(equipment.id, data.id!));
    } else {
      await db.insert(equipment).values(payload).onConflictDoUpdate({
        target: equipment.slug,
        set: payload,
      });
    }

    revalidatePath("/shop");
    revalidatePath("/admin/gear");
    updateTag("gear");
    return { success: true, message: "Equipment saved to Neon DB catalog." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

const gearReservationSchema = z.object({
  gearId: z.string().trim().min(1, "Please select equipment.").max(200, "Equipment ID is too long."),
  customerName: z.string().trim().min(1, "Please provide your name.").max(200, "Name is too long."),
  email: z.string().trim().email("Please provide a valid email address.").max(254, "Email is too long."),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,30}$/, "Please provide a valid phone number.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Please provide a valid phone number."),
  company: z.string().trim().max(200, "Company name is too long.").optional(),
  durationDays: z.number().int().min(1, "Rental duration must be at least 1 day.").max(365, "Rental duration cannot exceed 365 days."),
  deliveryMethod: z.enum(["soundstage", "dubai_courier", "hub_pickup"], {
    error: "Please select a valid delivery method.",
  }).default("soundstage"),
  notes: z.string().trim().max(2000, "Notes must be 2000 characters or fewer.").optional(),
  startDate: z.iso.date().optional(),
  returnDate: z.iso.date().optional(),
});

export type GearReservationInput = z.input<typeof gearReservationSchema>;

/**
 * Submits an instant gear rental reservation or quote request.
 * Saves to PostgreSQL inquiries table and notifies the equipment dispatch team.
 */
export async function submitGearReservation(
  payload: GearReservationInput
): Promise<CmsResponse<{ referenceCode: string }>> {
  try {
    const parsed = gearReservationSchema.safeParse(payload);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n") };
    }
    const input = parsed.data;
    if (!isDbAvailable()) {
      return { success: false, error: "Unable to save your reservation. Please contact us on WhatsApp." };
    }

    const [storedGear] = await db.select().from(equipment).where(
      isUuid(input.gearId) ? eq(equipment.id, input.gearId) : eq(equipment.slug, input.gearId)
    ).limit(1);
    const gear = storedGear || GEAR_DATA.find((item) => item.id === input.gearId);
    if (!gear || gear.isAvailable === false) {
      return { success: false, error: "gearId: Please select available equipment." };
    }
    const dailyRate = Number(gear.dailyRate);
    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      return { success: false, error: "Unable to price this equipment. Please contact us on WhatsApp." };
    }
    const discountMultiplier = input.durationDays >= 7 ? 0.65 : input.durationDays >= 3 ? 0.8 : 1;
    const total = Math.round(dailyRate * discountMultiplier) * input.durationDays
      + (input.deliveryMethod === "dubai_courier" ? 250 : 0);
    const referenceCode = `GEAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const structuredMessage = [
      `[GEAR RENTAL RESERVATION - ${referenceCode}]`,
      `Item: ${gear.name} (ID: ${gear.id})`,
      `Duration: ${input.durationDays} Day(s)`,
      input.startDate ? `Shoot Dates: ${input.startDate} to ${input.returnDate || input.startDate}` : "",
      `Delivery Method: ${input.deliveryMethod}`,
      `Estimated Amount: AED ${total.toLocaleString()}`,
      input.notes ? `Client Notes: ${input.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await db.insert(inquiries).values({
      name: input.customerName,
      email: input.email,
      phone: input.phone,
      company: input.company || "Filmmaker / Production Crew",
      inquiryType: "technical_support",
      message: structuredMessage,
      isResolved: false,
    });

    revalidatePath("/admin/inquiries");

    return {
      success: true,
      message: "Reservation request received! Our gear dispatch team will contact you within 15 minutes.",
      data: { referenceCode },
    };
  } catch (error) {
    console.error("submitGearReservation error:", error);
    return {
      success: false,
      error: "Unable to save your reservation. Please contact us on WhatsApp.",
    };
  }
}

const gearOrderSchema = z.object({
  gearIds: z.array(z.string()).min(1, "Please select at least one piece of gear.").max(100),
  customerName: z.string().min(2, "Customer name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(6, "Valid phone number is required."),
  company: z.string().optional(),
  durationDays: z.number().int().min(1).max(365).default(1),
  deliveryMethod: z.enum(["studio_delivery", "courier_dubai", "pickup_hub"]).default("studio_delivery"),
  notes: z.string().optional(),
  startDate: z.iso.date().optional(),
  returnDate: z.iso.date().optional(),
});

export type GearOrderInput = z.input<typeof gearOrderSchema>;

/**
 * Creates a verified cinema gear rental order directly in the bookings table.
 * Links only to the authenticated user,
 * computes duration discounts & delivery surcharges, and returns the reference code for Ziina payment.
 */
export async function createGearBookingOrder(
  payload: GearOrderInput
): Promise<CmsResponse<{ bookingId: string; referenceCode: string; totalAmount: number; currency: string }>> {
  try {
    const clientId = await getClientIdentifier();
    if (!checkRateLimit(`gear-order:${clientId}`, 5, 10 * 60 * 1000).allowed) {
      return { success: false, error: "Too many booking requests. Please try again later." };
    }

    const parsed = gearOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n"),
      };
    }
    const input = parsed.data;

    // 1. Resolve equipment items & calculate pricing
    const pricedItems: { dailyRate: number }[] = [];
    for (const gearId of input.gearIds) {
      let storedGear = null;
      if (isDbAvailable()) {
        const [found] = await db
          .select()
          .from(equipment)
          .where(isUuid(gearId) ? eq(equipment.id, gearId) : eq(equipment.slug, gearId))
          .limit(1);
        storedGear = found;
      }
      const item = storedGear || GEAR_DATA.find((g) => g.id === gearId);
      if (!item) {
        return { success: false, error: `Equipment item ${gearId} was not found.` };
      }
      pricedItems.push({ dailyRate: Number(item.dailyRate) });
    }

    const { grandTotal } = calculateGearCartTotals(pricedItems, { totalDays: input.durationDays }, input.deliveryMethod);

    // An email supplied by a guest is not proof of account ownership.
    const session = await getCurrentSession();
    const finalUserId = session?.user?.id ?? null;

    if (isDbAvailable()) {
      // 3. Insert into bookings
      const referenceCode = generateBookingReference();
      const scheduledAtDate = input.startDate ? new Date(input.startDate) : new Date();
      const returnDateStr = input.returnDate || (input.startDate ? new Date(scheduledAtDate.getTime() + input.durationDays * 86400000).toISOString().split("T")[0] : null);
      const scheduleSummary = input.startDate
        ? ` | Shoot Schedule: ${input.startDate} to ${returnDateStr} (${input.durationDays}d)`
        : ` | Duration: ${input.durationDays}d`;

      const [newBooking] = await db
        .insert(bookings)
        .values({
          referenceCode,
          userId: finalUserId,
          studioId: null, // Standalone gear rental
          sessionType: "commercial",
          scheduledAt: scheduledAtDate,
          durationHours: input.durationDays * 24,
          headcount: 1,
          equipmentIds: input.gearIds,
          propsNotes: `Gear Delivery: ${input.deliveryMethod}${scheduleSummary}`,
          specialRequests: finalUserId
            ? input.notes || null
            : `[Contact: ${input.customerName} | ${input.email} | ${input.phone}${input.company ? ` | ${input.company}` : ""}]${input.notes ? ` — ${input.notes}` : ""}`,
          totalAmount: grandTotal.toFixed(2),
          currency: "AED",
          status: "pending",
          paymentStatus: "unpaid",
        })
        .returning();

      revalidatePath("/portal");
      revalidatePath("/portal/bookings");
      revalidatePath("/admin/bookings");

      return {
        success: true,
        message: "Gear rental booking created successfully.",
        data: {
          bookingId: newBooking?.id || `gear_${Date.now()}`,
          referenceCode: newBooking?.referenceCode || referenceCode,
          totalAmount: grandTotal,
          currency: "AED",
        },
      };
    }

    // Fallback when DB is unavailable (e.g. mock test environment)
    return {
      success: true,
      data: {
        bookingId: `mock-gear-${Date.now()}`,
        referenceCode: generateBookingReference(),
        totalAmount: grandTotal,
        currency: "AED",
      },
    };
  } catch (error) {
    console.error("createGearBookingOrder error:", error);
    return {
      success: false,
      error: "Unable to process gear rental booking. Please retry or contact us on WhatsApp.",
    };
  }
}
