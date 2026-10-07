"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";
import { YAS_GROUP_COMPANIES } from "@/features/group/data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/animations/MotionWrappers";
import { Users, Film, Radio, Building2, ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";

interface ProductionMetric {
  end: number;
  suffix: string;
  code: string;
  labelEn: string;
  labelAr: string;
  subEn: string;
  subAr: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const PRODUCTION_METRICS: readonly ProductionMetric[] = [
  {
    end: 400,
    suffix: "M+",
    code: "01 // REACH",
    labelEn: "Total Audience Reach",
    labelAr: "إجمالي وصول الجمهور",
    subEn: "MENA & Global Distribution",
    subAr: "توزيع شرق أوسطي وعالمي",
    icon: Users,
  },
  {
    end: 500,
    suffix: "+",
    code: "02 // FILMS",
    labelEn: "Films & Masterpieces",
    labelAr: "إنتاجات وأفلام منجزة",
    subEn: "8K Cinema & Commercials",
    subAr: "إعلانات وسينما بدقة 8K",
    icon: Film,
  },
  {
    end: 3,
    suffix: " Hubs",
    code: "03 // HUBS",
    labelEn: "State Soundstages",
    labelAr: "مقرات واستوديوهات رئيسية",
    subEn: "Dubai • Cairo • Amman",
    subAr: "دبي • القاهرة • عمّان",
    icon: Radio,
  },
  {
    end: 100,
    suffix: "+",
    code: "04 // TRUST",
    labelEn: "Sovereign & Brands",
    labelAr: "شريك حكومي وعالمي",
    subEn: "Tier-1 Production Network",
    subAr: "شبكة شركاء موثوقة",
    icon: Building2,
  },
];

export function PartnersMarquee() {
  const { isArabic } = useLanguage();

  return (
    <section
      id="partners-ecosystem"
      aria-label={isArabic ? "شركاء الإنتاج ومنظومة مجموعة ياس برو" : "Global Production Partners and Yas Pro Ecosystem"}
      className="relative w-full py-14 sm:py-20 lg:py-24 bg-background overflow-hidden flex flex-col items-center select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════
          ACT 1: EDITORIAL HEADER & SOVEREIGN/GLOBAL PARTNERS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center">
        {/* Studio Metadata Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>
            {isArabic ? "سجل ثقة معتمد // شركاء الإنتاج" : "VERIFIED ROSTER // PRODUCTION PARTNERS"}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white">
          {isArabic
            ? "ثقة الكيانات السيادية والعلامات العالمية"
            : "Trusted by Sovereign Entities & Global Brands"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          {isArabic
            ? "من الوزارات والمؤسسات الحكومية إلى كبرى شبكات البث والترفيه في الشرق الأوسط والعالم"
            : "From federal government ministries to top-tier commercial platforms across the MENA region and worldwide."}
        </p>
      </div>

      {/* ────────────────── MARQUEE CONTAINER ────────────────── */}
      <div className="relative w-full overflow-hidden" dir="ltr">
        {/* Responsive Edge Fade Gradients (Reduced width on mobile so logos stay visible) */}
        <div className="pointer-events-none absolute inset-y-0 start-0 w-8 sm:w-28 lg:w-44 bg-gradient-to-r from-background via-background/90 to-transparent z-20" />
        <div className="pointer-events-none absolute inset-y-0 end-0 w-8 sm:w-28 lg:w-44 bg-gradient-to-l from-background via-background/90 to-transparent z-20" />

        {/* Track 1: Official UAE Government Entities */}
        <div className="w-full mb-3 sm:mb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-amber-400/80" />
              <span>{isArabic ? "الهيئات الحكومية والسيادية" : "Sovereign & Federal Entities"}</span>
            </span>
          </div>

          <Marquee
            pauseOnHover
            repeat={3}
            gap="1.25rem"
            className="[--duration:36s] py-1 items-center"
          >
            {GOV_LOGOS.map((gov) => (
              <div
                key={gov.id}
                title={gov.name}
                className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 hover:bg-white/[0.05] active:scale-95 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0"
              >
                <Image
                  src={gov.logo}
                  alt={gov.name}
                  width={140}
                  height={45}
                  className="h-6 sm:h-8 w-auto object-contain grayscale opacity-60 brightness-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300"
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Track 2: Premier Global Commercial Brands (Reverse Flow) */}
        <div className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-2 flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400/80" />
              <span>{isArabic ? "منصات البث والعلامات العالمية" : "Global Commercial & Broadcasters"}</span>
            </span>
          </div>

          <Marquee
            pauseOnHover
            reverse
            repeat={3}
            gap="1.25rem"
            className="[--duration:40s] py-1 items-center"
          >
            {BRAND_LOGOS.map((brand) => (
              <div
                key={brand.id}
                title={brand.name}
                className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 hover:bg-white/[0.05] active:scale-95 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0"
              >
                {brand.svg ? (
                  <div
                    className="flex items-center justify-center grayscale opacity-60 brightness-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300"
                    dangerouslySetInnerHTML={{ __html: brand.svg }}
                  />
                ) : (
                  <Image
                    src={brand.logo!}
                    alt={brand.name}
                    width={130}
                    height={40}
                    className="h-6 sm:h-7 w-auto object-contain grayscale opacity-60 brightness-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300"
                  />
                )}
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACT 2: PRODUCTION TELEMETRY RAIL (LIVE INCREMENTAL METRICS)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-10 sm:my-14 relative z-10">
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 backdrop-blur-md p-2 sm:p-4 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x divide-white/[0.06]">
            {PRODUCTION_METRICS.map((metric, idx) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.code}
                  className={`p-3.5 sm:p-5 flex flex-col justify-between group transition-colors duration-200 border-white/[0.06] ${
                    idx >= 2 ? "border-t lg:border-t-0" : ""
                  } ${idx % 2 === 1 ? "border-s lg:border-s-0" : ""}`}
                >
                  {/* Top: Monospace Code & Icon */}
                  <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] font-mono text-zinc-400 group-hover:text-amber-400/90 transition-colors">
                      {metric.code}
                    </span>
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                      <Icon size={14} />
                    </div>
                  </div>

                  {/* Counter Number */}
                  <div
                    className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display font-latin text-white tracking-tight mb-1"
                    dir="ltr"
                  >
                    <CountUp end={metric.end} suffix={metric.suffix} />
                  </div>

                  {/* Metric Title & Context */}
                  <div>
                    <h3 className="text-white text-xs sm:text-sm font-bold tracking-tight">
                      {isArabic ? metric.labelAr : metric.labelEn}
                    </h3>
                    <p className="text-zinc-400 text-[11px] sm:text-xs mt-0.5 font-normal leading-snug">
                      {isArabic ? metric.subAr : metric.subEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACT 3: THE YAS PRO ECOSYSTEM (7 GROUP DIVISIONS)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Contextual Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 mb-6 border-b border-white/[0.08]">
          <div className="text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-amber-400/90 mb-0.5">
              <span>[CONGLOMERATE ECOSYSTEM]</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {isArabic ? "منظومة مجموعة ياس برو المتكاملة" : "The Integrated Yas Pro Media Network"}
            </h3>
          </div>
          <p className="text-xs text-zinc-400 text-center sm:text-end max-w-md font-normal">
            {isArabic
              ? "7 كيانات واستوديوهات متخصصة تغطي الإنتاج السينمائي، البث، وإدارة المواهب"
              : "7 specialized studios spanning cinema, broadcast, talent & sound across MENA."}
          </p>
        </div>

        {/* 
            Optimized Flex-Wrap Layout for 7 Items:
            - Mobile (2 columns): 3 rows of 2, 7th item neatly centered in the last row.
            - Tablet (4 + 3 centered): Balanced 2 rows without empty holes.
            - Desktop: Symmetrically spaced single row with division tags and hover lift.
        */}
        <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4">
          {YAS_GROUP_COMPANIES.map((company) => {
            const displayName = isArabic ? company.nameAr : company.name;
            const displayDivision = isArabic ? company.divisionAr : company.division;

            return (
              <Link
                key={company.id}
                href="/about#conglomerate"
                title={`${displayName} - ${displayDivision}`}
                className="group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.04] active:scale-[0.98] transition-all duration-300 w-[calc(50%-0.4rem)] sm:w-[calc(25%-0.75rem)] lg:w-[calc(14.285%-0.875rem)] min-w-[135px] max-w-[200px]"
              >
                {/* Micro Arrow indicator on hover */}
                <ArrowUpRight
                  size={12}
                  className="opacity-0 group-hover:opacity-100 text-amber-400 transition-opacity absolute top-2 end-2"
                />

                {/* Logo */}
                <div className="h-10 sm:h-12 w-full flex items-center justify-center my-1">
                  <Image
                    src={company.logo}
                    alt={displayName}
                    width={130}
                    height={44}
                    className="max-h-9 sm:max-h-11 max-w-full h-auto w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 filter group-hover:brightness-110 transition-all duration-300"
                  />
                </div>

                {/* Division Subtitle */}
                <div className="w-full text-center mt-2 pt-2 border-t border-white/[0.04]">
                  <p className="text-[10px] sm:text-[11px] font-mono tracking-tight text-zinc-400 group-hover:text-amber-400/90 transition-colors truncate">
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

export default PartnersMarquee;
