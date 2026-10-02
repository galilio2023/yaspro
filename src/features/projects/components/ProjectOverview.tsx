"use client";

import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectItem } from "../types";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface ProjectOverviewProps {
  project: ProjectItem;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { isArabic } = useLanguage();
  const title = isArabic && project.arabicTitle ? project.arabicTitle : project.title;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 lg:p-10 shadow-2xl shadow-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="gold" className="text-xs font-semibold">
              {project.categoryLabel}
            </Badge>
            {project.client && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                <span>
                  {isArabic ? `تم التنفيذ لصالح ${project.client}` : `Commissioned by ${project.client}`}
                </span>
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-5 font-display rtl:font-arabic text-white tracking-tight rtl:tracking-normal leading-[1.15] rtl:leading-[1.4] text-balance">
            {title}
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
