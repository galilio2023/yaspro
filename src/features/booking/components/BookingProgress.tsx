"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { WizardStepItem } from "../types";

interface BookingProgressProps {
  steps: readonly WizardStepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function BookingProgress({
  steps,
  currentStep,
  onStepClick,
}: BookingProgressProps) {
  const { isArabic } = useLanguage();

  return (
    <div
      role="navigation"
      aria-label={isArabic ? "خطوات الحجز" : "Booking steps"}
      dir="ltr"
      className="w-full max-w-2xl mx-auto mb-8 px-2"
    >
      <div className="flex items-center justify-between relative">
        {/* Step circles */}
        {steps.map((s) => {
          const isCurrent = currentStep === s.id;
          const isCompleted = currentStep > s.id;

          return (
            <div
              key={s.id}
              className="flex flex-col items-center relative z-10 group"
            >
              <button
                type="button"
                onClick={() => onStepClick(s.id)}
                disabled={!isCompleted && !isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                className={`size-8 sm:size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/40 scale-105"
                    : isCompleted
                    ? "bg-[#8b5cf6] text-white hover:bg-purple-600"
                    : "bg-[#181d29] text-zinc-400 border border-white/10 hover:border-white/20"
                }`}
              >
                {s.id}
              </button>
              <span
                className={`mt-2 text-[10px] sm:text-[11px] font-medium tracking-tight text-center whitespace-nowrap transition-colors ${
                  isCurrent
                    ? "text-white font-semibold"
                    : isCompleted
                    ? "text-purple-300"
                    : "text-zinc-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
