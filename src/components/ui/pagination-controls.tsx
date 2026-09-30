import React from "react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  total: number;
  startIndex: number;
  endIndex: number;
  onPrev: () => void;
  onNext: () => void;
  /** Optional container class override */
  className?: string;
  /** Render inside a table footer (border-t) or standalone card (border) */
  variant?: "table" | "card";
}

/**
 * Reusable pagination footer that replaces the duplicated Previous/Next
 * block found inside all 9 admin manager components.
 */
export function PaginationControls({
  currentPage,
  pageCount,
  total,
  startIndex,
  endIndex,
  onPrev,
  onNext,
  className,
  variant = "table",
}: PaginationControlsProps) {
  if (total <= 0 || pageCount <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 text-xs text-slate-400",
        variant === "table"
          ? "border-t border-white/10 bg-white/[0.01]"
          : "border border-white/10 rounded-2xl bg-white/[0.01]",
        className
      )}
    >
      <span>
        Showing {startIndex + 1}–{endIndex} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage === 0}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Previous
        </button>
        <span className="font-mono text-slate-300">
          {currentPage + 1} / {pageCount}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= pageCount - 1}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
}
