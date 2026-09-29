"use client";

import React from "react";
import { FileCheck2, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { EnterpriseCreatorItem } from "../../types";

interface MawthooqTelemetryPanelProps {
  selectedCreators: EnterpriseCreatorItem[];
  onOpenAuditModal: () => void;
  onBundleCreators?: (creators: string[]) => void;
}

export function MawthooqTelemetryPanel({
  selectedCreators,
  onOpenAuditModal,
  onBundleCreators,
}: MawthooqTelemetryPanelProps) {
  const totalCombinedFollowers = selectedCreators.reduce((acc, c) => {
    const num = parseFloat(c.totalFollowers.replace(/[^\d.]/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const avgSaudiReach = Math.round(
    selectedCreators.reduce((acc, c) => acc + c.saudiReachPct, 0) / (selectedCreators.length || 1)
  );

  const avgUaeReach = Math.round(
    selectedCreators.reduce((acc, c) => acc + c.uaeReachPct, 0) / (selectedCreators.length || 1)
  );

  const totalEstimatedCostAED = selectedCreators.reduce((acc, c) => acc + c.baseCampaignFeeAED, 0);

  return (
    <div className="p-5 sm:p-7 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-teal-light mb-2">
            <FileCheck2 size={14} className="shrink-0 text-brand-teal" />
            <span>ACTIVE CAMPAIGN SYNDICATION SUMMARY</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">
            {selectedCreators.length} Selected Creators ({selectedCreators.map((c) => c.name).join(", ")})
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
            All agreements execute under pre-cleared GAMR Mawthooq advertising licensing and UAE National Media Council commercial guidelines.
          </p>
        </div>

        {/* Metrics Grid: Clean 2x2 grid on mobile, 4-col strip on tablet/desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="p-1">
            <div className="text-[10px] sm:text-[11px] text-text-secondary font-mono">Combined Reach</div>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">{totalCombinedFollowers}M+</div>
          </div>

          <div className="p-1 sm:border-l border-white/10 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-brand-teal-light font-mono font-bold">KSA Penetration</div>
            <div className="text-lg sm:text-xl font-black text-brand-teal-light font-mono mt-0.5">{avgSaudiReach}%</div>
          </div>

          <div className="p-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-1 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-brand-cyan font-mono font-bold">UAE Penetration</div>
            <div className="text-lg sm:text-xl font-black text-brand-cyan font-mono mt-0.5">{avgUaeReach}%</div>
          </div>

          <div className="p-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-1 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-brand-gold font-mono font-bold">Package Range</div>
            <div className="text-base sm:text-xl font-black text-brand-gold font-mono mt-0.5">
              {totalEstimatedCostAED.toLocaleString()} AED
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <AlertCircle size={14} className="text-brand-purple-light shrink-0" />
          <span>Includes Yas Pro 4K Studio shoots, multi-camera direction, and 9:16 viral cutdowns.</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenAuditModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-brand-teal-light border border-brand-teal/40 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <ShieldCheck size={14} />
            <span>Verify GAMR Certificate</span>
          </button>

          {onBundleCreators && (
            <button
              type="button"
              onClick={() => onBundleCreators(selectedCreators.map((c) => c.name))}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-purple via-[#6d28d9] to-brand-teal hover:opacity-95 text-white shadow-lg shadow-brand-purple/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Bundle Creators into RFP</span>
              <ArrowRight size={13} strokeWidth={2.5} className="rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
