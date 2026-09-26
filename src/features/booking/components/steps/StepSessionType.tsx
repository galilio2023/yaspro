import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../../types";
import { SESSION_TYPES } from "../../constants";

export function StepSessionType({ state, update }: WizardStepProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {SESSION_TYPES.map((s) => {
        const isSelected = state.sessionType === s.id;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => update({ sessionType: s.id })}
            className={cn(
              "p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between",
              isSelected
                ? "border-brand-purple bg-brand-purple/15 shadow-md shadow-brand-purple/20"
                : "border-white/10 bg-white/5 hover:border-brand-purple/40 hover:bg-white/[0.08]"
            )}
          >
            <div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-white font-semibold text-base font-display">
                {s.label}
              </div>
              <div className="text-text-muted text-xs mt-1 leading-relaxed">
                {s.desc}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-brand-purple-light font-medium">
              {isSelected ? "Selected ✓" : "Choose type"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
