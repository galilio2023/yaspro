"use server";

import { db } from "@/db";
import {
  inquiries,
  type Inquiry,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isDbAvailable, requireAdmin, type CmsResponse } from "./shared";


/**
 * Retrieves all client inquiries and lead submissions from Neon PostgreSQL.
 *
 * @returns Array of Inquiry records ordered by creation date.
 */
export async function getCmsInquiries(): Promise<Inquiry[]> {
  await requireAdmin();
  try {
    if (isDbAvailable()) {
      return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
    }
  } catch (e) {
    console.error("getCmsInquiries error:", e);
  }

  if (process.env.NODE_ENV === "production") {
    return [];
  }

  // Preview mode demo inquiries (non-production local dev only)
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
  ].map((i) => ({ ...i, inquiryType: i.inquiryType as Inquiry["inquiryType"], internalNotes: null as string | null }));
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
    if (isDbAvailable()) {
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
    if (isDbAvailable()) {
      await db.delete(inquiries).where(eq(inquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: "Inquiry record deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Saves internal staff follow-up notes on a lead (never shown to customers).
 */
export async function updateInquiryNotes(id: string, internalNotes: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (internalNotes.length > 5000) return { success: false, error: "Notes must be 5000 characters or fewer." };
    if (isDbAvailable()) {
      await db.update(inquiries).set({ internalNotes: internalNotes.trim() || null }).where(eq(inquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    return { success: true, message: "Internal notes saved." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Logs a manual lead (phone call / walk-in) from the admin panel.
 */
export async function createCmsInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: Inquiry["inquiryType"];
  message: string;
}): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (!input.name?.trim() || !input.message?.trim()) return { success: false, error: "Name and message are required." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email?.trim() ?? "")) return { success: false, error: "A valid email is required." };
    if (isDbAvailable()) {
      await db.insert(inquiries).values({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        company: input.company?.trim() || null,
        inquiryType: input.inquiryType,
        message: input.message.trim(),
      });
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: "Lead logged." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
