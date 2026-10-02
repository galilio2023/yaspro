"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface BookingStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  sessionTypeLabel?: string;
}

const STEP_LABELS_AR: Record<number, string> = {
  1: "الموعد والمدة",
  2: "نوع جلسة الإنتاج",
  3: "اختيار الاستوديو",
  4: "طاقم العمل والمعدات",
  5: "الديكور والمؤثرات",
  6: "المونتاج وما بعد الإنتاج",
  7: "بيانات الاتصال والتأكيد",
};

export function BookingStepHeader({
  currentStep,
  totalSteps,
  stepLabel,
  sessionTypeLabel = "Studio Session",
}: BookingStepHeaderProps) {
  const { isArabic } = useLanguage();
  const title = isArabic && STEP_LABELS_AR[currentStep] ? STEP_LABELS_AR[currentStep] : stepLabel;

  return (
    <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
      <div>
        <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold block mb-1">
          {isArabic ? `الخطوة ${currentStep} من ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
          {title}
        </h3>
      </div>
      <Badge variant="secondary" className="text-xs">
        {sessionTypeLabel}
      </Badge>
    </div>
  );
}
