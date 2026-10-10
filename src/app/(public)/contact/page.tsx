import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { LocationsList } from "@/features/contact/components/LocationsList";
import { ContactHeroHeader } from "@/features/contact/components/ContactHeroHeader";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { Suspense } from "react";

import { SITE_URL } from "@/lib/constants";
import { SHARED_OPEN_GRAPH } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  const title = isArabic ? "تواصل معنا والعمليات" : "Contact & Operations Desk";
  const desc = isArabic
    ? "تواصل مع استوديوهات Yas Pro لعربات البث المباشر، حجز الاستوديوهات، أو الدعم الفني في دبي."
    : "Get in touch with Yas Pro for OB VAN live broadcast, soundstage bookings, or production support in Dubai.";

  return {
    title,
    description: desc,
    openGraph: {
      ...SHARED_OPEN_GRAPH,
      title: `${title} • Yas Pro`,
      description: desc,
      url: `${SITE_URL}/contact`,
      images: [
        {
          url: `${SITE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} • Yas Pro`,
      description: desc,
      images: [`${SITE_URL}/opengraph-image`],
    },
    alternates: {
      canonical: `${SITE_URL}/contact`,
    },
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
