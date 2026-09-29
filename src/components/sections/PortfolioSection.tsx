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

interface PortfolioSectionProps {
  limit?: number;
}

export function PortfolioSection({ limit = 6 }: PortfolioSectionProps) {
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
          badgeVariant="cyan"
          badgeIcon={<Award size={13} />}
          title={isArabic ? t("portfolio.title") : "Our Latest"}
          gradientText={isArabic ? t("portfolio.titleGradient") : "Masterpieces"}
          description={t("portfolio.description")}
        />

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center justify-center",
                activeCategory === cat.id
                  ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/30 scale-105"
                  : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {isArabic ? (cat.arabicLabel || cat.label) : cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {filteredProjects.map((project, i) => (
            <FadeUp as="li" key={project.id} delay={i * 0.05} className="h-full">
              <ProjectCard
                project={project}
                priority={i < 6}
                onWatchReel={(p) => setSelectedProject(p)}
              />
            </FadeUp>
          ))}
        </ul>

        {/* Centered "View All" CTA below the grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-brand-purple/40 text-brand-purple-light hover:bg-brand-purple/15 hover:border-brand-purple hover:scale-105 transition-all text-xs font-bold shadow-md shadow-brand-purple/10"
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
