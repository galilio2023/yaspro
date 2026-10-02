import Image from "next/image";
import { cn, formatCurrency } from "@/lib/utils";
import type { WizardStepProps } from "../../types";
import { STUDIOS } from "../../constants";
import { Check } from "lucide-react";

import { VirtualStageConfigurator } from "../VirtualStageConfigurator";

export function StepStudio({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-6">
      <VirtualStageConfigurator />

      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-wider font-semibold text-text-secondary">
          Select Dedicated Soundstage or Suite
        </label>
        <span className="text-[11px] text-amber-400 font-mono">
          Includes Green Room &amp; High-Speed Fiber
        </span>
      </div>

      <div className="space-y-3">
      {STUDIOS.map((s) => {
        const isSelected = state.studioId === s.id;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => update({ studioId: s.id })}
            className={cn(
              "w-full p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group",
              isSelected
                ? "border-amber-500 bg-amber-500/15 shadow-xl shadow-amber-500/20"
                : "border-white/10 bg-white/5 hover:border-amber-500/40 hover:bg-white/[0.08]"
            )}
          >
            <div className="flex items-center gap-4">
              {/* Studio Thumbnail Photo */}
              {s.image && (
                <div className="relative size-18 sm:size-20 rounded-xl overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/50 flex items-center justify-center text-zinc-950 font-black">
                      <Check size={20} strokeWidth={3} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-white font-semibold font-display text-base sm:text-lg mb-0.5">
                  {s.name}
                </div>
                <div className="text-text-muted text-xs leading-relaxed max-w-md">{s.desc}</div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 shrink-0">
              <div className="text-amber-400 font-extrabold text-lg sm:text-xl font-display">
                {formatCurrency(s.rate)}
              </div>
              <div className="text-text-muted text-[11px]">per hour / AED</div>
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}
