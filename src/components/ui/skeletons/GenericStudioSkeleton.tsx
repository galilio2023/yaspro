"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface StudioSkeletonProps {
  className?: string;
}

export function GenericStudioSkeleton({ className }: StudioSkeletonProps) {
  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn("min-h-[80vh] w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10", className)}
      aria-hidden="true"
    >
      {/* Studio Header HUD Telemetry */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500/70 animate-ping" />
            <div className="h-3.5 w-28 rounded-full bg-white/15 animate-pulse" />
            <div className="h-3.5 w-16 rounded bg-white/10 animate-pulse font-mono text-[10px]" />
          </div>
          <div className="h-9 sm:h-12 w-64 sm:w-96 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-4 w-72 sm:w-80 rounded-md bg-white/5 animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-28 rounded-full bg-white/10 animate-pulse" />
          <div className="h-10 w-36 rounded-full bg-amber-500/20 border border-amber-500/30 animate-pulse" />
        </div>
      </div>

      {/* Main Grid Frame with Viewfinder Accents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Stage / Focal Hero Card */}
        <div className="md:col-span-2 rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 font-mono text-[9px] text-zinc-300">
            [CAM A // PRIMARY SOUNDSTAGE]
          </div>
          <div className="h-64 sm:h-80 w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse flex items-center justify-center relative">
            {/* Viewfinder crosshair */}
            <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-400/40 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-3/4 rounded-lg bg-white/10 animate-pulse" />
            <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
          </div>
        </div>

        {/* Telemetry / Control Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 space-y-4">
            <div className="h-4 w-32 rounded bg-white/15 animate-pulse" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/[0.04]">
                  <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                  <div className="h-3.5 w-16 rounded bg-amber-400/20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 space-y-4">
            <div className="h-4 w-28 rounded bg-white/15 animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-9 w-full rounded-xl bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
