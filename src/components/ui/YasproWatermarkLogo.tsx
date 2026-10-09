"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { YASPR_VECTOR_PATH } from "./yasprVectorPath";
import { ApertureO } from "./YasproAnimatedLoader";

export interface YasproWatermarkLogoProps {
  className?: string;
  idPrefix?: string;
}

export function YasproWatermarkLogo({
  className,
  idPrefix,
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
        @keyframes yasIrisSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes yasWatermarkGlowPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.16); }
        }
        .yas-iris-spin {
          animation: yasIrisSpin 16s linear infinite;
        }
        .${uid}-glow-pulse {
          animation: yasWatermarkGlowPulse 2.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .yas-iris-spin,
          .${uid}-glow-pulse {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
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

      {/* ─── Aperture [O] using the EXACT SAME ApertureO component as YasproAnimatedLoader ─── */}
      <span className="ml-[0.16em] size-[0.84em] shrink-0 inline-flex items-center justify-center relative">
        {/* Soft yellow glow behind the O that matches YasproAnimatedLoader */}
        <span className={cn(`${uid}-glow-pulse absolute -inset-[22%] rounded-full bg-yellow-400/25 blur-xl pointer-events-none`)} />

        <span className="relative block size-full z-10">
          <ApertureO uid={uid} />
        </span>
      </span>
    </div>
  );
}
