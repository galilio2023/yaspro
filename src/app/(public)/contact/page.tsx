import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { LocationsList } from "@/features/contact/components/LocationsList";
import { ContactHeroHeader } from "@/features/contact/components/ContactHeroHeader";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return {
    title: isArabic ? "تواصل معنا" : "Contact Us",
    description: isArabic
      ? "تواصل مع استوديوهات Yas Pro لعربات البث المباشر، حجز الاستوديوهات، أو الدعم الفني."
      : "Get in touch with Yas Pro for OB VAN, live broadcast, outdoor filming, studio bookings, or technical support.",
  };
}

export default function ContactPage() {
  return (
    <Section id="contact-page" aria-labelledby="contact-title" className="py-12 md:py-20 bg-background">
      <Container>
        <ContactHeroHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
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
