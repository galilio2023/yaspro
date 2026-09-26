"use client";

import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GearSelectButtonProps {
  itemId: string;
  inCart?: boolean;
  onToggle: (id: string) => void;
  className?: string;
}

export function GearSelectButton({
  itemId,
  inCart = false,
  onToggle,
  className,
}: GearSelectButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(itemId)}
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md",
        inCart
          ? "bg-green-500/20 text-green-300 border border-green-500/30 shadow-green-500/10"
          : "bg-brand-purple text-white hover:bg-brand-purple-dark shadow-brand-purple/20",
        className
      )}
    >
      {inCart ? (
        <>
          <Check size={14} /> Selected
        </>
      ) : (
        <>
          <Plus size={14} /> Reserve Item
        </>
      )}
    </button>
  );
}
