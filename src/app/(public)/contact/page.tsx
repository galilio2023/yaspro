import type { Metadata } from "next";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { LocationsList } from "@/features/contact/components/LocationsList";
import { SectionHeader } from "@/components/ui/section-header";
import { MessageSquare } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Yas Pro for OB VAN, live broadcast, outdoor filming, studio bookings, or technical support.",
};

export default function ContactPage() {
  return (
    <Section id="contact-page" aria-labelledby="contact-title" className="py-12 md:py-20 bg-background">
      <Container>
        <SectionHeader
          headingId="contact-title"
          as="h1"
          align="left"
          badge="Direct Inquiries"
          badgeVariant="default"
          badgeIcon={<MessageSquare size={13} />}
          title="Let's"
          gradientText="Talk"
          description="Have a production in mind? Reach out to our studios in Dubai, Cairo, or Amman and let's create something extraordinary together."
        />

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <FadeUp>
              <Suspense fallback={<div className="min-h-[400px] rounded-3xl border border-white/10 bg-white/[0.03] animate-pulse" />}>
                <ContactForm />
              </Suspense>
            </FadeUp>
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <LocationsList />
          </div>
        </div>
      </Container>
    </Section>
  );
}
