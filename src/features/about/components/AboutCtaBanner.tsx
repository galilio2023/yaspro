"use client";

import Link from "next/link";
import { Calendar, MessageSquare, ArrowRight } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutCtaBanner() {
  const { t } = useLanguage();

  return (
    <FadeUp delay={0.1}>
      <div className="relative rounded-3xl overflow-hidden border border-white/12 bg-zinc-950 p-8 sm:p-12 lg:p-16 text-center shadow-2xl shadow-black/80 mb-8 film-grain">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider rtl:font-arabic rtl:tracking-normal text-amber-400 bg-amber-500/10 border border-amber-500/30 mb-6 backdrop-blur-md whitespace-nowrap shrink-0 max-w-full">
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </span>
            <span className="whitespace-nowrap font-latin rtl:font-arabic">{t("about.cta.badge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight mb-4">
            {t("about.cta.title")}{" "}
            <span className="text-amber-400 font-serif italic font-normal">
              {t("about.cta.titleGradient")}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl mx-auto mb-8">
            {t("about.cta.desc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
            <Link
              href="/studio-booking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs text-zinc-950 bg-amber-500 hover:bg-amber-400 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-amber-500/25 whitespace-nowrap min-h-[44px]"
            >
              <Calendar size={15} />
              <span>{t("about.cta.bookTour")}</span>
              <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-xs text-zinc-200 border border-white/15 bg-zinc-900/70 hover:bg-zinc-800 hover:border-white/25 transition-all text-center backdrop-blur-md min-h-[44px] whitespace-nowrap active:scale-[0.97]"
            >
              <MessageSquare size={14} className="text-amber-400" />
              <span>{t("about.cta.talkTeam")}</span>
            </Link>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}
