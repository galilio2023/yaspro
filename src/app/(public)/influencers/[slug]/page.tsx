import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { getCachedInfluencerBySlug } from "@/lib/cached-queries";
import { BackButton } from "@/components/ui/back-button";
import { ProductionCtaCard } from "@/components/ui/production-cta-card";
import { InfluencerProfileCard } from "@/features/influencers/components/InfluencerProfileCard";
import { InfluencerBio } from "@/features/influencers/components/InfluencerBio";
import { InfluencerHighlights } from "@/features/influencers/components/InfluencerHighlights";
import { InfluencerAudienceCard } from "@/features/influencers/components/InfluencerAudienceCard";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return INFLUENCERS_DATA.map((creator) => ({ slug: creator.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const creator = await getCachedInfluencerBySlug(slug);

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
  const creator = await getCachedInfluencerBySlug(slug);

  if (!creator) {
    notFound();
  }

  const CREATOR_SCHEMA = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: creator.name,
    jobTitle: creator.role,
    description: creator.bio,
    image: creator.avatar ? (creator.avatar.startsWith("http") ? creator.avatar : `https://yaspro.ae${creator.avatar}`) : "https://yaspro.ae/images/influencers/aboflah.jpg",
    nationality: creator.nationality,
    worksFor: {
      ...YAS_PRO_ORGANIZATION_SCHEMA,
    },
    sameAs: [
      creator.instagram ? `https://instagram.com/${creator.instagram.replace("@", "")}` : undefined,
      creator.youtube ? `https://youtube.com/${creator.youtube}` : undefined,
      creator.tiktok ? `https://tiktok.com/@${creator.tiktok.replace("@", "")}` : undefined,
    ].filter(Boolean),
  };

  return (
    <section className="w-full py-12 md:py-20 bg-background relative overflow-hidden flex flex-col items-center">
      <JsonLd data={CREATOR_SCHEMA} />
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
