"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function StudioBookingSkeleton({ className }: { className?: string }) {
  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn("min-h-[85vh] w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10", className)}
      aria-hidden="true"
    >
      {/* Studio Header HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="h-3 w-32 rounded bg-amber-400/20 font-mono text-[10px]" />
          </div>
          <div className="h-10 sm:h-12 w-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-10 w-40 rounded-xl bg-amber-500/20 border border-amber-500/30 animate-pulse" />
        </div>
      </div>

      {/* Stage Selector Grid */}
      <div className="space-y-4">
        <div className="h-4 w-44 rounded bg-white/10 font-mono text-xs uppercase" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-white/[0.08] bg-zinc-900/30 space-y-3"
            >
              <div className="h-28 w-full rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-white/15 animate-pulse" />
              <div className="h-3.5 w-1/2 rounded bg-amber-400/20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Booking Interface: Calendar & Stage Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Calendar & Time Slots */}
        <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
            <div className="h-5 w-40 rounded bg-white/15 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-8 w-8 rounded-lg bg-white/10 animate-pulse" />
            </div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, idx) => (
              <div
                key={idx}
                className="h-12 rounded-xl border border-white/[0.04] bg-white/[0.02] animate-pulse flex items-center justify-center"
              >
                <div className="h-3 w-4 rounded bg-white/10" />
              </div>
            ))}
          </div>

          {/* Time Slot Telemetry Pills */}
          <div className="pt-4 space-y-3">
            <div className="h-4 w-32 rounded bg-white/10 font-mono text-xs" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
                <div
                  key={slot}
                  className="h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] animate-pulse flex items-center justify-center"
                >
                  <div className="h-3 w-14 rounded bg-white/15" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Stage Specs & Production Summary */}
        <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 space-y-6">
          <div className="h-5 w-36 rounded bg-white/15 animate-pulse" />

          {/* Stage Spec HUD */}
          <div className="space-y-3.5 pt-2">
            {[
              "Dimensions: 40m x 25m",
              "LED Volume: 1.9mm Pixel Pitch",
              "Mo-Sys Camera Tracking",
              "Power: 400A 3-Phase",
            ].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]"
              >
                <div className="h-3.5 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-3.5 w-20 rounded bg-amber-400/25 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Price & Checkout CTA */}
          <div className="pt-6 border-t border-white/[0.08] space-y-4">
            <div className="flex justify-between items-baseline">
              <div className="h-4 w-20 rounded bg-white/10" />
              <div className="h-7 w-28 rounded bg-amber-400/30 animate-pulse" />
            </div>
            <div className="h-12 w-full rounded-2xl bg-amber-500/20 border border-amber-500/40 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
