"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterPill<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface AdminFilterBarProps<T extends string = string> {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterValue?: T;
  onFilterChange?: (val: T) => void;
  filterOptions?: FilterPill<T>[];
  secondaryFilters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminFilterBar<T extends string = string>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filterValue,
  onFilterChange,
  filterOptions,
  secondaryFilters,
  actions,
  className,
}: AdminFilterBarProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl",
        className
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={14}
          className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full ps-9 pe-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Primary Filter Pills */}
      {filterOptions && filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {filterOptions.map((opt) => {
            const isActive = filterValue === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onFilterChange(opt.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
                  isActive
                    ? "bg-brand-mauve text-white shadow-md shadow-brand-violet/20 font-semibold"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5"
                )}
              >
                <span>{opt.label}</span>
                {typeof opt.count === "number" && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/[0.06] text-slate-400"
                    )}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Secondary filter slots (e.g. dropdowns, secondary pills) */}
      {secondaryFilters && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {secondaryFilters}
        </div>
      )}

      {/* Right Action slot */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
