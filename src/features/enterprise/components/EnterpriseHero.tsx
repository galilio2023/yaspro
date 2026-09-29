"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Radio, FileText } from "lucide-react";

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
    <section className="relative overflow-hidden pt-20 pb-10 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-24 border-b border-white/10 bg-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none opacity-25 bg-gradient-to-tr from-brand-purple via-indigo-600 to-brand-cyan blur-3xl" />
      <div className="absolute -top-10 -right-10 w-[400px] h-[400px] rounded-full pointer-events-none opacity-15 bg-brand-cyan blur-3xl" />

      {/* Cyber Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <Container className="relative z-10 max-w-6xl">
        {/* Top Sovereign Status Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-8 px-1">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wide border border-brand-purple/40 bg-brand-purple/10 text-brand-purple-light backdrop-blur-md">
            <span className="size-1.5 sm:size-2 rounded-full bg-brand-teal shrink-0" />
            <span>{t("enterprise.statusDubai")}</span>
          </div>

          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border border-white/10 bg-white/5 text-text-secondary backdrop-blur-md">
            <Radio size={12} className="text-brand-cyan shrink-0" />
            <span>{t("enterprise.statusObVan")}</span>
          </div>

          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium border border-brand-teal/30 bg-brand-teal/15 text-brand-teal-light backdrop-blur-md">
            <ShieldCheck size={12} className="text-brand-teal shrink-0" />
            <span>{t("enterprise.statusMawthooq")}</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 font-display">
            {t("enterprise.title1")} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-cyan to-brand-gold bg-clip-text text-transparent">
              {t("enterprise.titleGradient")}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t("enterprise.subtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-16">
          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={16} className="text-brand-gold animate-pulse" />
              <span>{t("enterprise.launchCopilot")}</span>
            </button>
          )}

          <button
            onClick={onOpenRfp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          >
            <FileText size={16} />
            <span>{t("enterprise.submitRfp")}</span>
            <ArrowRight size={15} className="rtl:rotate-180" />
          </button>

          <a
            href="#virtual-simulator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-text-secondary hover:text-white flex items-center justify-center gap-2 transition-all duration-200"
          >
            <span>{t("enterprise.virtualStageSim")}</span>
          </a>
        </div>

        {/* Executive KPI Stats Bar: Clean 2x2 grid on mobile, 4-col on desktop without border leakage */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          {ENTERPRISE_STATS.map((stat) => (
            <div key={stat.label} className="p-3 sm:p-4 text-center rounded-xl bg-white/[0.02] lg:bg-transparent border border-white/5 lg:border-none">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono tracking-tight mb-1 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-brand-purple-light mb-0.5">{stat.label}</div>
              <div className="text-[10px] sm:text-xs text-text-secondary">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
