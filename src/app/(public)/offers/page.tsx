import { Suspense } from "react";
import type { Metadata } from "next";
import { OffersPageClient } from "./OffersPageClient";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";
import { getBookingOffers } from "@/lib/actions/offers-packages-operations";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Offers & Bundles in Dubai • Production Packages | Yas Pro",
  description:
    "Explore turnkey recording bundles, live mix packages, and exclusive studio discounts at Yas Pro Media in Business Bay, Dubai. Secure online booking with instant Ziina checkout.",
  keywords: [
    "studio offers dubai",
    "podcast bundles dubai",
    "video recording packages uae",
    "yas pro media offers",
    "soundstage deals business bay",
    "vloggers recording setup dubai",
    "corporate studio bundle",
  ],
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: "Offers & Bundles • Production Packages in Dubai | Yas Pro",
    description:
      "Exclusive soundstage bundles and time-limited production deals at Yas Pro, Iris Bay Dubai. Instant booking and Ziina payment.",
    url: `${SITE_URL}/offers`,
    images: [
      {
        url: `${SITE_URL}/images/modal/offers-bundles-card.jpg`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Offers & Bundles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Offers & Bundles • Production Packages in Dubai | Yas Pro",
    description:
      "Exclusive soundstage bundles and time-limited production deals at Yas Pro, Iris Bay Dubai. Instant booking and Ziina payment.",
    images: [`${SITE_URL}/images/modal/offers-bundles-card.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/offers`,
  },
};

export default async function OffersPage() {
  await connection();
  const catalog = await getBookingOffers();
  const offersCatalogSchema = {
    ...YAS_PRO_ORGANIZATION_SCHEMA,
    "@type": "EntertainmentBusiness",
    name: "Yas Pro Offers & Production Bundles Dubai",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Iris Bay Tower, Level 18, Business Bay",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    priceRange: "AED 390 - AED 8,400",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Production Offers & Bundles Catalog",
      itemListElement: catalog.filter((item) => item.isActive !== false).slice(0, 6).map((item) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: item.name,
          description: item.description,
        },
        priceCurrency: "AED",
        price: String(item.price),
      })),
    },
  };

  return (
    <>
      <JsonLd data={offersCatalogSchema} />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <OffersPageClient catalog={catalog} />
      </Suspense>
    </>
  );
}
