"use client";

import Link from "next/link";
import { useReducedMotionVideo } from "../hooks/useReducedMotionVideo";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutHeroHeader() {
  const videoRef = useReducedMotionVideo();
  const { t, isArabic } = useLanguage();

  return (
    <div className="relative pt-6 sm:pt-10 pb-12 sm:pb-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Editorial Text Column */}
        <div className="lg:col-span-7 text-center lg:text-start flex flex-col items-center lg:items-start">
          {/* Top Accreditation & Government Trust Pill */}
          <FadeUp delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border border-white/10 bg-card/80 backdrop-blur-xl shadow-lg shadow-black/40 text-[11px] sm:text-xs font-semibold text-zinc-300 mb-6">
              <span className="size-2 rounded-full bg-brand-mauve shadow-[0_0_8px_rgba(152,123,165,0.6)]" />
              <span className="text-white font-medium">
                {isArabic ? "مرخّص ومعتمد رسمياً منذ 2015" : "Licensed & Accredited in Dubai Since 2015"}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-zinc-200 flex items-center gap-1 font-latin" dir="ltr">
                <ShieldCheck size={13} className="text-brand-mauve" /> NMC UAE
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
            <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-2xl mb-8 text-balance">
              {t("about.description")}
            </p>
          </FadeUp>

          {/* Hero CTA Strip */}
          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full max-w-md">
              <Link
                href="/studio-booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-brand-violet-rich via-brand-purple to-brand-mauve hover:brightness-110 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-brand-violet/30 whitespace-nowrap min-h-[44px]"
              >
                <span>{t("about.bookStage")}</span>
                <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-xs text-zinc-200 border border-white/10 bg-card/60 hover:bg-card hover:border-brand-mauve/30 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap active:scale-[0.97]"
              >
                <span>{t("about.contactProducers")}</span>
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* 3D Chromatic Geodesic Orb Visual Column */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="w-full flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[440px] lg:h-[440px] flex items-center justify-center">
              {/* Brand atmospheric radial glow matching app palette */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-violet/35 via-brand-purple/25 to-brand-mauve/20 blur-3xl pointer-events-none scale-90" />
              <div className="absolute w-2/3 h-2/3 rounded-full bg-brand-mauve/15 blur-2xl pointer-events-none" />

              <video
                ref={videoRef}
                src="/videos/geodesic-orb.mp4"
                muted
                playsInline
                preload="auto"
                className="relative z-10 w-full h-full object-contain pointer-events-none select-none mix-blend-screen"
                style={{
                  WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 45%, transparent 85%)",
                  maskImage: "radial-gradient(circle at 50% 50%, #000 45%, transparent 85%)",
                  filter: "contrast(1.15) brightness(0.95)",
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
