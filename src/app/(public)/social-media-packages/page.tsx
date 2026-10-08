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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return {
    title: isArabic
      ? "باقات السوشيال ميديا دبي | استوديوهات Yas Pro"
      : "Social Media Packages Dubai | Yas Pro AI Media Hub",
    description: isArabic
      ? "باقات إنتاج السوشيال ميديا السينمائية في دبي. ريلز 4K، تصوير احترافي، موشن جرافيكس، وأيام تصوير في استوديوهاتنا بالخليج التجاري أو في موقعك."
      : "Turnkey social media production packages in Dubai. 4K viral reels, full soundstage shoots, motion graphics, and monthly content engine for growing brands.",
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
      title: isArabic
        ? "باقات السوشيال ميديا السينمائية • Yas Pro دبي"
        : "Social Media Packages • Yas Pro Dubai",
      description: isArabic
        ? "ارتقِ بعلامتك التجارية مع باقات إنتاج المحتوى الرقمي المتكاملة من استوديوهات Yas Pro."
        : "Turnkey 4K cinema reels, soundstage filming days, and full monthly content delivery in Dubai.",
      images: ["/images/modal/social-media-card.jpg"],
    },
    alternates: {
      canonical: "https://yasproductions.com/social-media-packages",
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
  priceRange: "AED 2,400 - AED 10,500 / month",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Turnkey Social Media Production Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Starter Social Media Package",
          description: "2x 4K Reels, 6x Carousel/HQ Photos, 10x Stories, 1 Half Day Filming Session.",
        },
        priceCurrency: "AED",
        price: "2400",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Growth Social Media Package",
          description: "4x 4K Reels, 12x Carousel/HQ Photos, 20x Stories, 1 Motion Outro, 1 Full Day Filming, Moderator, 1 Strategy Call.",
        },
        priceCurrency: "AED",
        price: "5200",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Premium Social Media Package",
          description: "8x 4K Reels, 16x Carousel/HQ Photos, 30x Stories, 2 Motion Intro+Outro, Full Identity Graphics Kit, 2 Full Days Filming, Moderator, Dedicated Account Manager, Weekly Strategy Calls.",
        },
        priceCurrency: "AED",
        price: "8400",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Enterprise Custom Social Media Production",
          description: "Custom solutions for large businesses with advanced requirements, dedicated soundstage support, and scalable infrastructure.",
        },
      },
    ],
  },
};

export default function SocialMediaPackagesPage() {
  return (
    <Section
      id="social-media-packages-page"
      aria-labelledby="social-media-packages-title"
      className="py-10 md:py-16 bg-background relative"
    >
      <JsonLd data={SOCIAL_MEDIA_PACKAGES_SCHEMA} />
      <Container>
        {/* Hero Section */}
        <SocialMediaPackagesHero />

        {/* Pricing Grid & Modal */}
        <PackagesGrid />

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
