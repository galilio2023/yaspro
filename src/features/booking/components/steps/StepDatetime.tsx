import { cn } from "@/lib/utils";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "../../types";

const HEADCOUNT_OPTIONS = [1, 2, 3, 4, 6, "10+"] as const;

export function StepDatetime({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Session Date">
          <Input
            type="date"
            value={state.date}
            onChange={(e) => update({ date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
        </FormField>
        <FormField label="Start Time (09:00 AM – 09:00 PM)">
          <Input
            type="time"
            value={state.time}
            min="09:00"
            max="21:00"
            onChange={(e) => update({ time: e.target.value })}
          />
        </FormField>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
            Session Duration
          </label>
          <span className="text-amber-400 font-bold text-sm">
            {state.durationHours} Hours
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          value={state.durationHours}
          onChange={(e) => update({ durationHours: Number(e.target.value) })}
          className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>1h (Quick Session)</span>
          <span>6h (Half Day)</span>
          <span>12h (Full Day Block)</span>
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-3">
          How many people will attend the shoot?
        </label>
        <div className="flex gap-3 flex-wrap">
          {HEADCOUNT_OPTIONS.map((n) => {
            const count = typeof n === "number" ? n : 10;
            const isSelected = state.headcount === count;

            return (
              <button
                key={n}
                type="button"
                onClick={() => update({ headcount: count })}
                className={cn(
                  "px-5 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-white/5 border-white/10 text-text-secondary hover:border-amber-500/50 hover:text-white"
                )}
              >
                {n} {typeof n === "number" && n === 1 ? "Person" : "People"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
