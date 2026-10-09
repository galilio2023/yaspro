"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
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

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight mb-4 rtl:leading-tight">
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

            return (
              <motion.article
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`group relative rounded-3xl border p-6 sm:p-8 flex flex-col justify-between backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] shadow-xl ${
                  isHolding
                    ? "md:col-span-2 lg:col-span-3 border-brand-mauve/40 bg-gradient-to-r from-card via-brand-violet-dark/30 to-card shadow-brand-violet/20"
                    : "border-border/40 bg-card/60 hover:bg-card hover:border-brand-mauve/30 shadow-black/40"
                }`}
              >
                <div>
                  {/* Top Bar: Brand Logo & Holding Status / Index */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-4">
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

                    {isHolding ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-brand-mauve bg-brand-violet/25 border border-brand-mauve/30 shadow-sm shrink-0 whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-brand-mauve animate-pulse" />
                        {isArabic ? "الشركة الأم" : "HOLDING HQ"}
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-widest shrink-0 font-latin">
                        0{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Division Badge: Unconstrained Dedicated Row */}
                  <div className="mb-4 flex items-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-medium border border-brand-mauve/25 bg-brand-violet/15 text-brand-mauve whitespace-nowrap shadow-sm max-w-full">
                      <span className="size-1.5 rounded-full bg-brand-mauve/70 shrink-0" />
                      <span className="truncate">{isArabic ? company.divisionAr : company.division}</span>
                    </span>
                  </div>

                  {/* Company Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display group-hover:text-brand-mauve transition-colors flex items-center gap-2">
                    <span>{isArabic ? company.nameAr : company.name}</span>
                    {isHolding && (
                      <span className="size-2 rounded-full bg-brand-mauve animate-pulse" />
                    )}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                    {isArabic ? company.descriptionAr : company.description}
                  </p>
                </div>

                {/* Capability Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/8">
                  {company.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[10px] sm:text-[11px] font-mono text-zinc-400 bg-black/40 px-2.5 py-1 rounded-md border border-white/5"
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
