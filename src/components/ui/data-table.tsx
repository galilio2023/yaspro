import React from "react";
import { cn } from "@/lib/utils";

export interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">{children}</table>
      </div>
    </div>
  );
}

export function DataTableHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={cn(
        "bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider font-mono text-[11px]",
        className
      )}
    >
      {children}
    </thead>
  );
}

export function DataTableBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tbody className={cn("divide-y divide-white/5", className)}>
      {children}
    </tbody>
  );
}

export function DataTableRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "hover:bg-white/[0.02] transition-colors",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableEmpty({
  colSpan,
  message = "No records found.",
  onReset,
  resetLabel = "Clear all filters",
}: {
  colSpan: number;
  message?: string;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-12 text-center text-slate-400 text-xs font-medium space-y-2"
      >
        <p>{message}</p>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-mauve border border-brand-mauve/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            {resetLabel}
          </button>
        )}
      </td>
    </tr>
  );
}
