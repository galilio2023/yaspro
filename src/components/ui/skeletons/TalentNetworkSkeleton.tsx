"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function TalentNetworkSkeleton({ className }: { className?: string }) {
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
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="h-3 w-28 rounded bg-amber-400/20 font-mono text-[10px]" />
          </div>
          <div className="h-10 sm:h-12 w-72 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded bg-white/5 animate-pulse" />
        </div>

        {/* Territory badges */}
        <div className="flex gap-2">
          {["UAE Network", "Egypt Tier 1", "Jordan Hub"].map((_, i) => (
            <div key={i} className="h-8 px-3 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center">
              <div className="h-2.5 w-14 rounded bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Talent Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 flex flex-col items-center text-center space-y-4"
          >
            {/* Avatar with gold ring accent */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-amber-400/30 bg-white/[0.04] animate-pulse flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.06]" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50" />
            </div>

            {/* Creator details */}
            <div className="space-y-1.5 w-full">
              <div className="h-5 w-3/4 mx-auto rounded bg-white/15 animate-pulse" />
              <div className="h-3 w-1/2 mx-auto rounded bg-amber-400/20 font-mono text-xs" />
            </div>

            {/* Follower reach metrics */}
            <div className="w-full py-2.5 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex justify-around">
              <div>
                <div className="h-4 w-12 rounded bg-white/20 mx-auto mb-1 animate-pulse" />
                <div className="h-2.5 w-10 rounded bg-white/10 mx-auto" />
              </div>
              <div className="w-px h-6 bg-white/[0.08]" />
              <div>
                <div className="h-4 w-12 rounded bg-amber-400/30 mx-auto mb-1 animate-pulse" />
                <div className="h-2.5 w-10 rounded bg-white/10 mx-auto" />
              </div>
            </div>

            {/* Book creator CTA */}
            <div className="h-10 w-full rounded-xl bg-white/10 animate-pulse mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
