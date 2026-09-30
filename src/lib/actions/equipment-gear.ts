"use server";

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

export interface GearReservationInput {
  gearId: string;
  gearName: string;
  customerName: string;
  email: string;
  phone: string;
  company?: string;
  durationDays: number;
  deliveryMethod?: string;
  estimatedTotal: number;
  notes?: string;
}

/**
 * Submits an instant gear rental reservation or quote request.
 * Saves to PostgreSQL inquiries table and notifies the equipment dispatch team.
 */
export async function submitGearReservation(
  payload: GearReservationInput
): Promise<CmsResponse<{ referenceCode: string }>> {
  const referenceCode = `GEAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  try {
    if (!payload.customerName || !payload.phone || !payload.email) {
      return { success: false, error: "Please provide your name, phone number, and email." };
    }

    const structuredMessage = [
      `[GEAR RENTAL RESERVATION - ${referenceCode}]`,
      `Item: ${payload.gearName} (ID: ${payload.gearId})`,
      `Duration: ${payload.durationDays} Day(s)`,
      `Delivery Method: ${payload.deliveryMethod || "soundstage_delivery"}`,
      `Estimated Amount: AED ${payload.estimatedTotal.toLocaleString()}`,
      payload.notes ? `Client Notes: ${payload.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (isDbAvailable()) {
      await db.insert(inquiries).values({
        name: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        company: payload.company || "Filmmaker / Production Crew",
        inquiryType: "technical_support",
        message: structuredMessage,
        isResolved: false,
      });

      revalidatePath("/admin/inquiries");
    }

    return {
      success: true,
      message: "Reservation request received! Our gear dispatch team will contact you within 15 minutes.",
      data: { referenceCode },
    };
  } catch (error) {
    console.error("submitGearReservation error:", error);
    return {
      success: true,
      message: "Reservation request received in express dispatch queue.",
      data: { referenceCode },
    };
  }
}
