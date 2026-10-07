"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { WizardStepProps } from "../../types";
import { PROPS_ITEMS, PROP_CATEGORIES } from "../../constants";

export function StepProps({ state, update }: WizardStepProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const selectedIds = state.selectedPropIds || [];

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      update({
        selectedPropIds: selectedIds.filter((item) => item !== id),
      });
    } else {
      update({
        selectedPropIds: [...selectedIds, id],
      });
    }
  };

  const filteredProps = activeCategory === "All"
    ? PROPS_ITEMS
    : PROPS_ITEMS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Props &amp; Set Design</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Add props and set design elements to enhance your session
        </p>
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {PROP_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                  : "bg-[#141926] text-zinc-400 hover:text-white hover:bg-[#1e2436] border border-white/5"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Props Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredProps.map((prop) => {
          const isSelected = selectedIds.includes(prop.id);

          return (
            <div
              key={prop.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-[#101422] border-[#7c3aed] ring-2 ring-[#7c3aed]/50 shadow-lg shadow-purple-900/20"
                  : "bg-[#0d111a]/90 border-white/10 hover:border-white/25 hover:bg-[#131724]"
              }`}
            >
              <div>
                {/* Prop Cutout Image */}
                <div className="relative w-full h-44 sm:h-48 bg-white/[0.02] flex items-center justify-center p-4">
                  <Image
                    src={prop.imageUrl}
                    alt={prop.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-contain p-2"
                  />
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-white font-bold text-sm sm:text-base">{prop.title}</h3>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="text-white font-bold text-xs sm:text-sm">
                  AED {prop.price.toFixed(2)}{" "}
                  <span className="text-zinc-400 font-normal text-[11px]">
                    / per service
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(prop.id)}
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
