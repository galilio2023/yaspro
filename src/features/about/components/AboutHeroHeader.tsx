"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutHeroHeader() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 text-center max-w-4xl mx-auto flex flex-col items-center">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 sm:size-96 bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-10 right-1/4 size-60 bg-brand-cyan/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Accreditation & Government Trust Pill */}
      <FadeUp delay={0.05}>
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-lg shadow-black/40 text-[11px] sm:text-xs font-semibold text-text-secondary mb-6 group hover:border-brand-purple/40 transition-colors">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">
            {isArabic ? "مرخّص ومعتمد رسمياً منذ 2015" : "Licensed & Accredited in Dubai Since 2015"}
          </span>
          <span className="text-white/20">•</span>
          <span className="text-brand-purple-light flex items-center gap-1 font-latin" dir="ltr">
            <ShieldCheck size={13} className="text-brand-cyan" /> NMC UAE
          </span>
        </div>
      </FadeUp>

      {/* Main Page Title */}
      <FadeUp delay={0.1}>
        <h1
          id="about-title"
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] rtl:leading-[1.28] font-display mb-6 text-balance"
        >
          {t("about.title")}{" "}
          <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
            {t("about.titleGradient")}
          </span>
        </h1>
      </FadeUp>

      {/* Editorial Subtitle */}
      <FadeUp delay={0.15}>
        <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto mb-8 text-balance">
          {t("about.description")}
        </p>
      </FadeUp>

      {/* Hero CTA Strip */}
      <FadeUp delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
          <ShimmerButton
            asChild
            shimmerColor="var(--brand-purple-light)"
            shimmerDuration="2.5s"
            className="w-full sm:w-auto px-7 py-3.5 text-xs font-bold gap-2 min-h-[44px]"
          >
            <Link href="/studio-booking" className="inline-flex items-center gap-2 whitespace-nowrap">
              <Sparkles size={14} className="text-brand-purple-light" />
              <span>{isArabic ? "حجز استوديو في دبي" : "Book Dubai Studio"}</span>
              <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
            </Link>
          </ShimmerButton>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-xs text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap"
          >
            <MapPin size={14} className="text-brand-cyan" />
            <span>{isArabic ? "مواقع الاستوديوهات" : "Explore Studio Hubs"}</span>
          </Link>
        </div>
      </FadeUp>
    </div>
  );
}
