"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ArrowRight, Play } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { HeroStats } from "./HeroStats";
import { SplineScene } from "@/components/3d/SplineScene";
import { HeroSparkles } from "./HeroSparkles";
import { YasproBrandSparkleBadge } from "./YasproBrandSparkleBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";

export default function HeroSection() {
  const { t, isArabic } = useLanguage();
  const [isPlayingReel, setIsPlayingReel] = useState(false);

  return (
    <Section
      id="hero"
      aria-labelledby="hero-title"
      className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4.5rem)] flex items-center justify-center py-8 sm:py-12 md:py-20 bg-background relative"
    >
      <HeroSparkles />
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">

          {/* ── Left Column: Hero Content ── */}
          <FadeUp className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-start">
            <div className="mb-6 flex justify-center lg:justify-start">
              <YasproBrandSparkleBadge />
            </div>

            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] rtl:leading-[1.28] text-balance"
            >
              {isArabic ? (
                // Arabic: fluid phrase with gradient on AI keywords
                <>
                  {t("hero.title1")}{" "}
                  <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
                    {t("hero.ai")}
                  </span>{" "}
                  {t("hero.title2")}
                </>
              ) : (
                // English: split on "AI" to apply gradient
                <>
                  Where{" "}
                  <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
                    AI
                  </span>{" "}
                  Meets <br className="hidden sm:inline" />
                  Human Creativity
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-text-secondary mb-8 max-w-full sm:max-w-xl text-balance leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10 w-full">
              <ShimmerButton
                asChild
                shimmerColor="var(--brand-purple-light)"
                shimmerDuration="2.5s"
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 font-semibold text-sm gap-2"
              >
                <Link href="/studio-booking" className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span>{t("hero.bookStudio")}</span>
                  {/* Forward arrow: points Left in Arabic, Right in English */}
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-transform ${isArabic ? "rotate-180" : ""}`}
                  />
                </Link>
              </ShimmerButton>

              <button
                type="button"
                onClick={() => setIsPlayingReel(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm whitespace-nowrap cursor-pointer"
              >
                {/* Play triangle: mirrors in Arabic, normal in English */}
                <Play
                  size={14}
                  className={`text-brand-purple fill-current shrink-0 transition-transform ${
                    isArabic ? "scale-x-[-1]" : ""
                  }`}
                />
                <span>{t("hero.watchReel")}</span>
              </button>
            </div>

            <HeroStats />
          </FadeUp>

          {/* ── Right Column: Interactive Spline 3D Scene ── */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center mt-2 sm:mt-0">
            <div className="relative w-full aspect-[4/3] sm:aspect-square max-w-xs sm:max-w-sm md:max-w-[400px] lg:max-w-[500px] mx-auto rounded-2xl sm:rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-brand-purple/10">
              <BorderBeam size={240} duration={12} delay={2} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />

              {/*
                HUD Badge — top-start (logical: left in LTR, right in RTL).
                Tech strings (Dubai, Studio 4K, LIVE) stay Latin with font-latin.
              */}
              <div className="absolute top-4 start-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/50 select-none pointer-events-none">
                {/* UAE Flag micro SVG */}
                <div className="size-fit rounded-[3px] overflow-hidden border border-white/20 shadow-sm flex items-center justify-center">
                  <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
                    <rect width="24" height="5.33" y="0" fill="#00732f" />
                    <rect width="24" height="5.33" y="5.33" fill="#ffffff" />
                    <rect width="24" height="5.33" y="10.66" fill="#000000" />
                    <rect width="6" height="16" x="0" fill="#ff0000" />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase font-bold tracking-wider text-white font-latin">
                  <span>Dubai</span>
                  <span className="text-white/40">•</span>
                  <span className="text-brand-purple-light">Studio 4K</span>
                </div>

                {/* Live REC Beacon */}
                <div className="flex items-center gap-1.5 ps-1.5 border-s border-white/15">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-semibold font-latin">LIVE</span>
                </div>
              </div>

              {/* Spec Tag — bottom-end (logical: right in LTR, left in RTL) */}
              <div className="absolute bottom-4 end-4 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-[9.5px] font-mono text-text-muted select-none pointer-events-none font-latin">
                <span className="size-1.5 rounded-full bg-brand-cyan" />
                <span>UAE CINEMA CAM • RAW 8K</span>
              </div>

              <SplineScene className="size-full" />
            </div>
          </div>
        </div>
      </Container>

      {/* Hero Showreel Modal */}
      <CinemaVideoModal
        isOpen={isPlayingReel}
        onClose={() => setIsPlayingReel(false)}
        vimeoId="1093240200"
        title="Yas Pro — Official Master Showreel"
        subtitle={isArabic ? "الفيديو التعريفي الرسمي" : "Flagship Production Reel"}
        posterImage="/images/projects/flag-day.jpg"
        client="Yas Pro Media Network"
      />
    </Section>
  );
}
