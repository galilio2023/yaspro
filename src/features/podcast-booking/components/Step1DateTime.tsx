"use client";

import { useMemo } from "react";
import { Clock, Calendar, Check, Mic2 } from "lucide-react";
import { TIME_SLOTS } from "../data";
import { PodcastSessionItem } from "../types";
import { Counter, Panel, StepIntro, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { getLocalCalendarDate } from "@/features/gear/lib/rental-schedule";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step1DateTimeProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step1DateTime({ session, onChange }: Step1DateTimeProps) {
  // Generate dates for the next 14 days
  const upcomingDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = getLocalCalendarDate(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      list.push({ iso, dayName, monthName, dayNum });
    }
    return list;
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <StepIntro
        index={1}
        total={4}
        title="Date & Time"
        description="Choose how many seats you need, session length, and your preferred schedule."
      />

      {/* 1. Centerpiece Headcount Selector */}
      <div className="py-8 px-5 sm:px-8 rounded-3xl bg-[#0e0e13] border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle violet/mauve glow behind mic badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-violet/20 blur-3xl pointer-events-none rounded-full" />

        {/* Cinematic Microphone Badge */}
        <div className="relative size-20 sm:size-24 rounded-3xl bg-brand-mauve/10 border border-brand-mauve/30 flex items-center justify-center text-brand-lavender shadow-[0_0_40px_rgba(84,37,104,0.4)]">
          <Mic2 size={40} className="stroke-[1.75]" />
          <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-red-500 animate-pulse border-2 border-[#0e0e13]" title="Live on Air" />
        </div>

        {/* Heading */}
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            How many people will be recording?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select the number of seats & Shure SM7B broadcast microphones for your show
          </p>
        </div>

        {/* Tactile Headcount Pills */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1">
          {[1, 2, 3, 4, 5].map((count) => {
            const isSelected = session.headcount === count;
            return (
              <motion.button
                key={count}
                type="button"
                onClick={() => onChange({ headcount: count })}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={studioSprings.snappy}
                className={cn(
                  "size-13 sm:size-14 rounded-2xl font-black text-base sm:text-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer",
                  isSelected
                    ? "bg-brand-mauve text-zinc-950 shadow-[0_10px_25px_-6px_rgba(152,123,165,0.7)] scale-105 ring-2 ring-brand-mauve-soft"
                    : "bg-white/[0.03] text-zinc-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <span>{count}</span>
                <span className={cn("text-[9px] font-mono uppercase tracking-wider font-semibold", isSelected ? "text-black/80" : "text-zinc-500")}>
                  {count === 1 ? "mic" : "mics"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. Session Duration */}
      <Panel
        icon={Clock}
        title="Session duration"
        description="Includes studio operator, sound engineer live balance, and instant multi-track capture"
        aside={
          <Counter
            value={session.durationHours}
            min={1}
            max={8}
            onChange={(v) => onChange({ durationHours: v })}
            format={(v) => `${v}h`}
            decLabel="Decrease session duration"
            incLabel="Increase session duration"
          />
        }
      />

      {/* 3. Date Selection */}
      <Panel
        icon={Calendar}
        title="Select date"
        description="Upcoming calendar availability at Iris Bay Studio, Business Bay, Dubai"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {upcomingDates.map((item) => {
            const isSelected = session.date === item.iso;
            return (
              <motion.button
                key={item.iso}
                type="button"
                onClick={() => onChange({ date: item.iso })}
                whileTap={{ scale: 0.96 }}
                transition={studioSprings.snappy}
                className={cn(
                  "p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer",
                  isSelected
                    ? "bg-brand-mauve text-zinc-950 border-brand-mauve-soft font-bold shadow-[0_10px_25px_-8px_rgba(152,123,165,0.7)] scale-[1.02]"
                    : "bg-white/[0.02] text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <span className={cn("text-[10px] font-mono uppercase tracking-wider", isSelected ? "text-zinc-950 font-bold" : "text-zinc-500")}>
                  {item.dayName}
                </span>
                <span className="text-lg font-black leading-none">
                  {item.dayNum}
                </span>
                <span className={cn("text-[10px] font-mono", isSelected ? "text-zinc-900 font-semibold" : "text-zinc-500")}>
                  {item.monthName}
                </span>
              </motion.button>
            );
          })}
        </div>
      </Panel>

      {/* 4. Time Slot Selection */}
      <Panel
        icon={Clock}
        title="Select start time"
        description="Engineered slots with dedicated audio mixer"
        aside={
          session.timeSlot ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold">
              <Check size={12} strokeWidth={2.5} /> {session.timeSlot}
            </span>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7 gap-2">
          {TIME_SLOTS.map((time) => {
            const isSelected = session.timeSlot === time;
            return (
              <motion.button
                key={time}
                type="button"
                onClick={() => onChange({ timeSlot: time })}
                whileTap={{ scale: 0.96 }}
                transition={studioSprings.snappy}
                className={cn(
                  "py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 text-center cursor-pointer",
                  isSelected
                    ? "bg-brand-mauve text-zinc-950 border-brand-mauve-soft font-bold shadow-[0_8px_20px_-6px_rgba(152,123,165,0.6)] scale-[1.02]"
                    : "bg-white/[0.02] text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {time}
              </motion.button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
