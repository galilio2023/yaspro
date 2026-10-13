import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { AboutHeroHeader } from "@/features/about/components/AboutHeroHeader";
import { AboutOverview } from "@/features/about/components/AboutOverview";
import { AboutMilestones } from "@/features/about/components/AboutMilestones";
import { YasGroupShowcase } from "@/features/group/components/YasGroupShowcase";
import { FounderSpotlight } from "@/features/about/components/FounderSpotlight";
import { AboutCtaBanner } from "@/features/about/components/AboutCtaBanner";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const title = isArabic ? "عن الشركة والمنظومة" : "About Us";
  const desc = isArabic
    ? "تعرف على Yas Pro Media — المنظومة الإنتاجية الأسرع نمواً في الشرق الأوسط للإنتاج الافتراضي وصناع المحتوى."
    : "Learn about Yas Pro Media — the premier AI media production and virtual soundstage ecosystem in Dubai.";

  return {
    title,
    description: desc,
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      title: `${title} • Yas Pro`,
      description: desc,
      url: `${SITE_URL}/about`,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} • Yas Pro`,
      description: desc,
      images: [`${SITE_URL}/opengraph-image`],
    },
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isArabic = locale === "ar";

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
        className="py-16 sm:py-24 bg-background-alt border-t border-border/40 relative overflow-hidden"
      >
        <Container>
          <AboutMilestones />
        </Container>
      </Section>

      {/* ── Yas Media Group Ecosystem & Subsidiaries ── */}
      <YasGroupShowcase />

      {/* ── Executive Leadership & Founder Spotlight ── */}
      <Section
        id="about-team"
        aria-labelledby="team-title"
        className="py-16 sm:py-24 bg-background-alt border-t border-border/40"
      >
        <Container>
          <FounderSpotlight headingId="team-title" />
        </Container>
      </Section>

      {/* ── Grand Finale Studio Launch CTA ── */}
      <Section
        id="about-cta"
        aria-label={isArabic ? "حجز الاستوديو والاستشارات" : "Studio Booking & Consultation"}
        className="pt-16 sm:pt-24 pb-20 sm:pb-32 bg-background border-t border-border/40 relative overflow-hidden"
      >
        <Container>
          <AboutCtaBanner />
        </Container>
      </Section>
    </>
  );
}
