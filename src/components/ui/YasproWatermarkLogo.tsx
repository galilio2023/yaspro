"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { YASPR_VECTOR_PATH } from "./yasprVectorPath";

export interface YasproWatermarkLogoProps {
  className?: string;
  idPrefix?: string;
  animateIris?: boolean;
}

// Authentic SVG paths extracted directly from the official Yas Pro O emblem
const YAS_O_RING_PATH =
  "M 326,349 L 88,448 L 92,453 L 118,472 L 135,482 L 166,496 L 184,502 L 216,509 L 231,511 L 260,510 L 264,498 L 270,486 L 276,469 L 282,457 L 293,428 L 306,399 Z M 372,273 L 367,283 L 349,329 L 331,370 L 313,416 L 273,511 L 288,510 L 311,506 L 327,502 L 362,489 L 378,480 L 380,480 L 405,464 L 424,449 L 439,434 L 431,417 L 425,400 L 408,359 L 402,347 Z M 0,272 L 5,309 L 11,332 L 22,361 L 31,379 L 46,403 L 65,427 L 77,436 L 84,434 L 89,431 L 237,371 L 203,356 L 98,313 L 79,304 L 55,295 L 36,286 L 2,272 Z M 350,187 L 376,248 L 392,289 L 398,301 L 421,359 L 427,371 L 446,419 L 449,424 L 466,402 L 478,383 L 488,364 L 497,342 L 503,323 L 509,294 L 511,278 L 511,253 L 449,228 L 420,215 L 374,197 L 357,189 Z M 64,87 L 54,98 L 36,124 L 21,153 L 15,168 L 8,190 L 4,207 L 0,237 L 1,258 L 161,325 L 126,238 L 120,226 L 119,221 L 102,182 L 69,99 L 64,89 Z M 239,1 L 222,2 L 195,7 L 174,13 L 151,22 L 133,31 L 109,46 L 86,64 L 74,76 L 74,79 L 140,238 Z M 186,162 L 300,116 L 317,108 L 405,72 L 422,66 L 425,64 L 404,47 L 382,33 L 369,26 L 343,15 L 324,9 L 303,4 L 270,0 L 253,1 Z";

const YAS_YELLOW_BLADE_PATH =
  "M 274,141 L 511,239 L 509,218 L 505,197 L 497,170 L 489,150 L 477,127 L 464,107 L 449,88 L 438,76 L 435,74 Z";

export function YasproWatermarkLogo({
  className,
  idPrefix,
  animateIris = true,
}: YasproWatermarkLogoProps) {
  const generatedId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const uid = idPrefix || `yas-wm-${generatedId}`;

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn(
        "inline-flex items-center select-none overflow-visible will-change-transform leading-none",
        className
      )}
      aria-hidden="true"
    >
      <style>{`
        @keyframes yasWatermarkIrisSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .${uid}-iris-spin {
          animation: yasWatermarkIrisSpin 24s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .${uid}-iris-spin {
            animation: none !important;
          }
        }
      `}</style>

      {/* ─── YASPR Vector Letters with signature geometric delta triangle "A" ─── */}
      <svg
        viewBox="0 0 299.693 63.864"
        className="h-[0.72em] w-auto overflow-visible shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-letters-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f8fafc" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#cbd5e1" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <path d={YASPR_VECTOR_PATH} fill={`url(#${uid}-letters-grad)`} />
      </svg>

      {/* ─── Aperture [O] matching official brand proportions & geometry ─── */}
      <span className="ml-[0.16em] size-[0.84em] shrink-0 inline-flex items-center justify-center relative">
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full overflow-visible"
        >
          <defs>
            <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#251642" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#0d071b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#040209" stopOpacity="0.4" />
            </radialGradient>
            <linearGradient id={`${uid}-dark`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#201733" />
              <stop offset="50%" stopColor="#100b1d" />
              <stop offset="100%" stopColor="#170f25" />
            </linearGradient>
            <linearGradient id={`${uid}-yellow`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#fff04d" />
              <stop offset="60%" stopColor="#ffe900" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Outer lens bezel */}
          <circle
            cx="256"
            cy="256"
            r="252"
            fill={`url(#${uid}-halo)`}
            stroke="rgba(168,85,247,0.4)"
            strokeWidth="5"
          />

          {/* Aperture iris with dark obsidian blades & signature yellow blade */}
          <g
            className={animateIris ? `${uid}-iris-spin` : undefined}
            style={{ transformOrigin: "256px 256px" }}
          >
            {/* White razor seams */}
            <path
              d={YAS_O_RING_PATH}
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
              fillRule="evenodd"
            />
            {/* Obsidian blades */}
            <path
              d={YAS_O_RING_PATH}
              fill={`url(#${uid}-dark)`}
              fillRule="evenodd"
            />
            {/* Yellow blade */}
            <path
              d={YAS_YELLOW_BLADE_PATH}
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              d={YAS_YELLOW_BLADE_PATH}
              fill={`url(#${uid}-yellow)`}
            />
          </g>

          {/* Inner sensor pupil */}
          <circle
            cx="256"
            cy="256"
            r="112"
            fill="#06020e"
            stroke="rgba(255,233,0,0.7)"
            strokeWidth="3.5"
          />
          <circle
            cx="256"
            cy="256"
            r="64"
            fill="rgba(255,233,0,0.35)"
          />
        </svg>
      </span>
    </div>
  );
}
