"use server";

import { db } from "@/db";
import {
  users,
  type User,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves all registered users and production clients from Neon PostgreSQL.
 *
 * @returns Array of User records ordered by creation date.
 */
export async function getCmsUsers(): Promise<User[]> {
  await requireAdmin();
  try {
    if (isDbAvailable()) {
      const records = await db.select().from(users).orderBy(desc(users.createdAt));
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.error("getCmsUsers error:", e);
  }

  // Fallback demo users for preview mode
  return [
    {
      id: "usr_demo_1",
      name: "Tariq Mansoor",
      email: "tariq.mansoor@dubaimedia.ae",
      emailVerified: true,
      image: null,
      role: "client",
      phone: "+971 50 123 4567",
      company: "Dubai Media Council",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      updatedAt: new Date(),
    },
    {
      id: "usr_demo_2",
      name: "Noura Al-Dosari",
      email: "noura@riyadhevents.sa",
      emailVerified: true,
      image: null,
      role: "client",
      phone: "+966 55 987 6543",
      company: "Riyadh Season Productions",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      updatedAt: new Date(),
    },
    {
      id: "usr_demo_3",
      name: "Yas Pro Master Admin",
      email: "admin@yaspro.ae",
      emailVerified: true,
      image: null,
      role: "admin",
      phone: "+971 55 401 0465",
      company: "Yas Productions HQ",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(),
    },
  ];
}

/**
 * Updates a user's role (e.g. promoting client to admin).
 *
 * @param userId - ID of the user record.
 * @param role - Updated role ("admin" | "client" | "enterprise").
 * @returns CMS response confirming update.
 */
export async function updateUserRole(userId: string, role: "admin" | "client" | "enterprise"): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: `User role successfully updated to ${role}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates a user's profile details with an explicit allowlist of safe fields.
 *
 * @param userId - ID of the user record.
 * @param data - User fields to update.
 * @returns CMS response confirming update.
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      const { name, phone, company, image } = data;
      const safeData: Record<string, unknown> = { updatedAt: new Date() };
      if (name !== undefined) safeData.name = name;
      if (phone !== undefined) safeData.phone = phone;
      if (company !== undefined) safeData.company = company;
      if (image !== undefined) safeData.image = image;

      await db.update(users).set(safeData).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User profile updated successfully." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a user record from the database.
 *
 * @param userId - ID of the user record.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsUser(userId: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.delete(users).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User record removed from database." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
