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
      const [allProjects, allInfluencers, allGear, allBookings, allRfps, allInquiries, allUsers, allStudios] =
        await Promise.all([
          db.select({ id: projects.id }).from(projects),
          db.select({ id: influencers.id }).from(influencers),
          db.select({ id: equipment.id }).from(equipment),
          db.select({ id: bookings.id, status: bookings.status }).from(bookings),
          db.select({ id: enterpriseRfps.id, status: enterpriseRfps.status }).from(enterpriseRfps),
          db.select({ id: inquiries.id, isResolved: inquiries.isResolved }).from(inquiries),
          db.select({ id: users.id, role: users.role }).from(users),
          db.select({ id: studios.id, isActive: studios.isActive }).from(studios),
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
        activeStudios: allStudios.length > 0 ? allStudios.filter((s) => s.isActive).length : STUDIOS.length,
      };
    }
  } catch (err) {
    console.error("getCmsOverviewStats DB error:", err);
  }

  // In production, never return fabricated statistics
  if (process.env.NODE_ENV === "production") {
    return {
      totalProjects: PROJECTS_DATA.length,
      totalInfluencers: INFLUENCERS_DATA.length,
      totalGear: GEAR_DATA.length,
      totalBookings: 0,
      pendingBookings: 0,
      totalRfps: 0,
      pendingRfps: 0,
      totalInquiries: 0,
      pendingInquiries: 0,
      totalUsers: 0,
      clientUsers: 0,
      adminUsers: 0,
      totalStudios: STUDIOS.length,
      activeStudios: STUDIOS.length,
    };
  }

  // Local development / mock preview fallback
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
