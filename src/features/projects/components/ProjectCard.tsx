"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Tv, Eye, Film, ArrowUpRight } from "lucide-react";
import { ProjectItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";
import { studioSprings } from "@/lib/studio-motion";

export function ProjectCard({
  project,
  onWatchReel,
  priority = false,
}: {
  project: ProjectItem;
  onWatchReel?: (project: ProjectItem) => void;
  priority?: boolean;
}) {
  const { isArabic } = useLanguage();
  const hasVideo = Boolean(project.vimeoId || project.videoUrl);

  const handleReelClick = (e: React.MouseEvent) => {
    if (onWatchReel && hasVideo) {
      e.preventDefault();
      e.stopPropagation();
      onWatchReel(project);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={studioSprings.cinematic}
      className="relative group/card flex flex-col justify-between h-full rounded-3xl border border-white/8 bg-zinc-900/90 hover:border-amber-500/30 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-black/70 transition-colors duration-300 overflow-hidden shadow-xl shadow-black/40"
    >
      {/* Thumbnail Stage */}
      <div className="w-full">
        <div
          onClick={handleReelClick}
          className={`block relative w-full aspect-[16/9] overflow-hidden bg-black group/thumb ${
            onWatchReel && hasVideo ? "cursor-pointer" : ""
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
              className="object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-108"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <Film size={44} className="text-zinc-700" />
            </div>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/40 pointer-events-none" />

          {/* Top badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            <Badge variant="default" className="text-[10px] uppercase tracking-wider backdrop-blur-md">
              {project.categoryLabel}
            </Badge>
            {project.views && (
              <Badge variant="secondary" className="text-[10px] backdrop-blur-md gap-1 font-mono text-zinc-300">
                <Eye size={10} /> {project.views}
              </Badge>
            )}
          </div>

          {/* Tactical Spring Play Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.94 }}
              transition={studioSprings.snappy}
              className="size-13 rounded-full bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xl group-hover/thumb:scale-110 group-hover/thumb:bg-amber-500 group-hover/thumb:text-zinc-950 group-hover/thumb:border-amber-400 group-hover/thumb:shadow-[0_0_24px_rgba(245,158,11,0.4)] transition-all duration-300"
            >
              <Play size={18} className="fill-current translate-x-0.5 rtl:-translate-x-0.5" />
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-white/70 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-white/10">
              {project.tag}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm border border-white/10">
              4K MASTER
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        <div className="w-full mb-1">
          <h3 className="text-xl font-bold text-white mb-1 font-display group-hover/card:text-amber-400 transition-colors line-clamp-1">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:rounded-sm"
            >
              {project.title}
            </Link>
          </h3>
          {project.arabicTitle && (
            <p className="text-xs text-zinc-400 font-display mb-2">
              {project.arabicTitle}
            </p>
          )}
        </div>

        <div className="w-full">
          <p className="text-xs text-zinc-400 font-medium mb-3 flex items-center gap-1.5">
            <Tv size={12} className="shrink-0 text-amber-400" />
            <span>Client: {project.client}</span>
          </p>
        </div>

        <div className="w-full">
          <p className="text-zinc-300 text-sm leading-relaxed mb-5 line-clamp-2">
            {project.description}
          </p>
        </div>

        {project.deliverables && project.deliverables.length > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full">
            {project.deliverables.slice(0, 2).map((item) => (
              <span
                key={item}
                className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/8 font-mono"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 pt-3 sm:pt-2 flex items-center justify-between mt-auto w-full border-t border-white/8">
        <span className="text-xs text-zinc-500 font-mono">
          {project.year ? `Yas Production · ${project.year}` : "Yas Original"}
        </span>
        {hasVideo ? (
          <button
            type="button"
            onClick={handleReelClick}
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 sm:px-3 gap-1.5 text-xs font-semibold text-zinc-200 rounded-full bg-white/10 border border-white/15 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-400 transition-all cursor-pointer shadow-sm active:scale-[0.97]"
          >
            <Play size={11} className="fill-current text-amber-400 group-hover:text-zinc-950 rtl:scale-x-[-1] transition-colors shrink-0" />
            <span>{isArabic ? "مشاهدة الفيديو" : "Watch Reel"}</span>
          </button>
        ) : (
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 sm:px-3 gap-1.5 text-xs font-semibold text-zinc-200 rounded-full bg-white/10 border border-white/15 hover:bg-amber-500 hover:text-zinc-950 hover:border-amber-400 transition-all active:scale-[0.97]"
          >
            <span>{isArabic ? "تفاصيل المشروع" : "View Case"}</span>
            <ArrowUpRight size={11} className="rtl:rotate-90 rtl:scale-x-[-1]" />
          </Link>
        )}
      </div>
    </motion.article>
  );
}
