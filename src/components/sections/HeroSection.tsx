"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { HeroMediaOrbit } from "./HeroMediaOrbit";
import { BookNowModal } from "./BookNowModal";

export default function HeroSection() {
  const { t, isArabic } = useLanguage();
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [isBookNowOpen, setIsBookNowOpen] = useState(false);

  return (
    <Section
      id="hero"
      aria-labelledby="hero-title"
      className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4.5rem)] md:min-h-0 lg:min-h-[calc(100dvh-4.5rem)] flex items-center justify-center py-8 sm:py-10 md:py-12 lg:py-16 xl:py-20 bg-transparent relative overflow-hidden film-grain"
    >


      <Container className="relative z-10">
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-16 items-center"
        >

          {/* ── Editorial Studio Content Column ── */}
          <FadeUp
            dir={isArabic ? "rtl" : "ltr"}
            className="md:col-span-6 lg:col-span-7 flex flex-col items-center text-center md:items-start md:text-start relative"
          >
            {/* Mobile Key Ambient Backlight (hidden on md+ since tablet is side-by-side) */}
            <div
              aria-hidden="true"
              className="md:hidden absolute -top-8 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-48 sm:h-64 bg-brand-violet/20 blur-[55px] rounded-full pointer-events-none -z-10"
            />

            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold text-white mb-4 sm:mb-6 font-display rtl:font-arabic tracking-tight leading-[1.1] rtl:leading-[1.35] text-balance drop-shadow-lg"
            >
              {isArabic ? (
                <>
                  {t("hero.title1")}{" "}
                  <span className="gradient-text-mauve font-serif font-normal">
                    {t("hero.ai")}
                  </span>{" "}
                  {t("hero.title2")}
                </>
              ) : (
                <>
                  Where{" "}
                  <span className="gradient-text-mauve font-serif italic font-normal">
                    AI
                  </span>{" "}
                  Meets <br className="hidden sm:inline" />
                  Human Creativity
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg md:text-base lg:text-lg text-zinc-300 mb-6 sm:mb-8 max-w-full sm:max-w-xl md:max-w-md lg:max-w-xl text-balance leading-relaxed font-normal">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-center mb-0 w-full">
              {/* Primary Studio Action - Opens Book Now Modal */}
              <MagneticButton className="w-full sm:w-auto" strength={0.25} radius={90}>
                <button
                  type="button"
                  onClick={() => setIsBookNowOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm btn-brand whitespace-nowrap cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <span>{t("hero.bookStudio")}</span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-transform ${isArabic ? "rotate-180" : ""}`}
                  />
                </button>
              </MagneticButton>

              {/* Secondary Reel Action with Film Pulse */}
              <MagneticButton className="w-full sm:w-auto" strength={0.25} radius={90}>
                <button
                  type="button"
                  onClick={() => setIsPlayingReel(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm text-zinc-200 border border-white/12 bg-zinc-900/70 hover:bg-zinc-800 hover:border-white/20 transition-all backdrop-blur-md whitespace-nowrap cursor-pointer shadow-lg shadow-black/50"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-mauve-soft" />
                  </span>
                  <span>{t("hero.watchReel")}</span>
                  <Play
                    size={13}
                    className={`text-zinc-200 fill-current shrink-0 ${
                      isArabic ? "scale-x-[-1]" : ""
                    }`}
                  />
                </button>
              </MagneticButton>
            </div>
          </FadeUp>

          {/* ── Visionary Creator with Heroic Presence & 3D Media Orbit Column ── */}
          <div className="md:col-span-6 lg:col-span-5 relative flex items-center justify-center mt-8 md:mt-0 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[560px] xl:min-h-[600px]">
            {/* Main Central Persona Container with commanded scale */}
            <div className="relative w-full max-w-[300px] sm:max-w-[360px] md:max-w-[380px] lg:max-w-[460px] xl:max-w-[500px] select-none">
              
              {/* Dynamic Atmospheric Studio Lighting Behind Persona (Volumetric Breathing Lights) */}
              <div className="absolute -inset-8 pointer-events-none -z-10 overflow-visible">
                {/* Atmospheric Mauve Key Light - slow organic drift & scale */}
                <div className="absolute top-4 right-0 w-80 h-80 bg-brand-mauve/25 rounded-full blur-[85px] animate-mesh-float" />
                
                {/* Anamorphic Violet Rim Backlight - counter-sway floating aura */}
                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-84 h-84 bg-brand-violet/30 rounded-full blur-[90px] animate-float-reverse" />
                
                {/* Soft Mauve Dynamic Focus - gentle floating breathing */}
                <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-brand-mauve-soft/20 rounded-full blur-[70px] animate-float-slow" />

                {/* Grounding Stage Floor Pedestal Glow - breathing base wave */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-72 sm:w-84 h-24 bg-gradient-to-r from-brand-violet/25 via-cyan-500/15 to-brand-mauve/25 rounded-full blur-2xl animate-pulse-glow" />
              </div>

              {/* Persona Image Wrapper */}
              <div className="relative aspect-[3/4] w-full z-10 pointer-events-none filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)]">
                <Image
                  src="/images/hero/emirati-vr-creator-transparent.png?v=2"
                  alt={isArabic ? "صانع محتوى ومخرج إماراتي بنظارة الواقع المكاني والذكاء الاصطناعي" : "Emirati visionary filmmaker & AI spatial director"}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 85vw, (max-width: 1200px) 42vw, 500px"
                  priority
                  className="object-contain object-bottom scale-[1.03] origin-bottom transition-transform duration-700"
                />

                {/* Silky-Smooth Curved Dark-to-Mauve Studio Gradient */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-24 sm:h-28 pointer-events-none overflow-hidden"
                >
                  {/* Layer 1: Silky non-linear curve from translucent dark to radiant mauve */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 140% 100% at 50% 100%, rgba(12, 9, 18, 0.75) 0%, rgba(12, 9, 18, 0.42) 24%, rgba(84, 37, 104, 0.26) 48%, rgba(152, 123, 165, 0.2) 70%, rgba(152, 123, 165, 0.06) 88%, transparent 100%)",
                    }}
                  />

                  {/* Layer 2: Soft Mauve Studio Luminescence (Airy & Delicate) */}
                  <div
                    className="absolute -bottom-2 inset-x-8 h-16 rounded-full blur-xl pointer-events-none opacity-80"
                    style={{
                      background:
                        "radial-gradient(ellipse 90% 70% at 50% 100%, rgba(152, 123, 165, 0.25) 0%, rgba(118, 80, 134, 0.1) 50%, transparent 80%)",
                    }}
                  />
                </div>
              </div>

              {/* 3D Solar System Orbit around the head */}
              <HeroMediaOrbit />
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

      {/* Book Now Hub Selection Modal */}
      <BookNowModal
        isOpen={isBookNowOpen}
        onClose={() => setIsBookNowOpen(false)}
      />
    </Section>
  );
}
