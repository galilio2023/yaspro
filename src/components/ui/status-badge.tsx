import React from "react";
import { CheckCircle2, Clock, XCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "confirmed"
  | "pending"
  | "pending_review"
  | "completed"
  | "cancelled"
  | "sla_active"
  | "approved"
  | "resolved"
  | "open"
  | "paid"
  | "deposit_paid"
  | "unpaid"
  | "refunded"
  | string;

const STATUS_STYLES: Record<
  string,
  { classes: string; icon?: React.ReactNode }
> = {
  confirmed:     { classes: "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30",  icon: <CheckCircle2 size={11} /> },
  sla_active:    { classes: "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30",  icon: <CheckCircle2 size={11} /> },
  approved:      { classes: "bg-blue-500/20 text-blue-300 border-blue-500/30",               icon: <CheckCircle2 size={11} /> },
  completed:     { classes: "bg-blue-500/20 text-blue-300 border-blue-500/30",               icon: <CheckCircle2 size={11} /> },
  resolved:      { classes: "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30",  icon: <CheckCircle2 size={11} /> },
  paid:          { classes: "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30",  icon: undefined },
  deposit_paid:  { classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",            icon: undefined },
  pending:       { classes: "bg-amber-500/20 text-amber-300 border-amber-500/30",            icon: <Clock size={11} /> },
  pending_review:{ classes: "bg-amber-500/20 text-amber-300 border-amber-500/30",            icon: <Clock size={11} /> },
  open:          { classes: "bg-amber-500/10 text-amber-400 border-amber-500/30",            icon: undefined },
  cancelled:     { classes: "bg-rose-500/20 text-rose-300 border-rose-500/30",               icon: <XCircle size={11} /> },
  refunded:      { classes: "bg-slate-500/10 text-slate-400 border-slate-500/30",            icon: undefined },
  unpaid:        { classes: "bg-rose-500/10 text-rose-400 border-rose-500/30",               icon: undefined },
};

const FALLBACK_STYLE = {
  classes: "bg-white/10 text-slate-300 border-white/20",
  icon: undefined,
};

interface StatusBadgeProps {
  status: StatusVariant;
  /** Override display text (defaults to formatted status key) */
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Centralised status badge used across admin managers and client portal.
 * Replaces duplicated inline span+className conditionals in every manager.
 */
export function StatusBadge({ status, label, className, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? FALLBACK_STYLE;
  const displayLabel =
    label ?? status.replace(/_/g, " ").toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold border",
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        config.classes,
        className
      )}
    >
      {config.icon}
      {displayLabel}
    </span>
  );
}

/** Special Mawthooq compliance badge */
export function MawthooqBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-teal/15 border border-brand-teal/30 text-brand-teal-light text-[10px] font-semibold",
        className
      )}
    >
      <ShieldCheck size={10} /> Mawthooq
    </span>
  );
}
