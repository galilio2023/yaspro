"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Tv, Eye, Film, ArrowUpRight, Sparkles } from "lucide-react";
import { ProjectItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export interface ProjectCardProps {
  project: ProjectItem;
  onWatchReel?: (project: ProjectItem) => void;
  priority?: boolean;
  onSelectSpotlight?: (project: ProjectItem) => void;
  isSpotlighted?: boolean;
}

export function ProjectCard({
  project,
  onWatchReel,
  priority = false,
  onSelectSpotlight,
  isSpotlighted = false,
}: ProjectCardProps) {
  const { isArabic } = useLanguage();
  const hasVideo = Boolean(project.vimeoId || project.videoUrl);

  const handleReelClick = (e: React.MouseEvent) => {
    if (onWatchReel && hasVideo) {
      e.preventDefault();
      e.stopPropagation();
      onWatchReel(project);
    }
  };

  const handleCardClick = () => {
    if (onSelectSpotlight) {
      onSelectSpotlight(project);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onSelectSpotlight) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectSpotlight(project);
    }
  };

  // Extract a clean cinema sensor/optics tag from techStack if available
  const opticsTag = React.useMemo(() => {
    if (!project.techStack || project.techStack.length === 0) return "4K MASTER";
    const primary = project.techStack[0];
    if (primary.includes("Alexa")) return "ARRI ALEXA";
    if (primary.includes("RED")) return "RED 8K RAW";
    if (primary.includes("Phantom")) return "PHANTOM 4K";
    if (primary.includes("FX9")) return "SONY FX9";
    if (primary.includes("Unreal")) return "UNREAL 5.4 CGI";
    if (primary.includes("OB-VAN")) return "OB-VAN LIVE";
    return primary.slice(0, 14).toUpperCase();
  }, [project.techStack]);

  return (
    <article
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={onSelectSpotlight ? "button" : undefined}
      tabIndex={onSelectSpotlight ? 0 : undefined}
      aria-pressed={onSelectSpotlight ? isSpotlighted : undefined}
      aria-label={
        onSelectSpotlight
          ? isArabic
            ? `عرض مشروع ${project.title} في المسرح الرئيسي`
            : `Select ${project.title} as spotlight project`
          : undefined
      }
      className={cn(
        "relative group/card flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl border bg-zinc-950/95 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden shadow-xl shadow-black/50 will-change-transform",
        onSelectSpotlight && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mauve/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        isSpotlighted
          ? "border-brand-mauve/70 ring-1 ring-brand-mauve/40 shadow-[0_0_30px_rgba(152,123,165,0.28)]"
          : "border-white/10 hover:border-brand-mauve/50 hover:shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8),0_0_28px_-4px_rgba(152,123,165,0.22)]"
      )}
    >
      {/* Active Spotlight Marker */}
      {isSpotlighted && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-violet via-brand-mauve to-brand-violet z-30 shadow-[0_0_14px_rgba(187,167,195,0.8)]" />
      )}

      {/* Thumbnail Stage */}
      <div className="w-full">
        <div
          onClick={handleReelClick}
          className={`block relative w-full aspect-[16/9] overflow-hidden bg-black group/thumb ${
            hasVideo ? "cursor-pointer" : ""
          }`}
        >
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover/thumb:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <Film size={44} className="text-zinc-700" />
            </div>
          )}

          {/* Anamorphic Horizontal Flare (Subtle cinema sweep on hover) */}
          <div className="absolute inset-y-1/2 -translate-y-1/2 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-mauve/80 to-transparent scale-x-0 group-hover/thumb:scale-x-100 transition-transform duration-500 ease-out pointer-events-none z-20" />

          {/* Multi-tier Studio Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/60 pointer-events-none" />

          {/* Top HUD Telemetry Bar */}
          <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <Badge variant="default" className="text-[10px] uppercase tracking-wider bg-zinc-950/90 border-white/15 text-zinc-200">
                {project.categoryLabel}
              </Badge>
              {/* Studio Live Tally Light */}
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/90 border border-white/10 text-[9px] font-mono text-zinc-300" dir="ltr">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>REC</span>
              </span>
            </div>

            {/* Camera Sensor/Optics Tag */}
            <span className="px-2 py-0.5 rounded-md bg-black/90 border border-brand-mauve/30 text-[9px] font-mono tracking-wider text-brand-lavender" dir="ltr">
              {opticsTag}
            </span>
          </div>

          {/* Tactical Cinema Play Button */}
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="relative flex items-center justify-center">
                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-full bg-brand-mauve/20 scale-100 group-hover/thumb:scale-135 group-hover/thumb:opacity-0 transition-all duration-500 pointer-events-none" />
                <div className="size-12 sm:size-13 rounded-full bg-zinc-950/90 border border-brand-mauve/40 flex items-center justify-center text-brand-lavender shadow-xl group-hover/thumb:scale-110 group-hover/thumb:bg-brand-violet group-hover/thumb:text-white group-hover/thumb:border-brand-mauve group-hover/thumb:shadow-[0_0_24px_rgba(152,123,165,0.6)] transition-all duration-200">
                  <Play size={18} className="fill-current translate-x-0.5 rtl:-translate-x-0.5" />
                </div>
              </div>
            </div>
          )}

          {/* Bottom HUD Bar */}
          <div className="absolute bottom-2.5 inset-x-2.5 sm:bottom-3 sm:inset-x-3 flex items-center justify-between text-[10px] font-mono text-white/80 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/90 border border-white/10 text-[9px] tracking-wide" dir="ltr">
              4K UHD • 24FPS
            </span>
            {project.views && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/90 border border-white/10 text-[9px] text-zinc-300">
                <Eye size={10} className="text-brand-mauve" />
                <span>{project.views}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Client Row */}
        <div className="w-full flex items-center justify-between mb-2">
          <p className="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5 truncate">
            <Tv size={12} className="shrink-0 text-brand-mauve" />
            <span className="truncate">{project.client}</span>
          </p>
          {isSpotlighted && (
            <span className="text-[10px] font-mono text-brand-mauve font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={10} />
              <span>Spotlight</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div className="w-full mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-white font-display group-hover/card:text-brand-lavender transition-colors line-clamp-1">
            <Link
              href={`/projects/${project.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-mauve focus-visible:rounded-sm"
            >
              {project.title}
            </Link>
          </h3>
          {project.arabicTitle && (
            <p className="text-xs text-zinc-400 font-display mt-0.5 line-clamp-1">
              {project.arabicTitle}
            </p>
          )}
        </div>

        {/* Synopsis */}
        <div className="w-full mb-4">
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Deliverables / Tech Badges */}
        {project.deliverables && project.deliverables.length > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full mt-auto mb-3">
            {project.deliverables.slice(0, 2).map((item) => (
              <span
                key={item}
                className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/8 font-mono truncate max-w-[190px]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 flex items-center justify-between mt-auto w-full border-t border-white/8">
        <span className="text-[11px] text-zinc-500 font-mono" dir="ltr">
          {project.year ? `YAS CINE • ${project.year}` : "YAS ORIGINAL"}
        </span>

        <div className="flex items-center gap-2">
          {hasVideo ? (
            <button
              type="button"
              onClick={handleReelClick}
              className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 gap-1.5 text-xs font-semibold text-zinc-200 rounded-full bg-white/10 border border-white/15 hover:bg-brand-violet hover:text-white hover:border-brand-mauve transition-all cursor-pointer shadow-sm active:scale-[0.97] group/btn"
            >
              <Play size={11} className="fill-current text-brand-mauve group-hover/btn:text-white rtl:scale-x-[-1] transition-colors shrink-0" />
              <span>{isArabic ? "مشاهدة الفيديو" : "Watch Reel"}</span>
            </button>
          ) : (
            <Link
              href={`/projects/${project.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center min-h-[38px] px-3.5 py-1.5 gap-1.5 text-xs font-semibold text-zinc-200 rounded-full bg-white/10 border border-white/15 hover:bg-brand-violet hover:text-white hover:border-brand-mauve transition-all active:scale-[0.97]"
            >
              <span>{isArabic ? "تفاصيل العمل" : "View Case"}</span>
              <ArrowUpRight size={11} className="rtl:rotate-90 rtl:scale-x-[-1]" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
