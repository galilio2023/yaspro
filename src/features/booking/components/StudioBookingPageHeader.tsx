"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { BookingHero } from "./ui/BookingKit";

export function StudioBookingPageHeader() {
  const { t } = useLanguage();

  const specs = [
    { label: t("studioBooking.hero.specs.soundstagesLabel"), value: t("studioBooking.hero.specs.soundstagesValue") },
    { label: t("studioBooking.hero.specs.riggingLabel"), value: t("studioBooking.hero.specs.riggingValue") },
    { label: t("studioBooking.hero.specs.supportLabel"), value: t("studioBooking.hero.specs.supportValue") },
    { label: t("studioBooking.hero.specs.locationLabel"), value: t("studioBooking.hero.specs.locationValue") },
  ];

  return (
    <div className="mb-4 sm:mb-6">
      <BookingHero
        headingId="booking-title"
        eyebrow={t("studioBooking.hero.eyebrow")}
        title={t("studioBooking.hero.title")}
        accent={t("studioBooking.hero.accent")}
        description={t("studioBooking.hero.description")}
        specs={specs}
        crossLink={{
          href: "/podcast-booking",
          label: t("studioBooking.hero.crossLinkLabel"),
          cta: t("studioBooking.hero.crossLinkCta"),
        }}
      />
    </div>
  );
}
