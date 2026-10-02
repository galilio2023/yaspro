"use client";

import React from "react";
import { ArrowRight, ShieldCheck, Radio, FileText, Cpu } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ENTERPRISE_STATS } from "../data";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface EnterpriseHeroProps {
  onOpenRfp: () => void;
  onOpenCopilot?: () => void;
}

export function EnterpriseHero({ onOpenRfp, onOpenCopilot }: EnterpriseHeroProps) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-20 pb-10 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24 border-b border-white/8 bg-background film-grain">
      <Container className="relative z-10 max-w-6xl">
        {/* Top Sovereign Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-8 px-1">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold tracking-wide border border-white/12 bg-zinc-900/80 text-zinc-200 backdrop-blur-md">
            <span className="size-1.5 sm:size-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{t("enterprise.statusDubai")}</span>
          </div>

          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border border-white/10 bg-zinc-900/60 text-zinc-300 backdrop-blur-md">
            <Radio size={12} className="text-amber-400 shrink-0" />
            <span>{t("enterprise.statusObVan")}</span>
          </div>

          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border border-white/10 bg-zinc-900/60 text-zinc-300 backdrop-blur-md">
            <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
            <span>{t("enterprise.statusMawthooq")}</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="page-hero-title mb-6">
            {t("enterprise.title1")} <br className="hidden sm:inline" />
            <span className="gradient-text-gold font-serif italic font-normal">
              {t("enterprise.titleGradient")}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            {t("enterprise.subtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-16">
          {onOpenCopilot && (
            <button
              type="button"
              onClick={onOpenCopilot}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97]"
            >
              <Cpu size={16} className="text-zinc-950" />
              <span>{t("enterprise.launchCopilot")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenRfp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full font-semibold text-sm bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 border border-white/15 hover:border-white/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97]"
          >
            <FileText size={15} className="text-amber-400" />
            <span>{t("enterprise.submitRfp")}</span>
            <ArrowRight size={15} className="rtl:rotate-180" />
          </button>

          <a
            href="#virtual-simulator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
          >
            <span>{t("enterprise.virtualStageSim")}</span>
          </a>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/8 bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/60">
          {ENTERPRISE_STATS.map((stat) => (
            <div key={stat.label} className="p-3 sm:p-4 text-center rounded-xl bg-white/[0.02] lg:bg-transparent border border-white/5 lg:border-none">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-mono tracking-tight mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-zinc-200 mb-0.5">{stat.label}</div>
              <div className="text-[10px] sm:text-xs text-zinc-400">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
