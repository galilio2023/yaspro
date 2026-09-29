"use client";

import { useState, useMemo } from "react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryFilterBar, CategoryOption } from "@/components/ui/category-filter";
import { ProjectCard } from "./ProjectCard";
import { PROJECTS_DATA, PROJECT_CATEGORIES } from "../data";
import { ProjectCategory, ProjectItem } from "../types";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface ProjectsExplorerProps {
  initialProjects?: readonly ProjectItem[];
}

export function ProjectsExplorer({
  initialProjects = PROJECTS_DATA,
}: ProjectsExplorerProps) {
  const { isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");

  const categoriesWithOptions: CategoryOption<ProjectCategory>[] = useMemo(() => {
    return PROJECT_CATEGORIES.map((cat) => ({
      id: cat.id as ProjectCategory,
      label: isArabic ? (cat.arabicLabel || cat.label) : cat.label,
      count:
        cat.id === "all"
          ? initialProjects.length
          : initialProjects.filter((p) => p.category === cat.id).length,
    }));
  }, [initialProjects, isArabic]);

  const filteredProjects = useMemo(() => {
    return activeCategory === "all"
      ? initialProjects
      : initialProjects.filter((p) => p.category === activeCategory);
  }, [activeCategory, initialProjects]);

  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <div className="w-full">
      {/* Category Filter Bar */}
      <FadeUp delay={0.1}>
        <CategoryFilterBar
          categories={categoriesWithOptions}
          selected={activeCategory}
          onSelect={setActiveCategory}
        />
      </FadeUp>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length > 0 ? (
        <StaggerContainer as="ul" role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredProjects.map((project, i) => (
            <StaggerItem as="li" key={project.id} className="h-full">
              <ProjectCard
                project={project}
                priority={i < 6}
                onWatchReel={(p) => setSelectedProject(p)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title={isArabic ? "لا توجد أعمال في هذا التصنيف" : "No Projects in this Category"}
          description={
            isArabic
              ? "لم يتم إضافة أعمال في هذا التصنيف حالياً. يمكنك استعراض كافة أعمالنا أو مراجعتنا قريباً."
              : "We haven't added projects in this specific category yet. Check back soon or view all projects."
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCategory("all")}
              className="rounded-xl cursor-pointer"
            >
              {isArabic ? "عرض كافة الأعمال" : "View All Projects"}
            </Button>
          }
        />
      )}

      {/* Cinema Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={Boolean(selectedProject?.vimeoId || selectedProject?.videoUrl)}
        onClose={() => setSelectedProject(null)}
        vimeoId={selectedProject?.vimeoId}
        videoUrl={selectedProject?.videoUrl}
        posterImage={selectedProject?.image}
        title={selectedProject?.title || ""}
        client={selectedProject?.client}
      />
    </div>
  );
}
