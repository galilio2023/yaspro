"use server";

import { db } from "@/db";
import {
  inquiries,
  campaignInquiries,
  type Inquiry,
  type CampaignInquiry,
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
 * Retrieves all campaign inquiries and RFPs from Neon PostgreSQL.
 *
 * @returns Array of CampaignInquiry records ordered by creation date.
 */
export async function getCmsCampaignInquiries(): Promise<CampaignInquiry[]> {
  await requireAdmin();
  try {
    if (isDbAvailable()) {
      return await db.select().from(campaignInquiries).orderBy(desc(campaignInquiries.createdAt));
    }
  } catch (e) {
    console.error("getCmsCampaignInquiries error:", e);
  }

  if (process.env.NODE_ENV === "production") {
    return [];
  }

  // Preview mode demo inquiries (non-production local dev only)
  return [
    {
      id: "cinq-01",
      pillar: "influencers",
      targetId: "abir-saghir",
      targetName: "Abir El Saghir",
      name: "Zaid Al-Harbi",
      email: "zaid@gulfgourmet.com",
      phone: "+971 50 123 4567",
      company: "Gulf Gourmet Food Group",
      budgetRange: "50k_100k",
      timeline: "next_month",
      goals: ["brand_awareness", "product_launch"],
      message: "Looking for an exclusive brand ambassador campaign for our new artisanal culinary range across GCC.",
      status: "new",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "cinq-02",
      pillar: "production",
      targetId: "commercial-tvc",
      targetName: "Cinematic TVC Production",
      name: "Lina Kabbani",
      email: "lina@vertexmedia.ae",
      phone: "+971 55 987 6543",
      company: "Vertex Media Agency",
      budgetRange: "100k_plus",
      timeline: "immediate",
      goals: ["conversion", "tvc_broadcast"],
      message: "Require 4K anamorphic TV commercial shoot with robotic motion control at Yas Studio A.",
      status: "contacted",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
    },
  ];
}

/**
 * Updates the administrative status of a campaign inquiry / RFP.
 *
 * @param id - UUID of the campaign inquiry.
 * @param status - Updated status ("new" | "contacted" | "in_progress" | "closed").
 * @returns CMS response confirming update.
 */
export async function updateCampaignInquiryStatus(
  id: string,
  status: "new" | "contacted" | "in_progress" | "closed"
): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.update(campaignInquiries).set({ status }).where(eq(campaignInquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: `Campaign RFP marked as ${status}.` };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a campaign inquiry record from Neon PostgreSQL.
 *
 * @param id - UUID of the campaign inquiry.
 * @returns CMS response confirming deletion.
 */
export async function deleteCmsCampaignInquiry(id: string): Promise<CmsResponse> {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      await db.delete(campaignInquiries).where(eq(campaignInquiries.id, id));
    }
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: true, message: "Campaign RFP deleted." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

