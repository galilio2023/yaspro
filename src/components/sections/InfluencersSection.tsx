import Link from "next/link";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/animations/MotionWrappers";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { InfluencerCard } from "@/features/influencers/components/InfluencerCard";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Users, ArrowRight } from "lucide-react";

export default function InfluencersSection() {
  const featuredInfluencers = INFLUENCERS_DATA.slice(0, 8);

  return (
    <Section
      id="influencers"
      aria-labelledby="influencers-title"
      className="bg-background"
    >
      <Container>
        <SectionHeader
          headingId="influencers-title"
          badge="Creator Production Partner"
          badgeVariant="default"
          badgeIcon={<Users size={13} />}
          title="Featured"
          gradientText="Influencers"
          description="Trusted by the biggest creator networks in the Middle East with 400M+ combined audience. From acoustic podcast suites to viral YouTube production and stadium live streaming."
        />

        <StaggerContainer as="ul" role="list" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full">
          {featuredInfluencers.map((creator) => (
            <StaggerItem as="li" key={creator.id} className="h-full">
              <InfluencerCard creator={creator} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Centered "View All" CTA below grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-10">
          <Link
            href="/influencers"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-brand-purple/40 text-brand-purple-light hover:bg-brand-purple/10 hover:border-brand-purple transition-all text-xs font-semibold"
          >
            <span>View All 400M+ Creator Roster</span>
            <ArrowRight size={14} />
          </Link>
        </FadeUp>
      </Container>
    </Section>
  );
}
