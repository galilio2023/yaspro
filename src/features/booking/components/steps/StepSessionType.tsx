"use client";

import type { WizardStepProps, SessionTypeItem } from "../../types";
import { SESSION_TYPES } from "../../constants";
import { CardMedia, MetaTag, PriceLine, SelectableCard, StepIntro } from "../ui/BookingKit";

export function StepSessionType({
  state,
  update,
  sessionTypes = SESSION_TYPES,
}: WizardStepProps & { sessionTypes?: readonly SessionTypeItem[] }) {
  return (
    <div>
      <StepIntro
        index={2}
        total={7}
        title="Session Type"
        description="Tell us what you're producing — the hourly rate includes the studio space."
        aside={<MetaTag>{sessionTypes.length} formats</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sessionTypes.map((s, i) => {
          const isSelected = state.sessionType === s.id;

          return (
            <SelectableCard key={s.id} selected={isSelected} onSelect={() => update({ sessionType: s.id })}>
              <CardMedia src={s.imageUrl} alt={s.title} priority={i < 2} className="aspect-[2.35/1] sm:aspect-[16/9]">
                <span className="absolute bottom-2.5 start-2.5 sm:bottom-3 sm:start-3 font-mono text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-white/70">
                  Format {String(i + 1).padStart(2, "0")}
                </span>
              </CardMedia>

              <div className="p-3.5 sm:p-5 flex-1 flex flex-col gap-2.5 sm:gap-3">
                <div className="space-y-1 sm:space-y-1.5">
                  <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">{s.title}</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 sm:line-clamp-3">{s.description}</p>
                </div>
                <div className="mt-auto pt-2.5 sm:pt-3 border-t border-white/[0.06]">
                  <PriceLine amount={s.price} unit="hour" emphasis={isSelected} />
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
