"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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

export function YasproAnimatedLoader({
  statusText,
  size = "fullscreen",
  className,
}: YasproAnimatedLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const isFullscreen = size === "fullscreen";
  const isCompact = size === "compact";

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn(
        "flex flex-col items-center justify-center select-none font-sans",
        isFullscreen && "fixed inset-0 z-[9999] bg-[#070709]/95 backdrop-blur-2xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={statusText || "Loading Yas Pro AI Media Hub"}
    >
      {/* Background ambient stage glow */}
      <div className="absolute pointer-events-none">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-brand-violet/20 blur-[120px] animate-pulse motion-reduce:animate-none" />
        <div className="w-56 h-56 rounded-full bg-amber-400/15 blur-[90px]" />
      </div>

      {/* Main Container with subtle breathing motion */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.04, 0.98, 1],
              }
        }
        transition={{
          duration: 3.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Animated Authentic Yas Pro "O" Favicon Emblem */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(255,233,0,0.3)]",
            isCompact ? "size-16 sm:size-20" : "size-28 sm:size-36"
          )}
        >
          <svg
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-full overflow-visible"
          >
            <defs>
              {/* Backlight Halo behind the emblem */}
              <radialGradient id="yas-emblem-halo" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e1038" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#090514" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#030107" stopOpacity="1" />
              </radialGradient>

              {/* Deep Cinema Dark Obsidian Shading for the O-ring blades */}
              <linearGradient id="yas-ring-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a1228" />
                <stop offset="50%" stopColor="#0d0817" />
                <stop offset="100%" stopColor="#140d20" />
              </linearGradient>

              {/* Radiant Yellow Shutter Blade Gradient */}
              <linearGradient id="yas-yellow-blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#fff04d" />
                <stop offset="60%" stopColor="#ffe900" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>

              {/* Intense Neon Yellow Glow Filter */}
              <filter id="yas-yellow-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Backing Cinema Base Disc */}
            <circle
              cx="256"
              cy="256"
              r="252"
              fill="url(#yas-emblem-halo)"
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth="2"
            />

            {/* Precision Laser Outer Rim */}
            <circle
              cx="256"
              cy="256"
              r="244"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />

            {/* ROTATING APERTURE GROUP */}
            <motion.g
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "256px 256px" }}
            >
              {/* LAYER 1: Pure White Inner Base & Seams
                  By stroking the O-ring path in crisp white with stroke-width,
                  the dividing lines between every camera shutter blade shine in brilliant white! */}
              <path
                d={YAS_O_RING_PATH}
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinejoin="round"
                fillRule="evenodd"
              />

              {/* LAYER 2: Deep Dark Body of the O-ring Segments
                  Layered cleanly on top, leaving the sharp, crisp white seams between the blades */}
              <path
                d={YAS_O_RING_PATH}
                fill="url(#yas-ring-dark)"
                fillRule="evenodd"
              />

              {/* LAYER 3: Signature Yellow Shutter Blade (Vibrant, Neon, Shining with White Seam Boundary) */}
              <motion.g
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: [0.94, 1, 0.9, 1],
                        scale: [1, 1.025, 1],
                      }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ transformOrigin: "256px 256px" }}
              >
                {/* Yellow Blade White Border Seam */}
                <path
                  d={YAS_YELLOW_BLADE_PATH}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  fillRule="evenodd"
                />

                {/* Yellow Shutter Blade Body */}
                <path
                  d={YAS_YELLOW_BLADE_PATH}
                  fill="url(#yas-yellow-blade-grad)"
                  fillRule="evenodd"
                  filter="url(#yas-yellow-glow)"
                />
              </motion.g>
            </motion.g>

            {/* Center Aperture Lens Hole */}
            <circle
              cx="256"
              cy="256"
              r="68"
              fill="#06020e"
              stroke="rgba(255, 233, 0, 0.6)"
              strokeWidth="1.5"
            />
            {/* Center pulsing beacon */}
            <motion.circle
              cx="256"
              cy="256"
              r="40"
              fill="rgba(255, 233, 0, 0.25)"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      r: [35, 48, 35],
                      opacity: [0.3, 0.8, 0.3],
                    }
              }
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>
      </motion.div>

      {/* Brand Identity: Official Logo Image & Optional Status Text */}
      <div className="relative z-10 flex flex-col items-center mt-6 text-center space-y-2">
        <div className="relative shrink-0 flex items-center justify-center">
          <span className="absolute -inset-2 rounded-2xl bg-brand-violet/20 blur-md pointer-events-none opacity-60" />
          <Image
            src="/images/group/yas-pro-media-group.png"
            alt="YAS PRO Media Group"
            width={isCompact ? 130 : 160}
            height={isCompact ? 46 : 56}
            priority
            className={cn(
              "relative z-10 w-auto object-contain filter brightness-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]",
              isCompact ? "h-8" : "h-10 sm:h-11"
            )}
          />
        </div>

        {statusText && (
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 animate-pulse font-latin">
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
}

export default YasproAnimatedLoader;
