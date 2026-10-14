"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, Radio, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { YAS_GROUP_COMPANIES, YasGroupCompany } from "../data";

export function YasGroupShowcase() {
  const { isArabic } = useLanguage();

  return (
    <section
      id="conglomerate"
      aria-label={isArabic ? "شركات مجموعة ياس برو الإعلامية" : "Yas Pro Media Group Companies"}
      className="relative py-16 sm:py-24 lg:py-32 bg-background border-t border-border/40 overflow-hidden"
    >
      {/* Background ambient lighting (GPU hardware-accelerated radial gradient) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(118,80,134,0.15) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border border-brand-mauve/30 bg-brand-violet/20 text-brand-mauve mb-4 backdrop-blur-md">
            <Building2 size={13} className="text-brand-mauve" />
            <span>
              {isArabic ? "المجموعة القابضة والشركات التابعة" : "YAS MEDIA GROUP ECOSYSTEM"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight mb-3 sm:mb-4 rtl:leading-tight">
            {isArabic
              ? "منظومة إعلامية متكاملة تقود صناعة المحتوى في الخليج"
              : "A Multi-Disciplinary Media Conglomerate"}
          </h2>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "تضم مجموعة ياس برو شبكة متخصصة من الشركات الشقيقة التي تغطي كافة مجالات الإنتاج السينمائي، البث التلفزيوني، الوكالات الإبداعية، إدارة المشاهير، والتسجيل الصوتي."
              : "Yas Pro Media Group unites specialized sister enterprises spanning cinema production, broadcast soundstages, creative strategy, celebrity talent management, and spatial audio."}
          </p>
        </div>

        {/* Subsidiaries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {YAS_GROUP_COMPANIES.map((company: YasGroupCompany, idx: number) => {
            const isHolding = company.id === "media-group";

            if (isHolding) {
              return (
                <motion.article
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  className="md:col-span-2 lg:col-span-3 relative rounded-3xl border border-brand-mauve/30 hover:border-brand-mauve/50 bg-gradient-to-br from-card via-[#131018] to-card/95 backdrop-blur-2xl p-6 sm:p-9 lg:p-10 shadow-2xl shadow-brand-violet/15 transition-all duration-500 overflow-hidden group text-start"
                >
                  {/* Ambient background key light aura */}
                  <div
                    className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-violet/15 blur-3xl pointer-events-none"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-mauve/10 blur-3xl pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    {/* ── Left / Start Column: Identity, Logo, Titles (5 cols) ── */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full">
                      <div>
                        {/* Top Holding Badge & Indicator */}
                        <div className="flex items-center mb-6">
                          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-brand-mauve bg-brand-violet/25 border border-brand-mauve/35 shadow-sm">
                            <span className="relative flex size-2 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mauve opacity-75" />
                              <span className="relative inline-flex rounded-full size-2 bg-brand-mauve" />
                            </span>
                            <span>{isArabic ? "المظلة القابضة • دبي" : "PARENT HOLDING HQ • DUBAI"}</span>
                          </span>
                        </div>

                        {/* Brand Logo in High-End Slate Frame */}
                        <div
                          dir="ltr"
                          className="relative h-16 sm:h-20 w-56 sm:w-64 p-3 rounded-2xl bg-zinc-950/90 border border-white/10 group-hover:border-brand-mauve/40 transition-colors shadow-2xl flex items-center justify-center mb-6"
                        >
                          <Image
                            src={company.logo}
                            alt={company.name}
                            width={256}
                            height={96}
                            className="max-h-full max-w-full h-auto w-auto object-contain filter group-hover:brightness-110 transition-all duration-300"
                            priority
                          />
                        </div>

                        {/* Division Badge */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border border-brand-mauve/25 bg-brand-violet/15 text-brand-mauve whitespace-nowrap shadow-sm">
                            <span className="size-1.5 rounded-full bg-brand-mauve/80 shrink-0" />
                            <span>{isArabic ? company.divisionAr : company.division}</span>
                          </span>
                        </div>

                        {/* Company Name */}
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight group-hover:text-brand-mauve transition-colors rtl:leading-snug">
                          {isArabic ? company.nameAr : company.name}
                        </h3>
                      </div>
                    </div>

                    {/* ── Right / End Column: Strategic Overview, Metrics, Tags (7 cols) ── */}
                    <div className="lg:col-span-7 flex flex-col justify-between h-full lg:border-s lg:border-white/10 lg:ps-8 xl:ps-12">
                      <div>
                        <span className={`text-[10.5px] font-mono uppercase tracking-widest text-brand-mauve block mb-2 ${isArabic ? "font-arabic" : "font-latin"}`} dir={isArabic ? "rtl" : "ltr"}>
                          {isArabic ? "الرؤية والمنظومة الشاملة" : "CONGLOMERATE ECOSYSTEM"}
                        </span>

                        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed rtl:leading-loose mb-7">
                          {isArabic ? company.descriptionAr : company.description}
                        </p>

                        {/* Conglomerate Strategic Capability Pillars */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 mb-7">
                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-start flex flex-col justify-between">
                            <div className="size-8 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve mb-2.5">
                              <ShieldCheck size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">
                                {isArabic ? "الإنتاج السيادي والحكومي" : "Sovereign Operations"}
                              </div>
                              <div className="text-[10.5px] text-zinc-400 leading-snug">
                                {isArabic ? "شريك معتمد للمشاريع الوطنية" : "Accredited for National Tenders"}
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-start flex flex-col justify-between">
                            <div className="size-8 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve mb-2.5">
                              <Radio size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">
                                {isArabic ? "بث مباشر وأساطيل OB-VAN" : "Live Broadcast Fleets"}
                              </div>
                              <div className="text-[10.5px] text-zinc-400 leading-snug">
                                {isArabic ? "تغطية فورية عبر الألياف البصرية" : "SMPTE Fiber & Satellite Uplink"}
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-start flex flex-col justify-between">
                            <div className="size-8 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve mb-2.5">
                              <Sparkles size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white mb-0.5">
                                {isArabic ? "منظومة المواهب والمحتوى" : "Creator & IP Ecosystem"}
                              </div>
                              <div className="text-[10.5px] text-zinc-400 leading-snug">
                                {isArabic ? "ترخيص موثوق وإدارة المشاهير" : "Mawthooq Certified Talent Network"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Holding Capability Tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/8">
                        <span className="text-[11px] font-mono text-zinc-500 me-1">
                          {isArabic ? "المحاور:" : "Domains:"}
                        </span>
                        {((isArabic && company.tagsAr) ? company.tagsAr : company.tags).map((tag: string) => (
                          <span
                            key={tag}
                            dir={isArabic && company.tagsAr ? "rtl" : "ltr"}
                            className={`text-[10.5px] sm:text-xs font-mono text-brand-mauve bg-brand-violet/20 px-3 py-1 rounded-md border border-brand-mauve/25 inline-flex items-center ${
                              isArabic && company.tagsAr ? "font-arabic" : "font-latin"
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            }

            // Subsidiary Entity Card
            return (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="group relative rounded-3xl border border-white/10 hover:border-brand-mauve/40 bg-card/60 hover:bg-card/85 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl hover:shadow-brand-violet/10 shadow-black/40 text-start"
              >
                <div>
                  {/* Top Bar: Brand Logo */}
                  <div className="flex items-center mb-5">
                    {/* Fixed physical LTR container for brand logo */}
                    <div
                      dir="ltr"
                      className="relative h-12 sm:h-14 w-44 sm:w-52 p-2 rounded-xl bg-card border border-white/10 flex items-center justify-center shrink-0 group-hover:border-brand-mauve/40 transition-colors shadow-inner"
                    >
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={234}
                        height={86}
                        className="max-h-full max-w-full h-auto w-auto object-contain filter group-hover:brightness-110 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Division Badge */}
                  <div className="mb-3.5 flex items-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border border-brand-mauve/25 bg-brand-violet/15 text-brand-mauve whitespace-nowrap shadow-sm max-w-full">
                      <span className="size-1.5 rounded-full bg-brand-mauve/70 shrink-0" />
                      <span className="truncate">{isArabic ? company.divisionAr : company.division}</span>
                    </span>
                  </div>

                  {/* Company Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display group-hover:text-brand-mauve transition-colors rtl:leading-snug">
                    <span>{isArabic ? company.nameAr : company.name}</span>
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed rtl:leading-relaxed mb-6">
                    {isArabic ? company.descriptionAr : company.description}
                  </p>
                </div>

                {/* Capability Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/8">
                  {((isArabic && company.tagsAr) ? company.tagsAr : company.tags).map((tag: string) => (
                    <span
                      key={tag}
                      dir={isArabic && company.tagsAr ? "rtl" : "ltr"}
                      className={`text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 inline-flex items-center ${
                        isArabic && company.tagsAr ? "font-arabic" : "font-latin"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
