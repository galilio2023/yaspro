"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutHeroHeader() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 text-center max-w-4xl mx-auto flex flex-col items-center">
      {/* Top Accreditation & Government Trust Pill */}
      <FadeUp delay={0.05}>
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-white/12 bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-black/40 text-[11px] sm:text-xs font-semibold text-zinc-300 mb-6">
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="text-white font-medium">
            {isArabic ? "مرخّص ومعتمد رسمياً منذ 2015" : "Licensed & Accredited in Dubai Since 2015"}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-zinc-200 flex items-center gap-1 font-latin" dir="ltr">
            <ShieldCheck size={13} className="text-emerald-400" /> NMC UAE
          </span>
        </div>
      </FadeUp>

      {/* Main Page Title */}
      <FadeUp delay={0.1}>
        <h1
          id="about-title"
          className="page-hero-title mb-6 text-balance"
        >
          {t("about.title")}{" "}
          <span className="gradient-text-gold font-serif italic font-normal">
            {t("about.titleGradient")}
          </span>
        </h1>
      </FadeUp>

      {/* Editorial Subtitle */}
      <FadeUp delay={0.15}>
        <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-8 text-balance">
          {t("about.description")}
        </p>
      </FadeUp>

      {/* Hero CTA Strip */}
      <FadeUp delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
          <Link
            href="/studio-booking"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-zinc-950 bg-amber-500 hover:bg-amber-400 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-amber-500/25 whitespace-nowrap min-h-[44px]"
          >
            <span>{t("about.bookStage")}</span>
            <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-xs text-zinc-200 border border-white/15 bg-zinc-900/70 hover:bg-zinc-800 hover:border-white/25 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap active:scale-[0.97]"
          >
            <span>{t("about.contactProducers")}</span>
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}
