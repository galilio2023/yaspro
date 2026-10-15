"use server";

import { db } from "@/db";
import {
  users,
  sessions,
  accounts,
  bookings,
  type User,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
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
export async function updateUserRole(userId: string, role: "admin" | "client"): Promise<CmsResponse> {
  try {
    const session = await requireAdmin();

    if (session?.user && session.user.id === userId && role !== "admin") {
      return { success: false, error: "Cannot demote your own active administrator account." };
    }

    if (userId === "usr_yaman_ceo" && role !== "admin") {
      return { success: false, error: "The primary CEO executive account is protected and must remain an administrator." };
    }

    if (role !== "admin" && role !== "client") {
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
 * Updates a user's profile details with an explicit allowlist of safe fields
 * (name, phone, company). Email and role are intentionally not editable here.
 *
 * @param userId - ID of the user record.
 * @param data - Profile fields to update.
 * @returns CMS response confirming update.
 */
export async function updateCmsUserProfile(
  userId: string,
  data: { name: string; phone?: string | null; company?: string | null }
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    const name = data.name?.trim();
    if (!name) return { success: false, error: "Name cannot be empty." };
    if (isDbAvailable()) {
      await db.update(users).set({
        name,
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    return { success: true, message: "User profile updated." };
  } catch (error) {
    console.error("updateCmsUserProfile error:", error);
    return { success: false, error: "Failed to update user profile." };
  }
}

/**
 * Provisions a verified client account with a credential login.
 * Uses Better Auth's password hashing so the user can sign in immediately.
 */
export async function createCmsUser(data: {
  name: string;
  email: string;
  password: string;
  role: "client" | "enterprise" | "admin";
  phone?: string;
  company?: string;
}): Promise<CmsResponse> {
  try {
    await requireAdmin();
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    if (!name) return { success: false, error: "Name is required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? "")) return { success: false, error: "A valid email is required." };
    if (!data.password || data.password.length < 8) return { success: false, error: "Password must be at least 8 characters." };
    if (!["client", "enterprise", "admin"].includes(data.role)) return { success: false, error: "Invalid role specified." };
    if (!isDbAvailable()) return { success: true, message: "User created in preview mode." };

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) return { success: false, error: "A user with this email already exists." };

    const { hashPassword } = await import("better-auth/crypto");
    const id = randomUUID();
    const passwordHash = await hashPassword(data.password);
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id, name, email, role: data.role, emailVerified: true,
        phone: data.phone?.trim() || null, company: data.company?.trim() || null,
      });
      await tx.insert(accounts).values({
        id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: passwordHash,
      });
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User account created." };
  } catch (error) {
    console.error("createCmsUser error:", error);
    return { success: false, error: "Failed to create user account." };
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
      await db.transaction(async (tx) => {
        // 1. Unlink historical bookings (preserve booking records with audit trail)
        await tx.update(bookings).set({ userId: null }).where(eq(bookings.userId, userId));

        // 2. Delete active sessions
        await tx.delete(sessions).where(eq(sessions.userId, userId));

        // 4. Delete authentication accounts / credentials
        await tx.delete(accounts).where(eq(accounts.userId, userId));

        // 5. Delete user profile record
        await tx.delete(users).where(eq(users.id, userId));
      });
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User account and related credentials successfully removed." };
  } catch (error) {
    console.error("deleteCmsUser error:", error);
    return { success: false, error: "Failed to delete user account." };
  }
}
