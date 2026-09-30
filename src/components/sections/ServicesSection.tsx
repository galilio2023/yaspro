"use client";

import React, { useId, useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
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
      className="bg-background relative overflow-hidden py-14 sm:py-20 lg:py-28 border-b border-white/5"
      background={
        <>
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 size-[400px] rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      }
    >
      <Container className="relative z-10 mb-8 sm:mb-12">
        <SectionHeader
          headingId="services-title"
          badge={t("services.badge")}
          badgeVariant="cyan"
          badgeIcon={<Sparkles size={13} className="text-brand-cyan" />}
          title={isArabic ? t("services.title") : "Shape Your Content"}
          gradientText={isArabic ? t("services.titleGradient") : "With Us"}
          description={t("services.description")}
        />
        <button
          type="button"
          aria-controls={marqueeId}
          onClick={() => setIsPaused((paused) => !paused)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-cyan"
        >
          {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          {isArabic
            ? (isPaused ? "استئناف حركة الخدمات" : "إيقاف حركة الخدمات مؤقتًا")
            : (isPaused ? "Resume services animation" : "Pause services animation")}
        </button>
      </Container>

      {/* Pause on hover or focus, with a persistent manual pause control. */}
      <div className="group/services relative w-full overflow-hidden select-none" dir="ltr">
        {/* Edge Fade Masks for smooth gradient entry/exit */}
        <div className="pointer-events-none group-focus-within/services:hidden absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
        <div className="pointer-events-none group-focus-within/services:hidden absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

        <Marquee
          id={marqueeId}
          pauseOnHover
          paused={isPaused}
          onFocusCapture={(event) => {
            if (event.target instanceof HTMLElement) {
              event.target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
            }
          }}
          repeat={4}
          gap="1.75rem"
          className="[--duration:40s] py-4 items-stretch cursor-grab active:cursor-grabbing"
        >
          {SERVICES_DATA.map((svc) => (
            <ServiceCard key={svc.id} service={svc} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
