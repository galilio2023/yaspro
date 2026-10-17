"use client";

import Link from "next/link";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/animations/MotionWrappers";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { InfluencerCard } from "@/features/influencers/components/InfluencerCard";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { InfluencerItem } from "@/features/influencers/types";

interface InfluencersSectionProps {
  initialInfluencers?: InfluencerItem[];
}

export default function InfluencersSection({ initialInfluencers }: InfluencersSectionProps = {}) {
  const { t, isArabic } = useLanguage();
  const sourceInfluencers =
    initialInfluencers ?? INFLUENCERS_DATA;
  const featuredInfluencers = sourceInfluencers.slice(0, 8);

  if (sourceInfluencers.length === 0) return null;

  return (
    <Section
      id="influencers"
      aria-labelledby="influencers-title"
      className="bg-transparent py-12 sm:py-16 lg:py-28"
    >
      <Container>
        <SectionHeader
          headingId="influencers-title"
          title={isArabic ? t("creators.title") : "Featured"}
          gradientText={isArabic ? t("creators.titleGradient") : "Influencers"}
          description={t("creators.description")}
          align="left"
        />

        <StaggerContainer
          as="ul"
          role="list"
          staggerDelay={0.08}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch w-full"
        >
          {featuredInfluencers.map((creator) => (
            <StaggerItem as="li" key={creator.id} className="h-full">
              <InfluencerCard creator={creator} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Centered "View All" CTA below grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-8 sm:mt-10 px-4">
          <Link
            href="/influencers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full border border-white/15 bg-zinc-900/80 text-zinc-200 hover:bg-brand-violet hover:text-white hover:border-brand-mauve/50 transition-all text-xs font-semibold shadow-lg shadow-black/50 min-h-[44px] sm:min-h-0"
          >
            <span>
              {t("creators.viewAllCreators")} ({isArabic ? "شبكة 400M+ متابع" : "400M+ Audience"})
            </span>
            <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
          </Link>
        </FadeUp>
      </Container>
    </Section>
  );
}
