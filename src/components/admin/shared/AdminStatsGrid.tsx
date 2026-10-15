"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatVariant = "default" | "brand" | "success" | "warning" | "danger";

export interface AdminStatItem {
  id?: string;
  label: string;
  value: string | number;
  unit?: string;
  badge?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: StatVariant;
  description?: string;
  href?: string;
}

const VARIANT_STYLES: Record<
  StatVariant,
  {
    container: string;
    label: string;
    value: string;
    unit: string;
    icon: string;
  }
> = {
  default: {
    container: "border-white/10 bg-slate-900/60 backdrop-blur-xl",
    label: "text-slate-400",
    value: "text-white",
    unit: "text-brand-mauve",
    icon: "text-slate-400",
  },
  brand: {
    container: "border-brand-mauve/30 bg-brand-violet/20 backdrop-blur-xl shadow-lg shadow-brand-violet/10",
    label: "text-brand-mauve-soft",
    value: "text-white",
    unit: "text-brand-mauve",
    icon: "text-brand-mauve",
  },
  success: {
    container: "border-emerald-500/20 bg-emerald-950/20 backdrop-blur-xl",
    label: "text-emerald-400/80",
    value: "text-emerald-400",
    unit: "text-emerald-400/80",
    icon: "text-emerald-400",
  },
  warning: {
    container: "border-brand-mauve/40 bg-brand-violet/25 backdrop-blur-xl",
    label: "text-brand-lavender",
    value: "text-white",
    unit: "text-brand-mauve",
    icon: "text-brand-mauve",
  },
  danger: {
    container: "border-rose-500/20 bg-rose-950/20 backdrop-blur-xl",
    label: "text-rose-400/80",
    value: "text-rose-400",
    unit: "text-rose-400/80",
    icon: "text-rose-400",
  },
};

export interface AdminStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  badge?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: StatVariant;
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  unit,
  badge,
  icon: Icon,
  variant = "default",
  className,
}: AdminStatCardProps) {
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group",
        styles.container,
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[10px] sm:text-[11px] uppercase tracking-wider font-mono font-medium truncate",
            styles.label
          )}
        >
          {label}
        </span>
        {Icon && (
          <Icon
            size={16}
            className={cn("shrink-0 opacity-80 group-hover:opacity-100 transition-opacity", styles.icon)}
          />
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-1.5">
        <span className={cn("text-xl sm:text-2xl font-bold font-mono tracking-tight", styles.value)}>
          {value}
        </span>
        {unit && (
          <span className={cn("text-xs font-medium", styles.unit)}>
            {unit}
          </span>
        )}
      </div>

      {badge && (
        <div className="mt-2">
          <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

export interface AdminStatsGridProps {
  stats?: AdminStatItem[];
  children?: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const COLUMN_MAP = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
};

export function AdminStatsGrid({
  stats,
  children,
  columns = 4,
  className,
}: AdminStatsGridProps) {
  return (
    <div className={cn("grid gap-3 sm:gap-4", COLUMN_MAP[columns] || COLUMN_MAP[4], className)}>
      {stats
        ? stats.map((stat, idx) => (
            <AdminStatCard
              key={stat.id || `${stat.label}-${idx}`}
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              badge={stat.badge}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))
        : children}
    </div>
  );
}
