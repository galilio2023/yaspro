"use client";

import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Milestone, Flag, Radio, Sparkles, Building2 } from "lucide-react";

export function AboutMilestones() {
  const { t } = useLanguage();

  const MILESTONES = [
    {
      year: "2015",
      icon: Flag,
      title: t("about.milestones.m2015.title"),
      desc: t("about.milestones.m2015.desc"),
      badgeColor: "border-brand-violet/40 text-brand-mauve bg-brand-violet/10",
    },
    {
      year: "2019",
      icon: Building2,
      title: t("about.milestones.m2019.title"),
      desc: t("about.milestones.m2019.desc"),
      badgeColor: "border-brand-purple/40 text-brand-mauve-soft bg-brand-purple/10",
    },
    {
      year: "2023",
      icon: Radio,
      title: t("about.milestones.m2023.title"),
      desc: t("about.milestones.m2023.desc"),
      badgeColor: "border-brand-mauve/40 text-brand-mauve bg-brand-mauve/10",
    },
    {
      year: "2026",
      icon: Sparkles,
      title: t("about.milestones.m2026.title"),
      desc: t("about.milestones.m2026.desc"),
      badgeColor: "border-brand-yellow-light/40 text-brand-yellow-light bg-brand-violet-rich/10",
    },
  ];

  return (
    <div className="mb-20 sm:mb-28">
      <SectionHeader
        title={t("about.heritageTitle")}
        gradientText={t("about.heritageGradient")}
        description={t("about.heritageDesc")}
      />

      {/* Interactive Timeline Stepper */}
      <div className="relative mt-12 sm:mt-16">
        {/* Horizontal glowing track (hidden on mobile, visible md+) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-brand-violet/60 via-brand-purple/50 to-brand-mauve/60 pointer-events-none" />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-stretch">
          {MILESTONES.map((m) => {
            const Icon = m.icon;
            return (
              <StaggerItem key={m.year} className="h-full">
                <div className="rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl p-6 h-full flex flex-col justify-between hover:border-brand-mauve/50 hover:bg-card hover:shadow-2xl hover:shadow-black/80 transition-all duration-300 group text-start">
                  <div>
                    {/* Header with Year & Beacon */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-2xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent font-latin" dir="ltr">
                        {m.year}
                      </span>

                      <div className={`size-10 rounded-2xl border ${m.badgeColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={18} />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 font-display group-hover:text-brand-mauve transition-colors">
                      {m.title}
                    </h4>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                    <span className="size-1.5 rounded-full bg-brand-mauve shadow-[0_0_6px_rgba(152,123,165,0.6)]" />
                    <span>MILESTONE VERIFIED</span>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </div>
  );
}
