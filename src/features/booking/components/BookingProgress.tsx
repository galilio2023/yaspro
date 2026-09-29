import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
  return (
    <div
      role="navigation"
      aria-label="Booking steps"
      className="flex items-center gap-1 p-2 rounded-2xl border border-brand-purple/15 bg-card/60 backdrop-blur-xl overflow-x-auto sm:overflow-visible"
    >
      {steps.map((s, idx) => {
        const isCurrent = currentStep === s.id;
        const isCompleted = currentStep > s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => isCompleted && onStepClick(s.id)}
              disabled={!isCompleted && !isCurrent}
              title={s.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                isCurrent
                  ? "bg-gradient-brand text-white shadow-md shadow-brand-purple/35 font-bold"
                  : isCompleted
                  ? "text-brand-purple-mid hover:bg-brand-purple/10 font-semibold cursor-pointer"
                  : "text-text-ghost opacity-40 cursor-default"
              )}
            >
              <span
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isCurrent
                    ? "bg-white/20"
                    : isCompleted
                    ? "bg-brand-purple/20"
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
                {s.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-3 rounded-full transition-colors",
                  isCompleted ? "bg-brand-purple/40" : "bg-white/8"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
