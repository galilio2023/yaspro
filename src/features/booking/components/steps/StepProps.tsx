"use client";

import React, { useState } from "react";
import type { WizardStepProps } from "../../types";
import { PROPS_ITEMS, PROP_CATEGORIES } from "../../constants";
import { CardMedia, ChoiceChip, MetaTag, PriceLine, SelectableCard, StepIntro, TogglePill } from "../ui/BookingKit";

export function StepProps({ state, update }: WizardStepProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const selectedIds = state.selectedPropIds || [];

  const handleToggle = (id: string) => {
    update({
      selectedPropIds: selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id],
    });
  };

  const filteredProps = activeCategory === "All"
    ? PROPS_ITEMS
    : PROPS_ITEMS.filter((p) => p.category === activeCategory);

  return (
    <div>
      <StepIntro
        index={5}
        total={7}
        title="Props & Set Design"
        description="Optional — dress the set with furniture, backdrops and styling pieces."
        aside={<MetaTag tone={selectedIds.length ? "amber" : "neutral"}>{selectedIds.length} selected</MetaTag>}
      />

      {/* Category filter — horizontal scroll on mobile */}
      <div className="-mx-1 px-1 mb-5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PROP_CATEGORIES.map((cat) => (
          <ChoiceChip
            key={cat}
            selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className="px-4 rounded-full shrink-0 whitespace-nowrap"
          >
            {cat}
          </ChoiceChip>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredProps.map((prop) => {
          const isSelected = selectedIds.includes(prop.id);
          return (
            <SelectableCard key={prop.id} selected={isSelected} onSelect={() => handleToggle(prop.id)}>
              <CardMedia src={prop.imageUrl} alt={prop.title} contain className="aspect-square" />
              <div className="p-3 sm:p-4 flex-1 flex flex-col gap-2.5">
                <h3 className="text-white font-semibold text-sm tracking-tight line-clamp-2">{prop.title}</h3>
                <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <PriceLine amount={prop.price} emphasis={isSelected} />
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
