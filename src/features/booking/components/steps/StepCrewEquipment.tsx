"use client";

import Image from "next/image";
import type { WizardStepProps } from "../../types";
import { CREW_EQUIPMENT_ITEMS } from "../../constants";

export function StepCrewEquipment({ state, update }: WizardStepProps) {
  const selectedIds = state.selectedCrewEquipmentIds || [];

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      update({
        selectedCrewEquipmentIds: selectedIds.filter((item) => item !== id),
      });
    } else {
      update({
        selectedCrewEquipmentIds: [...selectedIds, id],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Crew &amp; Equipment</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Select professional crew members and equipment for your session
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CREW_EQUIPMENT_ITEMS.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-[#101422] border-[#7c3aed] ring-2 ring-[#7c3aed]/50 shadow-lg shadow-purple-900/20"
                  : "bg-[#0d111a]/90 border-white/10 hover:border-white/25 hover:bg-[#131724]"
              }`}
            >
              <div>
                {/* Photo Banner */}
                <div className="relative w-full h-32 sm:h-36 bg-zinc-900">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-transparent to-transparent" />
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="text-white font-bold text-sm sm:text-base">{item.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="text-[#8b5cf6] font-extrabold text-xs sm:text-sm">
                  AED {item.price.toFixed(2)}{" "}
                  <span className="text-zinc-400 font-normal text-[11px]">
                    / {item.priceType === "hourly" ? "per hour" : "per service"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                      : "bg-[#181d29] hover:bg-[#202738] text-zinc-300 border border-white/10"
                  }`}
                >
                  {isSelected ? "Remove" : "Add"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
