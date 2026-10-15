"use server";

import { db } from "@/db";
import {
  projects,
  influencers,
  equipment,
  bookings,
  inquiries,
  users,
  studios,
} from "@/db/schema";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { GEAR_DATA } from "@/features/gear/data";
import { STUDIOS } from "@/features/booking/constants";
import { isDbAvailable, requireAdmin } from "./shared";


/**
 * Aggregates high-level CMS operational statistics across all entities.
 *
 * @returns An overview metrics object containing project, influencer, gear, booking, and RFP tallies.
 */
export async function getCmsOverviewStats() {
  try {
    await requireAdmin();
    if (isDbAvailable()) {
      const [allProjects, allInfluencers, allGear, allBookings, allInquiries, allUsers, allStudios] =
        await Promise.all([
          db.select({ id: projects.id }).from(projects),
          db.select({ id: influencers.id }).from(influencers),
          db.select({ id: equipment.id }).from(equipment),
          db
            .select({
              id: bookings.id,
              status: bookings.status,
              referenceCode: bookings.referenceCode,
              totalAmount: bookings.totalAmount,
              paymentStatus: bookings.paymentStatus,
            })
            .from(bookings),
          db
            .select({
              id: inquiries.id,
              inquiryType: inquiries.inquiryType,
              message: inquiries.message,
              isResolved: inquiries.isResolved,
            })
            .from(inquiries),
          db.select({ id: users.id, role: users.role }).from(users),
          db.select({ id: studios.id, isActive: studios.isActive }).from(studios),
        ]);

      const totalBookedRevenue = Math.round(
        allBookings.reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0)
      );
      const paidRevenue = Math.round(
        allBookings
          .filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "deposit_paid")
          .reduce((acc, curr) => acc + (parseFloat(curr.totalAmount) || 0), 0)
      );

      return {
        status: "available" as const,
        totalProjects: allProjects.length || PROJECTS_DATA.length,
        totalInfluencers: allInfluencers.length || INFLUENCERS_DATA.length,
        totalGear: allGear.length || GEAR_DATA.length,
        totalBookings: allBookings.length,
        pendingBookings: allBookings.filter((b) => b.status === "pending").length,
        offerBookings: allBookings.filter((b) => b.referenceCode?.startsWith("YAS-OFR")).length,
        podcastBookings: allBookings.filter((b) => b.referenceCode?.startsWith("POD-")).length,
        totalInquiries: allInquiries.length,
        pendingInquiries: allInquiries.filter((i) => !i.isResolved).length,
        retainerLeads: allInquiries.filter((i) => i.message?.includes("[Social Media Package Subscription Request]")).length,
        broadcastLeads: allInquiries.filter(
          (i) => i.inquiryType === "ob_van" || i.inquiryType === "live_broadcast" || i.message?.includes("[OB-VAN")
        ).length,
        totalBookedRevenue,
        paidRevenue,
        totalUsers: allUsers.length,
        clientUsers: allUsers.filter((u) => u.role === "client").length,
        adminUsers: allUsers.filter((u) => u.role === "admin").length,
        totalStudios: allStudios.length || STUDIOS.length,
        activeStudios: allStudios.length > 0 ? allStudios.filter((s) => s.isActive).length : STUDIOS.length,
      };
    }
  } catch (err) {
    console.error("getCmsOverviewStats DB error:", err);
  }

  // In production, never return fabricated statistics
  if (process.env.NODE_ENV === "production") {
    return {
      status: "unavailable" as const,
      totalProjects: PROJECTS_DATA.length,
      totalInfluencers: INFLUENCERS_DATA.length,
      totalGear: GEAR_DATA.length,
      totalBookings: 0,
      pendingBookings: 0,
      offerBookings: 0,
      podcastBookings: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      retainerLeads: 0,
      broadcastLeads: 0,
      totalBookedRevenue: 0,
      paidRevenue: 0,
      totalUsers: 0,
      clientUsers: 0,
      adminUsers: 0,
      totalStudios: STUDIOS.length,
      activeStudios: STUDIOS.length,
    };
  }

  // Local development / mock preview fallback
  return {
    status: "demo" as const,
    totalProjects: PROJECTS_DATA.length,
    totalInfluencers: INFLUENCERS_DATA.length,
    totalGear: GEAR_DATA.length,
    totalBookings: 12,
    pendingBookings: 3,
    offerBookings: 4,
    podcastBookings: 6,
    totalInquiries: 14,
    pendingInquiries: 4,
    retainerLeads: 3,
    broadcastLeads: 2,
    totalBookedRevenue: 68500,
    paidRevenue: 42000,
    totalUsers: 24,
    clientUsers: 21,
    adminUsers: 3,
    totalStudios: STUDIOS.length,
    activeStudios: STUDIOS.length,
  };
}
