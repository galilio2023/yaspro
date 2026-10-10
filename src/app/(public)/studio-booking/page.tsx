import { getCachedStudios } from "@/lib/cached-queries";
import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingWizard } from "@/features/booking/components/BookingWizard";
import { Sparkles } from "lucide-react";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { StudioBookingPageHeader } from "@/features/booking/components/StudioBookingPageHeader";

import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Soundstage & Studio Booking",
  description:
    "Book a professional studio session at Yas Pro. Choose your studio, session type, crew, and post-production services in Dubai.",
  openGraph: {
    title: "Soundstage & Studio Booking • Yas Pro Dubai",
    description:
      "Book certified virtual production soundstages, green screen volumes, and broadcast studios at Yas Pro in Business Bay, Dubai.",
    url: `${SITE_URL}/studio-booking`,
    images: [
      {
        url: `${SITE_URL}/images/studios/nature-grid.jpg`,
        width: 1200,
        height: 630,
        alt: "Yas Pro Studio Booking Dubai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soundstage & Studio Booking • Yas Pro Dubai",
    description:
      "Book certified virtual production soundstages, green screen volumes, and broadcast studios at Yas Pro.",
    images: [`${SITE_URL}/images/studios/nature-grid.jpg`],
  },
  alternates: {
    canonical: `${SITE_URL}/studio-booking`,
  },
};

const STUDIO_BOOKING_SCHEMA = {
  ...YAS_PRO_ORGANIZATION_SCHEMA,
  "@type": "EntertainmentBusiness",
  name: "Yas Pro Soundstages & Virtual Production Studios",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Studio Soundstages & Suites",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Soundstage A - Infinity Cyc & Virtual Production",
          description: "4K virtual production volume, motorized overhead lighting grid, and green room suite.",
        },
        priceCurrency: "AED",
        price: "1200",
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Podcast Suite - Multi-Cam 4K Broadcast",
          description: "Sound isolated multi-mic podcast studio with Shure SM7B mics and live switcher.",
        },
        priceCurrency: "AED",
        price: "600",
      },
    ],
  },
};

function BookingWizardLoading() {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center border border-white/5 rounded-3xl bg-white/[0.01]">
      <div className="size-12 rounded-2xl bg-brand-mauve/15 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve mb-4 animate-pulse shadow-lg shadow-brand-violet/25">
        <Sparkles size={22} />
      </div>
      <p className="text-sm font-semibold text-white">Initializing Soundstage Engine...</p>
      <p className="text-xs text-text-muted mt-1">Calibrating schedule and packages</p>
    </div>
  );
}

export default async function StudioBookingPage() {
  const cmsStudios = await getCachedStudios();
  const studios = cmsStudios.filter((studio) => studio.isActive).map((studio) => ({
    id: studio.id,
    slug: studio.slug,
    name: studio.name,
    desc: studio.description || "",
    rate: Number(studio.hourlyRate),
    image: studio.imageUrl || undefined,
    isActive: studio.isActive,
  }));
  return (
    <Section id="booking-page" aria-labelledby="booking-title" className="py-12 md:py-20 bg-background">
      <JsonLd data={STUDIO_BOOKING_SCHEMA} />
      <Container>
        <StudioBookingPageHeader />

        <Suspense fallback={<BookingWizardLoading />}>
          <BookingWizard studios={studios} />
        </Suspense>
      </Container>
    </Section>
  );
}
