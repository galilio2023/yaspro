import { Users, Camera, Check } from "lucide-react";
import type { WizardStepProps } from "../../types";
import { STUDIO_GEAR_PACKAGES } from "../../constants";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function StepCrewEquipment({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-6">
      {/* 1. Turnkey Equipment Package Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary">
            Select Studio Camera &amp; Lighting Rig
          </label>
          <span className="text-[11px] text-amber-400 font-mono">
            Calibrated on Soundstage Arrival
          </span>
        </div>

        <div className="space-y-2.5">
          {STUDIO_GEAR_PACKAGES.map((pkg) => {
            const isSelected = (state.selectedGearPackage || "none") === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => update({ selectedGearPackage: pkg.id })}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-amber-500 text-zinc-950 font-bold"
                        : "bg-white/5 text-text-muted"
                    }`}
                  >
                    <Camera size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white block">
                        {pkg.name}
                      </span>
                      {pkg.rate > 0 && (
                        <Badge variant="gold" className="text-[10px] px-2 py-0">
                          +{formatCurrency(pkg.rate)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>
                </div>

                <div
                  className={`size-6 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                    isSelected
                      ? "border-amber-500 bg-amber-500 text-zinc-950 font-bold"
                      : "border-white/20 bg-transparent"
                  }`}
                >
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Dedicated Production Crew Add-on */}
      <div className="pt-2">
        <label className="flex items-center justify-between p-4 rounded-2xl border border-white/10 hover:border-amber-500/40 bg-white/5 cursor-pointer transition-all">
          <div className="flex items-center gap-3.5">
            <input
              type="checkbox"
              checked={state.needsCrew}
              onChange={(e) => update({ needsCrew: e.target.checked })}
              className="accent-amber-500 size-5 rounded cursor-pointer"
            />
            <div>
              <span className="text-white font-semibold text-sm block">
                Add Dedicated Studio Production Crew (+500 AED)
              </span>
              <span className="text-text-muted text-xs">
                Includes on-set Director of Photography (DoP), gaffer, and audio sound recordist.
              </span>
            </div>
          </div>
          <Users size={20} className="text-amber-400 shrink-0 hidden sm:block" />
        </label>
      </div>

      {/* 3. Special Equipment Notes */}
      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-2">
          Special Equipment Notes &amp; Requests
        </label>
        <textarea
          rows={3}
          value={state.equipmentNotes}
          onChange={(e) => update({ equipmentNotes: e.target.value })}
          placeholder="Specify if you require wireless lavaliers, teleprompter, ARRI/Sony anamorphic optics, or green screen chroma keying..."
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-text-muted focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none resize-none transition-all text-sm"
        />
      </div>
    </div>
  );
}
