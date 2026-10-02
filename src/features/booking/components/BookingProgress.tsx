"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { WizardStepItem } from "../types";

interface BookingProgressProps {
  steps: readonly WizardStepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

const STEP_PROGRESS_LABELS_AR: Record<number, string> = {
  1: "الموعد",
  2: "نوع الجلسة",
  3: "الاستوديو",
  4: "المعدات",
  5: "الديكور",
  6: "المونتاج",
  7: "التأكيد",
};

export function BookingProgress({
  steps,
  currentStep,
  onStepClick,
}: BookingProgressProps) {
  const { isArabic } = useLanguage();

  return (
    <div
      role="navigation"
      aria-label={isArabic ? "مراحل الحجز" : "Booking steps"}
      className="flex items-center gap-1 p-2 rounded-2xl border border-white/10 bg-card/60 backdrop-blur-xl overflow-x-auto scrollbar-none"
    >
      {steps.map((s, idx) => {
        const isCurrent = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        const Icon = s.icon;
        const label = isArabic && STEP_PROGRESS_LABELS_AR[s.id] ? STEP_PROGRESS_LABELS_AR[s.id] : s.label;

        return (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => isCompleted && onStepClick(s.id)}
              disabled={!isCompleted && !isCurrent}
              title={label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                isCurrent
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-400 font-bold"
                  : isCompleted
                  ? "text-amber-400 hover:bg-amber-500/10 font-semibold cursor-pointer"
                  : "text-text-ghost opacity-40 cursor-default"
              )}
            >
              <span
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isCurrent
                    ? "bg-amber-500 text-black"
                    : isCompleted
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/5"
                )}
              >
                {isCompleted ? (
                  <Check size={12} strokeWidth={3} />
                ) : (
                  <Icon size={12} />
                )}
              </span>
              <span className="text-[11px] hidden sm:inline font-semibold tracking-wide">
                {label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-3 rounded-full transition-colors",
                  isCompleted ? "bg-amber-500/40" : "bg-white/8"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
