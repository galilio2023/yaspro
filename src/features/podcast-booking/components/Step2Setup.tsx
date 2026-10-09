"use client";

import Image from "next/image";
import { Check, MapPin, Users, Sparkles } from "lucide-react";
import { PODCAST_STUDIOS } from "../data";
import { PodcastSessionItem } from "../types";
import { MetaTag, SelectableCard, StepIntro } from "@/features/booking/components/ui/BookingKit";

interface Step2SetupProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step2Setup({ session, onChange }: Step2SetupProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <StepIntro
        index={2}
        total={4}
        title="Studio Setup"
        description="Browse through our acoustic spaces and pick the setup that fits your podcast format best."
        aside={<MetaTag tone="mauve">{PODCAST_STUDIOS.length} setups</MetaTag>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PODCAST_STUDIOS.map((studio) => {
          const isSelected = session.studioKey === studio.key;
          const isCapacityMatch = studio.seats >= session.headcount;

          return (
            <SelectableCard
              key={studio.key}
              selected={isSelected}
              disabled={!isCapacityMatch}
              onSelect={() => {
                if (isCapacityMatch) onChange({ studioKey: studio.key });
              }}
              className="flex-1 justify-between"
            >
              <div>
                {/* Studio Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                  <Image
                    src={studio.image}
                    alt={studio.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={studio.key === "nature-grid"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-transparent" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1 font-mono">
                      <Users size={12} className="text-brand-mauve" />
                      {studio.seats} {studio.seats === 1 ? "seat" : "seats"}
                    </span>
                  </div>

                  {/* Location at bottom of photo */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-[11px] text-zinc-300">
                    <MapPin size={12} className="text-brand-mauve shrink-0" />
                    <span className="truncate">{studio.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-mauve transition-colors">
                    {studio.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {studio.description}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0 border-t border-white/[0.06] mt-2 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                  <Sparkles size={12} className="text-brand-mauve" />
                  Acoustic Isolation
                </span>
                <span
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isSelected
                      ? "bg-brand-mauve text-zinc-950 font-bold shadow-md shadow-brand-violet/30"
                      : isCapacityMatch
                      ? "bg-white/[0.06] text-zinc-300 group-hover:bg-white/[0.1] group-hover:text-white"
                      : "text-zinc-600"
                  }`}
                >
                  {!isCapacityMatch ? `Needs ${session.headcount} seats` : isSelected ? "Selected" : "Select Setup"}
                </span>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
