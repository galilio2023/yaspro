import type { Metadata } from "next";
import { AboutHeroHeader } from "@/features/about/components/AboutHeroHeader";
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
          <AboutHeroHeader />
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
