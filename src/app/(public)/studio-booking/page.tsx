import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingWizard } from "@/features/booking/components/BookingWizard";
import { SectionHeader } from "@/components/ui/section-header";
import { Video, Sparkles } from "lucide-react";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { StudioBookingPageHeader } from "@/features/booking/components/StudioBookingPageHeader";

export const metadata: Metadata = {
  title: "Studio Booking",
  description: "Book a professional studio session at Yas Pro. Choose your studio, session type, crew, and post-production services.",
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
      <div className="size-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
        <Sparkles size={22} />
      </div>
      <p className="text-sm font-semibold text-white">Initializing Soundstage Engine...</p>
      <p className="text-xs text-text-muted mt-1">Calibrating schedule and packages</p>
    </div>
  );
}

export default function StudioBookingPage() {
  return (
    <Section id="booking-page" aria-labelledby="booking-title" className="py-12 md:py-20 bg-background">
      <JsonLd data={STUDIO_BOOKING_SCHEMA} />
      <Container>
        <StudioBookingPageHeader />

        <Suspense fallback={<BookingWizardLoading />}>
          <BookingWizard />
        </Suspense>
      </Container>
    </Section>
  );
}
