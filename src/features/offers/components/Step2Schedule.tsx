"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";
import { OfferBundleItem } from "../types";
import { STANDARD_TIME_SLOTS } from "../data";
import { StepIntro } from "@/features/booking/components/ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

interface Step2ScheduleProps {
  offer: OfferBundleItem;
  selectedDate: string;
  selectedTimeSlot: string;
  onDateChange: (date: string) => void;
  onTimeSlotChange: (time: string) => void;
}

const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const DAYS_HEADER_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_HEADER_AR = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

const toISO = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function Step2Schedule({
  offer,
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onTimeSlotChange,
}: Step2ScheduleProps) {
  const { isArabic } = useLanguage();

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      const parsed = new Date(y, m - 1, d);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1); // default start tomorrow
    return d;
  });

  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  // Calendar math
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const monthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Available Time Slots (either restricted by offer or standard)
  const availableSlots = useMemo(() => {
    if (offer.restrictedHours?.slots && offer.restrictedHours.slots.length > 0) {
      return offer.restrictedHours.slots;
    }
    return STANDARD_TIME_SLOTS;
  }, [offer]);

  const isDayAllowedByOffer = (dayOfWeek: number) => {
    if (!offer.restrictedDays || offer.restrictedDays.length === 0) return true;
    return offer.restrictedDays.includes(dayOfWeek);
  };

  const selectedDisplay = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [selectedDate, isArabic]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <StepIntro
        index={2}
        total={3}
        title={isArabic ? "تحديد الموعد والوقت" : "Select Date & Time"}
        description={
          isArabic
            ? "اختر التاريخ والوقت المناسبين لجلسة التصوير الخاصة بباقة " + offer.nameAr
            : `Choose when you want to record your session for ${offer.name}.`
        }
      />

      {/* ── Contextual Offer Constraint Notice (if applicable) ── */}
      {offer.restrictionNoteEn && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-brand-violet/20 border border-brand-mauve/40 text-brand-lavender text-xs flex items-center gap-3">
          <Info size={16} className="text-brand-mauve shrink-0" />
          <div className="space-y-0.5">
            <span className="font-semibold block">
              {isArabic ? "تنبيه مواعيد الباقة الخاصة:" : "Schedule Window Note:"}
            </span>
            <p className="text-zinc-300">
              {isArabic ? offer.restrictionNoteAr : offer.restrictionNoteEn}
            </p>
          </div>
        </div>
      )}

      {/* ── Main Schedule Box ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Calendar */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-[#0e0e13] border border-white/[0.08] p-4 sm:p-6 shadow-xl space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-brand-mauve" />
              <h3 className="font-bold text-white text-sm sm:text-base font-display">
                {isArabic ? MONTH_NAMES_AR[month] : MONTH_NAMES_EN[month]} {year}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                className="size-8 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={16} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                className="size-8 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={16} className="rtl:rotate-180" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {(isArabic ? DAYS_HEADER_AR : DAYS_HEADER_EN).map((dayName, idx) => (
              <span
                key={idx}
                className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 py-1"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {leadingBlanks.map((_, i) => (
              <div key={`blank-${i}`} className="aspect-square" />
            ))}

            {monthDays.map((d) => {
              const dayISO = toISO(year, month, d);
              const dateObj = new Date(year, month, d);
              const dayOfWeek = dateObj.getDay();

              const isPast = dayISO < todayISO;
              const isAllowedDay = isDayAllowedByOffer(dayOfWeek);
              const isDisabled = isPast || !isAllowedDay;
              const isSelected = selectedDate === dayISO;
              const isToday = dayISO === todayISO;

              return (
                <button
                  key={dayISO}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onDateChange(dayISO)}
                  className={cn(
                    "aspect-square rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 flex flex-col items-center justify-center relative cursor-pointer",
                    isSelected &&
                      "bg-brand-violet text-white font-bold border border-brand-mauve/50 shadow-[0_6px_20px_-4px_rgba(152,123,165,0.7)] scale-105 z-10",
                    !isSelected &&
                      !isDisabled &&
                      "bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08] hover:text-white border border-white/[0.05]",
                    isDisabled &&
                      "text-zinc-600 bg-transparent opacity-40 cursor-not-allowed hover:bg-transparent"
                  )}
                  title={
                    !isAllowedDay
                      ? isArabic
                        ? "هذا اليوم غير متاح لعرض " + offer.nameAr
                        : `This day is not available for ${offer.name}`
                      : undefined
                  }
                >
                  <span>{d}</span>
                  {isToday && !isSelected && (
                    <span className="size-1 rounded-full bg-brand-mauve absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Time Slot Selection & Schedule Sheet */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl sm:rounded-3xl bg-[#0e0e13] border border-white/[0.08] p-4 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-mauve" />
                <h4 className="font-bold text-white text-sm sm:text-base font-display">
                  {isArabic ? "اختر موعد البدء" : "Select Start Time"}
                </h4>
              </div>
              <span className="font-mono text-[10px] uppercase text-zinc-500">
                {offer.hours} {isArabic ? "ساعات" : "Hrs Duration"}
              </span>
            </div>

            {/* Time Slot Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onTimeSlotChange(slot)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl font-mono text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 border cursor-pointer",
                      isSelected
                        ? "bg-brand-violet border-brand-mauve text-white font-bold shadow-md shadow-brand-violet/20"
                        : "bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/20 hover:text-white"
                    )}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selection Summary Card */}
          <div className="p-4 rounded-2xl bg-[#0b0b0f] border border-white/[0.08] space-y-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">
              {isArabic ? "ملخص الموعد المحجوز" : "Selected Stage Schedule"}
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{isArabic ? "التاريخ:" : "Date:"}</span>
              <span className="font-medium text-white">
                {selectedDisplay || (isArabic ? "يرجى اختيار يوم من التقويم" : "Select a day")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{isArabic ? "موعد البدء:" : "Start Time:"}</span>
              <span className="font-medium text-brand-mauve font-mono">
                {selectedTimeSlot || (isArabic ? "يرجى اختيار وقت" : "Select a slot")}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{isArabic ? "مدة الجلسة:" : "Session Length:"}</span>
              <span className="font-medium text-white font-mono">
                {offer.hours} {isArabic ? "ساعات استوديو" : offer.hours === 1 ? "Hour" : "Hours"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
