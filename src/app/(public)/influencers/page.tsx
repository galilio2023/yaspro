import type { Metadata } from "next";
import { InfluencersExplorer } from "@/features/influencers/components/InfluencersExplorer";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { getCmsInfluencers } from "@/lib/cms-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { Users } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { InfluencerItem, CreatorDemographics } from "@/features/influencers/types";

export const metadata: Metadata = {
  title: "Influencer Hub",
  description: "Explore the creators who partner with Yas Pro: Abo Flah, Abir El Saghir, Noor Stars, Narins Beauty, and more.",
};

export default async function InfluencersPage() {
  const cmsInfluencers = await getCmsInfluencers();

  const creatorsToDisplay: InfluencerItem[] = cmsInfluencers.map((inf) => ({
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
  }));

  const initialInfluencers = creatorsToDisplay.length > 0 ? creatorsToDisplay : INFLUENCERS_DATA;

  return (
    <Section id="influencers-page" aria-labelledby="influencers-title" className="py-12 md:py-20 bg-background">
      <Container>
        <SectionHeader
          headingId="influencers-title"
          as="h1"
          badge="Creator Production Partner"
          badgeVariant="default"
          badgeIcon={<Users size={13} />}
          title="Where Elite"
          gradientText="Creators Thrive"
          description="Trusted by top-tier Arab influencers with over 400M+ combined audience. From podcast spaces to full-scale viral series production."
        />

        <InfluencersExplorer initialInfluencers={initialInfluencers} />
      </Container>
    </Section>
  );
}
