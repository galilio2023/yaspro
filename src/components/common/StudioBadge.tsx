"use client";

import React from "react";
import { motion } from "framer-motion";
import { studioSprings } from "@/lib/studio-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface StudioBadgeProps {
  stage?: string;
  label?: string;
  className?: string;
}

export function StudioBadge({ stage = "STAGE 01", label, className = "" }: StudioBadgeProps) {
  const { isArabic } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={studioSprings.cinematic}
      whileHover={{ y: -1, scale: 1.01 }}
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-950/80 backdrop-blur-md shadow-2xl shadow-black/60 text-xs font-mono tracking-wider ${className}`}
    >
      {/* Live recording / studio status indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>

      {/* Studio Stage metadata */}
      <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
        {stage}
      </span>

      <span className="h-3 w-px bg-white/15" aria-hidden="true" />

      {/* Production identifier */}
      <span className="text-zinc-200 font-medium text-[11px] tracking-normal">
        {label || (isArabic ? "استوديو الإنتاج الافتراضي الفائق" : "VIRTUAL PRODUCTION & CINE STUDIOS")}
      </span>
    </motion.div>
  );
}
