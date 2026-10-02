"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "../../types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Clock, Sun, Sunset, Moon, Users, AlertCircle, CheckCircle2 } from "lucide-react";

function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const HEADCOUNT_OPTIONS = [1, 2, 3, 4, 6, "10+"] as const;

interface TimeSlotDefinition {
  time: string; // "HH:MM"
  hour: number;
  labelEn: string;
  labelAr: string;
  period: "morning" | "afternoon" | "evening";
}

const ALL_SLOTS: TimeSlotDefinition[] = [
  // Morning (09:00 - 12:00)
  { time: "09:00", hour: 9, labelEn: "09:00 AM", labelAr: "٠٩:٠٠ ص", period: "morning" },
  { time: "10:00", hour: 10, labelEn: "10:00 AM", labelAr: "١٠:٠٠ ص", period: "morning" },
  { time: "11:00", hour: 11, labelEn: "11:00 AM", labelAr: "١١:٠٠ ص", period: "morning" },
  { time: "12:00", hour: 12, labelEn: "12:00 PM", labelAr: "١٢:٠٠ م", period: "morning" },

  // Afternoon (13:00 - 16:00)
  { time: "13:00", hour: 13, labelEn: "01:00 PM", labelAr: "٠١:٠٠ م", period: "afternoon" },
  { time: "14:00", hour: 14, labelEn: "02:00 PM", labelAr: "٠٢:٠٠ م", period: "afternoon" },
  { time: "15:00", hour: 15, labelEn: "03:00 PM", labelAr: "٠٣:٠٠ م", period: "afternoon" },
  { time: "16:00", hour: 16, labelEn: "04:00 PM", labelAr: "٠٤:٠٠ م", period: "afternoon" },

  // Evening (17:00 - 20:00)
  { time: "17:00", hour: 17, labelEn: "05:00 PM", labelAr: "٠٥:٠٠ م", period: "evening" },
  { time: "18:00", hour: 18, labelEn: "06:00 PM", labelAr: "٠٦:٠٠ م", period: "evening" },
  { time: "19:00", hour: 19, labelEn: "07:00 PM", labelAr: "٠٧:٠٠ م", period: "evening" },
  { time: "20:00", hour: 20, labelEn: "08:00 PM", labelAr: "٠٨:٠٠ م", period: "evening" },
];

export function StepDatetime({ state, update }: WizardStepProps) {
  const { isArabic } = useLanguage();

  const durationHours = state.durationHours || 2;
  const currentStartTime = state.time || "10:00";

  // Calculate wrap time
  const wrapCalculation = useMemo(() => {
    const [startHStr, startMStr] = currentStartTime.split(":");
    const startH = parseInt(startHStr || "10", 10);
    const startM = parseInt(startMStr || "0", 10);

    const endH = startH + durationHours;
    const endFormatted = `${String(endH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
    const isValidWithinHours = startH >= 9 && endH <= 21;

    return {
      startH,
      endH,
      endFormatted,
      isValidWithinHours,
    };
  }, [currentStartTime, durationHours]);

  const periods = [
    {
      id: "morning",
      icon: Sun,
      title: isArabic ? "الفترة الصباحية" : "Morning Sessions",
      timeRange: "09:00 AM – 12:00 PM",
    },
    {
      id: "afternoon",
      icon: Sunset,
      title: isArabic ? "فترة بعد الظهر" : "Afternoon Sessions",
      timeRange: "01:00 PM – 04:00 PM",
    },
    {
      id: "evening",
      icon: Moon,
      title: isArabic ? "الفترة المسائية" : "Evening Sessions",
      timeRange: "05:00 PM – 09:00 PM",
    },
  ];

  const setDuration = (newDur: number) => {
    // If current start time would push end time past 21:00, adjust start time
    const [curHStr] = (state.time || "10:00").split(":");
    const curH = parseInt(curHStr, 10);
    if (curH + newDur > 21) {
      const adjustedH = Math.max(9, 21 - newDur);
      update({
        durationHours: newDur,
        time: `${String(adjustedH).padStart(2, "0")}:00`,
      });
    } else {
      update({ durationHours: newDur });
    }
  };

  return (
    <div className="space-y-8">
      {/* Date & Operating Notice */}
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4 items-end">
          <FormField label={isArabic ? "تاريخ جلسة التصوير" : "Session Date"}>
            <div className="relative">
              <Input
                type="date"
                value={state.date}
                onChange={(e) => update({ date: e.target.value })}
                min={formatLocalDate(new Date())}
                className="w-full"
              />
            </div>
          </FormField>

          {/* Quick Date Shortcuts */}
          <div className="flex gap-2 pb-1">
            <button
              type="button"
              onClick={() => {
                const today = formatLocalDate(new Date());
                update({ date: today });
              }}
              className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              {isArabic ? "اليوم" : "Today"}
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                update({ date: formatLocalDate(tomorrow) });
              }}
              className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              {isArabic ? "غداً" : "Tomorrow"}
            </button>
            <button
              type="button"
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                update({ date: formatLocalDate(nextWeek) });
              }}
              className="px-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              {isArabic ? "بعد أسبوع" : "+1 Week"}
            </button>
          </div>
        </div>

        {/* Operating Window Banner */}
        <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-400 shrink-0" />
            <span>
              {isArabic
                ? "ساعات عمل الاستوديو الرسمية: 09:00 ص – 09:00 م (بتوقيت دبي)"
                : "Official Studio Hours: 09:00 AM – 09:00 PM (Dubai Time UTC+4)"}
            </span>
          </div>
          <span className="font-mono text-amber-400 font-semibold hidden sm:inline">
            Iris Bay Tower · Business Bay
          </span>
        </div>
      </div>

      {/* Duration Slider and Presets */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
            {isArabic ? "مدة حجز الاستوديو" : "Session Duration"}
          </label>
          <span className="text-amber-400 font-bold text-sm">
            {state.durationHours} {isArabic ? "ساعات" : "Hours"}
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={12}
          value={state.durationHours}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
        />

        <div className="flex justify-between text-xs text-text-muted mt-2">
          <button
            type="button"
            onClick={() => setDuration(1)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            1h {isArabic ? "(بودكاست سريع)" : "(Quick Pod)"}
          </button>
          <button
            type="button"
            onClick={() => setDuration(4)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            4h {isArabic ? "(نصف يوم)" : "(Half Day)"}
          </button>
          <button
            type="button"
            onClick={() => setDuration(8)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            8h {isArabic ? "(يوم كامل)" : "(Full Day Block)"}
          </button>
        </div>
      </div>

      {/* Interactive Time-Slot Grid (Legacy Studio Bundles UI) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-text-secondary block">
              {isArabic ? "اختر موعد بدء الجلسة" : "Select Studio Start Slot"}
            </label>
            <span className="text-[11px] text-text-muted">
              {isArabic
                ? "انقر على الموعد المناسب لبدء التسجيل في الاستوديو"
                : "Choose your studio entry time (09:00 AM – 09:00 PM)"}
            </span>
          </div>

          {/* Wrap Time Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
            <CheckCircle2 size={13} />
            <span>
              {currentStartTime} ➔ {wrapCalculation.endFormatted}
            </span>
          </div>
        </div>

        {/* 3 Periods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {periods.map((period) => {
            const PeriodIcon = period.icon;
            const slotsInPeriod = ALL_SLOTS.filter((s) => s.period === period.id);

            return (
              <div
                key={period.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <PeriodIcon size={15} className="text-amber-400" />
                    <span className="text-xs font-bold text-white">{period.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{period.timeRange}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {slotsInPeriod.map((slot) => {
                    const isSelected = state.time === slot.time;
                    const exceedsOperatingHours = slot.hour + durationHours > 21;

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={exceedsOperatingHours}
                        onClick={() => update({ time: slot.time })}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-mono font-medium transition-all text-center cursor-pointer relative group",
                          isSelected
                            ? "bg-amber-500 border-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                            : exceedsOperatingHours
                            ? "opacity-35 bg-white/[0.01] border-white/5 text-text-muted cursor-not-allowed line-through"
                            : "bg-white/5 border-white/10 text-white hover:border-amber-500/50 hover:bg-white/10"
                        )}
                        title={
                          exceedsOperatingHours
                            ? isArabic
                              ? "يتجاوز وقت الإغلاق 09:00 مساءً للمدة المحددة"
                              : `Exceeds 21:00 closing with ${durationHours}h duration`
                            : undefined
                        }
                      >
                        <div>{isArabic ? slot.labelAr : slot.labelEn}</div>
                        <div
                          className={cn(
                            "text-[10px] opacity-75 mt-0.5",
                            isSelected ? "text-black/80 font-bold" : "text-text-muted"
                          )}
                        >
                          {slot.time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Exact Time Input (Accessible fallback) */}
        <div className="pt-2 flex items-center justify-between text-xs text-text-muted">
          <span>{isArabic ? "أو حدد دقيقة مخصصة للبدء:" : "Or specify exact custom minute:"}</span>
          <div className="w-36">
            <Input
              type="time"
              value={state.time}
              min="09:00"
              max="21:00"
              onChange={(e) => update({ time: e.target.value })}
              className="py-1 px-2 text-xs font-mono text-center h-8"
            />
          </div>
        </div>

        {!wrapCalculation.isValidWithinHours && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>
              {isArabic
                ? "تنبيه: وقت انتهاء الحجز يتجاوز موعد إغلاق الاستوديو (09:00 مساءً). يرجى تقليل المدة أو اختيار موعد بدء مبكر."
                : "Alert: The session wraps after studio closing time (09:00 PM). Please select an earlier start slot or reduce session hours."}
            </span>
          </div>
        )}
      </div>

      {/* Headcount Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-amber-400" />
          <label className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
            {isArabic ? "كم عدد الحاضرين في جلسة التصوير؟" : "How many people will attend the shoot?"}
          </label>
        </div>

        <div className="flex gap-2.5 flex-wrap">
          {HEADCOUNT_OPTIONS.map((n) => {
            const count = typeof n === "number" ? n : 10;
            const isSelected = state.headcount === count;

            return (
              <button
                key={n}
                type="button"
                onClick={() => update({ headcount: count })}
                className={cn(
                  "px-4 sm:px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-white/5 border-white/10 text-text-secondary hover:border-amber-500/50 hover:text-white"
                )}
              >
                {n}{" "}
                {typeof n === "number" && n === 1
                  ? isArabic
                    ? "شخص"
                    : "Person"
                  : isArabic
                  ? "أشخاص"
                  : "People"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
