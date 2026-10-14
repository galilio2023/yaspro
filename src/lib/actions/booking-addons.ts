"use server";

import { db } from "@/db";
import { bookingAddons, type BookingAddon } from "@/db/schema";
import { eq, asc, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";
import catalogData from "@/features/booking/catalog-data.json";

/**
 * Seed initial booking addons from catalog-data.json if the database is empty.
 */
async function seedInitialAddonsIfEmpty() {
  try {
    const existingCount = await db.select().from(bookingAddons).limit(1);
    if (existingCount.length > 0) return;

    const toInsert = [];

    // Crew & Equipment
    if (Array.isArray(catalogData.crewEquipment)) {
      for (const item of catalogData.crewEquipment) {
        toInsert.push({
          id: `crew-equip-${item.id}`,
          category: item.category || "equipment",
          name: item.title,
          arabicName: null,
          description: item.description || null,
          price: String(item.price),
          priceUnit: item.priceType || "flat",
          imageUrl: item.imageUrl || null,
          isActive: true,
          isPopular: false,
          propCategory: null,
          sortOrder: toInsert.length,
        });
      }
    }

    // Post-production Addons
    if (Array.isArray(catalogData.addons)) {
      for (const item of catalogData.addons) {
        toInsert.push({
          id: `post-addon-${item.id}`,
          category: "post_production",
          name: item.title,
          arabicName: null,
          description: item.description || null,
          price: String(item.price),
          priceUnit: item.priceType || "flat",
          imageUrl: item.imageUrl || null,
          isActive: true,
          isPopular: true,
          propCategory: null,
          sortOrder: toInsert.length,
        });
      }
    }

    // Props (seed representative first 20 items to prevent huge batch)
    if (Array.isArray(catalogData.props)) {
      for (const item of catalogData.props.slice(0, 25)) {
        toInsert.push({
          id: `prop-${item.id}`,
          category: "props",
          name: item.title,
          arabicName: null,
          description: `${item.category} prop for studio staging`,
          price: String(item.price),
          priceUnit: item.priceType || "flat",
          imageUrl: item.imageUrl || null,
          isActive: true,
          isPopular: false,
          propCategory: item.category || "Other",
          sortOrder: toInsert.length,
        });
      }
    }

    if (toInsert.length > 0) {
      await db.insert(bookingAddons).values(toInsert).onConflictDoNothing();
      console.log(`[Seed] Seeded ${toInsert.length} booking addons into Neon DB.`);
    }
  } catch (err) {
    console.error("Failed to seed initial addons:", err);
  }
}

/**
 * Retrieves all booking addons for the admin CMS.
 */
export async function getCmsAddons(): Promise<BookingAddon[]> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await seedInitialAddonsIfEmpty();
      return await db
        .select()
        .from(bookingAddons)
        .orderBy(asc(bookingAddons.sortOrder), desc(bookingAddons.createdAt));
    }
  } catch (error) {
    console.error("getCmsAddons error:", error);
  }

  return [];
}

/**
 * Retrieves active addons for public booking wizards.
 */
export async function getPublicAddons(category?: string): Promise<BookingAddon[]> {
  try {
    if (isDbAvailable()) {
      const conditions = [eq(bookingAddons.isActive, true)];
      if (category) {
        conditions.push(eq(bookingAddons.category, category));
      }

      const results = await db
        .select()
        .from(bookingAddons)
        .where(and(...conditions))
        .orderBy(asc(bookingAddons.sortOrder), desc(bookingAddons.createdAt));

      if (results.length > 0) return results;
    }
  } catch (error) {
    console.error("getPublicAddons DB query error:", error);
  }

  // Fallback to static catalog if DB empty or unavailable
  return [];
}

export interface CreateAddonInput {
  id?: string;
  category: "crew" | "equipment" | "props" | "post_production";
  name: string;
  arabicName?: string | null;
  description?: string | null;
  price: number | string;
  priceUnit?: "flat" | "hourly" | "fixed" | "per_day";
  imageUrl?: string | null;
  propCategory?: string | null;
  isPopular?: boolean;
  isActive?: boolean;
}

/**
 * Creates a new add-on or asset in the booking database.
 */
export async function createCmsAddon(
  input: CreateAddonInput
): Promise<CmsResponse & { addon?: BookingAddon }> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const rawId = input.id?.trim()
      ? input.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : `${input.category}-${input.name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString(36)}`;

    const [record] = await db
      .insert(bookingAddons)
      .values({
        id: rawId,
        category: input.category,
        name: input.name.trim(),
        arabicName: input.arabicName?.trim() || null,
        description: input.description?.trim() || null,
        price: String(input.price),
        priceUnit: input.priceUnit || "flat",
        imageUrl: input.imageUrl?.trim() || null,
        propCategory: input.category === "props" ? input.propCategory || "Other" : null,
        isPopular: input.isPopular ?? false,
        isActive: input.isActive ?? true,
      })
      .returning();

    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/admin/addons");

    return {
      success: true,
      message: `Asset "${input.name}" created successfully.`,
      addon: record,
    };
  } catch (error) {
    console.error("createCmsAddon error:", error);
    return { success: false, error: (error as Error).message || "Failed to create addon." };
  }
}

export interface UpdateAddonInput extends Partial<CreateAddonInput> {
  id: string;
}

/**
 * Updates an existing add-on or asset.
 */
export async function updateCmsAddon(
  input: UpdateAddonInput
): Promise<CmsResponse & { addon?: BookingAddon }> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.arabicName !== undefined) updateData.arabicName = input.arabicName?.trim() || null;
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.price !== undefined) updateData.price = String(input.price);
    if (input.priceUnit !== undefined) updateData.priceUnit = input.priceUnit;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl?.trim() || null;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.propCategory !== undefined) updateData.propCategory = input.propCategory;
    if (input.isPopular !== undefined) updateData.isPopular = input.isPopular;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const [record] = await db
      .update(bookingAddons)
      .set(updateData)
      .where(eq(bookingAddons.id, input.id))
      .returning();

    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/admin/addons");

    return {
      success: true,
      message: `Asset "${record.name}" updated successfully.`,
      addon: record,
    };
  } catch (error) {
    console.error("updateCmsAddon error:", error);
    return { success: false, error: (error as Error).message || "Failed to update addon." };
  }
}

/**
 * Toggles the active status of an add-on.
 */
export async function toggleCmsAddonStatus(
  id: string,
  isActive: boolean
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db
      .update(bookingAddons)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(bookingAddons.id, id));

    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/admin/addons");

    return { success: true, message: `Status updated to ${isActive ? "active" : "disabled"}.` };
  } catch (error) {
    console.error("toggleCmsAddonStatus error:", error);
    return { success: false, error: (error as Error).message || "Failed to toggle status." };
  }
}

/**
 * Permanently removes an add-on from the database.
 */
export async function deleteCmsAddon(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!isDbAvailable()) {
      return { success: false, error: "Database not available." };
    }

    await db.delete(bookingAddons).where(eq(bookingAddons.id, id));

    revalidatePath("/studio-booking");
    revalidatePath("/podcast-booking");
    revalidatePath("/admin/addons");

    return { success: true, message: "Asset removed successfully." };
  } catch (error) {
    console.error("deleteCmsAddon error:", error);
    return { success: false, error: (error as Error).message || "Failed to delete addon." };
  }
}
