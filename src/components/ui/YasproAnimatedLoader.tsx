"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { YASPR_VECTOR_PATH } from "./yasprVectorPath";

export interface YasproAnimatedLoaderProps {
  statusText?: string;
  size?: "default" | "compact" | "fullscreen";
  className?: string;
}

// Authentic SVG paths extracted directly from the official Yas Pro O emblem
const YAS_O_RING_PATH =
  "M 326,349 L 88,448 L 92,453 L 118,472 L 135,482 L 166,496 L 184,502 L 216,509 L 231,511 L 260,510 L 264,498 L 270,486 L 276,469 L 282,457 L 293,428 L 306,399 Z M 372,273 L 367,283 L 349,329 L 331,370 L 313,416 L 273,511 L 288,510 L 311,506 L 327,502 L 362,489 L 378,480 L 380,480 L 405,464 L 424,449 L 439,434 L 431,417 L 425,400 L 408,359 L 402,347 Z M 0,272 L 5,309 L 11,332 L 22,361 L 31,379 L 46,403 L 65,427 L 77,436 L 84,434 L 89,431 L 237,371 L 203,356 L 98,313 L 79,304 L 55,295 L 36,286 L 2,272 Z M 350,187 L 376,248 L 392,289 L 398,301 L 421,359 L 427,371 L 446,419 L 449,424 L 466,402 L 478,383 L 488,364 L 497,342 L 503,323 L 509,294 L 511,278 L 511,253 L 449,228 L 420,215 L 374,197 L 357,189 Z M 64,87 L 54,98 L 36,124 L 21,153 L 15,168 L 8,190 L 4,207 L 0,237 L 1,258 L 161,325 L 126,238 L 120,226 L 119,221 L 102,182 L 69,99 L 64,89 Z M 239,1 L 222,2 L 195,7 L 174,13 L 151,22 L 133,31 L 109,46 L 86,64 L 74,76 L 74,79 L 140,238 Z M 186,162 L 300,116 L 317,108 L 405,72 L 422,66 L 425,64 L 404,47 L 382,33 L 369,26 L 343,15 L 324,9 L 303,4 L 270,0 L 253,1 Z";

const YAS_YELLOW_BLADE_PATH =
  "M 274,141 L 511,239 L 509,218 L 505,197 L 497,170 L 489,150 L 477,127 L 464,107 L 449,88 L 438,76 L 435,74 Z";

// Authentic vector path extracted directly from the official Yas Pro brand identity mark
// Letter A features the signature geometric delta triangle apex with a horizontal base stroke.
export function WordmarkLetters({ uid = "yas-letters" }: { uid?: string }) {
  return (
    <span className="inline-flex items-center select-none" dir="ltr" style={{ direction: "ltr" }}>
      <svg
        viewBox="0 0 299.693 63.864"
        className="h-[0.72em] w-auto overflow-visible shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f8fafc" />
            <stop offset="85%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <path d={YASPR_VECTOR_PATH} fill={`url(#${uid}-grad)`} />
      </svg>
      {/* Spacer reserving the authentic aperture O slot matching official brand proportions */}
      <span className="ml-[0.16em] size-[0.84em] shrink-0" />
    </span>
  );
}

/** The aperture "O" emblem */
export function ApertureO({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
      <defs>
        <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e1038" />
          <stop offset="70%" stopColor="#090514" />
          <stop offset="100%" stopColor="#030107" />
        </radialGradient>
        <linearGradient id={`${uid}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1228" />
          <stop offset="50%" stopColor="#0d0817" />
          <stop offset="100%" stopColor="#140d20" />
        </linearGradient>
        <linearGradient id={`${uid}-yellow`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#fff04d" />
          <stop offset="60%" stopColor="#ffe900" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      <circle cx="256" cy="256" r="252" fill={`url(#${uid}-halo)`} stroke="rgba(168,85,247,0.3)" strokeWidth="2.5" />

      {/* Rotating aperture iris */}
      <g
        className="yas-iris-spin"
        style={{ transformOrigin: "256px 256px" }}
      >
        {/* White seams between the blades */}
        <path d={YAS_O_RING_PATH} fill="#ffffff" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" fillRule="evenodd" />
        {/* Dark blades */}
        <path d={YAS_O_RING_PATH} fill={`url(#${uid}-dark)`} fillRule="evenodd" />
        {/* Signature yellow blade */}
        <path d={YAS_YELLOW_BLADE_PATH} stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
        <path d={YAS_YELLOW_BLADE_PATH} fill={`url(#${uid}-yellow)`} />
      </g>

      <circle cx="256" cy="256" r="112" fill="#06020e" stroke="rgba(255,233,0,0.35)" strokeWidth="1.8" />
      <circle cx="256" cy="256" r="64" fill="rgba(255,233,0,0.18)" />
    </svg>
  );
}

/**
 * Authentic brand loader featuring:
 * - GPU-composited roll-in animation across X-axis with zero SSR flash
 * - Authentic vector wordmark with the signature geometric triangle delta "A"
 * - Spinning aperture O with dark obsidian blades and glowing yellow blade (#FFE900)
 * - Cinematic organic breathing once fully docked
 */

export function YasproAnimatedLoader({
  statusText,
  size = "fullscreen",
  className,
}: YasproAnimatedLoaderProps) {
  const uid = `yas-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isFullscreen = size === "fullscreen";
  const isCompact = size === "compact";

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn(
        "flex flex-col items-center justify-center select-none font-sans overflow-hidden bg-[#070709]",
        isFullscreen && "fixed inset-0 z-[9999] backdrop-blur-2xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={statusText || "Loading Yas Pro AI Media Hub"}
    >
      <style>{`
        @keyframes yasRevealWindow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes yasRevealContent {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes yasRollTrack {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        @keyframes yasOSpin {
          0% { transform: rotate(-540deg) scale(0.7); opacity: 0; }
          18% { opacity: 1; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        @keyframes yasIrisSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes yasBrandBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes yasGlowPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.16); }
        }
        @keyframes yasSubtitleIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes yasAmbientPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.14); opacity: 0.35; }
        }
        .yas-reveal-window {
          animation: yasRevealWindow 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .yas-reveal-content {
          animation: yasRevealContent 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .yas-roll-track {
          animation: yasRollTrack 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .yas-o-spin {
          animation: yasOSpin 0.75s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .yas-iris-spin {
          animation: yasIrisSpin 2s linear infinite;
        }
        .yas-brand-breathe {
          animation: yasBrandBreathe 2.4s ease-in-out 0.75s infinite;
        }
        .yas-glow-pulse {
          animation: yasGlowPulse 1.8s ease-in-out infinite;
        }
        .yas-subtitle-in {
          animation: yasSubtitleIn 0.4s ease-out 0.65s both;
        }
        .yas-ambient-pulse {
          animation: yasAmbientPulse 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .yas-reveal-window,
          .yas-reveal-content,
          .yas-roll-track,
          .yas-o-spin,
          .yas-iris-spin,
          .yas-brand-breathe,
          .yas-glow-pulse,
          .yas-subtitle-in,
          .yas-ambient-pulse {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Background ambient stage glow with subtle organic breathing */}
      <div className="absolute pointer-events-none" aria-hidden="true">
        <div className="yas-ambient-pulse w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-brand-violet/25 blur-[130px]" />
        <div className="yas-ambient-pulse w-64 h-64 rounded-full bg-amber-400/20 blur-[100px] [animation-delay:0.3s]" />
      </div>

      {/* ─── CINEMATIC ENTRANCE & ORGANIC BREATHING CONTAINER ───
          1. The O glides across X-axis, rolling from left to right.
          2. It writes Y-A-S-P-R with authentic brand vectors, docks as the final O.
          3. Once docked, the whole brand lockup breathes with a luxurious studio pulse! */}
      <div className="yas-brand-breathe relative flex flex-col items-center justify-center will-change-transform">
        {/* ─── WORDMARK: the O rolls left → right and reveals Y-A-S-P-R ─── */}
        <div
          aria-hidden="true"
          className={cn(
            "relative inline-flex items-center",
            isCompact ? "text-3xl sm:text-4xl" : "text-5xl sm:text-6xl md:text-7xl"
          )}
        >
          {/* Invisible sizer: reserves exact width/height of final YASPRO lockup */}
          <span className="invisible pointer-events-none select-none">
            <WordmarkLetters uid={`${uid}-sizer`} />
          </span>

          {/* Reveal window: slides across X-axis, masked overflow */}
          <div className="yas-reveal-window absolute inset-0 overflow-hidden will-change-transform pointer-events-none">
            {/* Counter-translate keeps the wordmark static while window unmasks */}
            <div className="yas-reveal-content absolute inset-0 flex items-center will-change-transform">
              <WordmarkLetters uid={`${uid}-letters`} />
            </div>
          </div>

          {/* O track: moves across X-axis, O pinned to its right edge */}
          <div className="yas-roll-track absolute inset-0 flex items-center justify-end pointer-events-none will-change-transform">
            <span className="yas-o-spin relative block size-[0.84em] shrink-0 will-change-transform">
              {/* Soft yellow glow behind the O that pulses with the yellow blade */}
              <span className="yas-glow-pulse absolute -inset-[18%] rounded-full bg-yellow-400/18 blur-xl pointer-events-none" />
              <span className="relative block size-full">
                <ApertureO uid={uid} />
              </span>
            </span>
          </div>
        </div>

        {/* Subtitle lands softly as the O docks */}
        <div className="yas-subtitle-in flex items-center gap-2 mt-3 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-zinc-400 uppercase font-latin">
          <span>MEDIA GROUP</span>
          <span className="size-1 rounded-full bg-yellow-400" />
          <span className="text-purple-300">AI HUB</span>
        </div>
      </div>

      {statusText && (
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-4 font-latin">
          {statusText}
        </p>
      )}
    </div>
  );
}

export default YasproAnimatedLoader;
