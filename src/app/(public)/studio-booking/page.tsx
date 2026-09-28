import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import { SectionHeader } from "@/components/ui/section-header";
import { Video } from "lucide-react";
import { JsonLd, YAS_PRO_ORGANIZATION_SCHEMA } from "@/components/seo/JsonLd";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

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

export default function StudioBookingPage() {
  return (
    <Section id="booking-page" aria-labelledby="booking-title" className="py-12 md:py-20 bg-background">
      <JsonLd data={STUDIO_BOOKING_SCHEMA} />
      <Container>
        <SectionHeader
          headingId="booking-title"
          as="h1"
          badge="Professional Studio Space"
          badgeVariant="default"
          badgeIcon={<Video size={13} />}
          title="Book a"
          gradientText="Studio"
          description="Secure your session in minutes. Fully customizable setups with professional crew, AI-enhanced post-production, and secure Ziina payment."
        />

        <BookingWizard />
      </Container>
    </Section>
  );
}
