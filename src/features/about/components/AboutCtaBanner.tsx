"use client";

import Link from "next/link";
import { useReducedMotionVideo } from "../hooks/useReducedMotionVideo";
import { Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutCtaBanner() {
  const videoRef = useReducedMotionVideo();
  const { t } = useLanguage();

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Text and Actions Column (7 cols) */}
        <div className="lg:col-span-7 text-center lg:text-start flex flex-col items-center lg:items-start">
          <FadeUp delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider rtl:font-arabic rtl:tracking-normal text-brand-mauve bg-card/80 border border-border/40 mb-6 backdrop-blur-md whitespace-nowrap shrink-0 max-w-full shadow-lg shadow-black/20">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mauve opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-brand-mauve shadow-[0_0_8px_rgba(152,123,165,0.6)]" />
              </span>
              <span className="whitespace-nowrap font-latin rtl:font-arabic">{t("about.cta.badge")}</span>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight mb-4">
              {t("about.cta.title")}{" "}
              <span className="gradient-text-gold font-serif italic font-normal">
                {t("about.cta.titleGradient")}
              </span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mb-8">
              {t("about.cta.desc")}
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full max-w-md">
              <Link
                href="/studio-booking"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-white bg-gradient-to-r from-brand-violet-rich via-brand-purple to-brand-mauve hover:brightness-110 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-brand-violet/30 whitespace-nowrap min-h-[44px]"
              >
                <Calendar size={15} />
                <span>{t("about.cta.bookTour")}</span>
                <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
              </Link>

              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-xs text-zinc-200 border border-white/10 bg-card/60 hover:bg-card hover:border-brand-mauve/30 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap active:scale-[0.97]"
              >
                <MessageSquare size={14} className="text-brand-mauve" />
                <span>{t("about.cta.talkTeam")}</span>
              </Link>
            </div>
          </FadeUp>
        </div>

        {/* 3D Animated Rocket Column (5 cols) */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="w-full flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[440px] lg:h-[440px] flex items-center justify-center">
              {/* Brand atmospheric radial glow matching the hero orb */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-violet/35 via-brand-purple/25 to-brand-mauve/20 blur-3xl pointer-events-none scale-90" />
              <div className="absolute w-2/3 h-2/3 rounded-full bg-brand-mauve/15 blur-2xl pointer-events-none" />

              <video
                ref={videoRef}
                src="/videos/rocket.mp4"
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
