"use client";

import { useMemo, useState, useEffect } from "react";
import { Clock, Calendar, Check, Mic2 } from "lucide-react";
import { TIME_SLOTS } from "../data";
import { PodcastSessionItem } from "../types";
import { Counter, Panel, StepIntro, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { getLocalCalendarDate } from "@/features/gear/lib/rental-schedule";
import { getStudioSlotAvailability } from "@/lib/actions/availability-operations";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step1DateTimeProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step1DateTime({ session, onChange }: Step1DateTimeProps) {
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [blackoutReason, setBlackoutReason] = useState<string | undefined>(undefined);

  if (typeof useEffect === "function") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!session.date || typeof getStudioSlotAvailability !== "function") return;
      let cancelled = false;
      getStudioSlotAvailability({
        date: session.date,
        durationHours: session.durationHours,
        podcastSetId: session.studioKey,
      })
        .then((res) => {
          if (!cancelled && res) {
            setUnavailableSlots(res.unavailableSlots || []);
            setBlackoutReason(res.blackoutReason);
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [session.date, session.durationHours, session.studioKey]);
  }

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
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={1}
        total={5}
        title="Schedule & Format"
        description="Choose your guest count, session length, and preferred recording schedule."
      />

      {/* 1. Compact, Tactile Headcount Selector */}
      <div className="py-4 px-3.5 sm:py-6 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#0e0e13] border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3.5 sm:space-y-4 shadow-xl relative overflow-hidden">
        {/* Subtle violet/mauve glow behind mic badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-brand-violet/20 blur-3xl pointer-events-none rounded-full" />

        {/* Compact Microphone Badge */}
        <div className="relative size-12 sm:size-14 rounded-2xl bg-brand-mauve/10 border border-brand-mauve/30 flex items-center justify-center text-brand-lavender shadow-[0_0_30px_rgba(84,37,104,0.35)]">
          <Mic2 size={24} className="stroke-[1.75]" />
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-red-500 animate-pulse border-2 border-[#0e0e13]" title="Live on Air" />
        </div>

        {/* Heading */}
        <div className="space-y-1 max-w-sm">
          <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
            How many guests will be recording?
          </h3>
          <p className="text-xs text-zinc-400">
            Select seats & Shure SM7B broadcast microphones
          </p>
        </div>

        {/* Tactile Headcount Pills */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 pt-0.5 flex-wrap">
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
                  "size-11 sm:size-13 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all duration-200 flex flex-col items-center justify-center cursor-pointer",
                  isSelected
                    ? "bg-brand-violet text-white shadow-[0_10px_25px_-6px_rgba(152,123,165,0.7)] scale-105 ring-2 ring-brand-mauve-soft"
                    : "bg-white/[0.03] text-zinc-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <span>{count}</span>
                <span className={cn("text-[9px] font-mono uppercase tracking-wider font-semibold", isSelected ? "text-brand-lavender font-bold" : "text-zinc-500")}>
                  {count === 1 ? "mic" : "mics"}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. Mobile-Optimized Session Duration Panel */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Icon + Clean Title & Light Subtitle */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-brand-mauve/10 border border-brand-mauve/25 text-brand-lavender flex items-center justify-center shrink-0">
              <Clock size={17} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white leading-tight">
                Session Duration
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                On-site sound engineer & 4K multi-cam capture included
              </p>
            </div>
          </div>

          {/* Right: Quick Hour Presets + Stepper Counter */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onChange({ durationHours: h })}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer",
                    session.durationHours === h
                      ? "bg-brand-violet text-white font-bold shadow-md shadow-brand-violet/40 scale-105"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/10 hover:bg-white/[0.08]"
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>

            <Counter
              value={session.durationHours}
              min={1}
              max={8}
              onChange={(v) => onChange({ durationHours: v })}
              format={(v) => `${v}h`}
              decLabel="Decrease session duration"
              incLabel="Increase session duration"
            />
          </div>
        </div>
      </section>

      {/* 3. Date Selection */}
      <Panel
        icon={Calendar}
        title="Session Date"
        description="Iris Bay Studio availability · Level 18"
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
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
                  "p-2.5 sm:p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer",
                  isSelected
                    ? "bg-brand-violet text-white border-brand-mauve-soft font-bold shadow-[0_10px_25px_-8px_rgba(152,123,165,0.7)] scale-[1.02]"
                    : "bg-white/[0.02] text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <span className={cn("text-[9px] sm:text-[10px] font-mono uppercase tracking-wider", isSelected ? "text-brand-lavender font-bold" : "text-zinc-500")}>
                  {item.dayName}
                </span>
                <span className="text-base sm:text-lg font-black leading-none">
                  {item.dayNum}
                </span>
                <span className={cn("text-[9px] sm:text-[10px] font-mono", isSelected ? "text-white/90 font-semibold" : "text-zinc-500")}>
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
        title="Start Time"
        description="Engineered recording slots"
        aside={
          session.timeSlot ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-semibold whitespace-nowrap shrink-0">
              <Check size={12} strokeWidth={2.5} /> {session.timeSlot}
            </span>
          ) : undefined
        }
      >
        {blackoutReason && (
          <div className="mb-2.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] text-rose-300">
            Schedule Notice: {blackoutReason}
          </div>
        )}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-1.5 sm:gap-2">
          {TIME_SLOTS.map((time) => {
            const isSelected = session.timeSlot === time;
            const isBooked = unavailableSlots.includes(time);
            return (
              <motion.button
                key={time}
                type="button"
                disabled={isBooked}
                onClick={() => !isBooked && onChange({ timeSlot: time })}
                whileTap={isBooked ? undefined : { scale: 0.96 }}
                transition={studioSprings.snappy}
                className={cn(
                  "py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all duration-200 text-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-35",
                  isSelected
                    ? "bg-brand-violet text-white border-brand-mauve-soft font-bold shadow-[0_8px_20px_-6px_rgba(152,123,165,0.6)] scale-[1.02]"
                    : "bg-white/[0.02] text-zinc-300 border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                {isBooked ? `${time} · Booked` : time}
              </motion.button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
