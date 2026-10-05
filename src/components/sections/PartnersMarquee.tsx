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
      className="relative w-full py-10 sm:py-16 lg:py-20 bg-transparent overflow-hidden flex flex-col items-center select-none max-w-full"
    >
      {/* Edge Fade Gradients for the marquee rows */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-20 sm:w-48 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-20 sm:w-48 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

      {/* ═══════════════════════════════════════════════════════════════
          1. TOP: CONTINUOUS CINEMATIC MARQUEES (Global & Government)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full mb-14 sm:mb-20">
        {/* Row 1: Official UAE Government Entities */}
        <div className="w-full relative z-10 mb-5 sm:mb-6">
          <Marquee pauseOnHover repeat={4} gap="3rem" className="[--duration:34s] py-1 items-center">
            {GOV_LOGOS.map((gov) => (
              <div
                key={gov.id}
                title={gov.name}
                className="h-14 sm:h-16 px-6 rounded-2xl bg-transparent hover:bg-white/[0.04] flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0"
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
                className="h-14 sm:h-16 px-6 rounded-2xl bg-transparent hover:bg-white/[0.04] flex items-center justify-center transition-all duration-300 group cursor-pointer shrink-0"
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
          2. MIDDLE: LIVE INCREMENTAL ANIMATED METRICS (Compact Studio Flow)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {PRODUCTION_METRICS.map((metric) => (
            <div
              key={metric.labelEn}
              className="group relative rounded-2xl p-3.5 sm:p-4 bg-transparent hover:bg-white/[0.02] transition-colors duration-300 flex flex-col justify-end overflow-hidden"
            >
              {/* Shimmer Scan Light Beam Passing Through */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none overflow-hidden"
              >
                <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-scan" />
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
                <h4 className="text-white text-xs sm:text-sm font-bold tracking-tight">
                  {isArabic ? metric.labelAr : metric.labelEn}
                </h4>
                <p className="text-zinc-400 text-[11px] sm:text-xs mt-0.5 font-normal leading-snug">
                  {isArabic ? metric.subAr : metric.subEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          3. BOTTOM: STATIC YAS PRO GROUP NETWORK (Borderless Flow)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 7 Clean Studio Cards with Completely Transparent Flow (No Text, No Background) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 items-center">
            {YAS_GROUP_COMPANIES.map((company) => {
              const displayName = isArabic ? company.nameAr : company.name;

              return (
                <Link
                  key={company.id}
                  href="/about#conglomerate"
                  title={displayName}
                  className="group relative h-16 sm:h-20 p-2 bg-transparent flex items-center justify-center transition-transform duration-300 cursor-pointer"
                >
                  <Image
                    src={company.logo}
                    alt={displayName}
                    width={140}
                    height={50}
                    className="max-h-11 max-w-full h-auto w-auto object-contain opacity-75 group-hover:opacity-100 group-hover:scale-110 filter group-hover:brightness-125 transition-all duration-300"
                  />
                </Link>
              );
            })}
        </div>
      </div>
    </aside>
  );
}

export default PartnersMarquee;
