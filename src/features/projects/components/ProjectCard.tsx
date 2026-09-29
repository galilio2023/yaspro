"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Tv, Eye, Film, ArrowUpRight } from "lucide-react";
import { ProjectItem } from "../types";
import { CardContainer, CardBody, CardItem } from "@/components/aceternity/3d-card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ProjectCard({
  project,
  onWatchReel,
}: {
  project: ProjectItem;
  onWatchReel?: (project: ProjectItem) => void;
}) {
  const { isArabic } = useLanguage();
  const isGovernment =
    project.category === "government" ||
    project.tag?.includes("Government") ||
    project.views?.includes("50M") ||
    project.views?.includes("60M");

  const hasVideo = Boolean(project.vimeoId || project.videoUrl);

  const handleReelClick = (e: React.MouseEvent) => {
    if (onWatchReel && hasVideo) {
      e.preventDefault();
      e.stopPropagation();
      onWatchReel(project);
    }
  };

  return (
    <CardContainer className="w-full h-full">
      <CardBody
        as="article"
        className="relative group/card flex flex-col justify-between h-full rounded-3xl border border-brand-purple/15 bg-[#0e0c1f] hover:border-brand-purple/50 hover:bg-[#120f26] hover:shadow-2xl hover:shadow-brand-purple/15 transition-colors duration-300 overflow-hidden [transform:translateZ(0)]"
      >
        {isGovernment && (
          <BorderBeam size={220} duration={14} colorFrom="var(--brand-gold)" colorTo="var(--brand-purple)" />
        )}

        {/* Thumbnail Stage */}
        <CardItem translateZ={30} className="w-full">
          <div
            onClick={handleReelClick}
            className={`block relative w-full aspect-[16/9] overflow-hidden bg-secondary group/thumb ${
              onWatchReel && hasVideo ? "cursor-pointer" : ""
            }`}
          >
            {project.image ? (
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-107"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/30 via-secondary to-black" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.25)_0%,transparent_70%)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-25 group-hover/thumb:opacity-50 transition-opacity">
                  <Film size={52} className="text-brand-purple-light" />
                </div>
              </>
            )}

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

            {/* Top badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
              <Badge variant="default" className="text-[10px] uppercase tracking-wider backdrop-blur-md">
                {project.categoryLabel}
              </Badge>
              {project.views && (
                <Badge variant="cyan" className="text-[10px] backdrop-blur-md gap-1">
                  <Eye size={10} /> {project.views}
                </Badge>
              )}
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="size-13 rounded-full bg-black/55 border border-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-xl group-hover/thumb:scale-115 group-hover/thumb:bg-brand-purple group-hover/thumb:border-brand-purple/80 group-hover/thumb:shadow-brand-purple/50 transition-all duration-350">
                <Play size={18} className="fill-current translate-x-0.5 rtl:-translate-x-0.5" />
              </div>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[10px] font-mono text-white/70 z-10 pointer-events-none">
              <span className="px-2 py-1 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10">
                {project.tag}
              </span>
              <span className="px-2 py-1 rounded-lg bg-black/65 backdrop-blur-sm border border-white/10">
                4K MASTER
              </span>
            </div>
          </div>
        </CardItem>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <CardItem translateZ={42} className="w-full mb-1">
            <h3 className="text-xl font-bold text-text-primary mb-1 font-display group-hover/card:text-brand-purple-light transition-colors line-clamp-1">
              <Link
                href={`/projects/${project.slug}`}
                className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:rounded-sm"
              >
                {project.title}
              </Link>
            </h3>
            {project.arabicTitle && (
              <p className="text-xs text-brand-cyan/80 font-display mb-2">
                {project.arabicTitle}
              </p>
            )}
          </CardItem>

          <CardItem translateZ={25} className="w-full">
            <p className="text-xs text-brand-purple-mid font-semibold mb-3 flex items-center gap-1.5">
              <Tv size={12} className="shrink-0 text-brand-teal" />
              <span>Client: {project.client}</span>
            </p>
          </CardItem>

          <CardItem translateZ={20} className="w-full">
            <p className="text-text-secondary text-sm leading-relaxed mb-5 line-clamp-2">
              {project.description}
            </p>
          </CardItem>

          {project.deliverables && project.deliverables.length > 0 && (
            <CardItem translateZ={30} className="flex flex-wrap gap-1.5 w-full">
              {project.deliverables.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-brand-purple/8 text-brand-purple-mid border border-brand-purple/15 font-medium"
                >
                  {item}
                </span>
              ))}
            </CardItem>
          )}
        </div>

        {/* Footer */}
        <CardItem
          translateZ={32}
          className="px-4 pb-4 sm:px-6 sm:pb-6 pt-3 sm:pt-2 flex items-center justify-between mt-auto w-full border-t border-brand-purple/10"
        >
          <span className="text-xs text-text-ghost font-medium">
            {project.year ? `Yas Production · ${project.year}` : "Yas Original"}
          </span>
          {hasVideo ? (
            <button
              type="button"
              onClick={handleReelClick}
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 sm:px-3 gap-1.5 text-xs font-bold text-brand-purple-mid rounded-xl bg-brand-purple/10 border border-brand-purple/20 group-hover/card:bg-brand-purple/20 group-hover/card:border-brand-purple/40 hover:!bg-brand-purple hover:!text-white transition-all cursor-pointer shadow-sm"
            >
              <Play size={11} className="fill-current text-brand-cyan group-hover/card:text-white rtl:scale-x-[-1] transition-transform shrink-0" />
              <span>{isArabic ? "مشاهدة الفيديو" : "Watch Reel"}</span>
            </button>
          ) : (
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 sm:px-3 gap-1.5 text-xs font-bold text-brand-purple-mid rounded-xl bg-brand-purple/10 border border-brand-purple/20 group-hover/card:bg-brand-purple/20 group-hover/card:border-brand-purple/40 transition-all"
            >
              <span>{isArabic ? "تفاصيل المشروع" : "View Case"}</span>
              <ArrowUpRight size={11} className="rtl:rotate-90 rtl:scale-x-[-1]" />
            </Link>
          )}
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
