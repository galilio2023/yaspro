import type { Metadata } from "next";
import BookingWizard from "@/components/booking/BookingWizard";
import { SectionHeader } from "@/components/ui/section-header";
import { Video } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Studio Booking",
  description: "Book a professional studio session at Yas Pro. Choose your studio, session type, crew, and post-production services.",
};

export default function StudioBookingPage() {
  return (
    <Section id="booking-page" aria-labelledby="booking-title" className="py-12 md:py-20 bg-background">
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
