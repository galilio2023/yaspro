"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Video, MapPin } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";

import { SoundstageAtmosphere } from "./SoundstageAtmosphere";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Section } from "@/components/ui/section";

interface CtaSectionProps {
  title?: string;
  gradientText?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

const HUBS = [
  { flag: "🇦🇪", cityEn: "Dubai", cityAr: "دبي" },
  { flag: "🇪🇬", cityEn: "Cairo", cityAr: "القاهرة" },
  { flag: "🇯🇴", cityEn: "Amman", cityAr: "عَمّان" },
];

export function CtaSection({
  title,
  gradientText,
  description,
  primaryCtaText,
  primaryCtaHref = "/studio-booking",
  secondaryCtaText,
  secondaryCtaHref = "/contact",
}: CtaSectionProps) {
  const { t, isArabic } = useLanguage();

  const displayTitle = title || (isArabic ? t("cta.title") : "Ready to Create");
  const displayGradientText = gradientText || (isArabic ? t("cta.titleGradient") : "Something Great?");
  const displayDesc = description || (isArabic ? t("cta.description") : "Whether you need a 4K soundstage, a live OB-VAN, or a full influencer content flywheel — our production team is on-call across three regional hubs.");
  const displayPrimaryText = primaryCtaText || (isArabic ? t("cta.bookStudio") : "Book a Studio");
  const displaySecondaryText = secondaryCtaText || (isArabic ? t("cta.talkProducers") : "Talk to Producers");

  return (
    <Section
      id="cta"
      aria-labelledby="cta-title"
      className="relative w-full min-h-[520px] sm:min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-background !py-16 sm:!py-20 lg:!py-28 film-grain"
    >
      {/* ── Layer 0: Photorealistic Soundstage Atmosphere (A24 / Sony Cine) ── */}
      <SoundstageAtmosphere isArabic={isArabic} />

      {/* ── Layer 2: Text / CTA Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-20 md:pb-28 pt-20 sm:pt-36 flex flex-col items-center text-center">
        <FadeUp>
          {/* Live status badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-6 backdrop-blur-md shadow-lg shadow-black/40">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>{t("cta.liveStatus")}</span>
          </div>

          {/* Headline */}
          <h2
            id="cta-title"
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 sm:mb-6 font-display rtl:font-arabic tracking-tight rtl:tracking-normal leading-[1.08] rtl:leading-[1.3] text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)] text-center"
          >
            {displayTitle}{" "}
            <span className="gradient-text-gold font-serif italic font-normal">
              {displayGradientText}
            </span>
          </h2>

          {/* Sub-copy */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-300 mb-8 sm:mb-10 max-w-2xl mx-auto text-balance leading-relaxed text-center">
            {displayDesc}
          </p>

          {/* Hub pills */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap">
            {HUBS.map((hub) => (
              <span
                key={hub.cityEn}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border border-white/10 bg-zinc-900/60 text-zinc-300 backdrop-blur-md"
              >
                <MapPin size={10} className="text-amber-400" />
                {hub.flag} {isArabic ? hub.cityAr : hub.cityEn}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
            <MagneticButton className="w-full sm:w-auto" strength={0.25} radius={90}>
              <Link
                href={primaryCtaHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full font-bold text-sm bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all duration-200 shadow-xl shadow-amber-500/25 whitespace-nowrap min-h-[44px]"
              >
                <Calendar size={15} />
                <span>{displayPrimaryText}</span>
                <ArrowRight size={15} className="rtl:rotate-180 shrink-0 transition-transform" />
              </Link>
            </MagneticButton>

            <MagneticButton className="w-full sm:w-auto" strength={0.25} radius={90}>
              <Link
                href={secondaryCtaHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm text-zinc-200 border border-white/15 bg-zinc-900/70 hover:bg-zinc-800 hover:border-white/25 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap"
              >
                <Video size={15} className="text-amber-400" />
                <span>{displaySecondaryText}</span>
              </Link>
            </MagneticButton>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}
