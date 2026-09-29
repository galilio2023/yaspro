"use client";

import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  const { isArabic } = useLanguage();
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
      {!isFirst && (
        <Button
          variant="outline"
          size="default"
          onClick={onPrev}
          className="w-full sm:w-auto min-h-[44px] rounded-xl px-5 text-xs font-semibold gap-1.5"
        >
          <ChevronLeft size={16} className="rtl:rotate-180" />
          <span>{isArabic ? "رجوع" : "Back"}</span>
        </Button>
      )}

      {!isLast ? (
        <Button
          variant="brand"
          size="default"
          onClick={onNext}
          className="w-full sm:w-auto min-h-[44px] sm:ms-auto rounded-xl px-6 text-xs font-semibold gap-2"
        >
          <span>{isArabic ? "متابعة" : "Continue"}</span>
          <ChevronRight size={16} className="rtl:rotate-180" />
        </Button>
      ) : (
        <Button
          variant="brand"
          size="default"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-h-[44px] sm:ms-auto rounded-xl px-8 text-xs font-semibold gap-2 shadow-lg shadow-brand-purple/25"
        >
          {isSubmitting ? (
            <span>{isArabic ? "جاري معالجة الحجز..." : "Processing Booking..."}</span>
          ) : (
            <>
              <CreditCard size={16} />
              <span>{isArabic ? "إتمام الحجز والدفع" : "Complete & Pay"}</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
