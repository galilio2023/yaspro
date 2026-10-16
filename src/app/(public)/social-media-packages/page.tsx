import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SocialMediaPackagesHero } from "@/features/social-media-packages/components/SocialMediaPackagesHero";
import { PackagesGrid } from "@/features/social-media-packages/components/PackagesGrid";
import { SocialMediaDeliverablesShowcase } from "@/features/social-media-packages/components/SocialMediaDeliverablesShowcase";
import { PackageComparisonTable } from "@/features/social-media-packages/components/PackageComparisonTable";
import { PackageFaqSection } from "@/features/social-media-packages/components/PackageFaqSection";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";
import { getCmsSocialPackages } from "@/lib/actions/social-packages-operations";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? "باقات إنتاج السوشيال ميديا في دبي"
      : "Social Media Production Packages in Dubai",
    description: isArabic
      ? "باقات إنتاج السوشيال ميديا السينمائية في دبي. ريلز 4K، تصوير احترافي، موشن جرافيكس، وأيام تصوير في استوديوهاتنا بالخليج التجاري أو في موقعك."
      : "Turnkey social media production packages in Dubai. 4K viral reels, soundstage shoots, motion graphics, and monthly content engine for growing brands.",
    keywords: [
      "social media packages dubai",
      "social media video production dubai",
      "reels production uae",
      "content creation packages dubai",
      "video production monthly packages",
      "yas pro social media",
      "باقات سوشيال ميديا دبي",
      "تصوير ريلز دبي",
      "إنتاج محتوى رقمي",
    ],
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      title: isArabic
        ? "باقات السوشيال ميديا السينمائية • Yas Pro دبي"
        : "Social Media Production Packages • Yas Pro Dubai",
      description: isArabic
        ? "ارتقِ بعلامتك التجارية مع باقات إنتاج المحتوى الرقمي المتكاملة من استوديوهات Yas Pro."
        : "Turnkey 4K cinema reels, soundstage filming days, and full monthly content delivery in Dubai.",
      url: `${SITE_URL}/social-media-packages`,
      images: [
        {
          url: `${SITE_URL}/images/modal/social-media-card.jpg`,
          width: 1200,
          height: 630,
          alt: isArabic ? "باقات السوشيال ميديا دبي" : "Social Media Packages Dubai",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isArabic
        ? "باقات السوشيال ميديا السينمائية • Yas Pro دبي"
        : "Social Media Production Packages • Yas Pro Dubai",
      description: isArabic
        ? "ارتقِ بعلامتك التجارية مع باقات إنتاج المحتوى الرقمي المتكاملة من استوديوهات Yas Pro."
        : "Turnkey 4K cinema reels, soundstage filming days, and full monthly content delivery in Dubai.",
      images: [`${SITE_URL}/images/modal/social-media-card.jpg`],
    },
    alternates: {
      canonical: `${SITE_URL}/social-media-packages`,
    },
  };
}

const SOCIAL_MEDIA_PACKAGES_SCHEMA = {
  ...YAS_PRO_ORGANIZATION_SCHEMA,
  "@type": "ProfessionalService",
  name: "Yas Pro Social Media Production Packages",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Iris Bay Tower, Business Bay",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
};

export default async function SocialMediaPackagesPage() {
  const socialPackages = await getCmsSocialPackages();
  const activePackages = socialPackages.filter((pkg) => pkg.isActive !== false);
  const prices = activePackages
    .map((pkg) => pkg.monthlyPrice)
    .filter((price): price is number => price !== null && Number.isFinite(price));
  const schema = {
    ...SOCIAL_MEDIA_PACKAGES_SCHEMA,
    priceRange: prices.length > 0
      ? `AED ${Math.min(...prices)} - AED ${Math.max(...prices)} / month`
      : undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Turnkey Social Media Production Packages",
      itemListElement: activePackages.map((pkg) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: pkg.nameEn,
          description: pkg.taglineEn,
        },
        ...(pkg.monthlyPrice !== null && Number.isFinite(pkg.monthlyPrice)
          ? { priceCurrency: "AED", price: String(pkg.monthlyPrice) }
          : {}),
      })),
    },
  };
  return (
    <Section
      id="social-media-packages-page"
      aria-labelledby="social-media-packages-title"
      className="py-10 md:py-16 bg-background relative"
    >
      <JsonLd data={schema} />
      <Container>
        {/* Hero Section */}
        <SocialMediaPackagesHero />

        {/* Pricing Grid & Modal */}
        <PackagesGrid packages={socialPackages} />

        {/* Deliverables & Studio Advantage */}
        <SocialMediaDeliverablesShowcase />

        {/* Comprehensive Comparison Matrix */}
        <PackageComparisonTable />

        {/* Frequently Asked Questions */}
        <PackageFaqSection />
      </Container>
    </Section>
  );
}
