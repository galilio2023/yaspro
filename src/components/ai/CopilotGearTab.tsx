"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { GEAR_DATA } from "@/features/gear/data";
import { analyzeGearSelection } from "@/features/gear/lib/compatibility";

export function CopilotGearTab() {
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([
    "arri-alexa-mini-lf",
  ]);

  const compatibilityReport = analyzeGearSelection(selectedGearIds);

  const toggleGearItem = (id: string) => {
    setSelectedGearIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12 xl:col-span-6 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Select Equipment to Test Compatibility
          </h4>
          <span className="text-[11px] text-text-muted">
            {selectedGearIds.length} items chosen
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
          {GEAR_DATA.map((gear) => {
            const isSelected = selectedGearIds.includes(gear.id);
            return (
              <button
                type="button"
                key={gear.id}
                onClick={() => toggleGearItem(gear.id)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between min-h-[44px] text-left w-full ${
                  isSelected
                    ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                    : "bg-white/[0.02] border-white/5 text-text-secondary hover:border-white/20"
                }`}
              >
                <div className="min-w-0 mr-2">
                  <div className="font-semibold text-white truncate">{gear.name}</div>
                  <div className="text-[11px] text-text-muted truncate">
                    {gear.categoryLabel} • {gear.dailyRate} AED/day
                  </div>
                </div>
                <div
                  className={`size-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-brand-purple border-brand-purple text-white"
                      : "border-white/20"
                  }`}
                >
                  {isSelected && <CheckCircle2 size={13} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Compatibility Inspection Report */}
      <div className="lg:col-span-12 xl:col-span-6 bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={14} className="text-brand-cyan" />
              <span>Optical & Power Compatibility Analysis</span>
            </h5>
            {compatibilityReport.isCompatible ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Rig Ready
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Accessories Required
              </span>
            )}
          </div>

          {compatibilityReport.warnings.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Identified Gaps:
              </div>
              {compatibilityReport.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"
                >
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {compatibilityReport.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                Recommended Companion Items:
              </div>
              {compatibilityReport.suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-white">{s.item.name}</div>
                    <div className="text-[11px] text-text-muted">{s.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleGearItem(s.item.id)}
                    className="px-2.5 py-1 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple-light border border-brand-purple/30 text-[11px] font-semibold transition-all shrink-0 min-h-[36px] cursor-pointer"
                  >
                    + Add to Rig
                  </button>
                </div>
              ))}
            </div>
          )}

          {compatibilityReport.warnings.length === 0 && compatibilityReport.suggestions.length === 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              Selected kit is fully self-contained and ready for commercial set deployment.
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-text-muted">
            Total Daily Gear:{" "}
            <span className="text-white font-bold">
              {GEAR_DATA.filter((g) => selectedGearIds.includes(g.id))
                .reduce((sum, g) => sum + g.dailyRate, 0)
                .toLocaleString()}{" "}
              AED
            </span>
          </div>
          <Link
            href={`/shop?preselect=${selectedGearIds.join(",")}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all min-h-[44px] sm:min-h-0"
          >
            <span>Proceed to Gear Rental</span>
            <ArrowRight size={13} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
