"use client";

import { cn } from "@/lib/utils";

export interface CategoryOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface CategoryFilterBarProps<T extends string> {
  categories: readonly CategoryOption<T>[] | CategoryOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
  className?: string;
}

export function CategoryFilterBar<T extends string>({
  categories,
  selected,
  onSelect,
  className,
}: CategoryFilterBarProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Filter categories"
      className={cn(
        "flex flex-wrap items-center gap-2 mb-10 p-1.5 rounded-full border border-white/10 bg-secondary/80 backdrop-blur-md w-fit shadow-inner",
        className
      )}
    >
      {categories.map((cat) => {
        const isActive = selected === cat.id;

        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2",
              isActive
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
          >
            <span>{cat.label}</span>
            {typeof cat.count === "number" && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-text-muted"
                )}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
