"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";
import { YAS_GROUP_COMPANIES } from "@/features/group/data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/animations/MotionWrappers";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductionMetric {
  end: number;
  suffix: string;
  labelEn: string;
  labelAr: string;
}

const PRODUCTION_METRICS: readonly ProductionMetric[] = [
  {
    end: 400,
    suffix: "M+",
    labelEn: "Audience Reach",
    labelAr: "وصول المشاهدات",
  },
  {
    end: 500,
    suffix: "+",
    labelEn: "Films Produced",
    labelAr: "إنتاجات وأفلام منجزة",
  },
  {
    end: 3,
    suffix: " Hubs",
    labelEn: "Production Hubs",
    labelAr: "مراكز ومقرات إنتاجية",
  },
  {
    end: 100,
    suffix: "+",
    labelEn: "Enterprise Partners",
    labelAr: "شريك سيادي وعالمي",
  },
];

export function PartnersMarquee() {
  const { isArabic } = useLanguage();
  const [isPaused, setIsPaused] = React.useState(false);

  const pauseLabel = isArabic ? "إيقاف حركة شعارات الشركاء مؤقتاً" : "Pause partner logos animation";
  const resumeLabel = isArabic ? "استئناف حركة شعارات الشركاء" : "Resume partner logos animation";

  return (
    <section
      id="partners-ecosystem"
      aria-label={isArabic ? "شركاء الإنتاج ومنظومة مجموعة ياس برو" : "Global Production Partners and Yas Pro Ecosystem"}
      className="relative w-full py-14 sm:py-20 lg:py-24 bg-background overflow-hidden flex flex-col items-center select-none"
    >
      {/* ────────────────── MARQUEE CONTAINER ────────────────── */}
      <div className="relative w-full overflow-hidden" dir="ltr">
        {/* Responsive Edge Fade Gradients: Gentle 24px on phone, wide 128px+ on desktop */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-6 sm:w-24 lg:w-44 bg-gradient-to-r from-background via-background/95 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-6 sm:w-24 lg:w-44 bg-gradient-to-l from-background via-background/95 to-transparent z-20" />

        {/* Accessible Keyboard & Screen Reader Pause/Play Control (WCAG 2.2.2) */}
        <div className="absolute top-2 end-3 sm:end-6 z-30">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-pressed={isPaused}
            aria-label={isPaused ? resumeLabel : pauseLabel}
            title={isPaused ? resumeLabel : pauseLabel}
            className={cn(
              "p-2 rounded-full border transition-all duration-200 outline-none select-none",
              // Accessible keyboard focus state: always prominently visible on Tab focus
              "focus-visible:ring-2 focus-visible:ring-brand-mauve focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:opacity-100",
              // Visual styling: ultra-clean, minimal obsidian style without cluttering titles/descriptions
              "bg-black/40 backdrop-blur-md border-white/10 hover:border-brand-mauve/40 hover:bg-black/70 text-white/60 hover:text-white",
              // When paused, show gentle mauve glow accent to clearly signal paused state
              isPaused && "border-brand-mauve/60 text-brand-mauve bg-brand-violet/20 shadow-[0_0_12px_rgba(152,123,165,0.3)] opacity-100"
            )}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            )}
            <span className="sr-only">{isPaused ? resumeLabel : pauseLabel}</span>
          </button>
        </div>

        {/* Track 1: Official UAE Government Entities */}
        <div className="w-full mb-6 sm:mb-9">
          <Marquee
            paused={isPaused}
            pauseOnHover
            repeat={4}
            gap="2.5rem"
            className="py-2 sm:py-3 items-center"
          >
            {GOV_LOGOS.map((gov) => (
              <div
                key={gov.id}
                title={gov.name}
                className="relative px-4 sm:px-6 lg:px-7 py-2 sm:py-3 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 select-none h-16 sm:h-20 lg:h-24"
              >
                {/* Brand Aura Glow */}
                <div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 scale-125"
                  style={{
                    background: `radial-gradient(circle at center, ${gov.glowColor || "rgba(152, 123, 165, 0.45)"} 0%, transparent 70%)`,
                  }}
                />

                <Image
                  src={gov.logo}
                  alt={gov.name}
                  width={gov.width}
                  height={gov.height}
                  unoptimized
                  draggable={false}
                  className={cn(
                    "w-auto object-contain opacity-90 brightness-125 group-hover:opacity-100 group-hover:brightness-150 group-hover:scale-105 transition-all duration-300 pointer-events-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.06)]",
                    gov.className
                  )}
                  style={{
                    aspectRatio: `${gov.width} / ${gov.height}`,
                  }}
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Track 2: Premier Global Commercial Brands (Reverse Flow) */}
        <div className="w-full">
          <Marquee
            paused={isPaused}
            pauseOnHover
            reverse
            repeat={4}
            gap="2.5rem"
            className="py-2 sm:py-3 items-center"
          >
            {BRAND_LOGOS.map((brand) => (
              <div
                key={brand.id}
                title={brand.name}
                className="relative px-4 sm:px-6 lg:px-7 py-2 sm:py-3 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 select-none h-14 sm:h-18 lg:h-20"
              >
                {/* Brand Spotlight Aura Glow */}
                <div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 scale-125"
                  style={{
                    background: `radial-gradient(circle at center, ${brand.color ? `${brand.color}55` : "rgba(152, 123, 165, 0.35)"} 0%, transparent 70%)`,
                  }}
                />

                <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={brand.width}
                  height={brand.height}
                  unoptimized
                  draggable={false}
                  className={cn(
                    "w-auto object-contain opacity-90 brightness-110 group-hover:opacity-100 group-hover:brightness-130 group-hover:scale-105 transition-all duration-300 pointer-events-none",
                    brand.className
                  )}
                  style={{
                    aspectRatio: `${brand.width} / ${brand.height}`,
                  }}
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACT 2: EDITORIAL TELEMETRY RAIL (RESPONSIVE STATS)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-16 lg:my-20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-8 lg:divide-x divide-white/[0.08]">
          {PRODUCTION_METRICS.map((metric, idx) => (
            <div
              key={metric.labelEn}
              className={`flex flex-col items-center sm:items-start text-center sm:text-start transition-opacity duration-300 hover:opacity-100 ${
                idx !== 0 ? "lg:ps-8" : ""
              }`}
            >
              {/* Bold Frameless Stat Number: Scaled 3xl on phone, 5xl on tablet, 6xl on desktop */}
              <div
                className="text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tighter text-white mb-1.5 font-display font-latin flex items-baseline gap-0.5"
                dir="ltr"
              >
                <CountUp end={metric.end} suffix={metric.suffix} />
              </div>

              {/* Title */}
              <h3 className="text-white text-xs sm:text-sm lg:text-base font-medium tracking-tight">
                {isArabic ? metric.labelAr : metric.labelEn}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACT 3: THE YAS PRO ECOSYSTEM (7 GROUP DIVISIONS)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 
            Optimized Responsive Layout for 7 Items:
            - Mobile: 2 per row (6 cards) + 7th card cleanly centered below.
            - Tablet: 3-4 per row with balanced flex centering.
            - Desktop: Symmetrical single row with division tags and hover lift.
        */}
        <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3.5 lg:gap-4">
          {YAS_GROUP_COMPANIES.map((company) => {
            const displayName = isArabic ? company.nameAr : company.name;
            const displayDivision = isArabic ? company.divisionAr : company.division;

            return (
              <Link
                key={company.id}
                href="/about#conglomerate"
                title={`${displayName} - ${displayDivision}`}
                className="group relative flex items-center justify-center p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-mauve/50 hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-300 w-[calc(50%-0.35rem)] sm:w-[calc(33.333%-0.6rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(14.285%-0.875rem)] min-w-[130px] max-w-[200px]"
              >
                {/* Dynamic Subtle Company Accent Bloom */}
                <div
                  className="pointer-events-none absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${company.accentColor ? `${company.accentColor}30` : "rgba(152, 123, 165, 0.25)"} 0%, transparent 70%)`,
                  }}
                />

                {/* Micro Arrow indicator on hover */}
                <ArrowUpRight
                  size={12}
                  className="opacity-0 group-hover:opacity-100 text-brand-mauve transition-opacity absolute top-2 sm:top-2.5 end-2 sm:end-2.5"
                />

                {/* Prominent Logo Container */}
                <div className="h-10 sm:h-12 w-full flex items-center justify-center my-1 sm:my-1.5">
                  <Image
                    src={company.logo}
                    alt={displayName}
                    width={130}
                    height={44}
                    className="max-h-9 sm:max-h-11 max-w-full h-auto w-auto object-contain grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 filter group-hover:brightness-110 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
