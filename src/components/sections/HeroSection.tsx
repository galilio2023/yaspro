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
      className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4.5rem)] flex items-center justify-center py-8 sm:py-12 md:py-20 bg-transparent relative overflow-hidden film-grain"
    >


      <Container className="relative z-10">
        {/* dir="ltr" locks physical column order — text always left, vista always right.
            Arabic content renders RTL inside via dir="auto" on the content column. */}
        <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">

          {/* ── Left Column: Editorial Studio Content ── */}
          <FadeUp
            dir={isArabic ? "rtl" : "ltr"}
            className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-start"
          >
            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display rtl:font-arabic tracking-tight leading-[1.1] rtl:leading-[1.4] text-balance drop-shadow-lg"
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

            <p className="text-base sm:text-lg text-zinc-300 mb-8 max-w-full sm:max-w-xl text-balance leading-relaxed font-normal">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-10 w-full">
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

          {/* ── Right Column: Visionary Creator with Heroic Presence & 3D Media Orbit ── */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-12 lg:mt-0 min-h-[500px] sm:min-h-[560px] lg:min-h-[600px]">
            {/* Main Central Persona Container with commanded scale */}
            <div className="relative w-full max-w-[350px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] select-none">
              
              {/* Studio Key & Rim Light Halo Behind Character (No Badges) */}
              <div className="absolute -inset-4 pointer-events-none -z-10">
                {/* Atmospheric Mauve Key Light from upper right */}
                <div className="absolute top-10 right-4 w-72 h-72 bg-brand-mauve/20 rounded-full blur-[80px]" />
                {/* Anamorphic Violet/Magenta Rim Backlight from center-left */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-violet/25 rounded-full blur-[90px]" />
                {/* Grounding Stage Floor Pedestal Glow */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-20 bg-cyan-500/10 rounded-full blur-2xl" />
              </div>

              {/* Persona Image Wrapper */}
              <div className="relative aspect-[3/4] w-full z-10 pointer-events-none filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)]">
                <Image
                  src="/images/hero/emirati-vr-creator-transparent.png"
                  alt={isArabic ? "صانع محتوى ومخرج إماراتي بنظارة الواقع المكاني والذكاء الاصطناعي" : "Emirati visionary filmmaker & AI spatial director"}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 85vw, (max-width: 1200px) 42vw, 500px"
                  priority
                  className="object-contain object-bottom scale-[1.03] origin-bottom transition-transform duration-700"
                />

                {/* Subtle Cinematic Lens Flare Accent across the chest */}
                <div className="absolute inset-x-8 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent pointer-events-none" />

                {/* Gentle fade only at the very bottom edge of the torso */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
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
