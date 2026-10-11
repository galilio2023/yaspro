"use client";

import { useState } from "react";
import type { WizardStepProps } from "../../types";
import { CREW_EQUIPMENT_ITEMS } from "../../constants";
import { CardMedia, ChoiceChip, MetaTag, PriceLine, SelectableCard, StepIntro, TogglePill } from "../ui/BookingKit";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "crew", label: "Crew" },
  { id: "equipment", label: "Equipment" },
] as const;

export function StepCrewEquipment({ state, update }: WizardStepProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const selectedIds = state.selectedCrewEquipmentIds || [];

  const handleToggle = (id: string) => {
    update({
      selectedCrewEquipmentIds: selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id],
    });
  };

  const items = filter === "all" ? CREW_EQUIPMENT_ITEMS : CREW_EQUIPMENT_ITEMS.filter((i) => i.category === filter);
  const hasCategories = CREW_EQUIPMENT_ITEMS.some((i) => i.category === "crew") && CREW_EQUIPMENT_ITEMS.some((i) => i.category === "equipment");

  return (
    <div>
      <StepIntro
        index={4}
        total={7}
        title="Crew & Equipment"
        description="Optional — add operators and camera, lighting or audio packages."
        aside={<MetaTag tone={selectedIds.length ? "mauve" : "neutral"}>{selectedIds.length} selected</MetaTag>}
      />

      {hasCategories && (
        <div className="flex gap-1.5 mb-5">
          {FILTERS.map((f) => (
            <ChoiceChip key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)} className="px-4 rounded-full">
              {f.label}
            </ChoiceChip>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <SelectableCard key={item.id} selected={isSelected} onSelect={() => handleToggle(item.id)}>
              <CardMedia src={item.imageUrl} alt={item.title} className="aspect-[2.35/1] sm:aspect-[16/9]">
                <span className="absolute top-2.5 start-2.5 sm:top-3 sm:start-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-white/85">
                  {item.category}
                </span>
              </CardMedia>
              <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{item.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">{item.description}</p>
                </div>
                <div className="mt-auto pt-2.5 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <PriceLine amount={item.price} unit={item.priceType === "hourly" ? "hour" : "service"} emphasis={isSelected} />
                  <TogglePill selected={isSelected} />
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
