"use client";

import { FadeUp } from "@/components/animations/MotionWrappers";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function AboutOverview() {
  const { t } = useLanguage();

  const scaleStats = [
    { value: "400M+", label: t("about.reachLabel") },
    { value: "500+", label: t("about.projectsLabel") },
    { value: "3", label: t("about.hubsLabel") },
    { value: "100%", label: t("about.satisfactionLabel") },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 items-stretch">
      {/* Philosophy Card */}
      <FadeUp className="h-full">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 lg:p-10 h-full flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <Badge variant="default" className="mb-4">
              {t("about.philosophyBadge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
              {t("about.philosophyTitle")}
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-4">
              {t("about.philosophyP1")}
            </p>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              {t("about.philosophyP2")}
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Scale Card */}
      <FadeUp delay={0.1} className="h-full">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 lg:p-10 h-full flex flex-col justify-between shadow-xl shadow-black/20">
          <div>
            <Badge variant="cyan" className="mb-4">
              {t("about.scaleBadge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
              {t("about.scaleTitle")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 my-6">
              {scaleStats.map((stat) => (
                <div key={stat.label}>
                  <div
                    dir="ltr"
                    className="text-2xl sm:text-4xl font-extrabold bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent font-display font-latin text-start"
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted mt-1 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
