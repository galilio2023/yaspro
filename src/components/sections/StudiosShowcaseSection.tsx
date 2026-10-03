"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Maximize2,
  Users,
  Radio,
  Sliders,
  CheckCircle2,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatCurrency, cn } from "@/lib/utils";
import { studioSprings } from "@/lib/studio-motion";
import { SOUNDSTAGES_CATALOG, SOUNDSTAGE_CATEGORIES } from "@/features/studios/data";
import type { StudioCategory, SoundstageDetail } from "@/features/studios/types";

export interface StudiosShowcaseSectionProps {
  initialStudios?: SoundstageDetail[];
}

export function StudiosShowcaseSection({ initialStudios }: StudiosShowcaseSectionProps = {}) {
  const { language, isArabic } = useLanguage();
  const studiosList = initialStudios && initialStudios.length > 0 ? initialStudios : SOUNDSTAGES_CATALOG;
  const [activeCategory, setActiveCategory] = useState<StudioCategory>("all");
  const [spotlightStudio, setSpotlightStudio] = useState<SoundstageDetail>(studiosList[0] || SOUNDSTAGES_CATALOG[0]);

  const filteredStudios =
    activeCategory === "all"
      ? studiosList
      : studiosList.filter((s) => s.category === activeCategory);

  return (
    <section
      id="soundstages"
      aria-labelledby="soundstages-title"
      className="relative py-20 sm:py-28 bg-[#070709] border-t border-white/[0.08] overflow-hidden"
    >
      {/* Cinematic subtle warm ambient lighting */}
      <div
        className="absolute top-0 right-1/4 w-[600px] h-[350px] pointer-events-none rounded-full blur-[140px] opacity-20"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[500px] h-[300px] pointer-events-none rounded-full blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle, #d97706 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase mb-4">
            <Radio size={13} className="text-amber-400 animate-pulse" />
            <span>{isArabic ? "آيريس باي • الخليج التجاري، دبي" : "Iris Bay • Business Bay, Dubai"}</span>
          </div>

          <h2
            id="soundstages-title"
            className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight leading-tight mb-4"
          >
            {isArabic ? (
              <>
                استوديوهات الإنتاج السينمائي <span className="text-amber-400">والموسيقي المعتمدة</span>
              </>
            ) : (
              <>
                Dubai’s Certified <span className="text-amber-400">Soundstages &amp; Suites</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            {isArabic
              ? "ستة استوديوهات إنتاج عالمية معزولة صوتياً (STC 65+) ومجهزة بكونسولات نيف وSSL وميكروفونات شور الأسطورية وشاشات ليد 270 درجة."
              : "Six acoustically certified soundstages, live tracking rooms, and podcast suites equipped with Neve, SSL, Shure, and 270° Micro-LED volumes in the center of Dubai."}
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
                    layoutId="activeStudioCategoryPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/20 -z-10"
                    transition={studioSprings.snappy}
                  />
                )}
                <span>{isArabic ? cat.arabicLabel : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <AnimatePresence mode="popLayout">
            {filteredStudios.map((studio) => (
              <motion.div
                key={studio.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={studioSprings.cinematic}
                className="group relative flex flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0f0f13]/90 hover:border-amber-500/50 hover:bg-[#121217] transition-all duration-300 shadow-xl overflow-hidden"
              >
                {/* Image Container with Zoom */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                  <Image
                    src={studio.image}
                    alt={isArabic ? studio.arabicName : studio.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/30 to-black/40 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                      {studio.isActive === false ? (
                        <>
                          <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                          <span>{isArabic ? "تحت الصيانة" : "Maintenance"}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={11} className="text-amber-400" />
                          <span>{isArabic ? studio.arabicBadge : studio.badge}</span>
                        </>
                      )}
                    </span>

                    <span className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-zinc-300" dir="ltr">
                      {studio.soundIsolation.split(" ")[0]}
                    </span>
                  </div>

                  {/* Bottom Stats Overlay */}
                  <div className="absolute bottom-3 inset-x-3.5 flex items-center justify-between text-[11px] font-mono text-zinc-300 z-10 pointer-events-none" dir="ltr">
                    <span className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded border border-white/10">
                      <Maximize2 size={11} className="text-amber-400" />
                      <span>{studio.areaSqm} m²</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded border border-white/10">
                      <Users size={11} className="text-amber-400" />
                      <span>{studio.capacity} Crew</span>
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white font-display tracking-tight mb-2 group-hover:text-amber-300 transition-colors">
                      {isArabic ? studio.arabicName : studio.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                      {isArabic ? studio.arabicOverview : studio.overview}
                    </p>

                    {/* Key Hardware Pills */}
                    <div className="space-y-1.5 mb-5 pb-5 border-b border-white/5">
                      {studio.keyHardware.slice(0, 2).map((hw, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-zinc-300">
                          <span className="text-zinc-500 font-mono">{isArabic ? (hw.arabicLabel || hw.label) : hw.label}</span>
                          <span className="font-semibold text-zinc-200 truncate max-w-[180px]">
                            {isArabic ? (hw.arabicValue || hw.value) : hw.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA Actions */}
                  <div>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-2xl font-black text-amber-400 font-display">
                          {formatCurrency(studio.rate)}
                        </span>
                        <span className="text-zinc-400 text-xs ml-1">/ {isArabic ? "ساعة" : "hour"}</span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {isArabic ? "الخليج التجاري • دبي" : "Iris Bay • Dubai"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {studio.isActive !== false ? (
                        <Link
                          href={`/studio-booking?studio=${studio.id}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                        >
                          <Calendar size={13} />
                          <span>{isArabic ? "احجز الآن" : "Book Studio"}</span>
                        </Link>
                      ) : (
                        <a
                          href={`https://wa.me/971554010465?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20inquire%20about%20availability%20for%20${encodeURIComponent(studio.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold transition-all border border-amber-500/30"
                        >
                          <MessageCircle size={13} className="text-emerald-400" />
                          <span>{isArabic ? "استفسار" : "Inquire"}</span>
                        </a>
                      )}

                      <Link
                        href={`/studios#${studio.id}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                      >
                        <span>{isArabic ? "المواصفات" : "View Specs"}</span>
                        <ArrowRight size={13} className="rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Banner Hub Banner */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-[#101015] to-zinc-950 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left rtl:md:text-right">
            <h4 className="text-lg sm:text-xl font-bold text-white font-display">
              {isArabic ? "هل تحتاج إلى جولة معاينة خاصة أو حجز عدة أيام؟" : "Planning a Multi-Day Shoot or Need a Studio Walkthrough?"}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              {isArabic
                ? "تحدث مباشرة مع فريق إدارة الاستوديوهات لترتيب المعاينة الميدانية أو الحصول على عرض أسعار خاص بالحملات الإعلانية والمسلسلات."
                : "Speak with our Studio Operations Lead for technical walkthroughs, custom turnkey packages, or multi-day facility lockouts."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/studios"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-98"
            >
              <span>{isArabic ? "استكشف كل الاستوديوهات والمخططات" : "Explore All Soundstages"}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </Link>

            <a
              href="https://wa.me/971554010465?text=Hello%20Yas%20Pro%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20soundstage%20at%20Iris%20Bay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-medium transition-all"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>{isArabic ? "واتساب مباشر" : "WhatsApp"}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
