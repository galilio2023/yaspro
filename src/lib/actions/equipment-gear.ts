"use server";

import { z } from "zod";
import { db } from "@/db";
import {
  equipment,
  inquiries,
  type Equipment,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { GEAR_DATA } from "@/features/gear/data";
import { slugify } from "@/lib/utils";
import { isUuid, isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves cinema equipment and rental gear catalog from Neon PostgreSQL.
 *
 * @returns Array of gear equipment records.
 */
export async function getCmsEquipment(): Promise<Equipment[]> {
  if (isDbAvailable()) {
    const records = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
    if (records && records.length > 0) return records;
  }

  return GEAR_DATA.map((g) => ({
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
  durationDays: z.number().refine((days) => [1, 3, 7].includes(days), "Please select a rental duration of 1, 3, or 7 days."),
  deliveryMethod: z.enum(["soundstage", "dubai_courier", "hub_pickup"], {
    error: "Please select a valid delivery method.",
  }).default("soundstage"),
  notes: z.string().trim().max(2000, "Notes must be 2000 characters or fewer.").optional(),
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
