import { connection } from "next/server";
import { getCmsPodcastSets, getCmsPodcastAddons, getCmsPodcastServices } from "@/lib/actions/podcast-operations";
import type { Metadata } from "next";
import { PodcastBookingWizard } from "@/features/podcast-booking/components/PodcastBookingWizard";
import { HelpCircle } from "lucide-react";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { BookingHero } from "@/features/booking/components/ui/BookingKit";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Podcast Studio Booking in Dubai",
  description:
    "Book a luxury podcast studio session at Yas Pro in Business Bay, Dubai. 4K multi-cam Sony capture, Shure SM7B mics, live switcher, and turnkey viral reels editing.",
  keywords: [
    "podcast studio dubai",
    "podcast booking dubai",
    "record podcast dubai",
    "business bay podcast studio",
    "video podcast recording",
    "vodcast studio uae",
  ],
  openGraph: {
    ...SHARED_OPEN_GRAPH,
    title: "Podcast Studio Booking in Dubai • Yas Pro",
    description:
      "Book your luxury 4K multi-cam podcast session with Sony capture and Shure SM7B mics in Business Bay, Dubai.",
    url: `${SITE_URL}/podcast-booking`,
    images: [
      {
        url: `${SITE_URL}/images/studios/nature-grid.jpg`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Podcast Studio Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Podcast Studio Booking in Dubai • Yas Pro",
    description:
      "Book your luxury 4K multi-cam podcast session with Sony capture and Shure SM7B mics in Business Bay, Dubai.",
    images: [`${SITE_URL}/images/studios/nature-grid.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/podcast-booking`,
  },
};

const PODCAST_BOOKING_SCHEMA = {
  ...YAS_PRO_ORGANIZATION_SCHEMA,
  "@type": "EntertainmentBusiness",
  name: "Yas Pro Luxury Podcast Studios Dubai",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Iris Bay Tower, Business Bay",
    addressLocality: "Dubai",
    addressCountry: "AE",
  },
  priceRange: "AED 390 - AED 1,999",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Podcast Recording Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording Only",
          description: "Raw footage from 3x Cinema cameras and Shure SM7B mics with studio operator.",
        },
        priceCurrency: "AED",
        price: "390",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording + Live Mix",
          description: "Live-switched multi-camera program feed with synced audio ready for export.",
        },
        priceCurrency: "AED",
        price: "490",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Recording + Professional Edit",
          description: "Full master episode edit, color grading, sound mastering, and logo/music integration.",
        },
        priceCurrency: "AED",
        price: "890",
      },
    ],
  },
};

import { PodcastBookingPageHeader } from "@/features/podcast-booking/components/PodcastBookingPageHeader";
import { PodcastBookingFaq } from "@/features/podcast-booking/components/PodcastBookingFaq";

export default async function PodcastBookingPage() {
  await connection();
  const [studios, addons, services] = await Promise.all([
    getCmsPodcastSets(),
    getCmsPodcastAddons(),
    typeof getCmsPodcastServices === "function" ? getCmsPodcastServices() : Promise.resolve(undefined),
  ]);
  return (
    <Section id="podcast-booking-page" aria-labelledby="podcast-booking-title" className="py-6 sm:py-12 md:py-20 bg-background">
      <JsonLd data={PODCAST_BOOKING_SCHEMA} />
      <Container>
        {/* Cinematic Booking Hero */}
        <PodcastBookingPageHeader />

        {/* Wizard */}
        <PodcastBookingWizard studios={studios} addons={addons} services={services} />

        {/* Studio FAQ Section */}
        <PodcastBookingFaq />
      </Container>
    </Section>
  );
}

