"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default function HeroSection() {
  const { t, isArabic } = useLanguage();
  const [isPlayingReel, setIsPlayingReel] = useState(false);

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
              {/* Primary Studio Action */}
              <MagneticButton className="w-full sm:w-auto" strength={0.25} radius={90}>
                <Link
                  href="/studio-booking"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm btn-brand whitespace-nowrap"
                >
                  <span>{t("hero.bookStudio")}</span>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-transform ${isArabic ? "rotate-180" : ""}`}
                  />
                </Link>
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

          {/* ── Right Column: Floating Visionary with 3D Media Production Tools ── */}
          <div className="lg:col-span-5 relative flex items-center justify-center mt-12 lg:mt-0 min-h-[460px] sm:min-h-[520px]">
            {/* Main Central Persona Container (Layer z-10) */}
            <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] animate-float select-none pointer-events-none z-10">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src="/images/hero/vr-filmmaker-v3.jpg"
                  alt={isArabic ? "مخرج يرتدي نظارة الواقع الافتراضي" : "Filmmaker wearing VR glasses"}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 80vw, (max-width: 1200px) 38vw, 420px"
                  priority
                  className="object-cover object-top"
                />

                {/* Smooth feathering into the obsidian background */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/50 pointer-events-none" />
              </div>
            </div>

            {/* ── Floating Tool 1: Broadcast Studio Microphone (Middle Left Flank z-20) ── */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-8 sm:-left-12 lg:-left-16 z-20 animate-float-slow pointer-events-none">
              <div className="relative w-36 sm:w-44 lg:w-48 aspect-square filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
                <Image
                  src="/images/hero/floating-mic.jpg"
                  alt="Broadcast Studio Microphone"
                  fill
                  sizes="192px"
                  className="object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity -scale-x-100"
                />
              </div>
            </div>

            {/* ── Floating Tool 2: Futuristic Next-Gen Cinema Camera (Bottom Right Flank z-20, Fully Visible) ── */}
            <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-12 lg:-right-16 z-20 animate-cinema-sway pointer-events-none">
              <div className="relative w-44 sm:w-52 lg:w-60 aspect-square filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] -rotate-12 -scale-x-100">
                <Image
                  src="/images/hero/cinema-camera-v2.jpg"
                  alt="Next-Gen 8K Cinema Camera"
                  fill
                  unoptimized
                  sizes="240px"
                  className="object-contain mix-blend-screen opacity-95 hover:opacity-100 transition-opacity"
                />
              </div>
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
