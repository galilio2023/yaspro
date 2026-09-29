import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProjectItem } from "../types";

export interface ProjectOverviewProps {
  project: ProjectItem;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 lg:p-10 shadow-2xl shadow-black/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="cyan" className="text-xs font-semibold">
              {project.categoryLabel}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-brand-purple-light font-medium">
              <ShieldCheck size={14} className="text-brand-purple" />
              <span>Commissioned by {project.client}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-5 font-display text-white tracking-tight">
            {project.title}
          </h1>

          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
