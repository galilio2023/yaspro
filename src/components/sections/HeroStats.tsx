"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export interface HeroStat {
  value: string;
  label: string;
  arLabel?: string;
}

const DEFAULT_STATS: readonly HeroStat[] = [
  { value: "400M+", label: "Combined Reach", arLabel: "إجمالي الوصول" },
  { value: "500+", label: "Projects Delivered", arLabel: "مشروع منجز" },
  { value: "3", label: "Regional Hubs", arLabel: "مقرات إقليمية" },
  { value: "100+", label: "Top Brands", arLabel: "علامة تجارية كبرى" },
];

interface HeroStatsProps {
  stats?: readonly HeroStat[];
}

export function HeroStats({ stats = DEFAULT_STATS }: HeroStatsProps) {
  const { isArabic } = useLanguage();

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 w-full pt-8 border-t border-brand-purple/20">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col items-start text-start gap-0.5">
          <dd
            className="text-2xl sm:text-3xl font-extrabold font-display font-latin"
            dir="ltr"
            style={{
              background:
                i % 2 === 0
                  ? "linear-gradient(135deg,#7c3aed,#c4b5fd,#06b6d4)"
                  : "linear-gradient(135deg,#f59e0b,#fcd34d,#f59e0b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {stat.value}
          </dd>
          <dt className="text-text-muted text-[11px] font-medium uppercase tracking-wider">
            {isArabic ? (stat.arLabel || stat.label) : stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
