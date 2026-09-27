import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";
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

  console.log("✅ Seed completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
