"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MessageCircle,
  Sparkles,
  Maximize2,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatCurrency, cn } from "@/lib/utils";
import { studioSprings } from "@/lib/studio-motion";
import { SOUNDSTAGES_CATALOG, SOUNDSTAGE_CATEGORIES } from "@/features/studios/data";
import type { StudioCategory, SoundstageDetail } from "@/features/studios/types";
import { VirtualStageConfigurator } from "@/features/booking/components/VirtualStageConfigurator";
import { TURNKEY_STUDIO_PACKAGES } from "@/features/booking/constants";

export interface StudiosPageClientProps {
  initialStudios?: SoundstageDetail[];
}

export function StudiosPageClient({ initialStudios }: StudiosPageClientProps = {}) {
  const { isArabic } = useLanguage();
  const studiosCatalog = initialStudios && initialStudios.length > 0 ? initialStudios : SOUNDSTAGES_CATALOG;
  const [activeCategory, setActiveCategory] = useState<StudioCategory>("all");
  const [activeImageMap, setActiveImageMap] = useState<Record<string, string>>({});

  const filteredStudios =
    activeCategory === "all"
      ? studiosCatalog
      : studiosCatalog.filter((s) => s.category === activeCategory);

  const turnkeyPackages = TURNKEY_STUDIO_PACKAGES.filter((p) => p.id !== "none");

  return (
    <div className="w-full bg-[#060608] text-white min-h-screen selection:bg-amber-500 selection:text-black">
      {/* ── 1. Compact Hero Header ── */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 border-b border-white/[0.08] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Telemetry Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] sm:text-xs font-mono font-semibold tracking-wider uppercase mb-4">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isArabic ? "آيريس باي • دبي • 6 استوديوهات معتمدة" : "IRIS BAY DUBAI • 6 SOUNDSTAGES"}</span>
            </div>

            {/* Tight, Confident Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight mb-3">
              {isArabic ? (
                <>
                  استوديوهات ومسارح تصوير <span className="text-amber-400">بمعايير عالمية</span>
                </>
              ) : (
                <>
                  Soundstages &amp; <span className="text-amber-400">Production Suites</span>
                </>
              )}
            </h1>

            {/* 1-Line Punchy Subtitle */}
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed mb-6">
              {isArabic
                ? "عزل صوتي كامل STC 65+، ومسرح ليد 270°، وكونسولات Neve & SSL مع حجز فوري بالساعة أو اليوم."
                : "STC 65+ acoustic isolation, 270° Micro-LED volume, and Neve/SSL suites with instant booking."}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
              <Link
                href="/studio-booking"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-black/40 active:scale-[0.98]"
              >
                <Calendar size={14} />
                <span>{isArabic ? "احجز استوديو" : "Book a Studio"}</span>
              </Link>

              <a
                href="#packages"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs sm:text-sm font-medium transition-all"
              >
                <span>{isArabic ? "الباقات المتكاملة" : "Turnkey Deals"}</span>
              </a>

              <a
                href="https://wa.me/971554010465?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20schedule%20a%20walkthrough%20of%20your%20soundstages%20at%20Iris%20Bay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium transition-all"
              >
                <MessageCircle size={14} className="text-emerald-400" />
                <span>{isArabic ? "واتساب" : "WhatsApp"}</span>
              </a>
            </div>

            {/* Compact Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-3xl p-2.5 sm:p-3 rounded-xl bg-[#0d0d12] border border-white/[0.08]">
              <div className="p-1.5 text-center">
                <span className="text-base sm:text-lg font-black text-amber-400 font-display">6 Stages</span>
                <span className="text-[10px] text-zinc-400 block font-mono">XR • Pod • Cyc</span>
              </div>
              <div className="p-1.5 text-center">
                <span className="text-base sm:text-lg font-black text-white font-display">STC 65+</span>
                <span className="text-[10px] text-zinc-400 block font-mono">Floating Box</span>
              </div>
              <div className="p-1.5 text-center">
                <span className="text-base sm:text-lg font-black text-white font-display">10 Gbps</span>
                <span className="text-[10px] text-zinc-400 block font-mono">Fiber Upload</span>
              </div>
              <div className="p-1.5 text-center">
                <span className="text-base sm:text-lg font-black text-amber-400 font-display">300+ Items</span>
                <span className="text-[10px] text-zinc-400 block font-mono">On-Site Gear</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Studios Showcase (Direct Visual Catalog) ── */}
      <section id="studios-catalog" className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills (Directly on top, no redundant title) */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 mb-8 overflow-x-auto p-1 bg-[#0b0b0f] rounded-full border border-white/[0.08] scrollbar-none -mx-4 px-4 sm:mx-auto sm:px-1 max-w-fit shadow-lg">
            {SOUNDSTAGE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap z-10",
                    isActive ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCatalogCategoryPill"
                      className="absolute inset-0 rounded-full bg-amber-500 shadow-sm -z-10"
                      transition={studioSprings.snappy}
                    />
                  )}
                  <span>{isArabic ? cat.arabicLabel : cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Studios Cards */}
          <div className="space-y-8 sm:space-y-10">
            {filteredStudios.map((studio) => {
              const currentImage = activeImageMap[studio.id] || studio.image;
              const hasGallery = studio.gallery && studio.gallery.length > 1;

              return (
                <div
                  key={studio.id}
                  id={studio.id}
                  className="scroll-mt-24 rounded-2xl border border-white/[0.08] bg-[#0c0c10] overflow-hidden shadow-xl transition-all duration-200 hover:border-white/20"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                    {/* Left: Media & Gallery (5 cols) */}
                    <div className="lg:col-span-5 relative flex flex-col justify-between bg-black p-4 min-h-[280px] lg:min-h-[380px]">
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={currentImage}
                          alt={isArabic ? studio.arabicName : studio.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover transition-transform duration-500 hover:scale-103"
                          priority={studio.id === "studio-xr"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-black/25 to-black/50 pointer-events-none" />
                      </div>

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between gap-2 pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                          <Sparkles size={10} className="text-amber-400" />
                          <span>{isArabic ? studio.arabicBadge : studio.badge}</span>
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300" dir="ltr">
                          {studio.soundIsolation}
                        </span>
                      </div>

                      {/* Bottom Media Controls & Specs */}
                      <div className="relative z-10 space-y-2">
                        {hasGallery && (
                          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 max-w-fit">
                            {studio.gallery.map((img, imgIdx) => {
                              const isSelected = currentImage === img;
                              return (
                                <button
                                  key={imgIdx}
                                  type="button"
                                  onClick={() =>
                                    setActiveImageMap((prev) => ({ ...prev, [studio.id]: img }))
                                  }
                                  className={cn(
                                    "relative size-8 rounded-md overflow-hidden border transition-all cursor-pointer shrink-0",
                                    isSelected ? "border-amber-400 ring-1 ring-amber-400" : "border-white/20 opacity-60 hover:opacity-100"
                                  )}
                                  title={`Photo ${imgIdx + 1}`}
                                >
                                  <Image src={img} alt="" fill className="object-cover" />
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-200" dir="ltr">
                          <span className="flex items-center gap-1 bg-black/85 px-2.5 py-1 rounded-md border border-white/10">
                            <Maximize2 size={11} className="text-amber-400" />
                            <span>{studio.areaSqm} m² ({studio.dimensions})</span>
                          </span>

                          <span className="flex items-center gap-1 bg-black/85 px-2.5 py-1 rounded-md border border-white/10">
                            <Users size={11} className="text-amber-400" />
                            <span>Max {studio.capacity}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Technical Specs & Pricing (7 cols) */}
                    <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between bg-[#0c0c10]">
                      <div>
                        {/* Eyebrow */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                            {isArabic ? studio.arabicCategoryLabel : studio.categoryLabel}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            Iris Bay • Business Bay
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-white font-display mb-1">
                          {isArabic ? studio.arabicName : studio.name}
                        </h2>

                        {/* 1-Line Headline */}
                        <p className="text-xs text-amber-200/80 mb-4 font-medium">
                          {isArabic ? studio.arabicHeadline : studio.headline}
                        </p>

                        {/* 4 Technical Badges (Compact 2x2 Grid) */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#121217] border border-white/[0.06] mb-4">
                          {studio.keyHardware.map((hw, hIdx) => (
                            <div key={hIdx} className="space-y-0.5">
                              <span className="text-[9px] uppercase font-mono text-zinc-500 block">
                                {isArabic ? (hw.arabicLabel || hw.label) : hw.label}
                              </span>
                              <div className="text-xs font-semibold text-zinc-200 truncate">
                                {isArabic ? (hw.arabicValue || hw.value) : hw.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Key Amenities (Compact Pills) */}
                        <div className="flex flex-wrap gap-1.5 mb-5">
                          {(isArabic ? studio.arabicAmenities : studio.amenities).slice(0, 4).map((amenity, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] text-zinc-300"
                            >
                              <CheckCircle2 size={11} className="text-amber-400 shrink-0" />
                              <span className="truncate max-w-[240px]">{amenity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Rates & Direct CTAs */}
                      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                              {formatCurrency(studio.rate)}
                            </span>
                            <span className="text-xs text-zinc-400">/ {isArabic ? "ساعة" : "hour"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mt-0.5">
                            <span>4h: {formatCurrency(studio.halfDayRate)}</span>
                            <span>•</span>
                            <span>8h: {formatCurrency(studio.fullDayRate)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/studio-booking?studio=${studio.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-98"
                          >
                            <Calendar size={13} />
                            <span>{isArabic ? "احجز الآن" : "Book Stage"}</span>
                          </Link>

                          <a
                            href={`https://wa.me/971554010465?text=Hello%20Yas%20Pro%2C%20I%20am%20interested%20in%20${encodeURIComponent(studio.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
                            title="Chat with Ops"
                          >
                            <MessageCircle size={14} className="text-emerald-400" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 3. Interactive 3D Simulator (Compact Module) ── */}
      <section className="py-12 bg-[#08080a] border-t border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
                {isArabic ? "المحاكاة ثلاثية الأبعاد" : "3D VIRTUAL SIMULATION"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                {isArabic ? "محاكاة مسرح الإنتاج الافتراضي 270°" : "270° LED Volume & Rig Preview"}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
              WebGL • Unreal 5.4 LiveLink
            </span>
          </div>

          <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.08] overflow-hidden bg-black shadow-xl">
            <VirtualStageConfigurator />
          </div>
        </div>
      </section>

      {/* ── 4. Turnkey Deals (Clean 3-Card Grid) ── */}
      <section id="packages" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
                {isArabic ? "باقات متكاملة" : "ALL-INCLUSIVE PACKAGES"}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white font-display">
                {isArabic ? "باقات الاستوديو والإنتاج" : "Turnkey Production Deals"}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm">
              {isArabic
                ? "تشمل الاستوديو، والمعدات، وطاقم التشغيل الفني بأسعار تفضيلية."
                : "Stage, gear locker, and dedicated crew bundled at preferential lockout rates."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {turnkeyPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border transition-all duration-200 shadow-lg",
                  pkg.isPopular
                    ? "bg-[#111116] border-amber-500/60 shadow-amber-500/5"
                    : "bg-[#0c0c10] border-white/[0.08] hover:border-white/20"
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-[9px] tracking-wider uppercase font-mono shadow-sm">
                    {isArabic ? "الأكثر طلباً" : "Popular"}
                  </div>
                )}

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display mb-1">
                    {isArabic ? (pkg.arabicName || pkg.name) : pkg.name}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {isArabic ? (pkg.arabicDescription || pkg.description) : pkg.description}
                  </p>

                  <div className="mb-4 pb-4 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                        {formatCurrency(pkg.rate)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        / {pkg.includedHours} {isArabic ? "ساعات" : "hours"}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {((isArabic && pkg.arabicFeatures ? pkg.arabicFeatures : pkg.features) || []).map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/studio-booking?package=${pkg.id}`}
                  className={cn(
                    "w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all shadow-sm active:scale-98",
                    pkg.isPopular
                      ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  {isArabic ? "اختر هذه الباقة" : "Select Deal"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Compact Gear Locker Strip ── */}
      <section className="py-8 bg-[#09090c] border-t border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0c0c10] border border-white/[0.08]">
            <div className="text-center sm:text-left rtl:sm:text-right">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold block">
                {isArabic ? "خزانة المعدات الميدانية" : "ON-SITE CINEMA GEAR LOCKER"}
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                {isArabic
                  ? "كاميرات ARRI وRED وعدسات Cooke وإضاءات Aputure متوفرة للتوصيل الفوري داخل الاستوديو."
                  : "ARRI Alexa, RED, Cooke optics, and Aputure fixtures ready for on-stage patch in Iris Bay."}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shrink-0"
            >
              <span>{isArabic ? "تصفح المعدات" : "Browse Gear"}</span>
              <ArrowRight size={13} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom Sticky Quick Action Bar ── */}
      <section className="py-12 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            {isArabic ? "جاهز لحجز موعد تصويرك القادم؟" : "Ready to Lock in Your Production?"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            {isArabic
              ? "فريق العمليات متواجد للمعاينة الميدانية أو تنسيق المتطلبات الخاصة."
              : "Our operations lead is available for walk-in inspections or technical riders."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/studio-booking"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm transition-all"
            >
              <Calendar size={14} />
              <span>{isArabic ? "حجز فوري أونلاين" : "Book Online"}</span>
            </Link>
            <a
              href="https://wa.me/971554010465?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20inquire%20about%20a%20soundstage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-all"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>{isArabic ? "واتساب مباشر" : "WhatsApp Concierge"}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
