"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Radio, FileText } from "lucide-react";

import { Container } from "@/components/ui/container";
import { ENTERPRISE_STATS } from "../data";

interface EnterpriseHeroProps {
  onOpenRfp: () => void;
}

export function EnterpriseHero({ onOpenRfp }: EnterpriseHeroProps) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-white/10 bg-slate-950">
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
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wide border border-brand-purple/40 bg-brand-purple/10 text-brand-purple-light backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DUBAI SOUNDSTAGE: LIVE GENLOCK</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium border border-white/10 bg-white/5 text-text-secondary backdrop-blur-md">
            <Radio size={12} className="text-brand-cyan" />
            <span>OB-VAN FLEET: DEPLOYMENT READY</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-md">
            <ShieldCheck size={13} className="text-emerald-400" />
            <span>KSA GAMR MAWTHOOQ CERTIFIED</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 font-display">
            Sovereign Media Operations & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-cyan to-brand-gold bg-clip-text text-transparent">
              Enterprise Cloud Production
            </span>
          </h1>

          <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            The Gulf’s premier media infrastructure. End-to-end Unreal Engine 5.4 virtual production, outside broadcast fleet, and Mawthooq-audited creator campaigns for GCC giga-projects, ministries, and global brands.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onOpenRfp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-brand-purple-light hover:to-indigo-500 text-white shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText size={16} />
            <span>Submit Enterprise RFP / Tender</span>
            <ArrowRight size={15} />
          </button>

          <Link
            href="#virtual-simulator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/30 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Sparkles size={16} className="text-brand-cyan" />
            <span>Launch Virtual Stage Simulator</span>
          </Link>
        </div>

        {/* Executive KPI Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
          {ENTERPRISE_STATS.map((stat) => (
            <div key={stat.label} className="p-3 sm:p-4 text-center border-r border-white/5 last:border-r-0">
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
