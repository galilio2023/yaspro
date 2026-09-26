import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting Yas Pro database seed...");

  // Studios
  console.log("Seeding Studios...");
  await db.insert(schema.studios).values([
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
  ]).onConflictDoNothing();

  // Influencers
  console.log("Seeding Influencers...");
  await db.insert(schema.influencers).values([
    {
      name: "Abo Flah",
      slug: "abo-flah",
      nationality: "Kuwait",
      totalFollowers: 70000000,
      instagramHandle: "aboflah",
      youtubeHandle: "AboFlah",
      tiktokHandle: "aboflah",
      isFeatured: true,
      bio: "Top Arab gaming and humanitarian digital creator.",
    },
    {
      name: "Abir El Saghir",
      slug: "abir-saghir",
      nationality: "Lebanon",
      totalFollowers: 72000000,
      instagramHandle: "abiresag",
      youtubeHandle: "abirsaghir",
      tiktokHandle: "abir.sag",
      isFeatured: true,
      bio: "Global culinary phenomenon bringing traditional culture to life.",
    },
    {
      name: "Noor Stars",
      slug: "noor-stars",
      nationality: "Iraq",
      totalFollowers: 62000000,
      instagramHandle: "noorstars",
      youtubeHandle: "noorstars",
      tiktokHandle: "noorstars",
      isFeatured: true,
      bio: "Pioneering lifestyle creator, music artist, and host.",
    },
  ]).onConflictDoNothing();

  console.log("✅ Seed completed successfully!");
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
