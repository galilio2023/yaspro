"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";
import { YAS_GROUP_COMPANIES } from "@/features/group/data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/animations/MotionWrappers";
import { ArrowUpRight, ShieldCheck, Sparkles, SlidersHorizontal, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductionMetric {
  end: number;
  suffix: string;
  labelEn: string;
  labelAr: string;
  subEn: string;
  subAr: string;
}

const PRODUCTION_METRICS: readonly ProductionMetric[] = [
  {
    end: 400,
    suffix: "M+",
    labelEn: "Audience Reach",
    labelAr: "وصول المشاهدات",
    subEn: "MENA & Global Broadcast",
    subAr: "انتشار وبث إقليمي ودولي",
  },
  {
    end: 500,
    suffix: "+",
    labelEn: "Films Produced",
    labelAr: "إنتاجات وأفلام منجزة",
    subEn: "8K Cinema & Global Commercials",
    subAr: "أفلام سينمائية وإعلانات عالمية",
  },
  {
    end: 3,
    suffix: " Hubs",
    labelEn: "Soundstages",
    labelAr: "استوديوهات رئيسية",
    subEn: "Dubai • Cairo • Amman",
    subAr: "دبي • القاهرة • عمّان",
  },
  {
    end: 100,
    suffix: "+",
    labelEn: "Enterprise Partners",
    labelAr: "شريك سيادي وعالمي",
    subEn: "Sovereign & Tier-1 Brands",
    subAr: "هيئات حكومية وعلامات كبرى",
  },
];

export function PartnersMarquee() {
  const { isArabic } = useLanguage();
  const [isPaused, setIsPaused] = React.useState(false);
  const [marqueeSpeed, setMarqueeSpeed] = React.useState<"normal" | "fast">("normal");

  return (
    <section
      id="partners-ecosystem"
      aria-label={isArabic ? "شركاء الإنتاج ومنظومة مجموعة ياس برو" : "Global Production Partners and Yas Pro Ecosystem"}
      className="relative w-full py-14 sm:py-20 lg:py-24 bg-background overflow-hidden flex flex-col items-center select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          ACT 1: EDITORIAL HEADER & SOVEREIGN/GLOBAL PARTNERS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-start flex flex-col items-start">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white">
          {isArabic ? (
            <>
              ثقة الكيانات السيادية و
              <span className="gradient-text-mauve ms-2">العلامات العالمية</span>
            </>
          ) : (
            <>
              Trusted by Sovereign Entities &amp;{" "}
              <span className="gradient-text-mauve">Global Brands</span>
            </>
          )}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl font-normal leading-relaxed">
          {isArabic
            ? "من الوزارات والمؤسسات الحكومية إلى كبرى شبكات البث والترفيه في الشرق الأوسط والعالم"
            : "From federal government ministries to top-tier commercial platforms across the MENA region and worldwide."}
        </p>
      </div>

      {/* ────────────────── MARQUEE CONTAINER ────────────────── */}
      <div className="relative w-full overflow-hidden" dir="ltr">
        {/* Cinematic Filmstrip Perforation Top Rail */}
        <div className="w-full h-3 border-y border-white/[0.06] bg-black/40 flex items-center justify-between px-3 select-none pointer-events-none mb-3">
          <div className="flex items-center gap-2 overflow-hidden opacity-30">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="inline-block w-2 h-1 rounded-[1px] bg-white/40 shrink-0" />
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 text-[9px] font-mono tracking-widest text-zinc-500 uppercase shrink-0 px-2">
            <span>SMPTE 24FPS</span>
            <span>•</span>
            <span>MASTER ROSTER</span>
          </div>
          <div className="flex items-center gap-2 overflow-hidden opacity-30">
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} className="inline-block w-2 h-1 rounded-[1px] bg-white/40 shrink-0" />
            ))}
          </div>
        </div>

        {/* Responsive Edge Fade Gradients: Gentle 24px on phone, wide 128px+ on desktop */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-6 sm:w-24 lg:w-44 bg-gradient-to-r from-background via-background/95 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-6 sm:w-24 lg:w-44 bg-gradient-to-l from-background via-background/95 to-transparent z-20" />

        {/* Track 1: Official UAE Government Entities */}
        <div className="w-full mb-6 sm:mb-9">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2.5 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <ShieldCheck size={13} className="text-brand-mauve" />
              <span className="font-medium text-zinc-300">{isArabic ? "الهيئات الحكومية والسيادية" : "Sovereign & Federal Entities"}</span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 hidden sm:inline-block">
              {isArabic ? "سجل معتمد // الإمارات والخليج" : "OFFICIAL REGIONAL ROSTER"}
            </span>
          </div>

          <Marquee
            pauseOnHover
            paused={isPaused}
            repeat={4}
            gap="2.5rem"
            speedMultiplier={marqueeSpeed === "fast" ? 2.0 : 1.0}
            className="py-2 sm:py-3 items-center"
          >
            {GOV_LOGOS.map((gov) => (
              <div
                key={gov.id}
                title={gov.name}
                className="relative px-3 sm:px-5 lg:px-6 py-2 sm:py-3 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 select-none h-16 sm:h-20 lg:h-24 min-w-[130px] sm:min-w-[160px] lg:min-w-[190px]"
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
                  width={280}
                  height={90}
                  draggable={false}
                  className={cn(
                    "w-auto object-contain grayscale opacity-85 brightness-105 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-120 group-hover:scale-105 transition-all duration-300 pointer-events-none",
                    gov.className || "h-11 sm:h-13 lg:h-16 max-w-[180px] sm:max-w-[220px] lg:max-w-[260px]"
                  )}
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Track 2: Premier Global Commercial Brands (Reverse Flow) */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2.5 flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Sparkles size={13} className="text-brand-mauve" />
              <span className="font-medium text-zinc-300">{isArabic ? "منصات البث والعلامات العالمية" : "Global Commercial & Broadcasters"}</span>
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 hidden sm:inline-block">
              {isArabic ? "شركاء الإنتاج والبث" : "ENTERTAINMENT & CINEMA"}
            </span>
          </div>

          <Marquee
            pauseOnHover
            paused={isPaused}
            reverse
            repeat={4}
            gap="2.5rem"
            speedMultiplier={marqueeSpeed === "fast" ? 2.0 : 1.0}
            className="py-2 sm:py-3 items-center"
          >
            {BRAND_LOGOS.map((brand) => (
              <div
                key={brand.id}
                title={brand.name}
                className="relative px-3 sm:px-5 lg:px-6 py-2 sm:py-3 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 select-none h-14 sm:h-18 lg:h-20 min-w-[120px] sm:min-w-[140px] lg:min-w-[170px]"
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
                  width={280}
                  height={90}
                  draggable={false}
                  className={cn(
                    "w-auto object-contain grayscale opacity-85 brightness-105 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-120 group-hover:scale-105 transition-all duration-300 pointer-events-none",
                    brand.className || "h-10 sm:h-12 lg:h-14 max-w-[170px] sm:max-w-[200px] lg:max-w-[240px]"
                  )}
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Minimal Bottom Transport Controller */}
        <div className="w-full mt-6 flex justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/[0.08] backdrop-blur-md">
            <SlidersHorizontal size={10} className="text-zinc-500" />
            <button
              type="button"
              onClick={() => {
                setIsPaused(false);
                setMarqueeSpeed((prev) => (prev === "normal" ? "fast" : "normal"));
              }}
              className="text-[9px] font-mono text-zinc-400 hover:text-white px-1.5 py-0.5 rounded transition-colors"
            >
              {isArabic ? "السرعة" : "SPEED"}: {marqueeSpeed === "fast" ? "2.0X" : "1.0X"}
            </button>
            <span className="text-zinc-700">•</span>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? (isArabic ? "متابعة شريط الشركاء" : "Resume marquee") : (isArabic ? "إيقاف شريط الشركاء" : "Pause marquee")}
              className="text-[9px] font-mono text-zinc-400 hover:text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
            >
              {isPaused ? <Play size={8} fill="currentColor" /> : <Pause size={8} fill="currentColor" />}
              <span>{isPaused ? (isArabic ? "متابعة" : "RESUME") : (isArabic ? "إيقاف" : "PAUSE")}</span>
            </button>
          </div>
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ms-1 inline-block" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-white text-xs sm:text-sm lg:text-base font-medium tracking-tight">
                {isArabic ? metric.labelAr : metric.labelEn}
              </h3>
              <p className="text-zinc-500 text-[11px] sm:text-xs mt-0.5 sm:mt-1 font-normal leading-relaxed">
                {isArabic ? metric.subAr : metric.subEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACT 3: THE YAS PRO ECOSYSTEM (7 GROUP DIVISIONS)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Contextual Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-4 mb-5 sm:mb-6 border-b border-white/[0.08]">
          <div className="text-start">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isArabic ? "منظومة مجموعة ياس برو المتكاملة" : "The Integrated Yas Pro Media Network"}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 text-start sm:text-end max-w-md font-normal">
            {isArabic
              ? "7 كيانات واستوديوهات متخصصة تغطي الإنتاج السينمائي، البث، وإدارة المواهب"
              : "7 specialized studios spanning cinema, broadcast, talent & sound across MENA."}
          </p>
        </div>

        {/* 
            Optimized Responsive Layout for 7 Items:
            - Mobile: 2 per row (6 cards) + 7th card cleanly centered below.
            - Tablet: 3-4 per row with balanced flex centering.
            - Desktop: Symmetrical single row with division tags and hover lift.
        */}
        <div className="flex flex-wrap justify-center items-stretch gap-2.5 sm:gap-3.5 lg:gap-4">
          {YAS_GROUP_COMPANIES.map((company) => {
            const displayName = isArabic ? company.nameAr : company.name;
            const displayDivision = isArabic ? company.divisionAr : company.division;

            return (
              <Link
                key={company.id}
                href="/about#conglomerate"
                title={`${displayName} - ${displayDivision}`}
                className="group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-brand-mauve/50 hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-300 w-[calc(50%-0.35rem)] sm:w-[calc(33.333%-0.6rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(14.285%-0.875rem)] min-w-[130px] max-w-[200px]"
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

                {/* Clean Division Subtitle */}
                <div className="w-full text-center mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/[0.04]">
                  <p className="text-[9.5px] sm:text-[11px] font-mono tracking-tight text-zinc-400 group-hover:text-amber-300 transition-colors truncate">
                    {displayDivision}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
