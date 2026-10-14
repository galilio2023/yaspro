"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Clock, ShieldCheck, Tag, Info } from "lucide-react";
import { OFFERS_AND_BUNDLES } from "../data";
import { OfferBundleItem, OfferCategory } from "../types";
import { formatAED, studioSprings, StepIntro, Panel } from "@/features/booking/components/ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

interface Step1OfferSelectionProps {
  selectedOfferId: string;
  onSelectOffer: (id: string) => void;
  onContinue: () => void;
}

export function Step1OfferSelection({
  selectedOfferId,
  onSelectOffer,
  onContinue,
}: Step1OfferSelectionProps) {
  const { isArabic } = useLanguage();
  const [filter, setFilter] = useState<OfferCategory>("all");

  const filteredOffers = OFFERS_AND_BUNDLES.filter((item) => {
    if (filter === "all") return true;
    if (filter === "bundles") return item.category === "bundle";
    if (filter === "special_offers") return item.category === "offer";
    return true;
  });

  const categories: { id: OfferCategory; labelEn: string; labelAr: string; count: number }[] = [
    {
      id: "all",
      labelEn: "All Offers & Bundles",
      labelAr: "جميع العروض والباقات",
      count: OFFERS_AND_BUNDLES.length,
    },
    {
      id: "bundles",
      labelEn: "Production Bundles",
      labelAr: "باقات الإنتاج المتكاملة",
      count: OFFERS_AND_BUNDLES.filter((i) => i.category === "bundle").length,
    },
    {
      id: "special_offers",
      labelEn: "Special Offers",
      labelAr: "عروض حصرية ومؤقتة",
      count: OFFERS_AND_BUNDLES.filter((i) => i.category === "offer").length,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <StepIntro
        index={1}
        total={3}
        title={isArabic ? "اختر العرض أو الباقة المناسبة" : "Choose Your Offer or Bundle"}
        description={
          isArabic
            ? "حدد الباقة أو العرض الترويجي الأنسب لمشروعك الإعلامي مع أفضل قيمة تشغيلية."
            : "Select the package or special promotional deal that best fits your production scope."
        }
      />

      {/* ── Filter Pills ── */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto p-1 bg-[#0b0b0f] rounded-full border border-white/[0.08] scrollbar-none max-w-fit mx-auto shadow-inner">
        {categories.map((cat) => {
          const isActive = filter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={cn(
                "relative px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer whitespace-nowrap z-10 flex items-center gap-2",
                isActive ? "text-white font-bold" : "text-zinc-400 hover:text-white"
              )}
            >
              <span>{isArabic ? cat.labelAr : cat.labelEn}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white font-bold" : "bg-white/10 text-zinc-400"
                )}
              >
                {cat.count}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeOffersFilterPill"
                  className="absolute inset-0 rounded-full bg-brand-violet border border-brand-mauve/40 shadow-md shadow-brand-violet/40 -z-10"
                  transition={studioSprings.snappy}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Offers Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredOffers.map((offer) => {
          const isSelected = selectedOfferId === offer.id;

          return (
            <motion.div
              key={offer.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              transition={studioSprings.snappy}
              onClick={() => onSelectOffer(offer.id)}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden group shadow-lg text-start",
                isSelected
                  ? "bg-[#121016] border-brand-mauve ring-2 ring-brand-mauve/50 shadow-[0_12px_36px_-8px_rgba(152,123,165,0.4)]"
                  : "bg-[#0c0c10] border-white/[0.08] hover:border-white/20 hover:bg-[#0f0f14]"
              )}
            >
              {/* Card Image Banner */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-black/40 border-b border-white/[0.06]">
                <Image
                  src={offer.image}
                  alt={isArabic ? offer.nameAr : offer.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={offer.id === "5-hour-bundles"}
                />

                {/* Ambient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider backdrop-blur-md shadow-sm border",
                        offer.category === "bundle"
                          ? "bg-purple-900/80 border-brand-mauve/60 text-brand-lavender"
                          : "bg-blue-950/80 border-sky-400/40 text-sky-200"
                      )}
                    >
                      {offer.category === "bundle"
                        ? isArabic
                          ? "باقة متكاملة"
                          : "BUNDLE"
                        : isArabic
                        ? "عرض خاص"
                        : "SPECIAL OFFER"}
                    </span>

                    {offer.badge && (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider bg-brand-violet/40 text-brand-lavender border border-brand-mauve/30 shadow-sm flex items-center gap-1">
                        <Sparkles size={11} className="fill-brand-lavender text-brand-lavender" />
                        <span>{isArabic ? offer.badgeAr || offer.badge : offer.badge}</span>
                      </span>
                    )}
                  </div>

                  {/* Radio indicator */}
                  <div
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center border transition-all duration-200 shrink-0",
                      isSelected
                        ? "bg-brand-violet border-brand-mauve text-white shadow-md"
                        : "bg-black/60 border-white/30 text-transparent"
                    )}
                  >
                    <Check size={13} strokeWidth={3} className={isSelected ? "opacity-100" : "opacity-0"} />
                  </div>
                </div>

                {/* Bottom duration pill */}
                <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-white font-mono text-[10px]">
                    <Clock size={11} className="text-brand-mauve" />
                    <span>
                      {offer.hours} {isArabic ? "ساعات استوديو" : offer.hours === 1 ? "Hour" : "Hours"}
                    </span>
                  </span>

                  {offer.savings && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                      {isArabic ? offer.savingsAr : offer.savings}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-display mb-1 group-hover:text-brand-lavender transition-colors">
                    {isArabic ? offer.nameAr : offer.name}
                  </h3>

                  <p className="text-xs text-brand-mauve font-medium mb-2.5">
                    {isArabic ? offer.taglineAr : offer.tagline}
                  </p>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {isArabic ? offer.descriptionAr : offer.description}
                  </p>

                  {/* Restrictions callout if present */}
                  {offer.restrictionNoteEn && (
                    <div className="mb-4 p-2 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 flex items-center gap-2 text-[11px] text-brand-lavender">
                      <Info size={13} className="shrink-0 text-brand-mauve" />
                      <span>{isArabic ? offer.restrictionNoteAr : offer.restrictionNoteEn}</span>
                    </div>
                  )}

                  {/* Feature checklist */}
                  <ul className="space-y-1.5 mb-5 border-t border-white/[0.06] pt-3">
                    {(isArabic ? offer.featuresAr : offer.features).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check size={13} className="text-brand-mauve shrink-0 mt-0.5 stroke-[2.5]" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and CTA footer */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <div>
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                      {isArabic ? "السعر الإجمالي للباقة" : "Package Price"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-2xl font-black text-white font-display">
                        {formatAED(offer.price)}
                      </span>
                      {offer.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          {formatAED(offer.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOffer(offer.id);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer",
                      isSelected
                        ? "btn-brand text-xs"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    {isSelected
                      ? isArabic
                        ? "الباقة المحددة ✓"
                        : "Selected ✓"
                      : isArabic
                      ? "اختر الباقة"
                      : "Pick Offer"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
