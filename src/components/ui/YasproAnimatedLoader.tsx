"use client";

import React, { useId } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

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

/**
 * Stage 1: The O swiftly rolls across X-axis and reveals Y-A-S-P-R.
 */
const ROLL_IN: Transition = { duration: 0.72, ease: [0.16, 1, 0.3, 1] };

const LETTERS = "YASPR";

const LETTER_CLASS =
  "font-sans font-black leading-none tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent";

function WordmarkLetters() {
  return (
    <span className="flex items-center">
      <span className={LETTER_CLASS}>{LETTERS}</span>
      {/* Spacer reserving the O slot */}
      <span className="ml-[0.06em] size-[0.78em] shrink-0" />
    </span>
  );
}

/** The aperture "O" emblem */
function ApertureO({ uid, spin }: { uid: string; spin: boolean }) {
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

      <circle cx="256" cy="256" r="252" fill={`url(#${uid}-halo)`} stroke="rgba(168,85,247,0.45)" strokeWidth="6" />

      {/* Rotating aperture iris */}
      <motion.g
        animate={spin ? { rotate: 360 } : undefined}
        transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "256px 256px" }}
      >
        {/* White seams between the blades */}
        <path d={YAS_O_RING_PATH} fill="#ffffff" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" fillRule="evenodd" />
        {/* Dark blades */}
        <path d={YAS_O_RING_PATH} fill={`url(#${uid}-dark)`} fillRule="evenodd" />
        {/* Signature yellow blade */}
        <path d={YAS_YELLOW_BLADE_PATH} stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
        <path d={YAS_YELLOW_BLADE_PATH} fill={`url(#${uid}-yellow)`} />
      </motion.g>

      <circle cx="256" cy="256" r="68" fill="#06020e" stroke="rgba(255,233,0,0.6)" strokeWidth="3" />
      <circle cx="256" cy="256" r="38" fill="rgba(255,233,0,0.3)" />
    </svg>
  );
}

export function YasproAnimatedLoader({
  statusText,
  size = "fullscreen",
  className,
}: YasproAnimatedLoaderProps) {
  const reduce = !!useReducedMotion();
  const uid = `yas-o-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const isFullscreen = size === "fullscreen";
  const isCompact = size === "compact";

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn(
        "flex flex-col items-center justify-center select-none font-sans overflow-hidden",
        isFullscreen && "fixed inset-0 z-[9999] bg-[#070709]/95 backdrop-blur-2xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={statusText || "Loading Yas Pro AI Media Hub"}
    >
      {/* Background ambient stage glow with subtle organic breathing */}
      <div className="absolute pointer-events-none" aria-hidden="true">
        <motion.div
          animate={
            reduce
              ? undefined
              : {
                  scale: [1, 1.15, 1],
                  opacity: [0.2, 0.35, 0.2],
                }
          }
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-brand-violet/25 blur-[130px]"
        />
        <motion.div
          animate={
            reduce
              ? undefined
              : {
                  scale: [1, 1.1, 1],
                  opacity: [0.15, 0.28, 0.15],
                }
          }
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
          className="w-64 h-64 rounded-full bg-amber-400/20 blur-[100px]"
        />
      </div>

      {/* ─── CINEMATIC ENTRANCE & ORGANIC BREATHING CONTAINER ───
          1. The O glides across X-axis, rolling from left to right.
          2. It forms YASPRO, docks as the O.
          3. Once docked, the whole brand lockup breathes with a luxurious pulse! */}
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                scale: [1, 1.035, 0.99, 1],
              }
        }
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.75, // begins breathing right after docking
        }}
        className="relative flex flex-col items-center justify-center"
      >
        {/* ─── WORDMARK: the O rolls left → right and "writes" Y-A-S-P-R, then docks as the final O ─── */}
        <div
          aria-hidden="true"
          className={cn(
            "relative inline-flex items-center",
            isCompact ? "text-3xl sm:text-4xl" : "text-5xl sm:text-6xl md:text-7xl"
          )}
        >
          {/* Invisible sizer: defines the exact width of the final "YASPRO" */}
          <span className="invisible">
            <WordmarkLetters />
          </span>

          {/* Reveal window: slides from -100% to 0% with overflow hidden; its right edge matches the O */}
          <motion.div
            className="absolute inset-0 overflow-hidden will-change-transform"
            initial={reduce ? false : { x: "-100%" }}
            animate={{ x: "0%" }}
            transition={ROLL_IN}
          >
            {/* Counter-translate keeps the letters steady on screen */}
            <motion.div
              className="absolute inset-0 flex items-center will-change-transform"
              initial={reduce ? false : { x: "100%" }}
              animate={{ x: "0%" }}
              transition={ROLL_IN}
            >
              <WordmarkLetters />
            </motion.div>
          </motion.div>

          {/* O track: moves across X-axis, O pinned to its right end */}
          <motion.div
            className="absolute inset-0 flex items-center justify-end pointer-events-none will-change-transform"
            initial={reduce ? false : { x: "-100%" }}
            animate={{ x: "0%" }}
            transition={ROLL_IN}
          >
            <motion.span
              className="relative block size-[0.78em] shrink-0 will-change-transform"
              initial={reduce ? false : { rotate: -540, scale: 0.7, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{
                ...ROLL_IN,
                opacity: { duration: 0.12, ease: "linear" },
              }}
            >
              {/* Soft yellow glow behind the O that pulses with the yellow blade */}
              <motion.span
                animate={
                  reduce
                    ? undefined
                    : {
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.12, 1],
                      }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-[22%] rounded-full bg-yellow-400/30 blur-xl pointer-events-none"
              />
              <span className="relative block size-full">
                <ApertureO uid={uid} spin={!reduce} />
              </span>
            </motion.span>
          </motion.div>
        </div>

        {/* Subtitle lands softly as the O docks */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 mt-3 text-[10px] sm:text-xs font-mono tracking-[0.25em] text-zinc-400 uppercase font-latin"
        >
          <span>MEDIA GROUP</span>
          <span className="size-1 rounded-full bg-yellow-400" />
          <span className="text-purple-300">AI HUB</span>
        </motion.div>
      </motion.div>

      {statusText && (
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mt-4 font-latin">
          {statusText}
        </p>
      )}
    </div>
  );
}

export default YasproAnimatedLoader;
