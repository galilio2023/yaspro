"use client";

import Image from "next/image";
import type { WizardStepProps } from "../../types";
import { SESSION_TYPES } from "../../constants";

export function StepSessionType({ state, update }: WizardStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Choose Session Type</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Select the type of session you need</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SESSION_TYPES.map((s) => {
          const isSelected = state.sessionType === s.id;

          return (
            <div
              key={s.id}
              onClick={() => update({ sessionType: s.id })}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#101422] border-[#7c3aed] ring-2 ring-[#7c3aed]/50 shadow-lg shadow-purple-900/20"
                  : "bg-[#0d111a]/90 border-white/10 hover:border-white/25 hover:bg-[#131724]"
              }`}
            >
              <div>
                {/* Session Photo Banner */}
                <div className="relative w-full h-32 sm:h-36 bg-zinc-900">
                  <Image
                    src={s.imageUrl}
                    alt={s.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-transparent to-transparent" />
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-white font-bold text-sm sm:text-base">{s.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                    {s.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="text-[#8b5cf6] font-extrabold text-xs sm:text-sm tracking-wide">
                  AED {s.price.toFixed(2)}/hour
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
