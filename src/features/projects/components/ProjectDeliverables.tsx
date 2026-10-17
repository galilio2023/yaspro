"use client";

import { Award, CheckCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface ProjectDeliverablesProps {
  deliverables?: readonly string[];
}

export function ProjectDeliverables({ deliverables }: ProjectDeliverablesProps) {
  const { t } = useLanguage();
  const items = deliverables || [
    t("projects.defaultDeliverable1"),
    t("projects.defaultDeliverable2"),
    t("projects.defaultDeliverable3"),
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8">
      <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2.5 font-display uppercase tracking-wider">
        <div className="size-8 rounded-xl bg-brand-mauve/10 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve shrink-0">
          <Award size={16} />
        </div>
        <span>{t("projects.deliverablesTitle")}</span>
      </h2>
      <div className="overflow-x-auto">
        <ul className="space-y-3 min-w-full">
          {items.map((item) => (
            <li key={item} className="text-sm text-text-secondary flex items-start gap-3">
              <CheckCircle size={16} className="text-brand-mauve mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
