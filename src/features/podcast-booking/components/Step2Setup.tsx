"use client";

import Image from "next/image";
import { MapPin, Users, Sparkles, Check } from "lucide-react";
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
        total={5}
        title="Studio Setup"
        description="Browse through our acoustic spaces and pick the setup that fits your podcast format best."
        aside={<MetaTag tone="mauve">{PODCAST_STUDIOS.length} setups</MetaTag>}
      />

      {/* 2-Column Responsive Grid (300px+ width per card to prevent text and badge wrapping) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {PODCAST_STUDIOS.map((studio) => {
          const isSelected = session.studioKey === studio.key;
          const isCapacityMatch = studio.seats >= session.headcount;

          return (
            <SelectableCard
              key={studio.key}
              selected={isSelected}
              onSelect={() => onChange({ studioKey: studio.key })}
              className="flex flex-col justify-between"
            >
              <div>
                {/* Studio Thumbnail with clean overlays */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
                  <Image
                    src={studio.image}
                    alt={studio.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={studio.key === "nature-grid"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-transparent to-transparent" />

                  {/* Seat capacity badge on top-left (leaves top-right clear for SelectableCard's SelectedMark) */}
                  <div className="absolute top-3 start-3">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 font-mono whitespace-nowrap shrink-0">
                      <Users size={12} className="text-brand-mauve" />
                      {studio.seats} {studio.seats === 1 ? "seat" : "seats"}
                    </span>
                  </div>

                  {/* Location badge at bottom of photo */}
                  <div className="absolute bottom-2.5 start-3 end-3 flex items-center gap-1 text-[11px] text-zinc-300">
                    <MapPin size={11} className="text-brand-mauve shrink-0" />
                    <span className="truncate">{studio.location}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-5 space-y-1 sm:space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-mauve transition-colors truncate">
                      {studio.name}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {studio.description}
                  </p>
                </div>
              </div>

              {/* Clean Footer Metadata without clashing buttons */}
              <div className="px-3.5 pb-3.5 sm:px-5 sm:pb-5 pt-2.5 sm:pt-3 mt-auto flex items-center justify-between gap-2 text-xs border-t border-white/[0.04]">
                <span className="text-zinc-400 flex items-center gap-1 text-[11px] font-mono whitespace-nowrap shrink-0">
                  <Sparkles size={11} className="text-brand-mauve shrink-0" />
                  Iris Bay L18
                </span>

                <span className="text-[11px] font-medium font-mono text-zinc-400 whitespace-nowrap shrink-0">
                  {isSelected ? (
                    <span className="text-brand-mauve font-bold flex items-center gap-1 whitespace-nowrap">
                      <Check size={12} strokeWidth={2.5} /> Selected
                    </span>
                  ) : !isCapacityMatch ? (
                    <span className="text-brand-lavender/80 whitespace-nowrap">Needs {session.headcount} seats</span>
                  ) : (
                    <span className="whitespace-nowrap">Available</span>
                  )}
                </span>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </div>
  );
}
