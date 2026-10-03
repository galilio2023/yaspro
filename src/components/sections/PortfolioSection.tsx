"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Award, Play, Film, Sparkles, Tv, Eye, ArrowUpRight, Clapperboard } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { PROJECTS_DATA, PROJECT_CATEGORIES } from "@/features/projects/data";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectItem, ProjectCategory } from "@/features/projects/types";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";
import { studioSprings } from "@/lib/studio-motion";

interface PortfolioSectionProps {
  limit?: number;
}

export function PortfolioSection({ limit = 9 }: PortfolioSectionProps) {
  const { t, isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [selectedVideoProject, setSelectedVideoProject] = useState<ProjectItem | null>(null);
  const [selectedSpotlightId, setSelectedSpotlightId] = useState<string | null>(null);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    const list =
      activeCategory === "all"
        ? PROJECTS_DATA
        : PROJECTS_DATA.filter((p) => p.category === activeCategory);
    return list.slice(0, limit);
  }, [activeCategory, limit]);

  // Derive active spotlight project (defaults to first filtered project, or user selection)
  const spotlightProject = useMemo(() => {
    if (selectedSpotlightId) {
      const found = filteredProjects.find((p) => p.id === selectedSpotlightId);
      if (found) return found;
    }
    return filteredProjects[0] || PROJECTS_DATA[0];
  }, [selectedSpotlightId, filteredProjects]);

  // Extract camera/optics sensor metadata
  const spotlightOptics = useMemo(() => {
    if (!spotlightProject?.techStack || spotlightProject.techStack.length === 0) {
      return "ARRI 8K • COOKE ANAMORPHIC • 24FPS";
    }
    const stack = spotlightProject.techStack;
    const camera = stack[0] || "CINEMA 8K RAW";
    const lensOrAudio = stack[1] || "COOKE ANAMORPHIC";
    return `${camera} • ${lensOrAudio}`.toUpperCase();
  }, [spotlightProject]);

  const hasSpotlightVideo = Boolean(spotlightProject?.vimeoId || spotlightProject?.videoUrl);

  return (
    <Section
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="bg-background border-t border-white/10 relative overflow-hidden py-16 sm:py-24"
    >
      {/* Hardware-friendly pre-rendered radial glow (Zero GPU blur convolution cost) */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <Container>
        {/* Section Header */}
        <SectionHeader
          headingId="portfolio-title"
          badge={t("portfolio.badge")}
          badgeVariant="gold"
          badgeIcon={<Award size={13} />}
          title={isArabic ? t("portfolio.title") : "Our Latest"}
          gradientText={isArabic ? t("portfolio.titleGradient") : "Masterpieces"}
          description={t("portfolio.description")}
        />

        {/* Category Filter Pills (Tactile Spring Physics) */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mb-10 sm:mb-12 overflow-x-auto p-1.5 bg-zinc-950/90 rounded-full border border-white/10 scrollbar-none -mx-4 px-4 sm:mx-auto sm:px-1.5 max-w-fit shadow-lg shadow-black/40">
          {PROJECT_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative px-4 py-2 min-h-[40px] rounded-full text-xs font-bold transition-colors duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center z-10",
                  isActive ? "text-zinc-950" : "text-zinc-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePortfolioPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-md shadow-amber-500/30 -z-10"
                    transition={studioSprings.snappy}
                  />
                )}
                <span>{isArabic ? (cat.arabicLabel || cat.label) : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* 🎬 Flagship Cinema Spotlight Stage (Premiere Feature) */}
        <FadeUp delay={0.05} className="mb-12 sm:mb-16">
          <div className="relative rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-zinc-950/95 shadow-2xl shadow-black/80 overflow-hidden">
            {/* Top Amber Accent Rail */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Large Cinema Screen (7 cols) */}
              <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto lg:min-h-[440px] bg-black overflow-hidden group">
                {spotlightProject.image ? (
                  <Image
                    key={spotlightProject.id}
                    src={spotlightProject.image}
                    alt={spotlightProject.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
                    <Film size={56} className="text-zinc-700" />
                  </div>
                )}

                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/60 pointer-events-none" />

                {/* Top Telemetry HUD */}
                <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/90 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{isArabic ? "العرض الرئيسي المميز" : "Spotlight Premiere"}</span>
                    </span>

                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/85 border border-white/10 text-[9px] font-mono text-zinc-300" dir="ltr">
                      <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>REC ● 3200K</span>
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-md bg-black/90 border border-white/15 text-[10px] font-mono text-zinc-300" dir="ltr">
                    4K DCI • MASTER
                  </span>
                </div>

                {/* Central Magnetic Cinema Play Button (Only when video is available) */}
                {hasSpotlightVideo && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      type="button"
                      onClick={() => setSelectedVideoProject(spotlightProject)}
                      className="group/playbtn relative flex flex-col items-center gap-2 cursor-pointer focus-visible:outline-none"
                      aria-label={`Watch ${spotlightProject.title}`}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Pulse Ring Wave */}
                        <div className="absolute inset-0 rounded-full bg-amber-500/30 scale-100 group-hover/playbtn:scale-140 group-hover/playbtn:opacity-0 transition-all duration-700 ease-out pointer-events-none" />
                        <div className="size-16 sm:size-20 rounded-full bg-zinc-950/90 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-2xl group-hover/playbtn:scale-110 group-hover/playbtn:bg-amber-500 group-hover/playbtn:text-zinc-950 group-hover/playbtn:border-amber-400 group-hover/playbtn:shadow-[0_0_36px_rgba(245,158,11,0.6)] transition-all duration-200">
                          <Play size={26} className="fill-current translate-x-0.5 rtl:-translate-x-0.5" />
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-black/90 border border-white/10 text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-zinc-200 group-hover/playbtn:text-amber-300 transition-colors">
                        {isArabic ? "مشاهدة الفيلم • 4K UHD" : "WATCH FILM • 4K UHD"}
                      </span>
                    </button>
                  </div>
                )}

                {/* Bottom Telemetry Bar */}
                <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 flex items-center justify-between text-[10px] font-mono text-white/80 z-10 pointer-events-none">
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-black/90 border border-white/10 text-zinc-400" dir="ltr">
                    {spotlightOptics}
                  </span>
                  {spotlightProject.views && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-black/90 border border-white/10 text-amber-400 font-semibold">
                      <Eye size={11} />
                      <span>{spotlightProject.views}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Editorial Dossier Console (5 cols) */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-s border-white/10 bg-zinc-950/70">
                <div>
                  {/* Client & Category Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                      <Tv size={13} className="shrink-0" />
                      <span>{spotlightProject.client}</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 uppercase" dir="ltr">
                      {spotlightProject.year ? `YAS CINE • ${spotlightProject.year}` : "YAS MASTER"}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mb-1.5 tracking-tight leading-tight">
                    {spotlightProject.title}
                  </h3>
                  {spotlightProject.arabicTitle && (
                    <p className="text-sm text-zinc-400 font-display mb-4">
                      {spotlightProject.arabicTitle}
                    </p>
                  )}

                  {/* Logline / Description */}
                  <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                    {spotlightProject.description}
                  </p>

                  {/* Studio Tech & Deliverables Pills */}
                  <div className="mb-6">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      {isArabic ? "مواصفات الإنتاج والتسليم:" : "Production & Deliverables:"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {spotlightProject.deliverables?.map((item) => (
                        <span
                          key={item}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/10 font-mono"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                  {hasSpotlightVideo ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedVideoProject(spotlightProject)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <Play size={13} className="fill-current" />
                        <span>{isArabic ? "مشاهدة الماستر السينمائي" : "Watch Master Reel"}</span>
                      </button>

                      <Link
                        href={`/projects/${spotlightProject.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-white/15 bg-white/5 text-zinc-300 font-semibold text-xs hover:bg-white/10 hover:text-white transition-all"
                      >
                        <span>{isArabic ? "تفاصيل المشروع" : "Project Dossier"}</span>
                        <ArrowUpRight size={13} className="rtl:rotate-90 rtl:scale-x-[-1]" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/projects/${spotlightProject.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                    >
                      <span>{isArabic ? "استعراض تفاصيل المشروع" : "Explore Project Dossier"}</span>
                      <ArrowUpRight size={13} className="rtl:rotate-90 rtl:scale-x-[-1]" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* 🎞️ Curated Masterpiece Grid (Ultra-Optimized Pure Hardware Grid) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-2">
              <Clapperboard size={16} className="text-amber-400" />
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                {isArabic ? "استكشف أعمالنا في هذا التصنيف" : "Selected Repertoire Grid"}
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {filteredProjects.length} {isArabic ? "أعمال معتمدة" : "Masterpieces"}
            </span>
          </div>

          {/* Clean hardware-accelerated CSS Grid without Framer Motion layout thrashing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {filteredProjects.map((project, idx) => (
              <div key={project.id} className="h-full transition-opacity duration-300">
                <ProjectCard
                  project={project}
                  priority={idx < 2}
                  onWatchReel={(p) => setSelectedVideoProject(p)}
                  onSelectSpotlight={(p) => setSelectedSpotlightId(p.id)}
                  isSpotlighted={spotlightProject?.id === project.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Centered "View All" CTA below the grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-12 sm:mt-16">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-white/15 bg-zinc-900/90 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-400 transition-all text-xs font-bold shadow-xl shadow-black/60 active:scale-[0.98]"
          >
            <span>
              {t("portfolio.viewAll")} ({PROJECTS_DATA.length}+ {isArabic ? "عمل سينمائي" : "Cinema Works"})
            </span>
            <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
          </Link>
        </FadeUp>
      </Container>

      {/* Vimeo & 4K Cinema Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={Boolean(selectedVideoProject?.vimeoId || selectedVideoProject?.videoUrl)}
        onClose={() => setSelectedVideoProject(null)}
        vimeoId={selectedVideoProject?.vimeoId}
        videoUrl={selectedVideoProject?.videoUrl}
        posterImage={selectedVideoProject?.image}
        title={selectedVideoProject?.title || ""}
        subtitle={selectedVideoProject?.arabicTitle}
        client={selectedVideoProject?.client}
      />
    </Section>
  );
}
