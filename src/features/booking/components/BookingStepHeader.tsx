import { Badge } from "@/components/ui/badge";

export interface BookingStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  sessionTypeLabel?: string;
}

export function BookingStepHeader({
  currentStep,
  totalSteps,
  stepLabel,
  sessionTypeLabel = "Studio Session",
}: BookingStepHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold block mb-1">
          Step {currentStep} of {totalSteps}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
          {stepLabel}
        </h3>
      </div>
      <Badge variant="secondary" className="text-xs">
        {sessionTypeLabel}
      </Badge>
    </div>
  );
}
