"use client";

import React, { useId, useState } from "react";
import { Pause, Play, Clapperboard } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { Marquee } from "@/components/magicui/marquee";
import { SERVICES_DATA } from "./services.data";
import { ServiceCard } from "./ServiceCard";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ServicesSection() {
  const { t, isArabic } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const marqueeId = useId();

  return (
    <Section
      id="services"
      aria-labelledby="services-title"
      className="bg-background relative overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-white/8 film-grain"
    >
      <Container className="relative z-10 mb-8 sm:mb-12">
        <SectionHeader
          headingId="services-title"
          badge={t("services.badge")}
          badgeVariant="gold"
          badgeIcon={<Clapperboard size={13} className="text-amber-400" />}
          title={isArabic ? t("services.title") : "Shape Your Content"}
          gradientText={isArabic ? t("services.titleGradient") : "With Us"}
          description={t("services.description")}
        />
        <button
          type="button"
          aria-controls={marqueeId}
          onClick={() => setIsPaused((paused) => !paused)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-300 hover:text-white hover:border-white/25 transition-all focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          {isPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {isArabic
            ? (isPaused ? "استئناف حركة الخدمات" : "إيقاف حركة الخدمات مؤقتًا")
            : (isPaused ? "Resume services animation" : "Pause services animation")}
        </button>
      </Container>

      {/* Services Scroller */}
      <div id={marqueeId} className="w-full relative z-10">
        <Marquee
          pauseOnHover
          repeat={3}
          gap="2rem"
          className={`[--duration:55s] py-4 ${isPaused ? "[animation-play-state:paused]" : ""}`}
        >
          {SERVICES_DATA.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
