"use client";

import { Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  const { isArabic } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onToggle(itemId)}
      className={cn(
        "px-4 py-2.5 sm:py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 whitespace-nowrap",
        inCart
          ? "bg-brand-teal/20 text-brand-teal-light border border-brand-teal/40 shadow-brand-teal/15"
          : "bg-brand-purple text-white hover:bg-brand-purple-dark shadow-brand-purple/20",
        className
      )}
    >
      {inCart ? (
        <>
          <Check size={14} className="shrink-0" />
          <span>{isArabic ? "تم الاختيار" : "Selected"}</span>
        </>
      ) : (
        <>
          <Plus size={14} className="shrink-0" />
          <span>{isArabic ? "حجز المعدة" : "Reserve Item"}</span>
        </>
      )}
    </button>
  );
}
