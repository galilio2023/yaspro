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
      accent: "from-amber-600 to-amber-500",
      badgeColor: "border-amber-500/40 text-amber-300",
    },
    {
      year: "2019",
      icon: Building2,
      title: t("about.milestones.m2019.title"),
      desc: t("about.milestones.m2019.desc"),
      accent: "from-amber-500 to-amber-400",
      badgeColor: "border-amber-400/40 text-amber-300",
    },
    {
      year: "2023",
      icon: Radio,
      title: t("about.milestones.m2023.title"),
      desc: t("about.milestones.m2023.desc"),
      accent: "from-amber-500 to-amber-600",
      badgeColor: "border-amber-500/40 text-amber-400",
    },
    {
      year: "2026",
      icon: Sparkles,
      title: t("about.milestones.m2026.title"),
      desc: t("about.milestones.m2026.desc"),
      accent: "from-emerald-400 to-emerald-600",
      badgeColor: "border-emerald-400/40 text-emerald-300",
    },
  ];

  return (
    <div className="mb-20 sm:mb-28">
      <SectionHeader
        badge={t("about.heritageBadge")}
        badgeVariant="default"
        badgeIcon={<Milestone size={13} />}
        title={t("about.heritageTitle")}
        gradientText={t("about.heritageGradient")}
        description={t("about.heritageDesc")}
      />

      {/* Interactive Timeline Stepper */}
      <div className="relative mt-12 sm:mt-16">
        {/* Horizontal glowing track (hidden on mobile, visible md+) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-gradient-to-r from-amber-600/40 via-amber-500/40 to-emerald-400/40 pointer-events-none" />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10 items-stretch">
          {MILESTONES.map((m) => {
            const Icon = m.icon;
            return (
              <StaggerItem key={m.year} className="h-full">
                <div className="rounded-3xl border border-white/10 bg-[#070709]/90 backdrop-blur-xl p-6 h-full flex flex-col justify-between hover:border-amber-500/40 hover:shadow-2xl hover:shadow-black/80 transition-all duration-300 group text-start">
                  <div>
                    {/* Header with Year & Beacon */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-mono text-2xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent font-latin" dir="ltr">
                        {m.year}
                      </span>

                      <div className={`size-10 rounded-2xl bg-white/[0.04] border ${m.badgeColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={18} />
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mb-2 font-display group-hover:text-amber-400 transition-colors">
                      {m.title}
                    </h4>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {m.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
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
