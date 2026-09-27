import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { BackButton } from "@/components/ui/back-button";
import { ProductionCtaCard } from "@/components/ui/production-cta-card";
import { InfluencerProfileCard } from "@/features/influencers/components/InfluencerProfileCard";
import { InfluencerBio } from "@/features/influencers/components/InfluencerBio";
import { InfluencerHighlights } from "@/features/influencers/components/InfluencerHighlights";
import { InfluencerAudienceCard } from "@/features/influencers/components/InfluencerAudienceCard";

export const dynamicParams = false;

export async function generateStaticParams() {
  return INFLUENCERS_DATA.map((creator) => ({ slug: creator.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = INFLUENCERS_DATA.find((c) => c.slug === slug);

  if (!creator) return { title: "Creator Not Found" };

  return {
    title: `${creator.name} (${creator.totalFollowers}) | Yas Pro Creators`,
    description: creator.bio,
  };
}

export default async function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const creator = INFLUENCERS_DATA.find((c) => c.slug === slug);

  if (!creator) {
    notFound();
  }

  return (
    <section className="w-full py-12 md:py-20 bg-background relative overflow-hidden flex flex-col items-center">
      {/* Ambient background light */}
      <div className="absolute top-20 right-1/4 size-[600px] bg-brand-purple/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <BackButton href="/influencers" label="Back to Influencer Hub" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Profile Card & Quick Actions (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            <InfluencerProfileCard creator={creator} />
            <ProductionCtaCard
              title="Produce your next show at Yas Pro"
              description="Book our creator soundstages, podcast suites, or request outside broadcast units for your next viral moment."
              primaryText="Book Studio Session"
              primaryHref="/studio-booking"
              secondaryText="Contact Team"
              secondaryHref="/contact"
            />
          </div>

          {/* Bio & Highlights & Demographics (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <InfluencerBio creator={creator} />
            <InfluencerAudienceCard demographics={creator.demographics} creatorName={creator.name} />
            <InfluencerHighlights
              signatureProductions={creator.signatureProductions}
              collaborations={creator.collaborations}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
