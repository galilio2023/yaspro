"use client";

import Image from "next/image";
import { Check, MapPin, Users, Sparkles } from "lucide-react";
import { PODCAST_STUDIOS } from "../data";
import { PodcastSessionItem } from "../types";

interface Step2SetupProps {
  session: PodcastSessionItem;
  onChange: (updates: Partial<PodcastSessionItem>) => void;
}

export function Step2Setup({ session, onChange }: Step2SetupProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Select the studio
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              7 Setups
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Browse through our acoustic spaces and pick the setup that fits your podcast format best.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PODCAST_STUDIOS.map((studio) => {
          const isSelected = session.studioKey === studio.key;
          const isCapacityMatch = studio.seats >= session.headcount;

          return (
            <div
              key={studio.key}
              onClick={() => {
                if (isCapacityMatch) onChange({ studioKey: studio.key });
              }}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${isCapacityMatch ? "cursor-pointer" : "opacity-50 cursor-not-allowed"} ${
                isSelected
                  ? "bg-amber-950/20 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-500"
                  : "bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
              }`}
            >
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badges on top */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1">
                    <Users size={12} className="text-amber-400" />
                    {studio.seats} {studio.seats === 1 ? "seat" : "seats"}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-3 right-3 size-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold shadow-lg shadow-amber-500/50 animate-in zoom-in-50">
                    <Check size={16} />
                  </div>
                )}

                {/* Location at bottom of photo */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-[11px] text-white/70">
                  <MapPin size={12} className="text-amber-400 shrink-0" />
                  <span className="truncate">{studio.location}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {studio.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                    {studio.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/60 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-400" />
                    Fully Soundproofed
                  </span>
                  <button
                    type="button"
                    disabled={!isCapacityMatch}
                    aria-pressed={isSelected && isCapacityMatch}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {!isCapacityMatch ? `Needs ${session.headcount} seats` : isSelected ? "Selected" : "Select Setup"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
