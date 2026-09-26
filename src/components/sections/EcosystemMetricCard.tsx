import { cn } from "@/lib/utils";
import type { EcosystemMetric } from "./ecosystem.data";

export interface EcosystemMetricCardProps {
  metric: EcosystemMetric;
}

export function EcosystemMetricCard({ metric }: EcosystemMetricCardProps) {
  const Icon = metric.icon;

  return (
    <div className="relative group p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      {/* Top glowing ambient accent */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${metric.glowColor}, transparent)`,
        }}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <dd
          className={cn(
            "text-2xl sm:text-3xl font-extrabold font-display tracking-tight bg-gradient-to-r bg-clip-text text-transparent",
            metric.colorClass
          )}
        >
          {metric.value}
        </dd>

        <div className="size-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-text-secondary group-hover:text-white group-hover:border-white/20 transition-colors">
          <Icon size={16} />
        </div>
      </div>

      <div>
        <dt className="text-xs sm:text-sm text-white font-semibold font-display tracking-tight">
          {metric.label}
        </dt>
        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed font-mono">
          {metric.detail}
        </p>
      </div>
    </div>
  );
}
