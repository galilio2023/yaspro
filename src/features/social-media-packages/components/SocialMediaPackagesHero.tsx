"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, Radio, Film } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function SocialMediaPackagesHero() {
  const { isArabic } = useLanguage();

  const SPECS = [
    { label: isArabic ? "الكاميرات" : "Camera Rig", value: "Sony FX6 / FX3 Cinema" },
    { label: isArabic ? "العدسات" : "Optics", value: "Sony GM Prime Cine Suite" },
    { label: isArabic ? "مواقع التصوير" : "Stage Access", value: "Iris Bay Stages or On-Site" },
    { label: isArabic ? "سرعة التسليم" : "Turnaround", value: "48-72h Rush Master Deliverables" },
  ];

  return (
    <header className="mb-12 sm:mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
      {/* Editorial Headline Column */}
      <div className="lg:col-span-7 space-y-5">
        <div className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-400">
          <span className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-60" />
            <span className="relative size-2 rounded-full bg-red-500" />
          </span>
          <span>{isArabic ? "محرك إنتاج المحتوى الرقمي · دبي" : "CONTENT ENGINE · 4K REELS · DUBAI"}</span>
        </div>

        <h1
          id="social-media-packages-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.02] font-display text-balance"
        >
          {isArabic ? (
            <>
              باقات إنتاج <span className="text-amber-400">السوشيال ميديا</span> السينمائية
            </>
          ) : (
            <>
              Turnkey <span className="text-amber-400">Social Media</span> Production
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
          {isArabic
            ? "نقلة نوعية في صناعة المحتوى: جلسات تصوير شهرية بكاميرات السينما، مونتاج عالي الإيقاع والجاذبية، موشن جرافيكس، وإدارة نشر متكاملة دون أعباء تشغيلية."
            : "Broadcast studio infrastructure engineered for vertical reels. Dedicated monthly shoot days on Sony cinema cameras, retention-first editing, bespoke motion kits, and turnkey content distribution."}
        </p>

        {/* Cross links */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link
            href="/podcast-booking"
            className="group inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>{isArabic ? "تريد حجز جلسة بودكاست مستقلة؟" : "Looking for single podcast sessions?"}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-amber-400 group-hover:text-amber-300">
              {isArabic ? "استوديو البودكاست" : "Podcast Booking"}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
          <span className="text-zinc-600 hidden sm:inline">|</span>
          <Link
            href="/studio-booking"
            className="group inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <span>{isArabic ? "حجز استوديو سينمائي كامل؟" : "Full soundstage hire?"}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-zinc-300 group-hover:text-white">
              {isArabic ? "استوديوهات التصوير" : "Soundstages Hub"}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* Production Sheet Spec Box */}
      <dl className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0c0f17]/80 divide-y divide-white/[0.06] overflow-hidden backdrop-blur-xl">
        <div className="px-5 py-3 flex items-center justify-between bg-white/[0.02]">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-500">
            {isArabic ? "بطاقة المواصفات الفنية" : "PRODUCTION BRIEF"}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-400/90">
            IRIS BAY · TOWER 18
          </span>
        </div>
        {SPECS.map((spec, i) => (
          <div key={i} className="px-5 py-3 flex items-center justify-between text-xs">
            <dt className="text-zinc-400 font-medium">{spec.label}</dt>
            <dd className="font-mono font-semibold text-zinc-200 text-right">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
