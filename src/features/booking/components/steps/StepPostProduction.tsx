"use client";

import type { WizardStepProps, AddonItem } from "../../types";
import { ADDONS_ITEMS } from "../../constants";
import { CardMedia, MetaTag, PriceLine, SelectableCard, StepIntro, TogglePill } from "../ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function StepPostProduction({
  state,
  update,
  addons = ADDONS_ITEMS,
}: WizardStepProps & { addons?: readonly AddonItem[] }) {
  const { t, isArabic } = useLanguage();
  const selectedIds = state.selectedAddonIds || [];

  const handleToggle = (id: string) => {
    update({
      selectedAddonIds: selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id],
    });
  };

  return (
    <div>
      <StepIntro
        index={6}
        total={7}
        title={t("studioBooking.step6.title")}
        description={t("studioBooking.step6.description")}
        aside={<MetaTag tone={selectedIds.length ? "mauve" : "neutral"}>{t("studioBooking.step6.selectedCount", { count: selectedIds.length })}</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addons.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const displayTitle = (isArabic && item.titleAr) || item.title;
          const displayDesc = (isArabic && item.descriptionAr) || item.description;
          return (
            <SelectableCard key={item.id} selected={isSelected} onSelect={() => handleToggle(item.id)}>
              <CardMedia src={item.imageUrl} alt={displayTitle} className="aspect-[2.35/1] sm:aspect-[2.39/1]" />
              <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{displayTitle}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">{displayDesc}</p>
                </div>
                <div className="mt-auto pt-2.5 sm:pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <PriceLine
                    amount={item.price}
                    unit={item.priceType === "hourly" ? t("studioBooking.step6.unitHour") : t("studioBooking.step6.unitService")}
                    emphasis={isSelected}
                  />
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
