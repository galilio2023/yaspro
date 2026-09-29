import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AboutHeroHeader } from "@/features/about/components/AboutHeroHeader";
import { AboutOverview } from "@/features/about/components/AboutOverview";
import { AboutMilestones } from "@/features/about/components/AboutMilestones";
import { AboutPillars } from "@/features/about/components/AboutPillars";
import { TeamGrid } from "@/features/about/components/TeamGrid";
import { AboutCtaBanner } from "@/features/about/components/AboutCtaBanner";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return {
    title: isArabic ? "عن Yas Pro" : "About Us",
    description: isArabic
      ? "تعرف على Yas Pro Media — المنظومة الإنتاجية الأسرع نمواً في الشرق الأوسط."
      : "Learn about Yas Pro Media — the fastest-growing AI media production company in the Gulf region.",
  };
}

export default function AboutPage() {
  return (
    <>
      {/* ── Page Hero & Foundations ── */}
      <Section
        id="about-hero"
        aria-labelledby="about-title"
        className="pt-10 sm:pt-16 pb-12 sm:pb-20 bg-background relative overflow-hidden"
      >
        <Container>
          <AboutHeroHeader />
          <AboutOverview />
        </Container>
      </Section>

      {/* ── Heritage & Milestones Journey ── */}
      <Section
        id="about-heritage"
        aria-labelledby="about-heritage-title"
        className="py-16 sm:py-24 bg-[#05040e] border-t border-white/[0.08] relative overflow-hidden"
      >
        <Container>
          <AboutMilestones />
        </Container>
      </Section>

      {/* ── Pillars & Studio Capabilities ── */}
      <Section
        id="about-pillars"
        aria-labelledby="pillars-title"
        className="py-16 sm:py-24 bg-background border-t border-white/[0.08]"
      >
        <Container>
          <AboutPillars headingId="pillars-title" />
        </Container>
      </Section>

      {/* ── Executive Leadership & Team Roster ── */}
      <Section
        id="about-team"
        aria-labelledby="team-title"
        className="py-16 sm:py-24 bg-[#05040e] border-t border-white/[0.08]"
      >
        <Container>
          <TeamGrid headingId="team-title" />
          <AboutCtaBanner />
        </Container>
      </Section>
    </>
  );
}
