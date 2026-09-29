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
    <div className="mb-20">
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
        {PILLARS.map((pillar) => (
          <StaggerItem key={pillar.title} className="h-full">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-7 h-full flex flex-col hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all duration-300">
              <div className="size-12 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center mb-5 text-brand-purple" aria-hidden="true">
                <pillar.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">
                {isArabic && pillar.arTitle ? pillar.arTitle : pillar.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                {isArabic && pillar.arDescription ? pillar.arDescription : pillar.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
