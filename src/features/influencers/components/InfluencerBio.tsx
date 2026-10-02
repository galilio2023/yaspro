"use client";

import type { InfluencerItem } from "../types";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface InfluencerBioProps {
  creator: InfluencerItem;
}

export function InfluencerBio({ creator }: InfluencerBioProps) {
  const { isArabic } = useLanguage();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/20">
      <span className="text-xs uppercase tracking-widest rtl:tracking-normal text-amber-400 font-mono font-semibold block mb-2">
        {isArabic ? "ملف صانع المحتوى" : "Creator Profile"}
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display rtl:font-arabic tracking-tight rtl:tracking-normal leading-[1.2] rtl:leading-[1.4] text-balance">
        {isArabic ? `نبذة عن ${creator.name}` : `About ${creator.name}`}
      </h2>
      <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
        {creator.bio}
      </p>
    </div>
  );
}
