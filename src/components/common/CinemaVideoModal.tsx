"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Film, X } from "lucide-react";

const emptySubscribe = () => () => {};

export interface CinemaVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vimeoId?: string;
  title: string;
  subtitle?: string;
  client?: string;
}

export function CinemaVideoModal({
  isOpen,
  onClose,
  vimeoId,
  title,
  subtitle,
  client,
}: CinemaVideoModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !vimeoId) {
    return null;
  }

  // Render via React Portal directly into document.body to escape
  // any parent <section> overflow, containment, or transform contexts
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl transition-opacity duration-300 select-none animate-in fade-in"
      onClick={onClose}
    >
      {/* Centered Modal Card Container */}
      <div
        className="relative w-full max-w-5xl bg-zinc-950 border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0 pr-3">
            <div className="size-8 sm:size-9 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light shrink-0">
              <Film size={16} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white font-display truncate">
                {title} {subtitle ? `— ${subtitle}` : ""}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-text-muted font-mono truncate">
                {client ? `Client: ${client} • ` : ""}Official Production Reel • 4K Master
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="size-8 sm:size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* 16:9 Aspect Ratio Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&autopause=0&muted=0&badge=0&byline=0&portrait=0&title=0&playsinline=1&dnt=1`}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            title={title}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
