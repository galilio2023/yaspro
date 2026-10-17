"use client";

import type { WizardStepProps, SessionTypeItem } from "../../types";
import { SESSION_TYPES } from "../../constants";
import { CardMedia, MetaTag, PriceLine, SelectableCard, StepIntro } from "../ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function StepSessionType({
  state,
  update,
  sessionTypes = SESSION_TYPES,
}: WizardStepProps & { sessionTypes?: readonly SessionTypeItem[] }) {
  const { t, isArabic } = useLanguage();

  return (
    <div>
      <StepIntro
        index={2}
        total={7}
        title={t("studioBooking.step2.title")}
        description={t("studioBooking.step2.description")}
        aside={<MetaTag>{t("studioBooking.step2.formatsCount", { count: sessionTypes.length })}</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sessionTypes.map((s, i) => {
          const isSelected = state.sessionType === s.id;
          const displayTitle = (isArabic && (s.titleAr || s.labelAr)) || s.title;
          const displayDesc = (isArabic && (s.descriptionAr || s.descAr)) || s.description;

          return (
            <SelectableCard key={s.id} selected={isSelected} onSelect={() => update({ sessionType: s.id })}>
              <CardMedia src={s.imageUrl} alt={displayTitle} priority={i < 2} className="aspect-[2.35/1] sm:aspect-[16/9]">
                <span className="absolute bottom-2.5 start-2.5 sm:bottom-3 sm:start-3 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/70">
                  {t("studioBooking.step2.formatBadge", { number: String(i + 1).padStart(2, "0") })}
                </span>
              </CardMedia>

              <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{displayTitle}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">{displayDesc}</p>
                </div>
                <div className="mt-auto pt-2.5 sm:pt-3 border-t border-white/[0.06]">
                  <PriceLine amount={s.price} unit={t("studioBooking.step2.unitHour")} emphasis={isSelected} />
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
