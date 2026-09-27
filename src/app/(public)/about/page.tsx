import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { AboutOverview } from "@/features/about/components/AboutOverview";
import { AboutPillars } from "@/features/about/components/AboutPillars";
import { TeamGrid } from "@/features/about/components/TeamGrid";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Yas Pro Media — the fastest-growing AI media production company in the Gulf region.",
};

export default function AboutPage() {
  return (
    <>
      {/* Page Hero — h1 landmark */}
      <Section
        id="about-hero"
        aria-labelledby="about-title"
        className="py-12 md:py-20 bg-background"
      >
        <Container>
          <SectionHeader
            headingId="about-title"
            as="h1"
            badge="About Us &amp; Our Story"
            badgeVariant="default"
            badgeIcon={<Sparkles size={13} />}
            title="Redefining Media in the"
            gradientText="Gulf Region"
            description="Yas Pro Media is the fastest-growing production company in the Middle East. You focus on what you do best — let Yas Pro handle the rest."
          />

          <AboutOverview />
        </Container>
      </Section>

      {/* Pillars — separate section with its own heading */}
      <Section
        id="about-pillars"
        aria-labelledby="pillars-title"
        className="bg-secondary border-t border-white/10"
      >
        <Container>
          <AboutPillars headingId="pillars-title" />
        </Container>
      </Section>

      {/* Team — separate section with its own heading */}
      <Section
        id="about-team"
        aria-labelledby="team-title"
        className="bg-background border-t border-white/10"
      >
        <Container>
          <TeamGrid headingId="team-title" />
        </Container>
      </Section>
    </>
  );
}
