import HeroSection from "@/components/sections/HeroSection";
import { OffersPreviewSection } from "@/components/sections/OffersPreviewSection";
import { GearPreviewSection } from "@/components/sections/GearPreviewSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { VirtualStudioSection } from "@/components/sections/VirtualStudioSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import InfluencersSection from "@/components/sections/InfluencersSection";
import { getCachedProjects, getCachedInfluencers } from "@/lib/cached-queries";
import { PROJECTS_DATA } from "@/features/projects/data";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import type { ProjectItem, ProjectCategory } from "@/features/projects/types";
import type { InfluencerItem, CreatorDemographics } from "@/features/influencers/types";

import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  government: "Government",
  commercial: "Commercial",
  shows: "Live Shows & Events",
  documentary: "Documentary Film",
  event: "Live Broadcast & Event",
  influencer: "Creator Campaign",
};

export default async function HomePage() {
  const [cmsProjects, cmsInfluencers] = await Promise.all([
    getCachedProjects().catch(() => []),
    getCachedInfluencers().catch(() => []),
  ]);

  const initialProjects: ProjectItem[] =
    cmsProjects.length > 0
      ? cmsProjects
          .filter((p) => p.isFeatured !== false)
          .map((p) => {
            const validCat = (
              p.category && p.category in CATEGORY_LABELS ? p.category : "commercial"
            ) as ProjectCategory;
            return {
              id: p.id,
              slug: p.slug,
              title: p.title,
              arabicTitle: p.arabicTitle || undefined,
              category: validCat,
              categoryLabel: CATEGORY_LABELS[validCat] || "Commercial",
              client: p.client || "",
              description: p.description || "",
              arabicDescription: p.arabicDescription || undefined,
              tag: p.tag || "Production",
              views: p.views || "10M+ Views",
              year: p.year || "2024",
              image: p.coverImageUrl || "/images/projects/flag-day.jpg",
              vimeoId: p.videoUrl ? p.videoUrl.split("/").pop() : undefined,
              videoUrl: p.videoUrl || undefined,
              deliverables: p.deliverables || [],
              techStack: p.techStack || [],
            };
          })
      : PROJECTS_DATA;

  const initialInfluencers: InfluencerItem[] =
    cmsInfluencers.length > 0
      ? cmsInfluencers
          .filter((inf) => inf.isFeatured !== false)
          .map((inf) => ({
            id: inf.id,
            slug: inf.slug,
            name: inf.name,
            role: inf.role || "Digital Creator",
            nationality: inf.nationality || "MENA",
            flag: inf.flag || "🌟",
            totalFollowers: inf.totalFollowers || "10M+",
            rawFollowers: inf.rawFollowers || 10,
            instagram: inf.instagramHandle || "",
            youtube: inf.youtubeHandle || "",
            tiktok: inf.tiktokHandle || "",
            bio: inf.bio || "",
            avatar: inf.imageUrl || "/images/influencers/aboflah.jpg",
            collaborations: inf.collaborations || [],
            signatureProductions: inf.signatureProductions || [],
            demographics: inf.demographics as unknown as CreatorDemographics,
          }))
      : INFLUENCERS_DATA;

  return (
    <>
      {/* Above the fold */}
      <HeroSection />

      {/* Offers & Turnkey Production Bundles Showcase */}
      <OffersPreviewSection />

      {/* Cinema Gear & Equipment Rental Showcase */}
      <GearPreviewSection />

      {/* Main Feature Sections */}
      <VirtualStudioSection />
      <PartnersMarquee />
      <PortfolioSection initialProjects={initialProjects} />
      <InfluencersSection initialInfluencers={initialInfluencers} />
    </>
  );
}
