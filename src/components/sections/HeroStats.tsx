export interface HeroStat {
  value: string;
  label: string;
}

const DEFAULT_STATS: readonly HeroStat[] = [
  { value: "400M+", label: "Combined Reach" },
  { value: "500+", label: "Projects Delivered" },
  { value: "3",    label: "Regional Hubs" },
  { value: "100+", label: "Top Brands" },
];

interface HeroStatsProps {
  stats?: readonly HeroStat[];
}

export function HeroStats({ stats = DEFAULT_STATS }: HeroStatsProps) {
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 w-full pt-8 border-t border-brand-purple/20">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex flex-col items-start gap-0.5">
          <dd
            className="text-2xl sm:text-3xl font-extrabold font-display"
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
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
