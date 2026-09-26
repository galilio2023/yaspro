import type { Metadata } from "next";
import { InfluencersExplorer } from "@/features/influencers/components/InfluencersExplorer";
import { INFLUENCERS_DATA } from "@/features/influencers/data";
import { SectionHeader } from "@/components/ui/section-header";
import { Users } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Influencer Hub",
  description: "Explore the creators who partner with Yas Pro: Abo Flah, Abir El Saghir, Noor Stars, Narins Beauty, and more.",
};

export default function InfluencersPage() {
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

        <InfluencersExplorer initialInfluencers={INFLUENCERS_DATA} />
      </Container>
    </Section>
  );
}
