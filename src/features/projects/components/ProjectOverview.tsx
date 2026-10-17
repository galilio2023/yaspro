"use client";

import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectItem } from "../types";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface ProjectOverviewProps {
  project: ProjectItem;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { t, isArabic } = useLanguage();
  const title = isArabic && project.arabicTitle ? project.arabicTitle : project.title;
  const description = isArabic && project.arabicDescription ? project.arabicDescription : project.description;
  const categoryLabel = isArabic && project.categoryLabelAr ? project.categoryLabelAr : project.categoryLabel;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 lg:p-10 shadow-2xl shadow-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="gold" className="text-xs font-semibold">
              {categoryLabel}
            </Badge>
            {project.client && (
              <div className="flex items-center gap-1.5 text-xs text-brand-mauve-soft font-medium">
                <ShieldCheck size={14} className="text-brand-mauve shrink-0" />
                <span>
                  {t("projects.commissionedBy", { client: project.client })}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 sm:mb-4 font-display rtl:font-arabic text-white tracking-tight rtl:tracking-normal leading-[1.15] rtl:leading-[1.4] text-balance">
            {title}
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
