"use client";

import Link from "next/link";
import { Sparkles, Calendar, MessageSquare, ArrowRight, MapPin } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutCtaBanner() {
  const { t, isArabic } = useLanguage();

  return (
    <FadeUp delay={0.1}>
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-r from-brand-purple/20 via-slate-950 to-slate-900 p-8 sm:p-12 lg:p-16 text-center shadow-2xl shadow-black/60 mb-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 size-72 bg-brand-purple/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 size-72 bg-brand-cyan/20 rounded-full blur-[100px] pointer-events-none" />
        <BorderBeam size={260} duration={12} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 mb-6 backdrop-blur-md">
            <Sparkles size={13} />
            <span>{t("about.cta.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight mb-4">
            {t("about.cta.title")}{" "}
            <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
              {t("about.cta.titleGradient")}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto mb-8">
            {t("about.cta.desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <ShimmerButton
              asChild
              shimmerColor="var(--brand-purple-light)"
              shimmerDuration="2.5s"
              className="w-full sm:w-auto px-7 py-3.5 text-xs font-bold gap-2 min-h-[44px]"
            >
              <Link href="/studio-booking" className="inline-flex items-center gap-2 whitespace-nowrap">
                <Calendar size={15} />
                <span>{t("about.cta.bookTour")}</span>
                <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
              </Link>
            </ShimmerButton>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-xs text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap"
            >
              <MessageSquare size={14} className="text-brand-cyan" />
              <span>{t("about.cta.talkTeam")}</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-brand-purple-light" />
              Iris Bay Tower, Business Bay, Dubai
            </span>
            <span>•</span>
            <span className="font-mono text-emerald-400">
              {isArabic ? "الحجوزات مفتوحة للربع 3 و 4 2026" : "Bookings Active Q3/Q4 2026"}
            </span>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
