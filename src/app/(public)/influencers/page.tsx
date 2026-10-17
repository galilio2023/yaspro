import type { Metadata } from "next";
import { InfluencersExplorer } from "@/features/influencers/components/InfluencersExplorer";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { getCachedInfluencers } from "@/lib/cached-queries";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { InfluencerItem, CreatorDemographics } from "@/features/influencers/types";

import { InfluencersPageHeader } from "@/features/influencers/components/InfluencersPageHeader";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Creator Network & Influencer Hub",
  description:
    "Explore the creators partnering with Yas Pro: Abo Flah, Abir El Saghir, Noor Stars, Narins Beauty, and leading MENA digital creators.",
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: "Creator Network & Influencer Hub • Yas Pro",
    description:
      "Explore top MENA digital creators partnering with Yas Pro: Abo Flah, Abir El Saghir, Noor Stars, Narins Beauty, and more.",
    url: `${SITE_URL}/influencers`,
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Creator Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Network & Influencer Hub • Yas Pro",
    description:
      "Explore top MENA digital creators partnering with Yas Pro: Abo Flah, Abir El Saghir, Noor Stars, Narins Beauty, and more.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  alternates: {
    canonical: `${SITE_URL}/influencers`,
  },
};

export default async function InfluencersPage() {
  const cmsInfluencers = await getCachedInfluencers();

  const creatorsToDisplay: InfluencerItem[] = cmsInfluencers.map((inf) => ({
    id: inf.id,
    slug: inf.slug,
    name: inf.name,
    role: inf.role || "Digital Creator",
    arabicRole: inf.arabicRole || undefined,
    nationality: inf.nationality || "MENA",
    flag: inf.flag || "🌟",
    totalFollowers: inf.totalFollowers || "10M+",
    rawFollowers: inf.rawFollowers || 10,
    instagram: inf.instagramHandle || "",
    youtube: inf.youtubeHandle || "",
    tiktok: inf.tiktokHandle || "",
    bio: inf.bio || "",
    arabicBio: inf.arabicBio || undefined,
    avatar: inf.imageUrl || "/images/influencers/aboflah.jpg",
    collaborations: inf.collaborations || [],
    signatureProductions: inf.signatureProductions || [],
    demographics: inf.demographics as unknown as CreatorDemographics,
  }));

  const initialInfluencers = creatorsToDisplay.length > 0 ? creatorsToDisplay : INFLUENCERS_DATA;

  return (
    <Section id="influencers-page" aria-labelledby="influencers-title" className="py-12 md:py-20 bg-background">
      <Container>
        <InfluencersPageHeader />
        <InfluencersExplorer initialInfluencers={initialInfluencers} />
      </Container>
    </Section>
  );
}
