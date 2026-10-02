import { cn, formatCurrency } from "@/lib/utils";
import type { WizardStepProps } from "../../types";
import { SESSION_TYPES, TURNKEY_STUDIO_PACKAGES } from "../../constants";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check } from "lucide-react";

export function StepSessionType({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-6">
      {/* 1. Turnkey Studio Packages (Imported from Yas Pro Production Portfolio) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-white">
              Turnkey Production Packages
            </span>
          </div>
          <span className="text-[11px] text-text-muted">
            All-Inclusive Flat Deals
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          {TURNKEY_STUDIO_PACKAGES.filter((p) => p.id !== "none").map((pkg) => {
            const isSelected = state.turnkeyPackageId === pkg.id;
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() =>
                  update({
                    turnkeyPackageId: isSelected ? "none" : pkg.id,
                    sessionType: "podcast",
                  })
                }
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative",
                  isSelected
                    ? "border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10"
                    : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/[0.08]"
                )}
              >
                {pkg.isPopular && (
                  <Badge variant="gold" className="absolute -top-2.5 right-3 text-[9px] px-2 py-0">
                    Most Popular
                  </Badge>
                )}
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-bold text-white text-sm font-display">{pkg.name}</span>
                  </div>
                  <div className="text-amber-400 font-extrabold text-base mb-2 font-mono">
                    {formatCurrency(pkg.rate)}
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed mb-3">
                    {pkg.description}
                  </p>
                  <ul className="space-y-1 text-[11px] text-text-muted mb-3">
                    {pkg.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <Check size={11} className="text-emerald-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] font-bold text-amber-400">
                  {isSelected ? "Package Locked ✓" : "Select Deal"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Standard Session Type */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
            Or Choose Custom Production Format
          </span>
          {state.turnkeyPackageId && state.turnkeyPackageId !== "none" && (
            <button
              type="button"
              onClick={() => update({ turnkeyPackageId: "none" })}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Reset to hourly soundstage
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SESSION_TYPES.map((s) => {
            const isSelected = state.sessionType === s.id && (!state.turnkeyPackageId || state.turnkeyPackageId === "none");

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ sessionType: s.id, turnkeyPackageId: "none" })}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                  isSelected
                    ? "border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/20"
                    : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/[0.08]"
                )}
              >
                <div>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-white font-semibold text-sm font-display">
                    {s.label}
                  </div>
                  <div className="text-text-muted text-[11px] mt-0.5 leading-relaxed line-clamp-2">
                    {s.desc}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-amber-400 font-bold">
                  {isSelected ? "Selected ✓" : "Select"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
