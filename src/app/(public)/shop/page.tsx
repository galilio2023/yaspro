import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { GearExplorer } from "@/features/gear/components/GearExplorer";
import { ShopHeroHeader } from "@/features/gear/components/ShopHeroHeader";
import { GEAR_DATA } from "@/features/gear/data";
import { getCachedEquipment } from "@/lib/cached-queries";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { GearItem, GearCategory } from "@/features/gear/types";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return {
    title: isArabic ? "تأجير المعدات السينمائية" : "Rent Cinema Equipment",
    description: isArabic
      ? "استئجار كاميرات سينمائية، عدسات أنامورفيك، معدات إضاءة وعربات بث مباشر متكاملة في دبي، القاهرة، وعَمّان."
      : "Rent cinema cameras, lenses, lighting, and turnkey broadcast packages across UAE, Egypt, and Jordan.",
  };
}

export default async function ShopPage() {
  const cmsEquipment = await getCachedEquipment();

  const gearToDisplay: GearItem[] = cmsEquipment.map((g) => ({
    id: g.id,
    name: g.name,
    arabicName: g.arabicName || undefined,
    category: g.category as GearCategory,
    categoryLabel:
      g.category === "cameras"
        ? "Cinema Camera"
        : g.category === "bundles"
        ? "Turnkey Kit"
        : g.category === "lighting"
        ? "Studio Lighting"
        : g.category === "lenses"
        ? "Cinema Lens"
        : "Production Audio",
    dailyRate: Number(g.dailyRate),
    securityDeposit: Number(g.securityDeposit || 0),
    specs: g.specs || [],
    description: g.description || "",
    arabicDescription: g.arabicDescription || undefined,
    isPopular: g.isPopular,
    isKit: g.isKit,
    includedInKit: g.includedInKit || [],
    image: g.imageUrl || "/images/gear/arri-alexa-mini-lf.jpg",
    isAvailable: g.isAvailable,
  }));

  const initialGear = gearToDisplay.length > 0 ? gearToDisplay : GEAR_DATA;

  const GEAR_CATALOG_SCHEMA = {
    ...YAS_PRO_ORGANIZATION_SCHEMA,
    "@type": "Store",
    name: "Yas Pro Cinema Equipment Rentals",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cinema Cameras & Broadcast Rental Gear",
      itemListElement: initialGear.slice(0, 8).map((gear) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: gear.name,
          category: gear.categoryLabel,
          description: gear.description || `Professional ${gear.categoryLabel} rental in Dubai & GCC.`,
          image: gear.image ? (gear.image.startsWith("http") ? gear.image : `https://yaspro.ae${gear.image}`) : "https://yaspro.ae/images/gear/arri-alexa-mini-lf.jpg",
        },
        priceCurrency: "AED",
        price: gear.dailyRate.toString(),
        availability: gear.isAvailable !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      })),
    },
  };

  return (
    <Section id="shop-page" aria-labelledby="shop-title" className="py-12 md:py-20 bg-background">
      <JsonLd data={GEAR_CATALOG_SCHEMA} />
      <Container>
        <ShopHeroHeader />

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <GearExplorer initialGear={initialGear} />
        </Suspense>
      </Container>
    </Section>
  );
}
