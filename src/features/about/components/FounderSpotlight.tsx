"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FOUNDER_PROFILE } from "../data";
import { SectionHeader } from "@/components/ui/section-header";
import { Quote, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";

interface FounderSpotlightProps {
  headingId?: string;
}

export function FounderSpotlight({ headingId }: FounderSpotlightProps) {
  const { t, isArabic } = useLanguage();
  const founder = FOUNDER_PROFILE;

  return (
    <div className="mb-20 sm:mb-28">
      <SectionHeader
        headingId={headingId}
        title={t("about.teamTitle")}
        gradientText={t("about.teamGradient")}
        description={t("about.teamDesc")}
      />

      <div className="mt-12 sm:mt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-border/40 bg-card/75 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-black/50 group"
        >
          {/* Subtle ambient lighting aura behind card */}
          <div
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-brand-violet/15 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-brand-mauve/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* ── Left / Start Column: Founder Identity & Telemetry (5 cols) ── */}
            <div className="lg:col-span-5 p-7 sm:p-9 lg:p-10 border-b lg:border-b-0 lg:border-e border-white/10 flex flex-col justify-between bg-black/20">
              <div>
                {/* Executive Status Header */}
                <div className="flex items-center justify-between gap-3 mb-8 pb-4 border-b border-white/10">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10.5px] font-mono uppercase tracking-wider text-brand-mauve bg-brand-violet/20 border border-brand-mauve/30">
                    <span className="size-1.5 rounded-full bg-brand-mauve animate-pulse" />
                    <span>{isArabic ? "المكتب التنفيذي • دبي" : "EXECUTIVE OFFICE • DUBAI"}</span>
                  </span>

                  <span className="font-mono text-[11px] text-zinc-400 font-latin" dir="ltr">
                    EST. 2015
                  </span>
                </div>

                {/* Monogram Seal & Aperture Ring */}
                <div className="flex flex-col items-center text-center my-6">
                  <div className="relative mb-5 group-hover:scale-105 transition-transform duration-500">
                    {/* Outer atmospheric aura */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-violet to-brand-mauve opacity-40 blur-lg" />

                    {/* Circular Aperture Portrait / Monogram Seal */}
                    <div className="relative size-32 sm:size-36 rounded-full border-2 border-brand-mauve/40 bg-zinc-950 p-1.5 shadow-2xl flex items-center justify-center overflow-hidden">
                      {founder.image ? (
                        <div className="relative size-full rounded-full overflow-hidden bg-zinc-900">
                          <Image
                            src={founder.image}
                            alt={isArabic ? founder.nameAr : founder.nameEn}
                            fill
                            sizes="(max-width: 640px) 128px, 144px"
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            priority
                          />
                          <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
                        </div>
                      ) : (
                        <div className="size-full rounded-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 flex flex-col items-center justify-center">
                          <span
                            className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider font-latin"
                            dir="ltr"
                          >
                            {founder.initials}
                          </span>
                          <span className="text-[9px] font-mono text-brand-mauve uppercase tracking-widest mt-0.5 font-latin" dir="ltr">
                            YAS PRO
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Verified Shield Badge */}
                    <div className="absolute -bottom-1 -end-1 size-8 rounded-full bg-brand-violet border-2 border-background flex items-center justify-center text-brand-mauve shadow-md">
                      <ShieldCheck size={16} />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-1">
                    {isArabic ? founder.nameAr : founder.nameEn}
                  </h3>

                  <p className="text-xs sm:text-sm font-semibold text-brand-mauve font-mono mb-1">
                    {isArabic ? founder.roleAr : founder.roleEn}
                  </p>

                  <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
                    <Building2 size={13} className="text-brand-mauve shrink-0" />
                    <span>{isArabic ? founder.orgAr : founder.orgEn}</span>
                  </p>
                </div>
              </div>

              {/* Leadership Focus Areas */}
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-2.5 sm:gap-3">
                {founder.focusAreas.map((area, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-mauve/25 transition-colors text-start"
                  >
                    <div className="text-xs font-bold text-white mb-1 leading-snug">
                      {isArabic ? area.titleAr : area.titleEn}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight">
                      {isArabic ? area.detailAr : area.detailEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right / End Column: Executive Vision & Track Record (7 cols) ── */}
            <div className="lg:col-span-7 p-7 sm:p-9 lg:p-10 flex flex-col justify-between text-start">
              <div>
                {/* Vision Quote Header */}
                <div className="mb-6 flex items-start gap-4">
                  <div className="size-11 rounded-2xl bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve shrink-0 mt-1 shadow-inner">
                    <Quote size={20} className="rtl:rotate-180" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-mono uppercase tracking-widest text-brand-mauve block mb-1">
                      {isArabic ? "الرؤية والرسالة الاستراتيجية" : "EXECUTIVE VISION STATEMENT"}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-white font-display rtl:leading-snug">
                      {isArabic
                        ? "قيادة الإعلام العربي نحو عصر الإنتاج الافتراضي"
                        : "Pioneering Sovereign Arab Media & Virtual Production"}
                    </h4>
                  </div>
                </div>

                {/* Editorial Quote */}
                <blockquote className="rounded-2xl bg-white/[0.02] border border-white/8 p-5 sm:p-6 mb-7 relative">
                  <p className="text-base sm:text-lg lg:text-xl text-white font-serif italic font-normal leading-relaxed text-balance rtl:font-sans rtl:not-italic rtl:leading-loose">
                    &ldquo;{isArabic ? founder.quoteAr : founder.quoteEn}&rdquo;
                  </p>
                  <footer className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-bold text-zinc-200">
                      {isArabic ? founder.nameAr : founder.nameEn}
                    </span>
                    <span className={`text-brand-mauve font-mono text-[11px] ${isArabic ? "font-arabic" : "font-latin"}`}>
                      {isArabic ? "دبي" : "DUBAI"} • <bdi dir="ltr">2026</bdi>
                    </span>
                  </footer>
                </blockquote>

                {/* Executive Credentials & Proven Track Record */}
                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-2">
                    {isArabic ? "سجل الإنجاز والمسؤوليات القيادية:" : "Executive Stewardship & Track Record:"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(isArabic ? founder.credentialsAr : founder.credentialsEn).map((cred, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-200 leading-relaxed rtl:leading-relaxed"
                      >
                        <CheckCircle2 size={15} className="text-brand-mauve shrink-0 mt-0.5" />
                        <span>{cred}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Verification Seal */}
              <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <ShieldCheck size={14} className="text-brand-mauve" />
                  <span>{isArabic ? "معتمد رسمياً بالمجلس الوطني للإعلام" : "Licensed Under UAE NMC Regulations"}</span>
                </span>
                <span className="font-latin text-brand-mauve" dir="ltr">
                  OFFICE OF THE CEO • YAS PRO MEDIA GROUP
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
