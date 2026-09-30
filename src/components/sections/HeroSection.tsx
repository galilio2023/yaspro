"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ArrowRight, Play } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { HeroStats } from "./HeroStats";
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
      className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4.5rem)] flex items-center justify-center py-8 sm:py-12 md:py-20 bg-background relative overflow-hidden"
    >
      {/* ── Cinematic 3D Virtual Production Soundstage Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* The 16:9 3D Cinema Robot & Soundstage Image */}
        <div
          className={`absolute inset-0 bg-cover bg-[80%_center] lg:bg-right bg-no-repeat opacity-90 transition-opacity duration-700 ${
            isArabic ? "-scale-x-100" : ""
          }`}
          style={{
            backgroundImage: `url('/images/branding/yaspro-hero-bg.jpg')`,
          }}
        />

        {/* Deep Vignette Blends:
            1. Directional gradient from start edge to guarantee maximum typography contrast
            2. Bottom gradient for seamless transition to partners/stats
            3. Top gradient for navbar harmony */}
        <div 
          className={`absolute inset-y-0 w-full lg:w-3/5 from-background via-background/90 to-transparent ${
            isArabic ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
          }`} 
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/80 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-black/35 lg:bg-black/20" />
      </div>

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
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] rtl:leading-[1.28] text-balance drop-shadow-md"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm whitespace-nowrap cursor-pointer shadow-lg shadow-black/40"
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

          {/* ── Right Column: Open vista for the 3D Cinema Robot & Soundstage ── */}
          <div className="lg:col-span-5 hidden lg:block" aria-hidden="true" />
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
