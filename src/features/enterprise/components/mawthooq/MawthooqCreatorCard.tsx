"use client";

import React from "react";
import Image from "next/image";
import { Check, Plus, ShieldCheck } from "lucide-react";
import { EnterpriseCreatorItem } from "../../types";

interface MawthooqCreatorCardProps {
  creator: EnterpriseCreatorItem;
  isSelected: boolean;
  onToggle: () => void;
}

export function MawthooqCreatorCard({
  creator,
  isSelected,
  onToggle,
}: MawthooqCreatorCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`relative rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
        isSelected
          ? "border-amber-500/80 bg-card ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/15"
          : "border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/90"
      }`}
    >
      <div>
        {/* Top Bar with Selection Pill & Flag */}
        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
          <span className="text-lg sm:text-xl" title="Nationality">{creator.flag}</span>
          <div
            className={`size-6 rounded-full flex items-center justify-center transition-all ${
              isSelected
                ? "bg-gradient-to-tr from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-500/40"
                : "border border-white/20 bg-white/5 text-text-secondary group-hover:border-white/40"
            }`}
          >
            {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
          </div>
        </div>

        {/* Avatar & Names */}
        <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
          <div className="relative size-11 sm:size-12 rounded-xl overflow-hidden border border-white/15 shrink-0">
            <Image
              src={creator.avatar}
              alt={creator.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
              {creator.name}
            </div>
            <div className="text-[11px] sm:text-xs font-arabic text-text-secondary truncate">{creator.arabicName}</div>
            <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
              {creator.totalFollowers}
            </div>
          </div>
        </div>

        {/* Niche */}
        <p className="text-[10px] sm:text-[11px] text-text-secondary mb-3 line-clamp-2 leading-relaxed">
          {creator.niche}
        </p>
      </div>

      {/* Mawthooq Badge & Reach Footer */}
      <div className="pt-2.5 sm:pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-emerald-400 mb-1 font-bold">
          <ShieldCheck size={12} className="shrink-0" />
          <span className="truncate">{creator.mawthooqLicenseId}</span>
        </div>

        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-text-muted">
          <span>🇸🇦 KSA: {creator.saudiReachPct}%</span>
          <span>🇦🇪 UAE: {creator.uaeReachPct}%</span>
        </div>
      </div>
    </button>
  );
}
