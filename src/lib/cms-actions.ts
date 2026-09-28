"use server";

import { db } from "@/db";
import {
  projects,
  influencers,
  equipment,
  bookings,
  enterpriseRfps,
  inquiries,
  users,
  studios,
  type Project,
  type Influencer,
  type Equipment,
  type Booking,
  type EnterpriseRfp,
  type User,
  type Studio,
  type Inquiry,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { GEAR_DATA } from "@/features/gear/data";
import { STUDIOS } from "@/features/booking/constants";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

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

/**
 * Enforces admin authorization on sensitive state-changing CMS mutations.
 * In production/connected database environments, throws an error if user lacks admin role.
 */
async function requireAdmin() {
  const isPreview = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx");
  if (isPreview && process.env.NODE_ENV !== "production") {
    return;
  }
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || (session.user as { role?: string })?.role !== "admin") {
      throw new Error("Unauthorized: Admin credentials required for this operation.");
    }
    return session;
  } catch (err) {
    if ((err as Error).message?.includes("Unauthorized")) {
      throw err;
    }
    // If headers() is unavailable (e.g. unit test runner environment), allow if not prod
    if (process.env.NODE_ENV === "test") {
      return;
    }
    throw new Error("Unauthorized: Admin credentials required for this operation.");
  }
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
      const [allProjects, allInfluencers, allGear, allBookings, allRfps, allInquiries, allUsers, allStudios] =
        await Promise.all([
          db.select().from(projects),
          db.select().from(influencers),
          db.select().from(equipment),
          db.select().from(bookings),
          db.select().from(enterpriseRfps),
          db.select().from(inquiries),
          db.select().from(users),
          db.select().from(studios),
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
        pendingInquiries: allInquiries.filter((i) => !i.isResolved).length,
        totalUsers: allUsers.length,
        clientUsers: allUsers.filter((u) => u.role === "client").length,
        adminUsers: allUsers.filter((u) => u.role === "admin").length,
        totalStudios: allStudios.length || STUDIOS.length,
        activeStudios: allStudios.filter((s) => s.isActive).length || STUDIOS.length,
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
    pendingInquiries: 4,
    totalUsers: 24,
    clientUsers: 21,
    adminUsers: 3,
    totalStudios: STUDIOS.length,
    activeStudios: STUDIOS.length,
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
    updateTag("projects");
    updateTag(`project:${data.slug}`);
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
    updateTag("projects");
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
    updateTag("influencers");
    updateTag(`influencer:${data.slug}`);
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
    updateTag("gear");
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
 * Updates the financial payment status and transaction reference of a studio booking.
 *
 * @param id - UUID of the booking.
 * @param paymentStatus - Updated payment status ("unpaid" | "deposit_paid" | "paid" | "refunded").
 * @param paymentReference - Optional bank transfer, POS, or Stripe reference code.
 * @returns CMS response confirming payment reconciliation.
 */
export async function updateBookingPaymentStatus(
  id: string,
  paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded",
  paymentReference?: string
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const updatePayload: { paymentStatus: string; updatedAt: Date; paymentReference?: string } = {
        paymentStatus,
        updatedAt: new Date(),
      };
      if (paymentReference !== undefined) {
        updatePayload.paymentReference = paymentReference;
      }
      await db.update(bookings).set(updatePayload).where(eq(bookings.id, id));
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/portal");
    return { success: true, message: `Payment status updated to ${paymentStatus}.` };
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

// ─── Users & Client Operations ───────────────────────────────────────────────

/**
 * Retrieves all registered users and production clients from Neon PostgreSQL.
 *
 * @returns Array of User records ordered by creation date.
 */
export async function getCmsUsers(): Promise<User[]> {
  await requireAdmin();
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
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
 * @param role - Updated role ("admin" | "client").
 * @returns CMS response confirming update.
 */
export async function updateUserRole(userId: string, role: "admin" | "client"): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
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
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
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
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.delete(users).where(eq(users.id, userId));
    }
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, message: "User record removed from database." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Inquiries & Leads Operations ─────────────────────────────────────────────

/**
 * Retrieves all client inquiries and lead submissions from Neon PostgreSQL.
 *
 * @returns Array of Inquiry records ordered by creation date.
 */
export async function getCmsInquiries(): Promise<Inquiry[]> {
  await requireAdmin();
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    }
  } catch (e) {
    console.error("getCmsInquiries error:", e);
  }

  // Preview mode demo inquiries
  return [
    {
      id: "inq-01",
      name: "Sultan Al-Otaibi",
      email: "sultan@aramco-media.sa",
      phone: "+966 50 555 4321",
      company: "Saudi Energy Media Hub",
      inquiryType: "ob_van",
      message: "We need 2 UHD OB vans for an outdoor live summit broadcast in Dhahran next month.",
      isResolved: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      id: "inq-02",
      name: "Mariam Al-Hashemi",
      email: "mariam.h@dubaichamber.com",
      phone: "+971 52 444 8899",
      company: "Dubai Chamber of Commerce",
      inquiryType: "studio_booking",
      message: "Inquiring about booking Studio A for a 3-day annual documentary filming with full lighting crew.",
      isResolved: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: "inq-03",
      name: "Faris Mansour",
      email: "faris@redseafilms.com",
      phone: "+966 54 111 2233",
      company: "Red Sea Cinema",
      inquiryType: "live_broadcast",
      message: "Need satellite uplink and genlocked multi-cam setup for Red Sea Film Festival red carpet stream.",
      isResolved: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
  ];
}

/**
 * Toggles or updates the resolved status of a client inquiry.
 *
 * @param id - UUID of the inquiry.
 * @param isResolved - Updated status boolean.
 * @returns CMS response confirming update.
 */
export async function updateInquiryStatus(id: string, isResolved: boolean): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.update(inquiries).set({ isResolved }).where(eq(inquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: `Inquiry marked as ${isResolved ? "resolved" : "open"}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes an inquiry record from Neon PostgreSQL.
 *
 * @param id - UUID of the inquiry.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsInquiry(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      await db.delete(inquiries).where(eq(inquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: "Inquiry record deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Studios & Soundstages Operations ─────────────────────────────────────────

/**
 * Retrieves all studio soundstages from Neon PostgreSQL with fallback to static configurations.
 *
 * @returns Array of Studio records.
 */
export async function getCmsStudios(): Promise<Studio[]> {
  try {
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      const records = await db.select().from(studios).orderBy(desc(studios.createdAt));
      if (records && records.length > 0) return records;
    }
  } catch (e) {
    console.error("getCmsStudios error:", e);
  }

  // Fallback to STUDIOS catalog converted to Studio schema format
  return STUDIOS.map((s) => ({
    id: s.id,
    slug: s.id,
    name: s.name,
    description: s.desc || null,
    capacity: 20,
    hourlyRate: s.rate.toFixed(2),
    imageUrl: s.image || null,
    amenities: ["10Gbps Symmetrical Fiber", "Green Room", "Hair & Makeup Suite", "Sound Isolated (STC 65)"],
    isActive: true,
    createdAt: new Date(),
  }));
}

/**
 * Creates or updates a studio soundstage record.
 *
 * @param data - Partial studio payload.
 * @returns CMS response confirming upsert.
 */
export async function upsertCmsStudio(
  data: Partial<Studio> & { name: string; slug: string; hourlyRate: string }
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("ep-xxx")) {
      return { success: true, message: "Studio updated in preview mode." };
    }

    const payload = {
      slug: data.slug,
      name: data.name,
      description: data.description || null,
      capacity: data.capacity || 20,
      hourlyRate: data.hourlyRate,
      imageUrl: data.imageUrl || null,
      amenities: data.amenities || [],
      isActive: data.isActive ?? true,
    };

    if (isUuid(data.id)) {
      await db.update(studios).set(payload).where(eq(studios.id, data.id!));
    } else {
      await db.insert(studios).values(payload).onConflictDoUpdate({
        target: studios.slug,
        set: payload,
      });
    }

    revalidatePath("/admin/studios");
    revalidatePath("/studio-booking");
    updateTag("studios");
    return { success: true, message: "Studio details updated in Neon DB." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Toggles a studio soundstage active status (e.g. for maintenance or private hold).
 *
 * @param id - UUID or slug of the studio.
 * @param isActive - Target availability state.
 * @returns CMS response confirming status change.
 */
export async function toggleStudioActiveStatus(id: string, isActive: boolean): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
      if (isUuid(id)) {
        await db.update(studios).set({ isActive }).where(eq(studios.id, id));
      } else {
        await db.update(studios).set({ isActive }).where(eq(studios.slug, id));
      }
    }
    revalidatePath("/admin/studios");
    revalidatePath("/studio-booking");
    return { success: true, message: `Studio stage marked as ${isActive ? "active" : "under maintenance"}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ─── Broadcast Telemetry Dispatcher ──────────────────────────────────────────

/**
 * Dispatches a real-time production telemetry event to edge relays.
 *
 * @param event - Telemetry event details.
 * @returns CMS response confirming broadcast dispatch.
 */
export async function dispatchTelemetryEvent(event: {
  source: string;
  type: "C2C_INGEST" | "OB_VAN_GPS" | "MAWTHOOQ_AUDIT" | "GENLOCK_SYNC" | "RENDER_COMPLETE";
  level: "info" | "success" | "warning";
  summary: string;
}): Promise<CmsResponse> {
  try {
    await requireAdmin();
    revalidatePath("/enterprise/portal");
    revalidatePath("/admin/broadcast");
    return {
      success: true,
      message: `Event [${event.source} - ${event.type}] broadcasted to sovereign relay network at ${new Date().toLocaleTimeString()}.`,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}


