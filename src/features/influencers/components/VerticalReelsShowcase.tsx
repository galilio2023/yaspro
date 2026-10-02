"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Flame,
  Eye,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

interface ReelItem {
  id: string;
  titleEn: string;
  titleAr: string;
  brandEn: string;
  brandAr: string;
  categoryEn: string;
  categoryAr: string;
  views: string;
  videoSrc: string;
  aspectRatio: "vertical" | "landscape";
  tags: string[];
}

const REELS: ReelItem[] = [
  {
    id: "fashion-luxury",
    titleEn: "Luxury Fashion & High Jewelry Commercial",
    titleAr: "إعلان الأزياء الراقية والمجوهرات الفاخرة",
    brandEn: "Haute Couture Dubai",
    brandAr: "أزياء دبي الراقية",
    categoryEn: "Fashion & Beauty",
    categoryAr: "أزياء وجمال",
    views: "4.8M Views",
    videoSrc: "/videos/reels/commercial-fashion-reel.mp4",
    aspectRatio: "vertical",
    tags: ["9:16 Reel", "4K Commercial", "Mawthooq Certified"],
  },
  {
    id: "brand-activation",
    titleEn: "Brand Activation & Social Momentum",
    titleAr: "إطلاق وتفعيل العلامة التجارية عبر السوشيال",
    brandEn: "Dubai Lifestyle Campaign",
    brandAr: "حملة أسلوب الحياة دبي",
    categoryEn: "Social Activation",
    categoryAr: "تفعيل رقمي",
    views: "3.2M Views",
    videoSrc: "/videos/reels/brand-activation-reel.mp4",
    aspectRatio: "vertical",
    tags: ["TikTok Viral", "Instagram Reel", "Influencer Led"],
  },
  {
    id: "product-commercial",
    titleEn: "Organic Bio-Wellness Product Launch",
    titleAr: "إطلاق منتجات الصحة والجمال العضوية",
    brandEn: "Pure Botanicals UAE",
    brandAr: "بيور بوتانيكالز الإمارات",
    categoryEn: "Commercial TVC",
    categoryAr: "إعلان تجاري",
    views: "2.1M Views",
    videoSrc: "/videos/reels/product-commercial-reel.mp4",
    aspectRatio: "landscape",
    tags: ["Macro Optics", "Studio XR Lighting", "TVC Master"],
  },
  {
    id: "tabletop-cinema",
    titleEn: "High-Speed Gourmet Tabletop Cinema",
    titleAr: "تصوير سينمائي عالي السرعة للأطعمة والحلويات",
    brandEn: "Artisan Patisserie Dubai",
    brandAr: "حلويات دبي الفاخرة",
    categoryEn: "Tabletop / F&B",
    categoryAr: "تصوير الأطعمة",
    views: "1.9M Views",
    videoSrc: "/videos/reels/fb-tabletop-cinema.mp4",
    aspectRatio: "landscape",
    tags: ["Phantom 1000fps", "Probe Lens", "Color Graded"],
  },
];

export function VerticalReelsShowcase() {
  const { isArabic } = useLanguage();
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const togglePlay = async (id: string) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (activeReelId === id && !video.paused) {
      video.pause();
    } else {
      // Pause any currently playing video
      if (activeReelId && videoRefs.current[activeReelId]) {
        videoRefs.current[activeReelId]?.pause();
      }
      setPlaybackError(null);
      try {
        await video.play();
      } catch (err) {
        console.error("Video playback failed for reel", id, err);
        setPlaybackError(id);
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    Object.values(videoRefs.current).forEach((vid) => {
      if (vid) vid.muted = newMuted;
    });
  };

  return (
    <div className="my-16 sm:my-20 rounded-3xl border border-white/10 bg-gradient-to-b from-[#090a10] to-black p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Flame size={13} className="text-amber-400" />
            <span>{isArabic ? "ريلز وإنتاجات الفيديو القصيرة" : "Viral Reels & Commercial Shorts"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            {isArabic ? "أقوى الحملات الإعلانية العمودية" : "High-Impact 9:16 Video Reels"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
            {isArabic
              ? "إنتاجات مصممة خصيصاً لمنصات تيك توك، إنستغرام ريلز، وحملات المشاهير الموثقة (Mawthooq) بأعلى جودة سينمائية."
              : "Bespoke short-form vertical productions engineered for TikTok, Instagram Reels, and Mawthooq-certified influencer campaigns."}
          </p>
        </div>

        {/* Global Mute Toggle */}
        <button
          type="button"
          onClick={toggleMute}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-amber-400" />}
          <span>{isMuted ? (isArabic ? "تشغيل الصوت" : "Unmute Audio") : (isArabic ? "كتم الصوت" : "Mute Audio")}</span>
        </button>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {REELS.map((reel) => {
          const isPlaying = activeReelId === reel.id;

          return (
            <div
              key={reel.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:shadow-amber-500/10 flex flex-col"
            >
              {/* Video Player Container */}
              <div
                onClick={() => togglePlay(reel.id)}
                className="relative aspect-[9/14] w-full bg-zinc-950 overflow-hidden cursor-pointer"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[reel.id] = el;
                  }}
                  src={reel.videoSrc}
                  loop
                  playsInline
                  muted={isMuted}
                  preload="metadata"
                  onPlay={() => setActiveReelId(reel.id)}
                  onPause={() => {
                    setActiveReelId((current) => current === reel.id ? null : current);
                  }}
                  onEnded={() => {
                    setActiveReelId((current) => current === reel.id ? null : current);
                  }}
                  className={cn(
                    "size-full group-hover:scale-105 transition-transform duration-500",
                    reel.aspectRatio === "landscape" ? "object-contain bg-black" : "object-cover"
                  )}
                />

                {/* Dark Gradient Overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Floating Badge (Views & Category) */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none text-[11px] font-mono">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5 font-bold">
                    <Eye size={12} className="text-amber-400" />
                    <span>{reel.views}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                    {isArabic ? reel.categoryAr : reel.categoryEn}
                  </span>
                </div>

                {/* Center Play / Pause Indicator Button */}
                <div
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 rounded-full bg-black/75 border border-white/20 text-white flex items-center justify-center transition-all duration-300 pointer-events-none shadow-2xl",
                    isPlaying ? "opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100" : "opacity-90 scale-100"
                  )}
                >
                  {isPlaying ? (
                    <Pause size={18} className="text-amber-400" />
                  ) : (
                    <Play size={18} className="text-amber-400 fill-amber-400 ml-0.5" />
                  )}
                </div>

                {/* Playback error notice */}
                {playbackError === reel.id && (
                  <div className="absolute inset-x-3 bottom-16 p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-[10px] text-red-300 font-mono text-center">
                    {isArabic ? "تعذر تشغيل الفيديو" : "Playback failed. Click to retry."}
                  </div>
                )}

                {/* Bottom Video Meta Info */}
                <div className="absolute bottom-3 inset-x-3 pointer-events-none space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">
                    {isArabic ? reel.brandAr : reel.brandEn}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                    {isArabic ? reel.titleAr : reel.titleEn}
                  </h3>
                </div>
              </div>

              {/* Card Meta & Tags Footer */}
              <div className="p-3.5 bg-white/[0.02] border-t border-white/5 flex flex-wrap gap-1.5 items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {reel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9.5px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-text-muted border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => togglePlay(reel.id)}
                  aria-label={`${isPlaying ? (isArabic ? "إيقاف" : "Pause") : (isArabic ? "تشغيل" : "Watch")} — ${isArabic ? reel.titleAr : reel.titleEn}`}
                  className="text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  {isPlaying ? (isArabic ? "إيقاف" : "Pause") : (isArabic ? "تشغيل" : "Watch")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Quality Callout Bar */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted font-mono">
        <div className="flex items-center gap-2">
          <Smartphone size={14} className="text-amber-400 shrink-0" />
          <span>{isArabic ? "مُصورة بكاميرات سينمائية رأسية (Vertical Rigged Cinema)" : "Filmed on Vertical-Rigged RED & ARRI Cinema Systems"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span>{isArabic ? "ترخيص إعلاني معتمد من هيئة الإعلام (Mawthooq)" : "100% Mawthooq UAE Media Council Compliant"}</span>
        </div>
      </div>
    </div>
  );
}
