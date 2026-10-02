"use client";

import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { TEAM_MEMBERS } from "../data";
import { SectionHeader } from "@/components/ui/section-header";
import { Users, Shield } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface TeamGridProps {
  headingId?: string;
}

export function TeamGrid({ headingId }: TeamGridProps) {
  const { t, isArabic } = useLanguage();

  return (
    <div className="mb-20 sm:mb-28">
      <SectionHeader
        headingId={headingId}
        badge={t("about.teamBadge")}
        badgeVariant="gold"
        badgeIcon={<Users size={13} />}
        title={t("about.teamTitle")}
        gradientText={t("about.teamGradient")}
        description={t("about.teamDesc")}
      />

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {TEAM_MEMBERS.map((member) => (
          <StaggerItem as="article" key={member.role} className="h-full">
            <div className="rounded-3xl border border-white/10 bg-[#070709]/90 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between h-full hover:border-amber-500/50 hover:bg-white/[0.04] transition-all duration-300 group shadow-xl shadow-black/30">
              <div>
                {/* Header: Monogram Avatar + Department Tag */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className={`size-12 sm:size-14 rounded-2xl bg-gradient-to-tr ${member.gradient} p-[1.5px] shadow-lg shadow-black/50 group-hover:scale-105 transition-transform`}>
                    <div className="size-full bg-[#070709] rounded-[14px] flex items-center justify-center font-mono font-bold text-sm sm:text-base text-white font-latin" dir="ltr">
                      {member.initials}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400">
                    {isArabic ? member.arDepartment : member.department}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block font-mono">
                    {isArabic ? member.arRole : member.role}
                  </span>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5 group-hover:text-amber-400 transition-colors">
                    {isArabic ? member.arName : member.name}
                  </h3>
                </div>

                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mt-3">
                  {isArabic ? member.arFocus : member.focus}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield size={12} className="text-emerald-400" />
                  {isArabic ? "طاقم معتمد" : "Verified Roster"}
                </span>
                <span className="font-latin" dir="ltr">YAS PRO CORE</span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
