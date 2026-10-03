"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Sparkles,
  MapPin,
  Maximize2,
  Users,
  Volume2,
  Mic,
  Film,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock,
  Calendar,
  MessageCircle,
  ChevronDown,
  Sliders,
  Music,
  Camera,
  Layers,
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
  const [selectedStudioId, setSelectedStudioId] = useState<string>(studiosCatalog[0]?.id || "studio-xr");

  const filteredStudios =
    activeCategory === "all"
      ? studiosCatalog
      : studiosCatalog.filter((s) => s.category === activeCategory);

  const selectedStudio =
    studiosCatalog.find((s) => s.id === selectedStudioId) || studiosCatalog[0];

  return (
    <div className="bg-[#070709] text-white min-h-screen selection:bg-amber-500 selection:text-black">
      {/* ── 1. Hero Section ── */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 border-b border-white/[0.08] overflow-hidden">
        {/* Subtle Warm Amber Glows */}
        <div
          className="absolute top-1/4 -left-40 w-[600px] h-[400px] pointer-events-none rounded-full blur-[160px] opacity-20"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[600px] h-[400px] pointer-events-none rounded-full blur-[160px] opacity-15"
          style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase mb-6">
              <MapPin size={13} className="text-amber-400" />
              <span>{isArabic ? "برج آيريس باي • الخليج التجاري، دبي" : "Iris Bay Tower • Business Bay, Dubai"}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display tracking-tight leading-[1.1] mb-6">
              {isArabic ? (
                <>
                  استوديوهات الإنتاج <span className="text-amber-400">بمعايير عالمية</span> في قلب دبي
                </>
              ) : (
                <>
                  Certified Soundstages &amp; <span className="text-amber-400">Creative Suites</span> in Dubai
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10">
              {isArabic
                ? "ستة استوديوهات إنتاج متخصصة ومعتمدة بمعايير عزل صوتي فائقة (STC 65+)، ومجهزة بكونسولات Neve وSSL، وميكروفونات شور، ومسرح شاشات ليد 270 درجة للمشاريع التجارية والسينمائية."
                : "Six purpose-built soundstages and recording halls featuring STC 65+ acoustic isolation, Neve & SSL analog consoles, 4K multi-camera podcast setups, and 270° Micro-LED virtual production."}
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
              <Link
                href="/studio-booking"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-[0.98]"
              >
                <Calendar size={16} />
                <span>{isArabic ? "حجز استوديو فوري" : "Book a Soundstage"}</span>
              </Link>

              <a
                href="#studios-catalog"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all"
              >
                <span>{isArabic ? "استعراض المرافق والمواصفات" : "Explore Facilities & Specs"}</span>
                <ChevronDown size={16} />
              </a>

              <a
                href="https://wa.me/971501234567?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20schedule%20a%20walkthrough%20of%20your%20soundstages%20at%20Iris%20Bay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-sm transition-all"
              >
                <MessageCircle size={16} className="text-emerald-400" />
                <span>{isArabic ? "معاينة ميدانية عبر واتساب" : "Schedule Studio Tour"}</span>
              </a>
            </div>

            {/* Facility Highlights Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl p-4 sm:p-6 rounded-2xl bg-[#0f0f13] border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center p-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">6</span>
                <span className="text-xs text-zinc-400 mt-1">{isArabic ? "استوديوهات مستقلة" : "Certified Stages"}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-display">STC 65+</span>
                <span className="text-xs text-zinc-400 mt-1">{isArabic ? "عزل صوتي فندقي كامل" : "Acoustic Isolation"}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-display">10 Gbps</span>
                <span className="text-xs text-zinc-400 mt-1">{isArabic ? "فايبر متزامن للرفع المباشر" : "Symmetrical Fiber"}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">Neve &amp; SSL</span>
                <span className="text-xs text-zinc-400 mt-1">{isArabic ? "كونسولات تناظرية رائدة" : "Analog Consoles"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Soundstages Showcase Catalog ── */}
      <section id="studios-catalog" className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight mb-4">
              {isArabic ? "اختر الاستوديو المناسب لمشروعك" : "Select Your Soundstage"}
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {isArabic
                ? "مقارنة شاملة بين المساحات، والأنظمة التقنية، ومواصفات العزل والأسعار بالساعة واليوم."
                : "Compare acoustic profiles, console riders, dimensions, and turnkey hourly or daily lockout rates."}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mb-12 overflow-x-auto p-1.5 bg-zinc-950/80 rounded-full border border-white/10 scrollbar-none -mx-4 px-4 sm:mx-auto sm:px-1.5 max-w-fit shadow-xl">
            {SOUNDSTAGE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "relative px-4 py-2 min-h-[38px] rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center z-10",
                    isActive ? "text-zinc-950" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCatalogCategoryPill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/20 -z-10"
                      transition={studioSprings.snappy}
                    />
                  )}
                  <span>{isArabic ? cat.arabicLabel : cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Soundstage Cards Full Details */}
          <div className="space-y-12 sm:space-y-16">
            {filteredStudios.map((studio, idx) => (
              <div
                key={studio.id}
                id={studio.id}
                className="scroll-mt-24 rounded-3xl border border-white/10 bg-[#0f0f13] overflow-hidden shadow-2xl transition-all duration-300 hover:border-amber-500/40"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
                  {/* Studio Image & Visual Gallery (5 cols) */}
                  <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto min-h-[320px] lg:min-h-[460px] bg-black overflow-hidden group">
                    <Image
                      src={studio.image}
                      alt={isArabic ? studio.arabicName : studio.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Top Telemetry Badge */}
                    <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                        <Sparkles size={11} className="text-amber-400" />
                        <span>{isArabic ? studio.arabicBadge : studio.badge}</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300" dir="ltr">
                        {studio.soundIsolation}
                      </span>
                    </div>

                    {/* Dimensions & Capacity Overlay */}
                    <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-xs font-mono text-zinc-200 z-10 pointer-events-none" dir="ltr">
                      <span className="flex items-center gap-1 bg-black/80 px-2.5 py-1 rounded-md border border-white/10">
                        <Maximize2 size={12} className="text-amber-400" />
                        <span>{studio.areaSqm} m² ({studio.dimensions})</span>
                      </span>
                      <span className="flex items-center gap-1 bg-black/80 px-2.5 py-1 rounded-md border border-white/10">
                        <Users size={12} className="text-amber-400" />
                        <span>Max {studio.capacity} Crew</span>
                      </span>
                    </div>
                  </div>

                  {/* Studio Specifications & Commercial Data (7 cols) */}
                  <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                            {isArabic ? studio.arabicCategoryLabel : studio.categoryLabel}
                          </span>
                          {studio.isActive === false && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase">
                              {isArabic ? "تحت الصيانة / حجز خاص" : "Maintenance Mode"}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-zinc-500">
                          {isArabic ? "برج آيريس باي • دبي" : "Iris Bay, Business Bay"}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white font-display mb-2">
                        {isArabic ? studio.arabicName : studio.name}
                      </h3>

                      <p className="text-sm font-medium text-amber-200/90 mb-4">
                        {isArabic ? studio.arabicHeadline : studio.headline}
                      </p>

                      <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                        {isArabic ? studio.arabicOverview : studio.overview}
                      </p>

                      {/* Technical Rider Grid */}
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 mb-6">
                        {studio.keyHardware.map((hw, hIdx) => (
                          <div key={hIdx} className="space-y-0.5">
                            <span className="text-[10px] uppercase font-mono text-zinc-500">
                              {isArabic ? (hw.arabicLabel || hw.label) : hw.label}
                            </span>
                            <div className="text-xs font-semibold text-zinc-200 truncate">
                              {isArabic ? (hw.arabicValue || hw.value) : hw.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Amenities Checkmarks */}
                      <div className="space-y-2 mb-8">
                        <div className="text-xs font-mono uppercase text-zinc-400 font-bold mb-2">
                          {isArabic ? "المرافق والخدمات المشمولة في الحجز:" : "Included Amenities & Perks:"}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(isArabic ? studio.arabicAmenities : studio.amenities).map((amenity, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rate Bar & Actions */}
                    <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-amber-400 font-display">
                            {formatCurrency(studio.rate)}
                          </span>
                          <span className="text-xs text-zinc-400">/ {isArabic ? "ساعة" : "hour"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 mt-1">
                          <span>Half-Day (4h): {formatCurrency(studio.halfDayRate)}</span>
                          <span>•</span>
                          <span>Full-Day (8h): {formatCurrency(studio.fullDayRate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {studio.isActive !== false ? (
                          <Link
                            href={`/studio-booking?studio=${studio.id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-98"
                          >
                            <Calendar size={14} />
                            <span>{isArabic ? "احجز هذا الاستوديو" : "Book This Soundstage"}</span>
                          </Link>
                        ) : (
                          <a
                            href={`https://wa.me/971501234567?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20inquire%20about%20availability%20for%20${encodeURIComponent(studio.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-semibold text-xs transition-all border border-amber-500/30"
                          >
                            <MessageCircle size={14} className="text-emerald-400" />
                            <span>{isArabic ? "استفسر عن الصيانة والتوفر" : "Inquire (Maintenance)"}</span>
                          </a>
                        )}

                        <a
                          href={`https://wa.me/971501234567?text=Hello%20Yas%20Pro%2C%20I%20am%20interested%20in%20booking%20or%20viewing%20${encodeURIComponent(studio.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-all"
                          title="Chat with Studio Operations"
                        >
                          <MessageCircle size={15} className="text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Interactive 3D Virtual Stage Simulation ── */}
      <section className="py-20 bg-zinc-950 border-t border-b border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono uppercase mb-3">
              <Layers size={12} className="text-amber-400" />
              <span>{isArabic ? "المحاكاة ثلاثية الأبعاد التفاعلية" : "Interactive 3D Stage Simulator"}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display">
              {isArabic ? "محاكاة المسرح وتوزيع الإضاءة الافتراضية" : "Test Lighting & Camera Track Configurations"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              {isArabic
                ? "جرب إعدادات انحناء شاشة الليد وتوزيع شبكة إضاءة DMX قبل بدء الإنتاج الفعلي."
                : "Explore LED volume curvature, lighting truss density, and optical camera tracks in real-time."}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <VirtualStageConfigurator />
          </div>
        </div>
      </section>

      {/* ── 4. Turnkey Production Packages (Up-Sell Deals) ── */}
      <section className="py-20 sm:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              {isArabic ? "باقات إنتاج متكاملة وشاملة" : "Turnkey Production Solutions"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display mt-2 mb-4">
              {isArabic ? "باقات التسجيل والمونتاج الشاملة" : "Turnkey Packages & Studio Deals"}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              {isArabic
                ? "احصل على الاستوديو مع طاقم العمل، مهندس الصوت، والمونتاج الكامل لتسليم حلقة متكاملة وجاهزة للنشر."
                : "Book bundled sessions that combine soundstage hours, broadcast equipment, live operators, and post-production cuts."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {TURNKEY_STUDIO_PACKAGES.filter((p) => p.id !== "none").map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  "relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all duration-300 shadow-xl",
                  pkg.isPopular
                    ? "bg-[#121217] border-amber-500/60 shadow-amber-500/10 scale-[1.02]"
                    : "bg-[#0f0f13] border-white/10 hover:border-white/20"
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] tracking-wider uppercase font-mono shadow-md">
                    {isArabic ? "الباقة الأكثر طلباً" : "Most Popular Deal"}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white font-display mb-2">{pkg.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">{pkg.description}</p>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400 font-display">
                        {formatCurrency(pkg.rate)}
                      </span>
                      <span className="text-xs text-zinc-400">/ {pkg.includedHours} {isArabic ? "ساعات" : "hours included"}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/studio-booking?package=${pkg.id}`}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl text-center text-xs font-bold transition-all shadow-md active:scale-98",
                    pkg.isPopular
                      ? "bg-amber-500 hover:bg-amber-400 text-zinc-950"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  )}
                >
                  {isArabic ? "احجز هذه الباقة" : "Select Turnkey Deal"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Cross-Selling Gear Rentals ── */}
      <section className="py-16 sm:py-20 bg-[#0d0d12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl">
            <div className="space-y-2 max-w-xl text-center md:text-left rtl:md:text-right">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                {isArabic ? "تكامل فوري مع أسطول المعدات" : "On-Site Gear Hub Integration"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                {isArabic ? "هل تحتاج إلى كاميرات أو عدسات إضافية في الاستوديو؟" : "Need Extra Cinema Cameras, Cooke Optics, or SkyPanels?"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                {isArabic
                  ? "يتوفر في الاستوديو أسطول تأجير معدات سينمائية كامل (ARRI Alexa, RED, Cooke, Aputure) جاهز للتوصيل الفوري داخل موقع التصوير."
                  : "Yas Pro maintains a comprehensive 300+ item cinema rental locker right on-site. Any camera body, prime set, or lighting fixture can be patched into your soundstage instantly."}
              </p>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shrink-0 shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <span>{isArabic ? "استعرض متجر تأجير المعدات" : "Browse Cinema Gear Catalog"}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Bottom VIP Concierge Tour CTA ── */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">
            {isArabic ? "ابدأ إنتاجك القادم في آيريس باي، دبي" : "Lock in Your Soundstage at Iris Bay, Dubai"}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "فريقنا متواجد 24/7 لدعم المنتجين والمخرجين وصناع المحتوى في تجهيز الاستوديو وتنسيق متطلبات التصوير."
              : "Our engineering leads and studio coordinators are on standby to accommodate custom technical riders, camera tests, and production lockouts."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/studio-booking"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all shadow-xl shadow-amber-500/25 active:scale-98"
            >
              <Calendar size={16} />
              <span>{isArabic ? "احجز جلستك الآن" : "Reserve Studio Online"}</span>
            </Link>

            <a
              href="https://wa.me/971501234567?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20book%20a%20studio%20tour%20at%20Iris%20Bay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all"
            >
              <MessageCircle size={16} className="text-emerald-400" />
              <span>{isArabic ? "محادثة مباشرة عبر واتساب" : "Direct WhatsApp Concierge"}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
