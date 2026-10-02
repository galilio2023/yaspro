import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { hashPassword } from "better-auth/crypto";
import { PROJECTS_DATA } from "../features/projects/data";
import { INFLUENCERS_DATA } from "../features/influencers/data";
import { GEAR_DATA } from "../features/gear/data";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment or .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Yas Pro comprehensive database seed...");

  // 1. Studios
  console.log("Seeding Studios...");
  await db
    .insert(schema.studios)
    .values([
      {
        slug: "studio-xr",
        name: "Studio XR — Virtual Production Stage",
        description: "270° Micro-LED volume with Unreal Engine 5.4 LiveSync, Mo-Sys optical tracking, and genlock synchronization.",
        capacity: 35,
        hourlyRate: "1500.00",
        amenities: ["Micro-LED Volume", "Unreal Engine 5.4", "Mo-Sys StarTracker", "Dedicated DIT Station"],
        isActive: true,
      },
      {
        slug: "studio-a",
        name: "Studio A — Main Stage",
        description: "200 sqm soundproof stage with green screen, 4K camera rig, and motorized lighting grid.",
        capacity: 25,
        hourlyRate: "800.00",
        amenities: ["Green Screen", "4K Rig", "Dressing Rooms", "Audio Booth"],
        isActive: true,
      },
      {
        slug: "studio-b",
        name: "Studio B — Podcast Suite",
        description: "Acoustically treated multi-mic podcast studio with 4x Shure SM7B, ATEM switcher, and Astera mood lighting.",
        capacity: 6,
        hourlyRate: "400.00",
        amenities: ["4x Shure SM7B", "ATEM Mini Extreme", "Astera RGB", "Dolby Treated"],
        isActive: true,
      },
      {
        slug: "studio-c",
        name: "Studio C — Cyclorama Stage",
        description: "Infinite white cyclorama with ceiling softboxes and overhead pantograph system for commercial and fashion.",
        capacity: 15,
        hourlyRate: "600.00",
        amenities: ["Infinite White Cyc", "Aputure 1200d", "Hair & Makeup Station"],
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 2. Influencers
  console.log("Seeding Influencers from catalog...");
  for (const item of INFLUENCERS_DATA) {
    await db
      .insert(schema.influencers)
      .values({
        slug: item.slug,
        name: item.name,
        role: item.role,
        nationality: item.nationality,
        flag: item.flag,
        bio: item.bio,
        imageUrl: item.avatar,
        totalFollowers: item.totalFollowers,
        rawFollowers: Math.round(item.rawFollowers),
        instagramHandle: item.instagram,
        youtubeHandle: item.youtube,
        tiktokHandle: item.tiktok,
        collaborations: item.collaborations || [],
        signatureProductions: item.signatureProductions || [],
        demographics: item.demographics ? (item.demographics as unknown as Record<string, unknown>) : {},
        isFeatured: true,
      })
      .onConflictDoNothing();
  }

  // 3. Projects
  console.log("Seeding Projects from catalog...");
  for (const proj of PROJECTS_DATA) {
    const validCategory =
      proj.category === "government" ||
      proj.category === "commercial" ||
      proj.category === "shows"
        ? proj.category
        : "commercial";

    await db
      .insert(schema.projects)
      .values({
        slug: proj.slug,
        title: proj.title,
        arabicTitle: proj.arabicTitle || "",
        description: proj.description,
        category: validCategory,
        client: proj.client,
        coverImageUrl: proj.image,
        videoUrl: proj.vimeoId ? `https://vimeo.com/${proj.vimeoId}` : null,
        tag: proj.tag,
        views: proj.views,
        year: proj.year || "2024",
        deliverables: proj.deliverables || [],
        techStack: proj.techStack || [],
        tags: [proj.tag, proj.categoryLabel],
        isFeatured: true,
      })
      .onConflictDoNothing();
  }

  // 4. Equipment
  console.log("Seeding Equipment from catalog...");
  for (const gear of GEAR_DATA) {
    await db
      .insert(schema.equipment)
      .values({
        slug: gear.id,
        name: gear.name,
        description: gear.description,
        category: gear.category,
        dailyRate: gear.dailyRate.toFixed(2),
        securityDeposit: (gear.securityDeposit || 0).toFixed(2),
        imageUrl: gear.image,
        specs: gear.specs || [],
        isPopular: !!gear.isPopular,
        isKit: !!gear.isKit,
        includedInKit: gear.includedInKit || [],
        isAvailable: true,
      })
      .onConflictDoNothing();
  }

  // 5. Team & Client Users (Imported from legacy WordPress directory)
  console.log("Seeding Administrative and Team Accounts with login credentials...");
  const seededUsers = [
    { id: "usr_yaman_ceo", name: "Yaman Alomari", email: "ceo@yasproductions.com", role: "admin", company: "Yas Productions" },
    { id: "usr_yaspro_admin", name: "YASPRO Master", email: "pressyaman@gmail.com", role: "admin", company: "Yas Productions" },
    { id: "usr_ahmad_lead", name: "Ahmad Wadi", email: "ahmedwadi978@gmail.com", role: "admin", company: "Yas Productions" },
    { id: "usr_yaspro_hq", name: "YASPRO Operations", email: "info@yasproductions.com", role: "admin", company: "Yas Productions" },
    { id: "usr_walaa_admin", name: "Walaa Ali", email: "walaa.ali131@gmail.com", role: "admin", company: "Yas Productions" },
    { id: "usr_belal_client", name: "Belal Alaa", email: "eng.belalalaa@gmail.com", role: "client", company: "Independent Creator" },
  ];

  const defaultAdminPassword =
    process.env.INITIAL_ADMIN_PASSWORD ||
    process.env.ADMIN_SEED_PASSWORD ||
    "YasPro@2026!";
  const initialPasswordHash = await hashPassword(defaultAdminPassword);

  for (const u of seededUsers) {
    const [persistedUser] = await db
      .insert(schema.users)
      .values({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        company: u.company,
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          role: u.role,
          emailVerified: true,
          company: u.company,
          updatedAt: new Date(),
        },
      })
      .returning();

    const targetUserId = persistedUser?.id || u.id;

    // Preserve existing passwords on conflict - only insert initial credentials for new accounts
    await db
      .insert(schema.accounts)
      .values({
        id: `acc_${targetUserId}`,
        accountId: targetUserId,
        providerId: "credential",
        userId: targetUserId,
        password: initialPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // 6. Historical Bookings (Preserved from WordPress studio reservations)
  console.log("Seeding Historical Bookings from WordPress...");
  const studioA = await db.query.studios.findFirst({ where: (s, { eq }) => eq(s.slug, "studio-a") });
  const studioId = studioA?.id;

  const historicalReservations = [
    { code: "YAS-1C1B9C03", email: "ceo@yasproductions.com", name: "Yaman Alomari", total: "4500.00", date: "2026-03-11T09:00:00Z", status: "confirmed" as const },
    { code: "YAS-2843A111", email: "walaa.ali131@gmail.com", name: "Walaa Ali", total: "4536.00", date: "2026-03-11T09:00:00Z", status: "confirmed" as const },
    { code: "YAS-314F3545", email: "walaa.ali131@gmail.com", name: "Walaa Ali", total: "4536.00", date: "2026-03-14T09:00:00Z", status: "confirmed" as const },
    { code: "YAS-60C62277", email: "pressyaman@gmail.com", name: "Yaman Alomari", total: "4800.00", date: "2026-03-25T09:00:00Z", status: "confirmed" as const },
    { code: "YAS-8754143B", email: "walaa.ali131@gmail.com", name: "Walaa Ali", total: "4536.00", date: "2026-03-25T09:00:00Z", status: "confirmed" as const },
    { code: "YAS-BD2A04FD", email: "eng.belalalaa@gmail.com", name: "Belal Alaa", total: "4536.00", date: "2026-09-27T09:00:00Z", status: "pending" as const },
  ];

  for (const b of historicalReservations) {
    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, b.email) });
    await db
      .insert(schema.bookings)
      .values({
        referenceCode: b.code,
        userId: user?.id,
        studioId: studioId,
        sessionType: "podcast",
        status: b.status,
        scheduledAt: new Date(b.date),
        durationHours: 3,
        headcount: 3,
        totalAmount: b.total,
        currency: "AED",
        paymentStatus: b.status === "confirmed" ? "paid" : "unpaid",
      })
      .onConflictDoNothing();
  }

  console.log("✅ Seed completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
