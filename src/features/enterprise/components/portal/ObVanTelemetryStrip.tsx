"use client";

import React from "react";
import { Wifi, Activity, Radio, ShieldCheck } from "lucide-react";

export function ObVanTelemetryStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
      <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 text-text-muted text-[9px] sm:text-[10px] font-mono mb-1">
          <Wifi size={12} className="text-emerald-400 shrink-0" />
          <span className="truncate">SATELLITE MARGIN</span>
        </div>
        <div className="text-base sm:text-lg font-black text-white font-mono">+14.2 dB</div>
        <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono truncate">Dual Ku/Ka Locked</div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 text-text-muted text-[9px] sm:text-[10px] font-mono mb-1">
          <Activity size={12} className="text-amber-400 shrink-0" />
          <span className="truncate">5G PRIVATE NETWORK</span>
        </div>
        <div className="text-base sm:text-lg font-black text-white font-mono">22ms Edge</div>
        <div className="text-[9px] sm:text-[10px] text-amber-400 font-mono truncate">Dedicated Slice</div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 text-text-muted text-[9px] sm:text-[10px] font-mono mb-1">
          <Radio size={12} className="text-amber-400 shrink-0" />
          <span className="truncate">EVS REPLAY INGEST</span>
        </div>
        <div className="text-base sm:text-lg font-black text-white font-mono">12 Channels</div>
        <div className="text-[9px] sm:text-[10px] text-amber-400 font-mono truncate">XT-VIA Zero Latency</div>
      </div>

      <div className="p-3 sm:p-3.5 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-1.5 text-text-muted text-[9px] sm:text-[10px] font-mono mb-1">
          <ShieldCheck size={12} className="text-amber-400 shrink-0" />
          <span className="truncate">POWER REDUNDANCY</span>
        </div>
        <div className="text-base sm:text-lg font-black text-white font-mono">2x 60 kVA</div>
        <div className="text-[9px] sm:text-[10px] text-amber-400 font-mono truncate">Auto-Failover UPS</div>
      </div>
    </div>
  );
}
