"use client";

import { useMemo } from "react";
import { Users, Clock, Calendar, Check } from "lucide-react";
import { TIME_SLOTS } from "../data";
import { PodcastSessionItem } from "../types";

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
      const iso = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      list.push({ iso, dayName, monthName, dayNum });
    }
    return list;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Headcount */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-white">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Users size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold">How many people will be recording?</h3>
            <p className="text-xs text-text-muted">Select the number of hosts and guests in the room</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2.5 sm:gap-4 max-w-md">
          {[1, 2, 3, 4, 5].map((count) => {
            const isSelected = session.headcount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onChange({ headcount: count })}
                className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.02]"
                    : "bg-white/[0.03] text-white/80 border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                {count} {count === 1 ? "seat" : "seats"}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Session Duration */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-white">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold">Session duration</h3>
            <p className="text-xs text-text-muted">Standard booking is 1 to 6 hours</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10">
            <button
              type="button"
              disabled={session.durationHours <= 1}
              onClick={() => onChange({ durationHours: Math.max(1, session.durationHours - 1) })}
              className="size-10 rounded-lg flex items-center justify-center text-lg font-bold text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              −
            </button>
            <span className="w-16 text-center font-bold text-white text-base">
              {session.durationHours}h
            </span>
            <button
              type="button"
              disabled={session.durationHours >= 8}
              onClick={() => onChange({ durationHours: Math.min(8, session.durationHours + 1) })}
              className="size-10 rounded-lg flex items-center justify-center text-lg font-bold text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              +
            </button>
          </div>
          <span className="text-xs text-text-muted">
            Includes studio operator & audio setup
          </span>
        </div>
      </div>

      {/* 3. Date Selection */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-white">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold">Select date</h3>
            <p className="text-xs text-text-muted">Choose your preferred session date</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {upcomingDates.map((item) => {
            const isSelected = session.date === item.iso;
            return (
              <button
                key={item.iso}
                type="button"
                onClick={() => onChange({ date: item.iso })}
                className={`p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.03]"
                    : "bg-white/[0.02] text-white/80 border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <span className={`text-[11px] uppercase tracking-wider ${isSelected ? "text-black/80 font-semibold" : "text-text-muted"}`}>
                  {item.dayName}
                </span>
                <span className="text-lg font-bold leading-none">
                  {item.dayNum}
                </span>
                <span className={`text-[10px] ${isSelected ? "text-black/70" : "text-text-muted"}`}>
                  {item.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Time Slot Selection */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold">Select start time</h3>
              <p className="text-xs text-text-muted">Available slots at Iris Bay Studio, Dubai</p>
            </div>
          </div>
          {session.timeSlot && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Check size={12} /> {session.timeSlot} Selected
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {TIME_SLOTS.map((time) => {
            const isSelected = session.timeSlot === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => onChange({ timeSlot: time })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all duration-200 text-center ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-400 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.03]"
                    : "bg-white/[0.02] text-white/80 border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
