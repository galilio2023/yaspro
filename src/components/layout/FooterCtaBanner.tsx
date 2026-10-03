"use client";

import Link from "next/link";
import { ArrowRight, Video, Calendar } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function FooterCtaBanner() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-[#0c0b10] backdrop-blur-2xl p-8 sm:p-12 mb-16 overflow-hidden shadow-2xl shadow-black/80">
      {/* Border Beam Animation */}
      <BorderBeam
        size={280}
        duration={12}
        delay={1}
        colorFrom="#f59e0b"
        colorTo="#d97706"
      />

      {/* Atmospheric ambient lighting */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Column: Copy & Live Status */}
        <div className="max-w-2xl text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] sm:text-xs font-mono uppercase tracking-wider rtl:font-arabic rtl:tracking-normal text-amber-400 font-semibold mb-4 backdrop-blur-md whitespace-nowrap shrink-0 max-w-full">
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </span>
            <span className="whitespace-nowrap font-latin rtl:font-arabic">{t("footerCta.badge")}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight rtl:tracking-normal font-display rtl:font-arabic leading-[1.15] rtl:leading-[1.35] mb-3">
            {t("footerCta.title")}{" "}
            <span className="gradient-text-gold">
              {t("footerCta.titleGradient")}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {t("footerCta.description")}
          </p>
        </div>

        {/* Right Column: High-conversion actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0">
          <Link
            href="/studio-booking"
            className="w-full sm:w-auto btn-brand px-7 py-3.5 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2"
          >
            <Calendar size={15} />
            <span>{t("footerCta.bookStudio")}</span>
            <ArrowRight size={15} className="rtl:rotate-180" />
          </Link>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm"
          >
            <Video size={15} className="text-amber-400" />
            <span>{t("footerCta.talkProducers")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
