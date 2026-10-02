"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
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

function MarqueeColumn({
  items,
  direction,
  className,
  onWatchReel,
  categoryId,
}: {
  items: ProjectItem[];
  direction: "up" | "down";
  className?: string;
  onWatchReel: (p: ProjectItem) => void;
  categoryId: string;
}) {
  if (!items.length) return null;

  // Guarantee enough height to seamlessly loop
  const baseItems = items.length < 4 ? [...items, ...items, ...items, ...items] : items;

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      <div
        key={categoryId} // Reset animation when category changes
        className={cn(
          "flex flex-col w-full",
          direction === "up" ? "animate-marquee-up" : "animate-marquee-down"
        )}
      >
        {/* Block A */}
        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 pb-5 sm:pb-6 lg:pb-8">
          {baseItems.map((project, idx) => (
            <div key={`a-${project.id}-${idx}`} className="transition-transform duration-300 hover:scale-[1.05] hover:z-40 origin-center relative rounded-3xl">
              <ProjectCard
                project={project}
                priority={idx < 4}
                onWatchReel={() => onWatchReel(project)}
              />
            </div>
          ))}
        </div>
        {/* Block B (Identical clone for seamless loop) */}
        <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 pb-5 sm:pb-6 lg:pb-8">
          {baseItems.map((project, idx) => (
            <div key={`b-${project.id}-${idx}`} className="transition-transform duration-300 hover:scale-[1.05] hover:z-40 origin-center relative rounded-3xl">
              <ProjectCard
                project={project}
                priority={false}
                onWatchReel={() => onWatchReel(project)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PortfolioSectionProps {
  limit?: number;
}

export function PortfolioSection({ limit = 12 }: PortfolioSectionProps) {
  const { t, isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = useMemo(() => {
    const list =
      activeCategory === "all"
        ? PROJECTS_DATA
        : PROJECTS_DATA.filter((p) => p.category === activeCategory);
    return list.slice(0, limit);
  }, [activeCategory, limit]);

  return (
    <Section
      id="portfolio"
      aria-labelledby="portfolio-title"
      className="bg-background border-t border-white/10 relative overflow-hidden"
    >
      <Container>
        <SectionHeader
          headingId="portfolio-title"
          badge={t("portfolio.badge")}
          badgeVariant="gold"
          badgeIcon={<Award size={13} />}
          title={isArabic ? t("portfolio.title") : "Our Latest"}
          gradientText={isArabic ? t("portfolio.titleGradient") : "Masterpieces"}
          description={t("portfolio.description")}
        />

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 overflow-x-auto p-1.5 bg-zinc-950/70 rounded-full border border-white/10 backdrop-blur-xl scrollbar-none -mx-4 px-4 sm:mx-auto sm:px-1.5 max-w-fit">
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
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-500/25 -z-10"
                    transition={studioSprings.snappy}
                  />
                )}
                <span>{isArabic ? (cat.arabicLabel || cat.label) : cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Marquee Grid */}
        <div className="marquee-grid relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 h-[600px] md:h-[700px] overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0 py-4">
          {/* Top/Bottom Fade Masks */}
          <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-b from-background to-transparent z-30 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent z-30 pointer-events-none" />

          <MarqueeColumn 
            items={filteredProjects.filter((_, i) => i % 3 === 0)} 
            direction="up" 
            onWatchReel={setSelectedProject} 
            categoryId={activeCategory} 
          />
          <MarqueeColumn 
            items={filteredProjects.filter((_, i) => i % 3 === 1)} 
            direction="down" 
            className="hidden sm:flex" 
            onWatchReel={setSelectedProject} 
            categoryId={activeCategory} 
          />
          <MarqueeColumn 
            items={filteredProjects.filter((_, i) => i % 3 === 2)} 
            direction="up" 
            className="hidden lg:flex" 
            onWatchReel={setSelectedProject} 
            categoryId={activeCategory} 
          />
        </div>

        {/* Centered "View All" CTA below the grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 bg-zinc-900/80 text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-400 transition-all text-xs font-semibold shadow-lg shadow-black/50"
          >
            <span>
              {t("portfolio.viewAll")} ({PROJECTS_DATA.length}+ {isArabic ? "عمل" : "Projects"})
            </span>
            <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
          </Link>
        </FadeUp>
      </Container>

      {/* Vimeo Cinema Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={Boolean(selectedProject?.vimeoId || selectedProject?.videoUrl)}
        onClose={() => setSelectedProject(null)}
        vimeoId={selectedProject?.vimeoId}
        videoUrl={selectedProject?.videoUrl}
        posterImage={selectedProject?.image}
        title={selectedProject?.title || ""}
        subtitle={selectedProject?.arabicTitle}
        client={selectedProject?.client}
      />
    </Section>
  );
}
