"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Play, Radio, Zap, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ServiceItem, ServiceIconName } from "./services.data";

const SERVICE_ICONS: Record<ServiceIconName, typeof Camera> = {
  camera: Camera,
  radio: Radio,
  play: Play,
  zap: Zap,
};

const ACCENT_COLORS: Record<ServiceIconName, { icon: string; border: string; glow: string; text: string }> = {
  camera: {
    icon: "text-brand-purple-light",
    border: "border-brand-purple/30 group-hover/card:border-brand-purple/60",
    glow: "rgba(124, 58, 237, 0.4)",
    text: "text-brand-purple-light",
  },
  radio: {
    icon: "text-brand-teal",
    border: "border-brand-teal/30 group-hover/card:border-brand-teal/60",
    glow: "rgba(6, 182, 212, 0.4)",
    text: "text-brand-teal",
  },
  play: {
    icon: "text-brand-gold",
    border: "border-brand-gold/30 group-hover/card:border-brand-gold/60",
    glow: "rgba(245, 158, 11, 0.4)",
    text: "text-brand-gold",
  },
  zap: {
    icon: "text-cyan-400",
    border: "border-cyan-500/30 group-hover/card:border-cyan-500/60",
    glow: "rgba(6, 182, 212, 0.4)",
    text: "text-cyan-400",
  },
};

export interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { isArabic } = useLanguage();
  const Icon = SERVICE_ICONS[service.iconName];
  const accents = ACCENT_COLORS[service.iconName];

  const displayTitle = isArabic ? (service.arabicTitle || service.title) : service.title;
  const displaySubtitle = isArabic ? (service.arabicSubtitle || service.subtitle) : service.subtitle;
  const displayDescription = isArabic ? (service.arabicDescription || service.description) : service.description;
  const displayBadge = isArabic ? (service.arabicBadge || service.badge) : service.badge;
  const displaySpecs = isArabic && service.arabicSpecs ? service.arabicSpecs : service.specs;
  const displayStatLabel = isArabic ? (service.arabicStatLabel || service.statLabel) : service.statLabel;

  return (
    <div className="relative group/card h-full rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_12px_40px_rgba(124,58,237,0.18)] hover:-translate-y-1.5 overflow-hidden">
      {/* Ambient Top Glow on Hover */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-2xl rounded-full"
        style={{ background: accents.glow }}
      />

      <div>
        {/* Visual Hero Thumbnail with Overlay */}
        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden mb-5 border border-white/10 bg-slate-900 shadow-inner group">
          <Image
            src={service.image}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Icon Emblem */}
          <div className="absolute top-3.5 start-3.5 size-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg">
            <Icon size={18} className={accents.icon} />
          </div>

          {/* Floating Status Tag */}
          <div className="absolute top-3.5 end-3.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase border border-white/15 bg-black/60 text-slate-300 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {displayBadge}
            </span>
          </div>

          {/* Floating Spec Tag over image bottom */}
          <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-[11px] font-mono">
            <span className="font-bold text-white px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10" dir="ltr">
              {service.stat}
            </span>
            <span className="text-[10px] text-slate-300 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm border border-white/10">
              {displayStatLabel}
            </span>
          </div>
        </div>

        {/* Subtitle & Title with normalized min-height to prevent uneven card alignment */}
        <div className="space-y-1.5 mb-3 text-start">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-purple-400 font-semibold block truncate">
            {displaySubtitle}
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight leading-snug group-hover/card:text-purple-300 transition-colors line-clamp-2 min-h-[3.25rem]">
            {displayTitle}
          </h3>
        </div>

        {/* Clean Description with uniform height */}
        <p className="text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-5 line-clamp-3 min-h-[3.75rem] text-start">
          {displayDescription}
        </p>

        {/* Feature Check Badges - clean pill layout */}
        <div className="flex flex-wrap gap-1.5 mb-6 text-start">
          {displaySpecs.map((spec) => (
            <span
              key={spec}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300 bg-white/[0.04] border border-white/10 whitespace-nowrap"
            >
              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
              <span>{spec}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer: Full-width button with clear micro-copy, no awkward clapping or wrapping */}
      <div className="pt-4 border-t border-white/10 mt-auto flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-0.5">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">{isArabic ? "جاهز للحجز الفوري" : "Instant Availability"}</span>
          </span>
          <span className="font-bold text-slate-300" dir="ltr">{service.stat}</span>
        </div>

        <Link
          href={service.href}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all duration-200 shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 group/btn whitespace-nowrap select-none"
        >
          <span>{isArabic ? "احجز الخدمة الآن" : "Reserve Studio & Gear"}</span>
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 rtl:rotate-180 shrink-0"
          />
        </Link>
      </div>
    </div>
  );
}
