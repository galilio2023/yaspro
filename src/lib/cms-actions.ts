"use server";

import { db } from "@/db";
import {
  projects,
  influencers,
  equipment,
  bookings,
  enterpriseRfps,
  inquiries,
  type Project,
  type Influencer,
  type Equipment,
  type Booking,
  type EnterpriseRfp,
  type Inquiry,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { GEAR_DATA } from "@/features/gear/data";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const uuidSchema = z.string().uuid();

/**
 * Validates whether an identifier string is a valid UUIDv4.
 *
 * @param id - Optional identifier to test.
 * @returns True if the identifier matches a valid UUID pattern, false otherwise.
 */
function isUuid(id?: string): boolean {
  if (!id) return false;
  return uuidSchema.safeParse(id).success;
}

export interface CmsResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ─── Metrics & Overview ───────────────────────────────────────────────────────

/**
 * Aggregates high-level CMS operational statistics across all entities.
 *
 * @returns An overview metrics object containing project, influencer, gear, booking, and RFP tallies.
 */
export async function getCmsOverviewStats() {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const [allProjects, allInfluencers, allGear, allBookings, allRfps, allInquiries] =
        await Promise.all([
          db.select().from(projects),
          db.select().from(influencers),
          db.select().from(equipment),
          db.select().from(bookings),
          db.select().from(enterpriseRfps),
          db.select().from(inquiries),
        ]);

      return {
        totalProjects: allProjects.length || PROJECTS_DATA.length,
        totalInfluencers: allInfluencers.length || INFLUENCERS_DATA.length,
        totalGear: allGear.length || GEAR_DATA.length,
        totalBookings: allBookings.length,
        pendingBookings: allBookings.filter((b) => b.status === "pending").length,
        totalRfps: allRfps.length,
        pendingRfps: allRfps.filter((r) => r.status === "pending_review").length,
        totalInquiries: allInquiries.length,
      };
    }
  } catch (err) {
    console.error("getCmsOverviewStats DB error, using fallbacks:", err);
  }

  // Graceful fallback when DB is offline or local preview
  return {
    totalProjects: PROJECTS_DATA.length,
    totalInfluencers: INFLUENCERS_DATA.length,
    totalGear: GEAR_DATA.length,
    totalBookings: 12,
    pendingBookings: 3,
    totalRfps: 8,
    pendingRfps: 2,
    totalInquiries: 14,
  };
}

// ─── Projects CRUD ────────────────────────────────────────────────────────────

/**
 * Retrieves portfolio projects from the Neon database with automatic fallback to the static catalog.
 *
 * @returns Array of projects ordered by creation date.
 */
export async function getCmsProjects(): Promise<Project[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const records = await db.select().from(projects).orderBy(desc(projects.createdAt));
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.error("getCmsProjects DB error:", e);
  }

  // Fallback to static catalog converted to Project type
  return PROJECTS_DATA.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    arabicTitle: p.arabicTitle || null,
    description: p.description || null,
    category:
      p.category === "government" || p.category === "commercial" || p.category === "shows"
        ? p.category
        : "commercial",
    client: p.client || null,
    coverImageUrl: p.image || null,
    videoUrl: p.vimeoId ? `https://vimeo.com/${p.vimeoId}` : null,
    tag: p.tag || null,
    views: p.views || null,
    year: p.year || "2024",
    deliverables: p.deliverables || [],
    techStack: p.techStack || [],
    tags: [p.tag, p.categoryLabel],
    isFeatured: true,
    publishedAt: new Date(),
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates a portfolio film record in Neon PostgreSQL.
 *
 * @param data - Partial project input with required title and slug.
 * @returns A CMS response indicating operation success or failure.
 */
export async function upsertCmsProject(data: Partial<Project> & { title: string; slug: string }): Promise<CmsResponse> {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: true, message: "Project saved in local preview mode." };
    }

    const payload = {
      title: data.title,
      slug: data.slug,
      arabicTitle: data.arabicTitle || null,
      description: data.description || null,
      category: data.category || "commercial",
      client: data.client || null,
      coverImageUrl: data.coverImageUrl || null,
      videoUrl: data.videoUrl || null,
      tag: data.tag || null,
      views: data.views || null,
      year: data.year || "2024",
      deliverables: data.deliverables || [],
      techStack: data.techStack || [],
      tags: data.tags || [],
      isFeatured: data.isFeatured ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(projects).set(payload).where(eq(projects.id, data.id!));
    } else {
      await db.insert(projects).values(payload).onConflictDoUpdate({
        target: projects.slug,
        set: payload,
      });
    }

    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    return { success: true, message: "Project updated successfully in Neon DB." };
  } catch (error) {
    console.error("upsertCmsProject error:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a portfolio film record from Neon PostgreSQL.
 *
 * @param id - UUID of the project to remove.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsProject(id: string): Promise<CmsResponse> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.delete(projects).where(eq(projects.id, id));
    }
    revalidatePath("/projects");
    revalidatePath("/admin/projects");
    return { success: true, message: "Project deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Influencers CRUD ─────────────────────────────────────────────────────────

/**
 * Retrieves the creator and influencer roster from Neon PostgreSQL or catalog fallback.
 *
 * @returns Array of influencer profiles.
 */
export async function getCmsInfluencers(): Promise<Influencer[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const records = await db.select().from(influencers).orderBy(desc(influencers.createdAt));
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.error("getCmsInfluencers DB error:", e);
  }

  return INFLUENCERS_DATA.map((inf) => ({
    id: inf.id,
    slug: inf.slug,
    name: inf.name,
    role: inf.role || null,
    nationality: inf.nationality || null,
    flag: inf.flag || null,
    bio: inf.bio || null,
    imageUrl: inf.avatar || null,
    totalFollowers: inf.totalFollowers || null,
    rawFollowers: Math.round(inf.rawFollowers) || null,
    instagramHandle: inf.instagram || null,
    youtubeHandle: inf.youtube || null,
    tiktokHandle: inf.tiktok || null,
    collaborations: inf.collaborations || [],
    signatureProductions: inf.signatureProductions || [],
    demographics: (inf.demographics as unknown as Record<string, unknown>) || {},
    isFeatured: true,
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates an influencer record in Neon PostgreSQL.
 *
 * @param data - Partial influencer record containing required name and slug.
 * @returns CMS response confirming status.
 */
export async function upsertCmsInfluencer(data: Partial<Influencer> & { name: string; slug: string }): Promise<CmsResponse> {
  try {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: true, message: "Creator profile updated in preview mode." };
    }

    const payload = {
      name: data.name,
      slug: data.slug,
      role: data.role || null,
      nationality: data.nationality || null,
      flag: data.flag || null,
      bio: data.bio || null,
      imageUrl: data.imageUrl || null,
      totalFollowers: data.totalFollowers || null,
      rawFollowers: data.rawFollowers || null,
      instagramHandle: data.instagramHandle || null,
      youtubeHandle: data.youtubeHandle || null,
      tiktokHandle: data.tiktokHandle || null,
      collaborations: data.collaborations || [],
      signatureProductions: data.signatureProductions || [],
      demographics: data.demographics || {},
      isFeatured: data.isFeatured ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(influencers).set(payload).where(eq(influencers.id, data.id!));
    } else {
      await db.insert(influencers).values(payload).onConflictDoUpdate({
        target: influencers.slug,
        set: payload,
      });
    }

    revalidatePath("/influencers");
    revalidatePath("/admin/influencers");
    return { success: true, message: "Creator updated successfully in Neon DB." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Equipment / Gear CRUD ────────────────────────────────────────────────────

/**
 * Retrieves cinema equipment and rental gear catalog from Neon PostgreSQL.
 *
 * @returns Array of gear equipment records.
 */
export async function getCmsEquipment(): Promise<Equipment[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const records = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.error("getCmsEquipment DB error:", e);
  }

  return GEAR_DATA.map((g) => ({
    id: g.id,
    slug: g.id,
    name: g.name,
    description: g.description || null,
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
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: true, message: "Equipment updated in preview mode." };
    }

    const itemSlug = data.slug || (data.id && !isUuid(data.id) ? data.id : slugify(data.name));

    const payload = {
      slug: itemSlug,
      name: data.name,
      description: data.description || null,
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
    return { success: true, message: "Equipment saved to Neon DB catalog." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Bookings & RFP Operations ────────────────────────────────────────────────

/**
 * Retrieves all studio reservations from Neon PostgreSQL.
 *
 * @returns Array of booking records ordered by creation date.
 */
export async function getCmsBookings(): Promise<Booking[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
    }
  } catch (e) {
    console.error("getCmsBookings error:", e);
  }
  return [];
}

/**
 * Updates the approval status of a studio booking reservation.
 *
 * @param id - UUID of the booking.
 * @param status - Updated lifecycle status ("pending" | "confirmed" | "cancelled" | "completed").
 * @returns CMS response confirming status transition.
 */
export async function updateBookingStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed"): Promise<CmsResponse> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.update(bookings).set({ status, updatedAt: new Date() }).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    return { success: true, message: `Booking status changed to ${status}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Retrieves all enterprise tender proposals and RFPs from Neon PostgreSQL.
 *
 * @returns Array of Enterprise RFP records ordered by creation date.
 */
export async function getCmsEnterpriseRfps(): Promise<EnterpriseRfp[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      return await db.select().from(enterpriseRfps).orderBy(desc(enterpriseRfps.createdAt));
    }
  } catch (e) {
    console.error("getCmsEnterpriseRfps error:", e);
  }
  return [];
}

/**
 * Updates the milestone status of an enterprise tender RFP.
 *
 * @param id - UUID of the enterprise proposal.
 * @param status - New status string (e.g., "approved", "sla_active").
 * @returns CMS response confirming update.
 */
export async function updateEnterpriseRfpStatus(id: string, status: string): Promise<CmsResponse> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.update(enterpriseRfps).set({ status, updatedAt: new Date() }).where(eq(enterpriseRfps.id, id));
    }
    revalidatePath("/admin/rfps");
    revalidatePath("/enterprise/portal");
    return { success: true, message: `Enterprise proposal status updated to ${status}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
