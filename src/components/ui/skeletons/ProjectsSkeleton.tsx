"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function ProjectsSkeleton({ className }: { className?: string }) {
  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn("min-h-[85vh] w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10", className)}
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="h-3 w-32 rounded bg-red-500/20 font-mono text-[10px]" />
          </div>
          <div className="h-10 sm:h-12 w-80 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2">
          {["All Showcase", "Virtual Production", "Commercials", "Cinema Features"].map((_, i) => (
            <div key={i} className="h-9 px-3 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center">
              <div className="h-3 w-16 rounded bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Showcase Grid (Widescreen 16:9 & 2.39:1 aspect ratios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 overflow-hidden space-y-4 p-5"
          >
            {/* 16:9 Anamorphic frame */}
            <div className="aspect-video w-full rounded-2xl bg-white/[0.04] border border-white/[0.05] animate-pulse relative flex items-center justify-center">
              <div className="font-mono text-[9px] text-zinc-300">
                [4K HDR // 2.39:1 CINEMATIC PROJECTION]
              </div>
            </div>

            <div className="space-y-2 px-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-amber-400/20 font-mono text-xs" />
                <div className="h-3 w-16 rounded bg-white/10" />
              </div>
              <div className="h-6 w-3/4 rounded bg-white/15 animate-pulse" />
              <div className="h-3.5 w-full rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
