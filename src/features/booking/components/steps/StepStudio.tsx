"use client";

import type { WizardStepProps, StudioItem } from "../../types";
import { STUDIOS } from "../../constants";
import { Users, MapPin } from "lucide-react";
import { CardMedia, MetaTag, SelectableCard, StepIntro } from "../ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function StepStudio({
  state,
  update,
  studios = STUDIOS as StudioItem[],
}: WizardStepProps & { studios?: StudioItem[] }) {
  const { t, isArabic } = useLanguage();
  const displayStudios = studios && studios.length > 0 ? studios : (STUDIOS as StudioItem[]);

  return (
    <div>
      <StepIntro
        index={3}
        total={7}
        title={t("studioBooking.step3.title")}
        description={t("studioBooking.step3.description")}
        aside={<MetaTag>{t("studioBooking.step3.stagesCount", { count: displayStudios.length })}</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayStudios.map((s, i) => {
          const isSelected = state.studioId === s.id;
          const imageSrc = s.imageUrl || s.image || `/images/booking/studio-${s.id}.jpg`;
          const displayName = (isArabic && s.arabicName) || s.name;
          const displayDesc = (isArabic && s.arabicDescription) || s.description || s.desc;
          const displayLocation = (isArabic && s.arabicLocation) || s.location || t("studioBooking.step3.defaultLocation");
          const displayFeatures =
            isArabic && s.arabicFeatures && s.arabicFeatures.length > 0 ? s.arabicFeatures : s.features;

          return (
            <SelectableCard key={s.id} selected={isSelected} onSelect={() => update({ studioId: s.id })}>
              <CardMedia src={imageSrc} alt={displayName} priority={i < 2} className="aspect-[2.2/1] sm:aspect-[16/9]">
                <span className="absolute top-2.5 start-2.5 sm:top-3 sm:start-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] uppercase text-white/85">
                  {t("studioBooking.step3.stageBadge", { number: String(i + 1).padStart(2, "0") })}
                </span>
              </CardMedia>

              <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{displayName}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] sm:text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} className="text-brand-mauve/80" />
                      {t("studioBooking.step3.seatsCount", { count: s.capacity || 10 })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-brand-mauve/80" />
                      {displayLocation}
                    </span>
                  </div>
                  {displayDesc && (
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-1 sm:line-clamp-2 pt-0.5">{displayDesc}</p>
                  )}
                </div>

                {displayFeatures && displayFeatures.length > 0 && (
                  <div className="mt-auto pt-2.5 border-t border-white/[0.06]">
                    <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-0.5 px-0.5">
                      {displayFeatures.map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] text-zinc-300 shrink-0 whitespace-nowrap"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
