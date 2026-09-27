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
  const [isLoading, setIsLoading] = React.useState(true);

  const [prevVideoKey, setPrevVideoKey] = React.useState(`${isOpen}-${vimeoId}`);
  if (`${isOpen}-${vimeoId}` !== prevVideoKey) {
    setPrevVideoKey(`${isOpen}-${vimeoId}`);
    if (isOpen) {
      setIsLoading(true);
    }
  }


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

  const vimeoUrl = `https://vimeo.com/${vimeoId}`;

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

          <div className="flex items-center gap-2">
            {/* Direct Vimeo Fallback Link */}
            <a
              href={vimeoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-[11px] font-mono border border-white/10 transition-colors"
              title="Open video on Vimeo"
            >
              <span>Vimeo Mirror</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="size-8 sm:size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-white/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 16:9 Aspect Ratio Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {/* Buffering/Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 z-10 gap-3 pointer-events-none">
              <div className="size-10 rounded-full border-2 border-brand-purple border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-text-muted tracking-widest uppercase">
                Loading 4K Cinema Reel...
              </span>
            </div>
          )}

          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?app_id=122963&autoplay=1&muted=0&playsinline=1&title=0&byline=0&portrait=0&dnt=1`}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            title={title}
            onLoad={() => {
              setIsLoading(false);
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
