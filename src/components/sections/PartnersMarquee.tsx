"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";
import { YAS_GROUP_COMPANIES } from "@/features/group/data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CountUp } from "@/components/animations/MotionWrappers";
import { Users, Film, Radio, Building2 } from "lucide-react";

interface ProductionMetric {
  end: number;
  suffix: string;
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
    labelEn: "Total Audience Reach",
    labelAr: "إجمالي وصول الجمهور",
    subEn: "MENA & Global Distribution",
    subAr: "توزيع شرق أوسطي وعالمي",
    icon: Users,
  },
  {
    end: 500,
    suffix: "+",
    labelEn: "Films & Masterpieces",
    labelAr: "إنتاجات وأفلام منجزة",
    subEn: "8K Cinema & Commercials",
    subAr: "إعلانات وسينما بدقة 8K",
    icon: Film,
  },
  {
    end: 3,
    suffix: " Hubs",
    labelEn: "State Soundstages",
    labelAr: "مقرات واستوديوهات رئيسية",
    subEn: "Dubai • Cairo • Amman",
    subAr: "دبي • القاهرة • عمّان",
    icon: Radio,
  },
  {
    end: 100,
    suffix: "+",
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
    <aside
      aria-label="Global Production Partners, Live Metrics and Yas Pro Network"
      dir="ltr"
      className="relative w-full py-14 sm:py-20 lg:py-24 border-y border-white/8 bg-transparent overflow-hidden flex flex-col items-center select-none max-w-full"
    >
      {/* Edge Fade Gradients for the marquee rows */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-20 sm:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-20 sm:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

      {/* ═══════════════════════════════════════════════════════════════
          1. TOP: CONTINUOUS CINEMATIC MARQUEES (Global & Government)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full mb-14 sm:mb-20">
        {/* Editorial Section Label */}
        <div className="mb-8 flex items-center justify-center gap-2.5 px-4 text-center relative z-10">
          <span className="size-1.5 rounded-full bg-brand-mauve shrink-0" />
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] rtl:tracking-normal rtl:font-arabic rtl:normal-case text-zinc-300 font-semibold">
            {isArabic
              ? "شريك الإنتاج المعتمد للمؤسسات الحكومية وكبرى العلامات العالمية"
              : "Chosen For UAE Government & Global Brand Productions"}
          </span>
          <span className="size-1.5 rounded-full bg-brand-mauve shrink-0" />
        </div>

        {/* Row 1: Official UAE Government Entities */}
        <div className="w-full relative z-10 mb-5 sm:mb-6">
          <Marquee pauseOnHover repeat={4} gap="3rem" className="[--duration:34s] py-1 items-center">
            {GOV_LOGOS.map((gov) => (
              <div
                key={gov.id}
                title={gov.name}
                className="h-14 sm:h-16 px-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-brand-mauve/40 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 backdrop-blur-sm"
              >
                <Image
                  src={gov.logo}
                  alt={gov.name}
                  width={150}
                  height={50}
                  className="h-7 sm:h-9 w-auto object-contain opacity-75 group-hover:opacity-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-110 transition-all duration-300 mix-blend-screen"
                />
              </div>
            ))}
          </Marquee>
        </div>

        {/* Row 2: Premier Global Commercial Brands (Reverse Flow) */}
        <div className="w-full relative z-10">
          <Marquee pauseOnHover reverse repeat={4} gap="3.5rem" className="[--duration:36s] py-1 items-center">
            {BRAND_LOGOS.map((brand) => (
              <div
                key={brand.id}
                title={brand.name}
                className="h-14 sm:h-16 px-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-brand-mauve/40 flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0 backdrop-blur-sm"
              >
                {brand.svg ? (
                  <div
                    className="flex items-center justify-center opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter brightness-95 group-hover:brightness-110"
                    dangerouslySetInnerHTML={{ __html: brand.svg }}
                  />
                ) : (
                  <Image
                    src={brand.logo!}
                    alt={brand.name}
                    width={140}
                    height={45}
                    className="h-7 sm:h-8 w-auto object-contain opacity-75 group-hover:opacity-100 group-hover:scale-105 filter brightness-95 group-hover:brightness-110 transition-all duration-300"
                  />
                )}
              </div>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          2. MIDDLE: LIVE INCREMENTAL ANIMATED METRICS
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 sm:mb-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PRODUCTION_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.labelEn}
                className="group relative rounded-3xl p-6 sm:p-7 bg-zinc-950/70 border border-white/10 hover:border-brand-mauve/40 transition-all duration-300 backdrop-blur-xl shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Hover Backlight */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/15 rounded-full blur-2xl pointer-events-none group-hover:bg-brand-mauve/25 transition-colors" />

                {/* Top Row: Icon + Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="size-10 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-mauve-soft flex items-center justify-center shadow-inner">
                    <Icon size={18} />
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mauve-soft opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-mauve" />
                  </span>
                </div>

                {/* Counter Number */}
                <div
                  className="text-4xl sm:text-5xl font-black font-display font-latin text-white tracking-tight mb-2 text-balance"
                  dir="ltr"
                >
                  <CountUp end={metric.end} suffix={metric.suffix} />
                </div>

                {/* Metric Title & Context */}
                <div>
                  <h4 className="text-white text-sm font-bold tracking-tight">
                    {isArabic ? metric.labelAr : metric.labelEn}
                  </h4>
                  <p className="text-zinc-400 text-xs mt-0.5 font-normal">
                    {isArabic ? metric.subAr : metric.subEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. BOTTOM: STATIC YAS PRO GROUP NETWORK (Refined Architecture)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-white/8 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-brand-mauve shadow-[0_0_8px_rgba(152,123,165,0.7)]" />
            <span className="text-xs font-mono uppercase tracking-[0.16em] text-white font-bold">
              {isArabic ? "مجموعة شركات ياس برو للإعلام" : "Yas Pro Media Group Companies"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-brand-lavender tracking-wider">
            DUBAI • CAIRO • AMMAN
          </span>
        </div>

        {/* 7 Clean Studio Cards with Consistent Sizing & Visual Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {YAS_GROUP_COMPANIES.map((company) => (
            <Link
              key={company.id}
              href="/about#conglomerate"
              title={`${company.name} — ${company.division}`}
              className="group relative h-20 sm:h-22 p-3 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-brand-mauve/50 hover:bg-zinc-900/90 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-lg shadow-black/50 overflow-hidden"
            >
              <Image
                src={company.logo}
                alt={company.name}
                width={120}
                height={40}
                className="max-h-10 max-w-full h-auto w-auto object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 filter group-hover:brightness-110 transition-all duration-300"
              />
              <span className="mt-1 text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300 truncate max-w-full text-center transition-colors">
                {company.division.split("&")[0].trim()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default PartnersMarquee;
