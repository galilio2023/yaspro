"use client";

import React from "react";
import Image from "next/image";
import { Activity } from "lucide-react";

export interface CameraFeed {
  id: number;
  label: string;
  source: string;
  image: string;
  status: "ONLINE" | "RECORDING" | "STANDBY";
  resolution: string;
}

interface ObVanMonitorProps {
  activeCam: CameraFeed;
}

export function ObVanMonitor({ activeCam }: ObVanMonitorProps) {
  return (
    <div className="lg:col-span-8 relative aspect-[16/10] bg-black overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
      <Image
        src={activeCam.image}
        alt={activeCam.label}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 750px"
      />

      {/* Top Telemetry Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-red-500/50 text-[10px] sm:text-xs font-mono text-red-400">
          <span className="size-1.5 sm:size-2 rounded-full bg-red-500 animate-ping shrink-0" />
          <span className="font-bold">LIVE</span>
          <span className="text-white/40 hidden xs:inline">|</span>
          <span className="text-white/90 truncate max-w-[150px] sm:max-w-none">{activeCam.label}</span>
        </div>

        <div className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-500/40 text-[10px] sm:text-xs font-mono text-emerald-400 flex items-center gap-1 sm:gap-1.5">
          <Activity size={12} className="shrink-0 text-emerald-400" />
          <span className="hidden xs:inline">12G-SDI</span>
          <span>11.88 Gbps</span>
        </div>
      </div>

      {/* Bottom Monitor Overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none text-[10px] sm:text-xs font-mono text-white/80 bg-black/80 backdrop-blur-md px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-2 truncate mr-2">
          <span className="text-amber-400 font-bold">SOURCE:</span>
          <span className="truncate">{activeCam.source}</span>
        </div>
        <div className="text-amber-400 font-bold shrink-0">{activeCam.resolution}</div>
      </div>
    </div>
  );
}
