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
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 w-full pt-8 border-t border-white/10">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-start text-start gap-1">
          <dd
            className="text-2xl sm:text-3xl font-bold font-display font-latin text-white tracking-tight"
            dir="ltr"
          >
            {stat.value}
          </dd>
          <dt className="text-zinc-400 text-[11px] font-mono uppercase tracking-wider rtl:tracking-normal whitespace-nowrap">
            {isArabic ? (stat.arLabel || stat.label) : stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
