"use client";

import type { WizardStepProps, StudioItem } from "../../types";
import { STUDIOS } from "../../constants";
import { Users, MapPin } from "lucide-react";
import { CardMedia, MetaTag, SelectableCard, StepIntro } from "../ui/BookingKit";

export function StepStudio({
  state,
  update,
  studios = STUDIOS as StudioItem[],
}: WizardStepProps & { studios?: StudioItem[] }) {
  const displayStudios = studios && studios.length > 0 ? studios : (STUDIOS as StudioItem[]);

  return (
    <div>
      <StepIntro
        index={3}
        total={7}
        title="Choose Your Stage"
        description="Every stage is acoustically treated and ready for camera on arrival."
        aside={<MetaTag>{displayStudios.length} stages</MetaTag>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayStudios.map((s, i) => {
          const isSelected = state.studioId === s.id;
          const imageSrc = s.imageUrl || s.image || `/images/booking/studio-${s.id}.jpg`;

          return (
            <SelectableCard key={s.id} selected={isSelected} onSelect={() => update({ studioId: s.id })}>
              <CardMedia src={imageSrc} alt={s.name} priority={i < 2}>
                <span className="absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[10px] tracking-[0.16em] uppercase text-white/85">
                  Stage {String(i + 1).padStart(2, "0")}
                </span>
              </CardMedia>

              <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                <div className="space-y-1.5">
                  <h3 className="text-white font-semibold text-base tracking-tight">{s.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} className="text-amber-400/80" />
                      {s.capacity || 10} seats
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} className="text-amber-400/80" />
                      {s.location || "Iris Bay - Dubai"}
                    </span>
                  </div>
                  {(s.description || s.desc) && (
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 pt-0.5">{s.description || s.desc}</p>
                  )}
                </div>

                {s.features && s.features.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.06]">
                    {s.features.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] text-zinc-300"
                      >
                        {f}
                      </span>
                    ))}
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
