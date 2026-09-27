"use client";

import React from "react";
import Image from "next/image";
import { Award, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";

export function EnterpriseTrustLogos() {
  return (
    <section
      aria-label="Government Accreditations & Enterprise Partners"
      className="relative py-14 sm:py-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl overflow-hidden select-none"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left & Right Smooth Edge Fade Out Masks for Marquees */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20" />

      <Container className="relative z-10 max-w-6xl mb-8 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-brand-gold mb-3 backdrop-blur-md">
          <Award size={13} className="text-brand-gold" />
          <span>OFFICIAL GOVERNMENT ACCREDITATION &amp; CLIENTELE</span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight mb-2">
          Trusted by Gulf Ministries, Sovereign Entities &amp; Telecom Giants
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl mx-auto">
          Yas Pro operates high-security cleared production units, SMPTE fiber broadcast infrastructure, and turnkey national campaigns for premier regional authorities.
        </p>
      </Container>

      {/* Row 1: Sovereign & Government Entity Logo Cards */}
      <div className="w-full relative z-10 mb-6 sm:mb-8">
        <Marquee pauseOnHover repeat={4} gap="1.5rem" className="[--duration:36s] py-2 items-center">
          {GOV_LOGOS.map((gov) => (
            <div
              key={gov.id}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-brand-purple/40 backdrop-blur-md transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-brand-purple/10"
              title={gov.name}
            >
              <div className="relative h-10 sm:h-12 w-28 sm:w-32 flex items-center justify-center shrink-0">
                <Image
                  src={gov.logo}
                  alt={gov.name}
                  width={150}
                  height={50}
                  className="max-h-full max-w-full h-auto w-auto object-contain filter group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all duration-300"
                />
              </div>
              <div className="hidden md:flex flex-col text-left border-l border-white/10 pl-3">
                <span className="text-[11px] font-bold text-white group-hover:text-brand-purple-lighter transition-colors max-w-[140px] truncate">
                  {gov.name}
                </span>
                <span className="text-[9px] font-mono text-text-muted flex items-center gap-1">
                  <ShieldCheck size={10} className="text-emerald-400" />
                  <span>Sovereign Partner</span>
                </span>
              </div>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Row 2: Multinational Telecom, Enterprise & Tech Summits (Reverse Scroll) */}
      <div className="w-full relative z-10">
        <Marquee pauseOnHover reverse repeat={4} gap="1.5rem" className="[--duration:38s] py-2 items-center">
          {BRAND_LOGOS.slice(0, 8).map((brand) => (
            <div
              key={brand.id}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.07] hover:border-brand-cyan/40 backdrop-blur-md transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-brand-cyan/10"
              title={brand.name}
            >
              <div className="relative h-9 sm:h-11 w-28 sm:w-32 flex items-center justify-center shrink-0">
                {brand.svg ? (
                  <div
                    className="flex items-center justify-center filter group-hover:drop-shadow-[0_0_14px_rgba(6,182,212,0.6)] transition-all duration-300"
                    dangerouslySetInnerHTML={{ __html: brand.svg }}
                  />
                ) : (
                  <Image
                    src={brand.logo!}
                    alt={brand.name}
                    width={140}
                    height={44}
                    className="max-h-full max-w-full h-auto w-auto object-contain filter group-hover:brightness-110 group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all duration-300"
                  />
                )}
              </div>
              <div className="hidden md:flex flex-col text-left border-l border-white/10 pl-3">
                <span className="text-[11px] font-bold text-white group-hover:text-brand-cyan transition-colors max-w-[130px] truncate">
                  {brand.name}
                </span>
                <span className="text-[9px] font-mono text-text-muted flex items-center gap-1">
                  <Sparkles size={10} className="text-brand-cyan" />
                  <span>Enterprise Client</span>
                </span>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
