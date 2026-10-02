"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { HeroStats } from "./HeroStats";
import { StudioBadge } from "@/components/common/StudioBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { studioSprings } from "@/lib/studio-motion";

export default function HeroSection() {
  const { t, isArabic } = useLanguage();
  const [isPlayingReel, setIsPlayingReel] = useState(false);

  return (
    <Section
      id="hero"
      aria-labelledby="hero-title"
      className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4.5rem)] flex items-center justify-center py-8 sm:py-12 md:py-20 bg-background relative overflow-hidden film-grain"
    >
      {/* ── Cinematic 3D Virtual Production Soundstage Background ── */}
      <div className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* The 16:9 3D Cinema Robot & Soundstage Image */}
        <div
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-opacity duration-700 ${
            isArabic ? "-scale-x-100" : ""
          }`}
          style={{
            backgroundImage: `url('/images/branding/yaspro-hero-bg.jpg')`,
          }}
        />

        {/* Deep Studio Vignettes: Directional key light with obsidian shadows */}
        <div 
          className={`absolute inset-y-0 w-full lg:w-3/5 from-background/90 via-background/65 to-transparent ${
            isArabic ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"
          }`} 
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/80 via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-black/35 lg:bg-black/20" />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 items-center">

          {/* ── Left Column: Editorial Studio Content ── */}
          <FadeUp className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-start">
            <div className="mb-6 flex justify-center lg:justify-start">
              <StudioBadge
                stage="STAGE 01"
                label={isArabic ? "استوديو الإنتاج الافتراضي الفائق" : "VIRTUAL PRODUCTION & CINE STUDIOS"}
              />
            </div>

            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] rtl:leading-[1.28] text-balance drop-shadow-lg"
            >
              {isArabic ? (
                <>
                  {t("hero.title1")}{" "}
                  <span className="text-amber-400 font-serif font-normal">
                    {t("hero.ai")}
                  </span>{" "}
                  {t("hero.title2")}
                </>
              ) : (
                <>
                  Where{" "}
                  <span className="text-amber-400 font-serif italic font-normal">
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
              {/* Primary Studio Action */}
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={studioSprings.snappy}
                className="w-full sm:w-auto"
              >
                <Link
                  href="/studio-booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/25 whitespace-nowrap"
                >
                  <span>{t("hero.bookStudio")}</span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-transform ${isArabic ? "rotate-180" : ""}`}
                  />
                </Link>
              </motion.div>

              {/* Secondary Reel Action with Film Pulse */}
              <motion.button
                type="button"
                onClick={() => setIsPlayingReel(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={studioSprings.snappy}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full font-medium text-sm text-zinc-200 border border-white/12 bg-zinc-900/70 hover:bg-zinc-800 hover:border-white/20 transition-all backdrop-blur-md whitespace-nowrap cursor-pointer shadow-lg shadow-black/50"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>{t("hero.watchReel")}</span>
                <Play
                  size={13}
                  className={`text-zinc-200 fill-current shrink-0 ${
                    isArabic ? "scale-x-[-1]" : ""
                  }`}
                />
              </motion.button>
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
