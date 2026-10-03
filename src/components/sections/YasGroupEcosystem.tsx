"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { YAS_GROUP_COMPANIES, YasGroupCompany } from "@/features/group/data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function YasGroupEcosystem() {
  const { isArabic } = useLanguage();

  return (
    <section
      id="conglomerate-ecosystem"
      aria-label="Yas Pro Media Group Conglomerate Ecosystem"
      className="relative w-full py-16 sm:py-24 bg-[#08080c] border-t border-white/[0.08] overflow-hidden film-grain select-none"
    >
      {/* Volumetric ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono uppercase tracking-wider font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-400 mb-4 backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            </span>
            <span>
              {isArabic
                ? "المظلة الإعلامية الكبرى • 7 قطاعات إنتاجية متخصصة"
                : "HOLDING CONGLOMERATE • 7 SPECIALIZED ENTERPRISES"}
            </span>
          </div>

          <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display rtl:font-arabic tracking-tight mb-4 leading-tight">
            {isArabic ? (
              <>
                منظومة إعلامية موحدة تقود الإنتاج في{" "}
                <span className="gradient-text-gold font-serif italic font-normal">
                  الإمارات والشرق الأوسط
                </span>
              </>
            ) : (
              <>
                One Holding Network.{" "}
                <span className="gradient-text-gold font-serif italic font-normal">
                  Infinite Media Capabilities.
                </span>
              </>
            )}
          </h3>

          <p className="text-xs sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "تعمل شركات مجموعة ياس برو بتناغم رقمي ولوجستي كامل؛ لتقديم حلول سيادية وإنتاج سينمائي متكامل تحت سقف واحد."
              : "Operating in unified cinematic synchronization — from soundstage infrastructure and OB broadcast vans to talent management, music composition, and original IP."}
          </p>
        </div>

        {/* 7-Pillar Studio Switchboard Rack */}
        <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-3.5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {YAS_GROUP_COMPANIES.map((company: YasGroupCompany, index: number) => {
            const callsign = String(index + 1).padStart(2, "0");
            return (
              <Link
                key={company.id}
                href="/about#conglomerate"
                className="group relative flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c0d14]/90 hover:bg-[#12131d] hover:border-amber-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/80 cursor-pointer min-w-[210px] sm:min-w-0 snap-center overflow-hidden"
              >
                {/* Top Subtle Accent Bar on Hover */}
                <div
                  className="absolute top-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: company.accentColor }}
                />

                {/* Callsign & Tag */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-mono font-bold text-zinc-500 group-hover:text-amber-400 transition-colors">
                      CH.{callsign}
                    </span>
                    <span
                      className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border border-white/8 bg-white/[0.02] text-zinc-400 truncate max-w-[100px]"
                      title={company.tags[0]}
                    >
                      {company.tags[0]}
                    </span>
                  </div>

                  {/* Logo Mark Stage */}
                  <div className="relative h-12 w-full flex items-center justify-center my-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors p-2">
                    <Image
                      src={company.logo}
                      alt={isArabic ? company.nameAr : company.name}
                      width={140}
                      height={44}
                      className="max-h-full max-w-full h-auto w-auto object-contain opacity-75 group-hover:opacity-100 filter group-hover:brightness-110 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Division Title & Direction Arrow */}
                <div className="pt-3 border-t border-white/5">
                  <div className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {isArabic ? company.divisionAr : company.division}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 group-hover:text-zinc-400 transition-colors">
                    {isArabic ? company.nameAr : company.name}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 group-hover:text-amber-400 transition-colors">
                    <span>{isArabic ? "استكشف" : "EXPLORE"}</span>
                    <ArrowRight size={11} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Editorial Link to Holding Page */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-md">
          <div className="flex items-center gap-3 text-start">
            <div className="size-8 sm:size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isArabic ? "مظلة إنتاجية مرخصة ومعتمدة في الإمارات" : "Fully Licensed & Accredited Media Holding in the UAE"}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                DUBAI • CAIRO • AMMAN · ISO 9001 · SMPTE · MAWTHOOQ
              </span>
            </div>
          </div>

          <Link
            href="/about#conglomerate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{isArabic ? "عرض الهيكل التنظيمي الكامل للمجموعة" : "View Full Holding Structure"}</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
