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
      className="relative py-16 sm:py-24 lg:py-32 bg-zinc-950 border-t border-white/10 overflow-hidden"
    >
      {/* Background ambient lighting (GPU hardware-accelerated radial gradient) */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400 mb-4 backdrop-blur-md">
            <Building2 size={13} className="text-amber-400" />
            <span>
              {isArabic ? "المجموعة القابضة والشركات التابعة" : "YAS MEDIA GROUP ECOSYSTEM"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight mb-4 rtl:leading-tight">
            {isArabic
              ? "منظومة إعلامية متكاملة تقود صناعة المحتوى في الخليج"
              : "A Multi-Disciplinary Media Conglomerate"}
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
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
                    ? "md:col-span-2 lg:col-span-3 border-amber-500/40 bg-gradient-to-r from-zinc-950 via-amber-950/20 to-zinc-950 shadow-amber-500/10"
                    : "border-white/10 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-amber-500/30 shadow-black/40"
                }`}
              >
                <div>
                  {/* Top Bar: Brand Logo & Division */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 mb-6">
                    {/* Fixed physical LTR container for brand logo */}
                    <div
                      dir="ltr"
                      className="relative h-12 sm:h-14 w-44 sm:w-52 p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-amber-500/40 transition-colors"
                    >
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={234}
                        height={86}
                        className="max-h-full max-w-full h-auto w-auto object-contain filter group-hover:brightness-110 transition-all duration-300"
                      />
                    </div>

                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-300 shrink max-w-full break-words text-center">
                      {isArabic ? company.divisionAr : company.division}
                    </span>
                  </div>

                  {/* Company Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-display group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>{isArabic ? company.nameAr : company.name}</span>
                    {isHolding && (
                      <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
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
