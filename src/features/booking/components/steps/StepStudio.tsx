"use client";

import Image from "next/image";
import type { WizardStepProps, StudioItem } from "../../types";
import { STUDIOS } from "../../constants";
import { Users, MapPin } from "lucide-react";

export function StepStudio({
  state,
  update,
  studios = STUDIOS as StudioItem[],
}: WizardStepProps & { studios?: StudioItem[] }) {
  const displayStudios = studios && studios.length > 0 ? studios : (STUDIOS as StudioItem[]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Select Studio</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">Choose your preferred recording space</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayStudios.map((s) => {
          const isSelected = state.studioId === s.id;
          const imageSrc = s.imageUrl || s.image || `/images/booking/studio-${s.id}.jpg`;

          return (
            <div
              key={s.id}
              onClick={() => update({ studioId: s.id })}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#101422] border-[#7c3aed] ring-2 ring-[#7c3aed]/50 shadow-lg shadow-purple-900/20"
                  : "bg-[#0d111a]/90 border-white/10 hover:border-white/25 hover:bg-[#131724]"
              }`}
            >
              <div>
                {/* Studio Photo */}
                <div className="relative w-full h-36 sm:h-40 bg-zinc-900">
                  <Image
                    src={imageSrc}
                    alt={s.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-transparent to-transparent" />
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-white font-bold text-sm sm:text-base">{s.name}</h3>

                  {/* Metadata: seats & location */}
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} className="text-zinc-400" />
                      <span>{s.capacity || 10} seats</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-zinc-400" />
                      <span>{s.location || "Iris Bay - Dubai"}</span>
                    </span>
                  </div>

                  {s.description && (
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                  )}

                  {/* Features tags if any */}
                  {s.features && s.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {s.features.slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    update({ studioId: s.id });
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                      : "bg-[#181d29] hover:bg-[#202738] text-zinc-300 border border-white/10"
                  }`}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
