"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { BookingHero } from "@/features/booking/components/ui/BookingKit";

export function PodcastBookingPageHeader() {
  const { t } = useLanguage();

  const specs = [
    { label: t("podcastBooking.hero.specs.cameras"), value: "3x Sony FX3 / FX6" },
    { label: t("podcastBooking.hero.specs.microphones"), value: "Shure SM7B Vocal Suite" },
    { label: t("podcastBooking.hero.specs.monitoring"), value: "ATEM Extreme ISO 4K" },
    { label: t("podcastBooking.hero.specs.location"), value: "Iris Bay · Level 18" },
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <BookingHero
        headingId="podcast-booking-title"
        eyebrow={t("podcastBooking.hero.badge")}
        title={t("podcastBooking.hero.title")}
        description={t("podcastBooking.hero.subtitle")}
        specs={specs}
        crossLink={{
          href: "/studio-booking",
          label: t("studioBooking.hero.crossLinkLabel"),
          cta: t("studioBooking.hero.crossLinkCta"),
        }}
      />
    </div>
  );
}
