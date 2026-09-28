import { unstable_cache } from "next/cache";
import { getCmsProjects, getCmsInfluencers, getCmsEquipment, getCmsStudios } from "./cms-actions";
import { db } from "@/db";
import { projects, influencers, type Project, type Influencer, type Equipment, type Studio } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import type { ProjectItem, ProjectCategory } from "@/features/projects/types";
import type { InfluencerItem, CreatorDemographics } from "@/features/influencers/types";

/**
 * 1 hour default TTL for ISR background revalidation.
 * Mutations in cms-actions trigger immediate on-demand invalidation via revalidateTag.
 */
const DEFAULT_REVALIDATE_SECONDS = 3600;

export const CACHE_TAGS = {
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  influencers: "influencers",
  influencer: (slug: string) => `influencer:${slug}`,
  gear: "gear",
  studios: "studios",
} as const;

/**
 * Cached public query for all portfolio projects.
 */
export const getCachedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    return getCmsProjects();
  },
  ["all-projects-cache"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.projects],
  }
);

/**
 * Cached single project query by slug with fallback to static catalog.
 */
export async function getCachedProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const fetcher = unstable_cache(
    async (targetSlug: string): Promise<ProjectItem | null> => {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
        const record = await db.query.projects.findFirst({
          where: eq(projects.slug, targetSlug),
        });
          if (record) {
            return {
              id: record.id,
              slug: record.slug,
              title: record.title,
              arabicTitle: record.arabicTitle || undefined,
              category: (record.category === "government" || record.category === "commercial" || record.category === "shows"
                ? record.category
                : "commercial") as ProjectCategory,
              categoryLabel:
                record.category === "government"
                  ? "Government"
                  : record.category === "shows"
                  ? "Live Shows & Events"
                  : "Commercial",
              client: record.client || "",
              description: record.description || "",
              tag: record.tag || "Production",
              views: record.views || "10M+ Views",
              year: record.year || "2024",
              image: record.coverImageUrl || "/images/projects/flag-day.jpg",
              vimeoId: record.videoUrl ? record.videoUrl.split("/").pop() : undefined,
              deliverables: record.deliverables || [],
              techStack: record.techStack || [],
            };
          }
        }

      const staticItem = PROJECTS_DATA.find((p) => p.slug === targetSlug);
      return staticItem || null;
    },
    [`project-by-slug-${slug}`],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.projects, CACHE_TAGS.project(slug)],
    }
  );

  return fetcher(slug);
}

/**
 * Cached public query for all influencers.
 */
export const getCachedInfluencers = unstable_cache(
  async (): Promise<Influencer[]> => {
    return getCmsInfluencers();
  },
  ["all-influencers-cache"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.influencers],
  }
);

/**
 * Cached single creator query by slug with fallback to static catalog.
 */
export async function getCachedInfluencerBySlug(slug: string): Promise<InfluencerItem | null> {
  const fetcher = unstable_cache(
    async (targetSlug: string): Promise<InfluencerItem | null> => {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
        const record = await db.query.influencers.findFirst({
          where: eq(influencers.slug, targetSlug),
        });
          if (record) {
            const rawDemo = record.demographics as Record<string, unknown> | null;
            let validatedDemo: CreatorDemographics | undefined = undefined;

            if (
              rawDemo &&
              Array.isArray(rawDemo.topCountries) &&
              typeof rawDemo.primaryAgeGroup === "string" &&
              typeof rawDemo.genderSplit === "object" &&
              rawDemo.genderSplit !== null &&
              "male" in rawDemo.genderSplit &&
              "female" in rawDemo.genderSplit
            ) {
              validatedDemo = rawDemo as unknown as CreatorDemographics;
            }

            return {
              id: record.id,
              slug: record.slug,
              name: record.name,
              role: record.role || "Digital Creator",
              nationality: record.nationality || "MENA",
              flag: record.flag || "🌟",
              totalFollowers: record.totalFollowers || "10M+",
              rawFollowers: record.rawFollowers || 10,
              instagram: record.instagramHandle || "",
              youtube: record.youtubeHandle || "",
              tiktok: record.tiktokHandle || "",
              bio: record.bio || "",
              avatar: record.imageUrl || "/images/influencers/aboflah.jpg",
              collaborations: record.collaborations || [],
              signatureProductions: record.signatureProductions || [],
              demographics: validatedDemo,
            };
          }
        }

      const staticItem = INFLUENCERS_DATA.find((i) => i.slug === targetSlug);
      return staticItem || null;
    },
    [`influencer-by-slug-${slug}`],
    {
      revalidate: DEFAULT_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.influencers, CACHE_TAGS.influencer(slug)],
    }
  );

  return fetcher(slug);
}

/**
 * Cached public query for rental equipment.
 */
export const getCachedEquipment = unstable_cache(
  async (): Promise<Equipment[]> => {
    return getCmsEquipment();
  },
  ["all-equipment-cache"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.gear],
  }
);

/**
 * Cached public query for studio soundstages.
 */
export const getCachedStudios = unstable_cache(
  async (): Promise<Studio[]> => {
    return getCmsStudios();
  },
  ["all-studios-cache"],
  {
    revalidate: DEFAULT_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.studios],
  }
);
