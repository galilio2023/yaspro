"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Award, Film, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { PROJECTS_DATA, PROJECT_CATEGORIES } from "@/features/projects/data";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectItem, ProjectCategory } from "@/features/projects/types";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { cn } from "@/lib/utils";

interface PortfolioSectionProps {
  limit?: number;
}

export function PortfolioSection({ limit = 6 }: PortfolioSectionProps) {
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
          badge="Government & Enterprise Portfolio"
          badgeVariant="cyan"
          badgeIcon={<Award size={13} />}
          title="Our Latest"
          gradientText="Masterpieces"
          description="High-impact visual narratives, TV commercial campaigns, and nationwide broadcasts produced for leading regional brands and government entities."
        />

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {PROJECT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border",
                activeCategory === cat.id
                  ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/30 scale-105"
                  : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredProjects.map((project, i) => (
            <FadeUp as="li" key={project.id} delay={i * 0.05} className="h-full">
              <ProjectCard project={project} onWatchReel={(p) => setSelectedProject(p)} />
            </FadeUp>
          ))}
        </ul>

        {/* Centered "View All" CTA below the grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-brand-purple/40 text-brand-purple-light hover:bg-brand-purple/15 hover:border-brand-purple hover:scale-105 transition-all text-xs font-bold shadow-md shadow-brand-purple/10"
          >
            <span>View Complete Portfolio ({PROJECTS_DATA.length}+ Projects)</span>
            <ArrowRight size={14} />
          </Link>
        </FadeUp>
      </Container>

      {/* Vimeo Cinema Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={Boolean(selectedProject?.vimeoId)}
        onClose={() => setSelectedProject(null)}
        vimeoId={selectedProject?.vimeoId}
        title={selectedProject?.title || ""}
        subtitle={selectedProject?.arabicTitle}
        client={selectedProject?.client}
      />
    </Section>
  );
}
