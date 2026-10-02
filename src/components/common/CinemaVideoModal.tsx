"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Film, X, ExternalLink, Play, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

const emptySubscribe = () => () => {};

export interface CinemaVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vimeoId?: string;
  videoUrl?: string;
  posterImage?: string;
  title: string;
  subtitle?: string;
  client?: string;
}

type VideoSourceType = "direct" | "youtube" | "vimeo" | "unknown";

interface ParsedSource {
  type: VideoSourceType;
  idOrUrl: string;
  directWatchUrl: string;
}

function parseVideoSource(vimeoId?: string, videoUrl?: string): ParsedSource | null {
  const target = (videoUrl || vimeoId || "").trim();
  if (!target) return null;

  // 1. Direct video file (mp4, webm, m3u8, ogg, etc.)
  if (/\.(mp4|webm|m3u8|mov|ogg)(\?.*)?$/i.test(target) || target.startsWith("blob:") || target.includes("/video/upload/")) {
    return {
      type: "direct",
      idOrUrl: target,
      directWatchUrl: target,
    };
  }

  // 2. YouTube (standard watch, short URL, embed)
  const ytMatch = target.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      idOrUrl: ytMatch[1],
      directWatchUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
    };
  }

  // 3. Vimeo numeric ID or URL (e.g. "1093240200" or "https://vimeo.com/1093240200")
  const vimeoDigitsMatch = target.match(/(\d{6,12})/);
  if (vimeoDigitsMatch && vimeoDigitsMatch[1]) {
    const id = vimeoDigitsMatch[1];
    return {
      type: "vimeo",
      idOrUrl: id,
      directWatchUrl: `https://vimeo.com/${id}`,
    };
  }

  if (/^\d+$/.test(target)) {
    return {
      type: "vimeo",
      idOrUrl: target,
      directWatchUrl: `https://vimeo.com/${target}`,
    };
  }

  return {
    type: "unknown",
    idOrUrl: target,
    directWatchUrl: target,
  };
}

export function CinemaVideoModal({
  isOpen,
  onClose,
  vimeoId,
  videoUrl,
  posterImage,
  title,
  subtitle,
  client,
}: CinemaVideoModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const parsed = parseVideoSource(vimeoId, videoUrl);

  // Lock body scroll, listen for Escape key, and suspend background 3D/canvases
  useEffect(() => {
    if (!isOpen) return;

    window.dispatchEvent(new CustomEvent("yaspro:cinema-modal-open"));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      window.dispatchEvent(new CustomEvent("yaspro:cinema-modal-close"));
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !parsed) {
    return null;
  }

  const handleLaunchVideo = () => {
    window.open(parsed.directWatchUrl, "_blank", "noopener,noreferrer");
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-6 md:p-8 bg-black/95 backdrop-blur-2xl transition-opacity duration-300 select-none animate-in fade-in"
      onClick={onClose}
    >
      {/* Centered Cinema Card Container */}
      <div
        className="relative w-full h-full sm:h-auto max-w-5xl bg-zinc-950 border-0 sm:border sm:border-white/20 rounded-none sm:rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.95)] flex flex-col justify-center sm:justify-start my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <div className="size-8 sm:size-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Film size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white font-display truncate">
                {title} {subtitle ? `— ${subtitle}` : ""}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-text-muted font-mono truncate">
                {client ? `Client: ${client} • ` : ""}Official Yas Pro Cinema Master
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="size-9 sm:size-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Stage Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {/* ENGINE 1: Direct Video File (HTML5 Native Player - Never hangs) */}
          {parsed.type === "direct" && (
            <video
              src={parsed.idOrUrl}
              poster={posterImage}
              autoPlay
              controls
              playsInline
              className="absolute inset-0 size-full object-contain bg-black"
            />
          )}

          {/* ENGINE 2: YouTube Embed (youtube-nocookie with zero bot hangs) */}
          {parsed.type === "youtube" && (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${parsed.idOrUrl}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              title={title}
            />
          )}

          {/* ENGINE 3: Vimeo Player Embed - Hardware accelerated, optimized params to prevent browser auto-pause/hang loops */}
          {parsed.type === "vimeo" && (
            <iframe
              src={`https://player.vimeo.com/video/${parsed.idOrUrl}?autoplay=1&autopause=0&playsinline=1&title=0&byline=0&portrait=0&transparent=0&dnt=1&app_id=58479`}
              className="absolute inset-0 size-full border-0 bg-black"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              title={title}
            />
          )}

          {/* ENGINE 4: Fallback Gateway for unknown/external links */}
          {parsed.type === "unknown" && (
            <div className="absolute inset-0 size-full flex flex-col justify-between p-6 sm:p-10 bg-gradient-to-t from-black via-zinc-950/80 to-black/60">
              {/* Background Poster Artwork */}
              {posterImage && (
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <Image
                    src={posterImage}
                    alt={title}
                    fill
                    className="object-cover object-center blur-sm opacity-40 scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" />
                </div>
              )}

              {/* Top Tags */}
              <div className="flex items-center justify-between gap-3 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-xs font-mono">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>4K Ultra-HD Master</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <ShieldCheck size={12} />
                  <span>High Bitrate Cinema Stream</span>
                </span>
              </div>

              {/* Centered Luxury Launch Button */}
              <div className="flex flex-col items-center justify-center text-center my-auto z-10 py-6">
                <button
                  type="button"
                  onClick={handleLaunchVideo}
                  className="group relative cursor-pointer flex items-center justify-center size-20 sm:size-24 rounded-full bg-amber-500 text-black shadow-[0_0_50px_rgba(245,158,11,0.35)] hover:bg-amber-400 hover:shadow-[0_0_70px_rgba(245,158,11,0.5)] hover:scale-110 active:scale-95 transition-all duration-300"
                  aria-label="Play video master"
                >

                  <Play size={32} className="fill-current translate-x-0.5 text-black transition-transform group-hover:scale-110" />
                </button>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-6 tracking-tight">
                  Launch Master Reel
                </h3>
                <p className="text-xs sm:text-sm text-text-muted max-w-md mt-2">
                  Plays instantly in full uncompressed cinema quality without third-party iframe buffering or CAPTCHA restrictions.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-4 sm:mt-6 w-full max-w-xs sm:max-w-none">
                  <button
                    type="button"
                    onClick={handleLaunchVideo}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full btn-brand text-xs font-bold shadow-lg transition-transform hover:scale-105 cursor-pointer min-h-[44px] sm:min-h-0"
                  >
                    <span>Open 4K Player</span>
                    <ExternalLink size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/10 transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
                  >
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex items-center justify-center sm:justify-between gap-4 text-[11px] font-mono text-white/50 border-t border-white/10 pt-3 z-10">
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-amber-400" />
                  Zero Stalling & Guaranteed Delivery
                </span>
                <span>YAS PRO MEDIA PRODUCTIONS</span>
                <span className="hidden sm:inline">DOLBY ATMOS · 24FPS CINEMA</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
