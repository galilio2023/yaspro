"use client";

import { getLocalCalendarDate } from "@/features/gear/lib/rental-schedule";

import { useMemo } from "react";
import { Clock, Calendar, Check } from "lucide-react";
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
      const iso = getLocalCalendarDate(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();
      list.push({ iso, dayName, monthName, dayNum });
    }
    return list;
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* 1. Centerpiece Headcount Selector (Matching Live Screenshot) */}
      <div className="py-8 px-4 rounded-3xl bg-zinc-950/80 border border-white/10 flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated Vector Illustration: Studio Mic with 2 Speech Bubbles */}
        <div className="relative size-28 sm:size-32 flex items-center justify-center">
          {/* Left Speech Bubble */}
          <div className="absolute -left-2 top-2 size-10 rounded-2xl bg-[#9450CE] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
            <span className="font-mono text-sm font-black tracking-widest leading-none pb-1">...</span>
            <div className="absolute -bottom-1 right-2 size-2.5 bg-[#9450CE] rotate-45" />
          </div>

          {/* Right Speech Bubble */}
          <div className="absolute -right-2 top-0 size-11 rounded-2xl bg-[#9450CE] text-white flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse delay-150">
            <span className="font-mono text-sm font-black tracking-widest leading-none pb-1">...</span>
            <div className="absolute -bottom-1 left-2 size-2.5 bg-[#9450CE] rotate-45" />
          </div>

          {/* Centerpiece Microphone Illustration */}
          <svg
            viewBox="0 0 100 120"
            className="w-20 h-24 drop-shadow-[0_0_15px_rgba(148,80,206,0.3)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Mic capsule body */}
            <rect x="34" y="10" width="32" height="52" rx="16" fill="url(#mic-grad)" stroke="#ffffff" strokeWidth="2" />
            {/* Mic grille horizontal lines */}
            <line x1="38" y1="24" x2="62" y2="24" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="38" y1="32" x2="62" y2="32" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="38" y1="40" x2="62" y2="40" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
            <line x1="38" y1="48" x2="62" y2="48" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
            {/* Center vertical grille line */}
            <line x1="50" y1="14" x2="50" y2="58" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
            {/* U-shaped mount */}
            <path d="M26 38 C26 66, 74 66, 74 38" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
            {/* Stem */}
            <line x1="50" y1="68" x2="50" y2="92" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Modern weighted base */}
            <path d="M30 102 C30 96, 70 96, 70 102 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            <ellipse cx="50" cy="102" rx="28" ry="6" fill="#15803d" />

            <defs>
              <linearGradient id="mic-grad" x1="34" y1="10" x2="66" y2="62" gradientUnits="userSpaceOnUse">
                <stop stopColor="#e2e8f0" />
                <stop offset="0.5" stopColor="#94a3b8" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            How many people will be recording?
          </h2>
          <p className="text-xs sm:text-sm text-text-muted">
            Choose how many seats and microphones you need in the studio
          </p>
        </div>

        {/* Circular Headcount Pills (Matching Live Screenshot) */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2">
          {[1, 2, 3, 4, 5].map((count) => {
            const isSelected = session.headcount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onChange({ headcount: count })}
                className={`size-13 sm:size-15 rounded-full font-black text-base sm:text-lg transition-all duration-300 flex items-center justify-center ${
                  isSelected
                    ? "bg-[#9450CE] text-white shadow-[0_0_30px_rgba(148,80,206,0.6)] scale-110 ring-2 ring-white/40"
                    : "bg-zinc-900/90 text-white/70 border border-white/10 hover:border-white/30 hover:text-white hover:bg-zinc-800 hover:scale-105"
                }`}
              >
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Session Duration */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-white">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold">Session duration</h3>
            <p className="text-xs text-text-muted">Standard recording session length</p>
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
            Includes professional studio operator & sound check
          </span>
        </div>
      </div>

      {/* 3. Date Selection */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
        <div className="flex items-center gap-3 text-white">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold">Select date</h3>
            <p className="text-xs text-text-muted">Upcoming availability at Iris Bay Studio, Dubai</p>
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
                    ? "bg-[#9450CE] text-white border-purple-400 font-bold shadow-[0_0_20px_rgba(148,80,206,0.4)] scale-[1.03]"
                    : "bg-white/[0.02] text-white/80 border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <span className={`text-[11px] uppercase tracking-wider ${isSelected ? "text-white font-semibold" : "text-text-muted"}`}>
                  {item.dayName}
                </span>
                <span className="text-lg font-bold leading-none">
                  {item.dayNum}
                </span>
                <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-text-muted"}`}>
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
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold">Select start time</h3>
              <p className="text-xs text-text-muted">Scheduled slots with sound engineer</p>
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
                    ? "bg-[#9450CE] text-white border-purple-400 font-bold shadow-[0_0_20px_rgba(148,80,206,0.4)] scale-[1.03]"
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
