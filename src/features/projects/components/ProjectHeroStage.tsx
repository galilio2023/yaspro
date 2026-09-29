"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Film, Play, Sparkles } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import type { ProjectItem } from "../types";

export interface ProjectHeroStageProps {
  project: ProjectItem;
}

export function ProjectHeroStage({ project }: ProjectHeroStageProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <>
      <div
        onClick={() => project.vimeoId && setIsPlaying(true)}
        className="relative w-full aspect-video max-h-[60vh] lg:max-h-none rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl shadow-black/60 group cursor-pointer select-none"
      >
        <BorderBeam size={260} duration={12} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />

        {/* Real Cinema Poster Image */}
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-brand-purple/20 to-secondary flex items-center justify-center">
            <Film size={64} className="text-white/20 group-hover:text-white/40 transition-colors" />
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 group-hover:via-black/20 transition-all duration-300" />

        {/* Top Overlays */}
        <div className="absolute top-3 sm:top-4 inset-x-3 sm:inset-x-5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant="default" className="text-[10px] sm:text-xs font-semibold backdrop-blur-md">
              {project.categoryLabel}
            </Badge>
            <Badge variant="secondary" className="text-[10px] sm:text-xs backdrop-blur-md">
              {project.tag}
            </Badge>
          </div>
          {project.views && (
            <Badge variant="cyan" className="text-[10px] sm:text-xs font-bold backdrop-blur-md gap-1">
              <Sparkles size={12} /> {project.views}
            </Badge>
          )}
        </div>

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="size-14 sm:size-20 rounded-full bg-brand-purple/90 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl shadow-brand-purple/50 group-hover:scale-110 transition-transform duration-300">
            <Play size={20} className="fill-current translate-x-0.5 text-white" />
          </div>
          <span className="mt-2 sm:mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-white/90 font-mono drop-shadow-md">
            Watch Production Master
          </span>
        </div>

        {/* Bottom Bar Info */}
        <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-5 flex items-center justify-between text-[10px] sm:text-xs font-mono text-white/80 z-10 pointer-events-none">
          <span className="line-clamp-1">CLIENT: {project.client.toUpperCase()}</span>
          <span className="hidden sm:inline">4K CINEMA MASTER · DOLBY ATMOS</span>
        </div>
      </div>

      {/* Cinema Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={isPlaying && Boolean(project.vimeoId || project.videoUrl)}
        onClose={() => setIsPlaying(false)}
        vimeoId={project.vimeoId}
        videoUrl={project.videoUrl}
        posterImage={project.image}
        title={project.title}
        client={project.client}
      />
    </>
  );
}
