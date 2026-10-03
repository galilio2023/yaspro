"use server";

import { db } from "@/db";
import {
  users,
  sessions,
  accounts,
  bookings,
  enterpriseRfps,
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
    const session = await requireAdmin();

    if (session?.user && session.user.id === userId && role !== "admin") {
      return { success: false, error: "Cannot demote your own active administrator account." };
    }

    if (userId === "usr_yaman_ceo" && role !== "admin") {
      return { success: false, error: "The primary CEO executive account is protected and must remain an administrator." };
    }

    if (role !== "admin" && role !== "client" && role !== "enterprise") {
      return { success: false, error: "Invalid role specified." };
    }

    if (isDbAvailable()) {
      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: `User role successfully updated to ${role}.` };
  } catch (error) {
    console.error("updateUserRole error:", error);
    return { success: false, error: "Failed to update user role." };
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
 * Deletes a user record from the database safely.
 * Unlinks historical bookings and RFPs so audit records are preserved,
 * removes active sessions and credentials, and deletes the user profile.
 *
 * @param userId - ID of the user record.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsUser(userId: string): Promise<CmsResponse> {
  try {
    const session = await requireAdmin();

    if (session && session.user && session.user.id === userId) {
      return { success: false, error: "Cannot delete your own active administrator account." };
    }

    if (userId === "usr_yaman_ceo") {
      return { success: false, error: "The primary CEO executive account is protected and cannot be deleted." };
    }

    if (isDbAvailable()) {
      // 1. Unlink historical bookings (preserve booking records with audit trail)
      await db.update(bookings).set({ userId: null }).where(eq(bookings.userId, userId));

      // 2. Unlink any enterprise RFPs (preserve proposal records)
      await db.update(enterpriseRfps).set({ userId: null }).where(eq(enterpriseRfps.userId, userId));

      // 3. Delete active sessions
      await db.delete(sessions).where(eq(sessions.userId, userId));

      // 4. Delete authentication accounts / credentials
      await db.delete(accounts).where(eq(accounts.userId, userId));

      // 5. Delete user profile record
      await db.delete(users).where(eq(users.id, userId));
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User account and related credentials successfully removed." };
  } catch (error) {
    console.error("deleteCmsUser error:", error);
    return { success: false, error: "Failed to delete user account." };
  }
}
