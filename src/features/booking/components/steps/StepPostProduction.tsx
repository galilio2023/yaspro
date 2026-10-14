"use client";

import type { AddonItem, WizardStepProps } from "../../types";
import { ADDONS_ITEMS } from "../../constants";
import { CardMedia, MetaTag, PriceLine, SelectableCard, StepIntro, TogglePill } from "../ui/BookingKit";

interface StepPostProductionProps extends WizardStepProps {
  items?: AddonItem[];
}

export function StepPostProduction({ state, update, items: customItems }: StepPostProductionProps) {
  const selectedIds = state.selectedAddonIds || [];

  const handleToggle = (id: string) => {
    update({
      selectedAddonIds: selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id],
    });
  };

  const items = customItems && customItems.length > 0 ? customItems : ADDONS_ITEMS;

  return (
    <div>
      <StepIntro
        index={6}
        total={7}
        title="Post Production"
        description="Optional — hand off editing, grading and sound so you leave with finished assets."
        aside={<MetaTag tone={selectedIds.length ? "mauve" : "neutral"}>{selectedIds.length} selected</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <SelectableCard key={item.id} selected={isSelected} onSelect={() => handleToggle(item.id)}>
              <CardMedia src={item.imageUrl} alt={item.title} className="aspect-[2.35/1] sm:aspect-[2.39/1]" />
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
