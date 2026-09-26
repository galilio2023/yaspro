import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BookingStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export function BookingStepNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
}: BookingStepNavigationProps) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
      {!isFirst && (
        <Button
          variant="outline"
          size="default"
          onClick={onPrev}
          className="rounded-xl px-5 text-xs font-semibold"
        >
          <ChevronLeft size={16} /> Back
        </Button>
      )}

      {!isLast ? (
        <Button
          variant="brand"
          size="default"
          onClick={onNext}
          className="ml-auto rounded-xl px-6 text-xs font-semibold gap-2"
        >
          <span>Continue</span>
          <ChevronRight size={16} />
        </Button>
      ) : (
        <Button
          variant="brand"
          size="default"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="ml-auto rounded-xl px-8 text-xs font-semibold gap-2 shadow-lg shadow-brand-purple/25"
        >
          {isSubmitting ? (
            <span>Processing Booking...</span>
          ) : (
            <>
              <CreditCard size={16} /> Complete &amp; Pay
            </>
          )}
        </Button>
      )}
    </div>
  );
}
