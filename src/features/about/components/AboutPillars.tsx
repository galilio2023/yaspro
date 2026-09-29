"use client";

import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { PILLARS } from "../data";
import { SectionHeader } from "@/components/ui/section-header";
import { Shield } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface AboutPillarsProps {
  headingId?: string;
}

export function AboutPillars({ headingId }: AboutPillarsProps) {
  const { t, isArabic } = useLanguage();

  return (
    <div className="mb-20 sm:mb-28">
      <SectionHeader
        headingId={headingId}
        badge={t("about.pillarsBadge")}
        badgeVariant="default"
        badgeIcon={<Shield size={13} />}
        title={t("about.pillarsTitle")}
        gradientText={t("about.pillarsGradient")}
        description={t("about.pillarsDesc")}
      />

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <StaggerItem key={pillar.title} className="h-full">
              <div className="rounded-3xl border border-white/10 bg-[#0c091c]/80 backdrop-blur-xl p-6 sm:p-7 h-full flex flex-col justify-between hover:border-brand-purple/50 hover:bg-[#110d28]/90 transition-all duration-300 group shadow-xl shadow-black/30">
                <div>
                  {/* Top Bar with Icon & Micro-Badge */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="size-12 rounded-2xl bg-white/[0.04] border border-white/10 group-hover:border-brand-purple/40 flex items-center justify-center text-brand-purple-light group-hover:scale-105 transition-all shadow-md">
                      <Icon size={22} />
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted">
                      {isArabic ? pillar.arBadge : pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2.5 font-display group-hover:text-brand-purple-light transition-colors">
                    {isArabic && pillar.arTitle ? pillar.arTitle : pillar.title}
                  </h3>

                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6">
                    {isArabic && pillar.arDescription ? pillar.arDescription : pillar.description}
                  </p>
                </div>

                {/* Micro tags */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                  {pillar.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-slate-400 font-latin"
                      dir="ltr"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
