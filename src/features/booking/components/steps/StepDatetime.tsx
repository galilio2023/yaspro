"use client";

import React, { useState } from "react";
import type { WizardStepProps } from "../../types";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Users, Timer } from "lucide-react";
import { ChoiceChip, Counter, Panel, StepIntro } from "../ui/BookingKit";
import { cn } from "@/lib/utils";

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

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toISO = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function StepDatetime({ state, update }: WizardStepProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (state.date) {
      const [y, m, d] = state.date.split("-").map(Number);
      const parsed = new Date(y, m - 1, d);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const duration = state.durationHours || 1;
  const currentPeople = state.headcount || 2;
  const selectedTime = state.time || "10:00 AM";
  const selectedDateStr = state.date;

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const now = new Date();
  const todayISO = toISO(now.getFullYear(), now.getMonth(), now.getDate());
  const isViewingCurrentMonthOrEarlier =
    currentYear < now.getFullYear() || (currentYear === now.getFullYear() && currentMonth <= now.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Calendar math
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDayOfWeek });
  const currentMonthDays = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  const selectedLabel = selectedDateStr
    ? new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : null;

  return (
    <div>
      <StepIntro
        index={1}
        total={7}
        title="Date & Time"
        description="Pick your shoot day, call time, and how long you need the stage."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 sm:gap-5">
        {/* Calendar */}
        <Panel
          icon={CalendarDays}
          title="Shoot day"
          description={selectedLabel ? `Selected · ${selectedLabel}` : "Choose an available date"}
        >
          <div dir="ltr">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                disabled={isViewingCurrentMonthOrEarlier}
                className="size-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-semibold text-white tracking-tight">
                {MONTH_NAMES[currentMonth]} <span className="text-zinc-500 font-mono">{currentYear}</span>
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="size-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="font-mono text-[10px] tracking-widest uppercase text-zinc-600 py-1.5">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {leadingBlanks.map((_, i) => (
                <div key={`blank-${i}`} aria-hidden />
              ))}

              {currentMonthDays.map((d) => {
                const iso = toISO(currentYear, currentMonth, d);
                const isSelected = selectedDateStr === iso;
                const isPast = iso < todayISO;
                const isToday = iso === todayISO;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={isPast}
                    onClick={() => update({ date: iso })}
                    aria-pressed={isSelected}
                    aria-label={iso}
                    className={cn(
                      "relative aspect-square min-h-[38px] rounded-lg text-xs sm:text-sm font-semibold tabular-nums transition-all duration-150 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed",
                      isSelected
                        ? "bg-brand-mauve text-zinc-950 shadow-[0_8px_20px_-8px_rgba(152,123,165,0.7)]"
                        : isPast
                        ? "text-zinc-700"
                        : "text-zinc-200 hover:bg-white/[0.07] hover:text-white active:scale-95"
                    )}
                  >
                    {d}
                    {isToday && !isSelected && (
                      <span aria-hidden className="absolute bottom-1.5 size-1 rounded-full bg-brand-mauve" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Panel>

        <div className="space-y-4 sm:space-y-5">
          {/* Duration */}
          <Panel
            icon={Timer}
            title="Session length"
            description="Billed per hour · max 12h"
            aside={
              <Counter
                value={duration}
                min={1}
                max={12}
                onChange={(v) => update({ durationHours: v })}
                format={(v) => `${v}h`}
                decLabel="Decrease duration"
                incLabel="Increase duration"
              />
            }
          />

          {/* Headcount */}
          <Panel icon={Users} title="People on set" description="Talent & guests recording">
            <div className="grid grid-cols-5 gap-1.5">
              {PEOPLE_OPTIONS.map((val) => {
                const numVal = typeof val === "number" ? val : 5;
                return (
                  <ChoiceChip
                    key={val}
                    selected={currentPeople === numVal}
                    onClick={() => update({ headcount: numVal })}
                  >
                    {val}
                  </ChoiceChip>
                );
              })}
            </div>
          </Panel>

          {/* Time */}
          <Panel icon={Clock} title="Call time" description="Studio hours 9 AM – 8 PM">
            <div className="grid grid-cols-4 sm:grid-cols-4 xl:grid-cols-3 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <ChoiceChip
                  key={slot}
                  selected={selectedTime === slot}
                  onClick={() => update({ time: slot })}
                  className="text-[10px] sm:text-[11px] min-h-[36px] sm:min-h-[40px] px-1"
                >
                  {slot}
                </ChoiceChip>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
