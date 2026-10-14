"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { SocialMediaPackage } from "../data/packages";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PackageCardProps {
  pkg: SocialMediaPackage;
  billingInterval: "monthly" | "yearly";
  onSelect: (pkg: SocialMediaPackage) => void;
}

export function PackageCard({ pkg, billingInterval, onSelect }: PackageCardProps) {
  const { isArabic } = useLanguage();

  const isGrowth = pkg.id === "growth";
  const isPremium = pkg.id === "premium";
  const isEnterprise = pkg.id === "enterprise";

  const currentPrice =
    billingInterval === "yearly" ? pkg.yearlyPricePerMonth : pkg.monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 backdrop-blur-xl ${
        isGrowth
          ? "bg-gradient-to-b from-[#181324] via-[#120e1c] to-[#0a0810] border-2 border-brand-mauve/70 shadow-[0_0_50px_rgba(84,37,104,0.35)] lg:-translate-y-2 z-10"
          : isPremium
          ? "bg-[#0b0e16]/95 border border-white/15 hover:border-white/30 shadow-2xl shadow-black/60"
          : isEnterprise
          ? "bg-[#0c0912]/90 border border-white/10 hover:border-brand-mauve/40 shadow-xl shadow-black/40"
          : "bg-[#0c0f17]/90 border border-white/10 hover:border-white/20 shadow-xl shadow-black/40"
      }`}
    >
      {/* Top Badge for Growth Tier */}
      {isGrowth && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-violet/40 text-brand-lavender border border-brand-mauve/30 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-brand-violet/40">
            <Sparkles size={11} className="fill-brand-lavender text-brand-lavender" />
            {isArabic ? "الباقة الأكثر طلباً · RECOMMENDED" : "MOST POPULAR · PRODUCTION ENGINE"}
          </span>
        </div>
      )}

      {/* Top Header & Identity */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                {isEnterprise ? "[BESPOKE]" : `[TIER 0${pkg.id === "starter" ? "1" : pkg.id === "growth" ? "2" : "3"}]`}
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white font-display mt-0.5">
              {isArabic ? pkg.nameAr : pkg.nameEn}
            </h3>
          </div>

          {isPremium && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 uppercase tracking-widest">
              PRO MAX
            </span>
          )}
        </div>

        <p className="text-xs text-zinc-400 min-h-[38px] leading-relaxed">
          {isArabic ? pkg.taglineAr : pkg.taglineEn}
        </p>

        {/* Price & Billing Calculation */}
        <div className="my-5 pt-4 pb-1 border-t border-white/[0.08]">
          {isEnterprise ? (
            <div className="min-h-[64px] flex flex-col justify-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display">
                {isArabic ? "مخصص" : "Custom"}
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                {isArabic ? "حسب حجم الإنتاج والمتطلبات" : "Tailored to campaign volume"}
              </span>
            </div>
          ) : (
            <div className="min-h-[64px] flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-mono font-bold text-brand-mauve tracking-wider">
                  {isArabic ? "د.إ" : "AED"}
                </span>
                <motion.span
                  key={`${pkg.id}-${currentPrice}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-4xl sm:text-5xl font-black tracking-tight text-white font-display"
                >
                  {currentPrice?.toLocaleString()}
                </motion.span>
                <span className="text-xs text-zinc-400 font-medium">
                  {isArabic ? "/شهرياً" : "/mo"}
                </span>
              </div>

              {billingInterval === "yearly" && pkg.monthlyPrice && (
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="line-through text-zinc-500 font-mono">
                    AED {pkg.monthlyPrice.toLocaleString()}/mo
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[10px]">
                    SAVE 20%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onSelect(pkg)}
          className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isGrowth
              ? "btn-brand shadow-lg shadow-brand-violet/40 font-black"
              : isPremium
              ? "bg-brand-mauve/15 hover:bg-brand-mauve/25 text-brand-lavender border border-brand-mauve/40 font-bold shadow-lg shadow-brand-violet/20"
              : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15"
          }`}
        >
          <span>
            {isEnterprise
              ? isArabic
                ? pkg.ctaTextAr
                : pkg.ctaTextEn
              : isArabic
                ? pkg.ctaTextAr
                : pkg.ctaTextEn}
          </span>
          {isArabic ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
        </motion.button>

        {/* Deliverables Breakdown Divider */}
        <div className="mt-6 mb-4 flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
            {isArabic ? "مخرجات الباقة الشهرية" : "MONTHLY DELIVERABLES"}
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        {/* Feature List */}
        <ul className="space-y-2.5">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span
                className={`shrink-0 mt-0.5 size-4 rounded-full flex items-center justify-center ${
                  isGrowth
                    ? "bg-brand-mauve/20 text-brand-lavender border border-brand-mauve/40"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                }`}
              >
                <Check size={11} strokeWidth={3} />
              </span>
              <span className="text-xs leading-relaxed text-zinc-300 font-medium">
                {isArabic ? feature.labelAr : feature.labelEn}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Production Telemetry Footer */}
      <div className="mt-6 pt-3.5 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <span className="block text-zinc-500 uppercase tracking-wider">
            {isArabic ? "فيديوهات" : "REELS"}
          </span>
          <span className="font-bold text-zinc-200">
            {pkg.specsHighlights.reels}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-white/[0.02]">
          <span className="block text-zinc-500 uppercase tracking-wider">
            {isArabic ? "أيام التصوير" : "FILMING"}
          </span>
          <span className="font-bold text-zinc-200">
            {pkg.specsHighlights.filming}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
