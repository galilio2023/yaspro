"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play, Sparkles, Eye, Film, Tv, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { SHOWS_DATA, ShowItem } from "@/features/shows/data";
import { CinemaVideoModal } from "@/components/common/CinemaVideoModal";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORIES = ["All", "Talk Show", "Reality / Social", "Entertainment", "Fashion & Lifestyle"] as const;

export function ShowsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedShow, setSelectedShow] = useState<ShowItem | null>(null);

  const filteredShows =
    activeCategory === "All"
      ? SHOWS_DATA
      : SHOWS_DATA.filter((s) => s.category === activeCategory);

  return (
    <Section
      id="shows"
      aria-labelledby="shows-title"
      className="bg-background relative overflow-hidden border-t border-white/10"
      background={
        <div
          className="absolute top-1/3 left-1/4 size-96 rounded-full pointer-events-none opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          }}
        />
      }
    >
      <Container className="relative z-10">
        <SectionHeader
          headingId="shows-title"
          badge="Flagship Media Formats"
          badgeVariant="purple"
          badgeIcon={<Tv size={13} />}
          title="Signature Productions &"
          gradientText="Original Shows"
          description="Media projects we’ve delivered with premier Middle Eastern creators, cinematic production values, and hundreds of millions of digital views."
        />

        {/* Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 min-h-[38px] rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap",
                activeCategory === cat
                  ? "bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/30 scale-105"
                  : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Shows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {filteredShows.map((show, i) => (
            <FadeUp key={show.id} delay={i * 0.05} className="h-full">
              <div
                className="relative rounded-3xl border border-white/10 bg-card overflow-hidden h-full flex flex-col justify-between group transition-all duration-300 hover:border-brand-purple/50 hover:shadow-2xl hover:shadow-brand-purple/20"
              >
                {/* 1. Cinema Video Thumbnail Header Stage */}
                <div
                  onClick={() => setSelectedShow(show)}
                  className="relative w-full aspect-video overflow-hidden cursor-pointer select-none bg-black"
                >
                  <Image
                    src={show.thumbnail}
                    alt={show.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Dark gradient overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 group-hover:via-black/20 transition-all duration-300" />

                  {/* Category & Badge Chips */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10.5px] font-mono text-white/90 border border-white/15">
                      {show.category}
                    </span>
                    {show.badge && (
                      <span className="px-2.5 py-1 rounded-full bg-brand-cyan/20 backdrop-blur-md text-brand-cyan border border-brand-cyan/40 text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                        <Sparkles size={10} /> {show.badge}
                      </span>
                    )}
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="size-12 sm:size-14 rounded-full bg-black/60 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:bg-brand-purple group-hover:border-white transition-all duration-300">
                      <Play size={18} className="fill-current translate-x-0.5 text-white" />
                    </div>
                  </div>

                  {/* Bottom Video HUD Duration / Quality */}
                  <div className="absolute bottom-2.5 right-3 z-10">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10 flex items-center gap-1">
                      <Film size={10} className="text-brand-purple-light" />
                      4K Trailer
                    </span>
                  </div>
                </div>

                {/* 2. Show Information Body */}
                <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title & Arabic Title */}
                    <div className="mb-2.5">
                      <h3 className="text-xl font-black text-white font-display tracking-tight group-hover:text-brand-purple-light transition-colors">
                        {show.title}
                      </h3>
                      <p className="text-xs font-semibold text-brand-cyan/90 font-display mt-0.5">
                        {show.arabicTitle}
                      </p>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-4">
                      {show.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {show.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-text-muted border border-white/5 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Stats & Watch Trigger */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={13} className="text-brand-purple" />
                      <span className="text-xs font-extrabold text-white font-mono">
                        {show.views}
                      </span>
                      <span className="text-white/30">•</span>
                      <span className="text-[11px] text-text-muted font-mono">{show.episodes}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedShow(show)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-brand-purple text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 group-hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                    >
                      <Play size={11} className="fill-current text-brand-cyan group-hover:text-white" />
                      <span>Play</span>
                    </button>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* Section Footer CTA */}
        <FadeUp delay={0.2} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 pt-8 border-t border-white/10 text-center">
          <span className="text-sm text-text-secondary">
            Have a television format or creator concept you want to produce?
          </span>
          <Link
            href="/studio-booking"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg shadow-brand-purple/25 hover:scale-105 transition-all"
          >
            <span>Book Production Consultation</span>
            <ArrowRight size={14} />
          </Link>
        </FadeUp>
      </Container>

      {/* Vimeo Video Modal (Rendered via Portal into document.body) */}
      <CinemaVideoModal
        isOpen={Boolean(selectedShow?.vimeoId || selectedShow?.videoUrl)}
        onClose={() => setSelectedShow(null)}
        vimeoId={selectedShow?.vimeoId}
        videoUrl={selectedShow?.videoUrl}
        posterImage={selectedShow?.thumbnail}
        title={selectedShow?.title || ""}
        subtitle={selectedShow?.arabicTitle}
      />
    </Section>
  );
}
