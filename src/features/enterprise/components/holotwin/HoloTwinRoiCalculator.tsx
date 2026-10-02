"use client";

import React from "react";
import { TrendingDown, ArrowRight } from "lucide-react";
import { DigitalTwinLocation } from "../../types";

interface HoloTwinRoiCalculatorProps {
  selectedTwin: DigitalTwinLocation;
  onSelectEnvironmentForRfp?: (environmentName: string) => void;
}

export function HoloTwinRoiCalculator({
  selectedTwin,
  onSelectEnvironmentForRfp,
}: HoloTwinRoiCalculatorProps) {
  const traditionalLocationCost = 145000;
  const virtualStageCost = Math.round(
    traditionalLocationCost * (1 - selectedTwin.permitSavingsPercentage / 100)
  );
  const estimatedSavings = traditionalLocationCost - virtualStageCost;

  return (
    <div className="p-5 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
      {/* Description info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-1.5">
          <TrendingDown size={14} className="shrink-0 text-emerald-400" />
          <span>SOVEREIGN PRODUCTION COST OPTIMIZATION</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
          Virtual Production vs. Physical Location Permits ({selectedTwin.region})
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          Calibrated Unreal 5.4 photogrammetry volume in Dubai and Cairo bypasses flight logistics, military airspace drone clearances, crew visas, and unpredictable weather delays.
        </p>
      </div>

      {/* Metrics Card: Adaptive responsive layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-black/60 p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-6 divide-x divide-white/10 text-center sm:text-left">
          <div className="px-1.5 sm:px-2">
            <div className="text-[10px] sm:text-[11px] text-text-secondary font-mono">Traditional Shoot</div>
            <div className="text-xs sm:text-sm font-bold text-red-400/90 line-through mt-0.5">
              ${traditionalLocationCost.toLocaleString()}
            </div>
            <div className="text-[9px] text-text-muted mt-0.5 hidden xs:block">Permits &amp; flights</div>
          </div>

          <div className="px-1.5 sm:px-2 pl-2.5 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-emerald-400 font-mono font-bold">Virtual Stage</div>
            <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
              ${virtualStageCost.toLocaleString()}
            </div>
            <div className="text-[9px] text-emerald-400/80 font-mono mt-0.5 hidden xs:block">
              {selectedTwin.permitSavingsPercentage}% off physical
            </div>
          </div>

          <div className="px-1.5 sm:px-2 pl-2.5 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-amber-400 font-mono font-bold">Client Net Savings</div>
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono mt-0.5">
              +${estimatedSavings.toLocaleString()}
            </div>
            <div className="text-[9px] text-amber-400/80 font-mono mt-0.5 hidden xs:block">Direct ROI gain</div>
          </div>
        </div>

        {onSelectEnvironmentForRfp && (
          <button
            type="button"
            onClick={() => onSelectEnvironmentForRfp(selectedTwin.name)}
            className="w-full sm:w-auto btn-brand py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg hover:shadow-amber-500/25 transition-all mt-2 sm:mt-0"
          >
            <span>Reserve Stage</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}
