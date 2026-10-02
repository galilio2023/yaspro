"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function GearShopSkeleton({ className }: { className?: string }) {
  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn("min-h-[85vh] w-full pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8", className)}
      aria-hidden="true"
    >
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {["All Cinema Gear", "Arri & RED Cameras", "Cooke & Zeiss Lenses", "Lighting", "Audio & Comms"].map(
            (cat, i) => (
              <div
                key={i}
                className={cn(
                  "h-9 px-4 rounded-full border border-white/[0.08] bg-white/[0.03] animate-pulse shrink-0 flex items-center",
                  i === 0 && "border-amber-400/30 bg-amber-400/10"
                )}
              >
                <div className="h-3 w-16 rounded bg-white/20" />
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-full sm:w-64 rounded-xl border border-white/[0.08] bg-white/[0.02] animate-pulse" />
          <div className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-5 flex flex-col justify-between space-y-4"
          >
            {/* Gear Image Placeholder */}
            <div className="h-44 w-full rounded-2xl bg-white/[0.04] border border-white/[0.05] animate-pulse relative overflow-hidden flex items-center justify-center">
              <div className="font-mono text-[9px] text-zinc-300">
                [CINEMA GEAR // 8K SENSOR]
              </div>
            </div>

            {/* Spec metadata */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 w-16 rounded bg-amber-400/20" />
                <div className="h-3 w-12 rounded bg-white/10" />
              </div>
              <div className="h-5 w-4/5 rounded bg-white/15 animate-pulse" />
              <div className="h-3.5 w-2/3 rounded bg-white/5 animate-pulse" />
            </div>

            {/* Price & Add to Cart button */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="h-2.5 w-10 rounded bg-white/10 mb-1" />
                <div className="h-5 w-16 rounded bg-amber-400/25 animate-pulse" />
              </div>
              <div className="h-9 w-24 rounded-xl bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
