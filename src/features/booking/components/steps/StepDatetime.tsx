"use client";

import React, { useState } from "react";
import type { WizardStepProps } from "../../types";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
];

const PEOPLE_OPTIONS = [1, 2, 3, 4, "5+"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StepDatetime({ state, update }: WizardStepProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (state.date) {
      const parsed = new Date(state.date);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Default to October 2026 as shown in screenshot or current year
    const d = new Date();
    d.setFullYear(2026, 9, 22); // Oct 22, 2026 as shown in the screenshot
    return d;
  });

  const duration = state.durationHours || 1;
  const currentPeople = state.headcount || 2;
  const selectedTime = state.time || "10:00 AM";

  // Selected date string YYYY-MM-DD
  const selectedDateStr = state.date || "2026-10-22";

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar math
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Prev month filler days
  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentMonthDays = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push(d);
  }

  // Next month filler days to complete 35 or 42 grid
  const totalSlots = Math.ceil((firstDayOfWeek + daysInCurrentMonth) / 7) * 7;
  const nextMonthDaysCount = totalSlots - (firstDayOfWeek + daysInCurrentMonth);
  const nextMonthDays = [];
  for (let d = 1; d <= nextMonthDaysCount; d++) {
    nextMonthDays.push(d);
  }

  const handleSelectDay = (day: number) => {
    const formatted = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    update({ date: formatted });
  };

  const handleDurationChange = (delta: number) => {
    const newDur = Math.max(1, Math.min(12, duration + delta));
    update({ durationHours: newDur });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Date &amp; Time</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Choose when you want to record</p>
      </div>

      {/* Top Controls: Session duration & How many people */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#0d111a]/70 p-4 rounded-xl border border-white/5">
        {/* Session duration */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock size={13} />
            <span>Session duration</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDurationChange(-1)}
              disabled={duration <= 1}
              className="size-8 rounded-lg bg-[#1a2030] hover:bg-[#252e42] disabled:opacity-40 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-[#141926] border border-white/10 text-white font-semibold text-xs min-w-[50px] text-center">
              {duration}h
            </span>
            <button
              type="button"
              onClick={() => handleDurationChange(1)}
              disabled={duration >= 12}
              className="size-8 rounded-lg bg-[#1a2030] hover:bg-[#252e42] disabled:opacity-40 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* How many people */}
        <div className="space-y-1.5 sm:text-right">
          <div className="text-xs text-zinc-400 sm:text-right">How many people will be recording?</div>
          <div className="inline-flex items-center rounded-lg bg-[#141926] p-1 border border-white/10 gap-1">
            {PEOPLE_OPTIONS.map((val) => {
              const numVal = typeof val === "number" ? val : 5;
              const isSelected = currentPeople === numVal;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => update({ headcount: numVal })}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#7c3aed] text-white shadow-sm"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Month Calendar Grid */}
      <div className="bg-[#0d111a]/90 rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-[11px] font-medium text-zinc-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days Numbers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Previous Month Days */}
          {prevMonthDays.map((d, i) => (
            <div
              key={`prev-${i}`}
              className="py-2.5 text-xs text-zinc-600 cursor-not-allowed select-none"
            >
              {d}
            </div>
          ))}

          {/* Current Month Days */}
          {currentMonthDays.map((d) => {
            const thisDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const isSelected = selectedDateStr === thisDateStr;

            return (
              <button
                key={`cur-${d}`}
                type="button"
                onClick={() => handleSelectDay(d)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30 font-bold scale-105"
                    : "text-zinc-200 hover:bg-[#1a2233] hover:text-white"
                }`}
              >
                {d}
              </button>
            );
          })}

          {/* Next Month Days */}
          {nextMonthDays.map((d, i) => (
            <div
              key={`next-${i}`}
              className="py-2.5 text-xs text-zinc-600 cursor-not-allowed select-none"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Available Times Grid */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-zinc-300">Available Times</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => update({ time: slot })}
                className={`py-2 px-1 text-center rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm"
                    : "bg-[#0d111a]/80 border-white/10 text-zinc-300 hover:border-white/25 hover:bg-[#141926]"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
