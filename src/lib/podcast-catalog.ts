import "server-only";

import { db } from "@/db";
import { platformSettings, podcastAddons, podcastSets, studios } from "@/db/schema";
import { PODCAST_ADDONS, PODCAST_SERVICES, PODCAST_STUDIOS } from "@/features/podcast-booking/data";
import { eq, sql } from "drizzle-orm";

const seedKey = "podcast_catalog_seeded";

/** Seed once, preserving edits and remembering deletions even when a table becomes empty. */
export async function ensurePodcastCatalog() {
  const [seeded] = await db.select().from(platformSettings).where(eq(platformSettings.key, seedKey)).limit(1);
  if (seeded) return;

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${seedKey}))`);
    const [existing] = await tx.select().from(platformSettings).where(eq(platformSettings.key, seedKey)).limit(1);
    if (existing) return;

    await tx.insert(podcastSets).values(PODCAST_STUDIOS.map((studio, sortOrder) => ({
      id: studio.key,
      name: studio.name,
      seats: studio.seats,
      location: studio.location,
      image: studio.image,
      gradient: studio.gradient,
      description: studio.description,
      isAvailable: studio.isAvailable ?? true,
      sortOrder,
    }))).onConflictDoNothing();
    await tx.insert(podcastAddons).values(PODCAST_ADDONS.map((addon, sortOrder) => ({
      id: addon.key,
      title: addon.title,
      desc: addon.desc,
      priceNum: addon.priceNum,
      priceDisplay: addon.priceDisplay,
      unit: addon.unit,
      gradient: addon.gradient,
      vimeoEmbed: addon.vimeoEmbed,
      isActive: addon.isActive ?? true,
      sortOrder,
    }))).onConflictDoNothing();

    // Scheduling uses studio UUIDs; include sets already created through the CMS.
    const sets = await tx.select().from(podcastSets);
    await tx.insert(studios).values(sets.map((set) => ({
      slug: set.id,
      name: set.name,
      capacity: set.seats,
      hourlyRate: String(PODCAST_SERVICES.find((service) => service.key === "recording")!.price),
      category: "podcast",
      imageUrl: set.image,
    }))).onConflictDoNothing();
    await tx.insert(platformSettings).values({ key: seedKey, value: true }).onConflictDoNothing();
  });
}
