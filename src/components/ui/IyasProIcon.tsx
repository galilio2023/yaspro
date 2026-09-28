import React from "react";
import { cn } from "@/lib/utils";

export interface IyasProIconProps {
  className?: string;
  size?: number | string;
  idPrefix?: string;
}

/**
 * Exquisite Candle "i" Emblem for "iYASPRO".
 *
 * Design Concept:
 * - The Dot of the "i" is an enchanting, luminous candle flame featuring:
 *   - Outer spiritual aura: Radiant violet & cyan ambient glow filter.
 *   - Tear-drop teardrop flame curvature: Gradient flowing from blazing gold amber at the core
 *     into neon magenta / electric violet, and rising into a fine bright cyan tip.
 *   - Inner incandescent white-gold spark ember heart.
 * - The Wick: A delicate, warm curved filament connecting the flame to the candle body.
 * - The Stem of the "i" is a luxurious sculpted candle column:
 *   - Soft wax rim with an elegant melting dip.
 *   - Unique cylindrical shading with deep royal violet, midnight indigo, and cyan rim highlights.
 *   - Micro wax luster droplets and a glowing pedestal reflection.
 */
export function IyasProIcon({
  className,
  size = 28,
  idPrefix = "iyas-candle",
}: IyasProIconProps) {
  const flameOuterGradId = `${idPrefix}-flame-outer`;
  const flameCoreGradId = `${idPrefix}-flame-core`;
  const flameGlowFilterId = `${idPrefix}-glow`;
  const candleBodyGradId = `${idPrefix}-body`;
  const waxRimGradId = `${idPrefix}-wax-rim`;
  const lusterGradId = `${idPrefix}-luster`;

  return (
    <svg
      viewBox="0 0 24 34"
      width={size}
      height={typeof size === "number" ? Math.round((size * 34) / 24) : size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0 overflow-visible align-middle", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Soft magical illumination aura for the flame */}
        <filter id={flameGlowFilterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer Flame: Gold amber base -> Electric orchid / magenta -> Luminous turquoise tip */}
        <linearGradient id={flameOuterGradId} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="25%" stopColor="#f43f5e" />
          <stop offset="65%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Inner Flame Core: Pure celestial incandescent light */}
        <linearGradient id={flameCoreGradId} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="90%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>

        {/* Candle Column Body: High-end royal violet to deep obsidian with cyan edge reflection */}
        <linearGradient id={candleBodyGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="18%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="75%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
        </linearGradient>

        {/* Candle Top Wax Rim: Soft molten wax curve */}
        <linearGradient id={waxRimGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Vertical Candle Specular Luster Highlight */}
        <linearGradient id={lusterGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* ─────────────────────────────────────────────────────────────
          1. CANDLE FLAME (The Dot of the "i")
          ───────────────────────────────────────────────────────────── */}
      <g filter={`url(#${flameGlowFilterId})`}>
        {/* Soft Outer Halo Aura */}
        <ellipse
          cx="12"
          cy="7"
          rx="5.5"
          ry="6.5"
          fill="#f59e0b"
          fillOpacity="0.18"
          className="animate-pulse"
        />

        {/* Main Tear-Drop Flame Body */}
        {/* Tip at (12, 1), curves down through (15.5, 6.8), rounded base at (12, 10), curves back up */}
        <path
          d="M12 1.2
             C12.8 3.5 15.6 5.8 15.6 7.6
             C15.6 9.8 14 10.8 12 10.8
             C10 10.8 8.4 9.8 8.4 7.6
             C8.4 5.8 11.2 3.5 12 1.2 Z"
          fill={`url(#${flameOuterGradId})`}
        />

        {/* Vibrant Inner Hot Ember Tear */}
        <path
          d="M12 3.6
             C12.5 5 14.2 6.4 14.2 7.7
             C14.2 9 13.2 9.7 12 9.7
             C10.8 9.7 9.8 9 9.8 7.7
             C9.8 6.4 11.5 5 12 3.6 Z"
          fill={`url(#${flameCoreGradId})`}
        />

        {/* White Hot Sparkle Kernel */}
        <circle cx="12" cy="8.2" r="1.1" fill="#ffffff" />
      </g>

      {/* ─────────────────────────────────────────────────────────────
          2. THE WICK
          ───────────────────────────────────────────────────────────── */}
      <path
        d="M12 9.8 Q12.2 11.5 12 13"
        stroke="#1e1b4b"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Tiny ember glow point at top of wick */}
      <circle cx="12" cy="10.2" r="0.6" fill="#f59e0b" />

      {/* ─────────────────────────────────────────────────────────────
          3. CANDLE PILLAR (The Stem of the "i")
          ───────────────────────────────────────────────────────────── */}
      <g>
        {/* Main Candle Body Column with Smooth Rounded Base */}
        <path
          d="M9 14.2
             H15
             V28.5
             C15 30.5 13.65 31.5 12 31.5
             C10.35 31.5 9 30.5 9 28.5
             V14.2 Z"
          fill={`url(#${candleBodyGradId})`}
        />

        {/* Molten Wax Rim at the Top (Slightly dished ellipse) */}
        <ellipse
          cx="12"
          cy="14.2"
          rx="3"
          ry="1.2"
          fill={`url(#${waxRimGradId})`}
        />

        {/* Artistic Molten Wax Tear / Drop running down left side */}
        <path
          d="M9 16 C9 18.5 9.8 19.5 9.8 21 C9.8 21.6 9.4 22 9 22"
          stroke="#c4b5fd"
          strokeWidth="0.8"
          strokeLinecap="round"
          className="opacity-70"
        />

        {/* Left Specular Glaze / Luster Streak for Cylindrical 3D Form */}
        <path
          d="M10.2 15.8 V28.2"
          stroke={`url(#${lusterGradId})`}
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Right Subtle Ambient Rim Light */}
        <path
          d="M13.8 15.8 V28"
          stroke="#67e8f9"
          strokeWidth="0.6"
          strokeLinecap="round"
          className="opacity-60"
        />

        {/* Base Glow Accent Foot */}
        <ellipse
          cx="12"
          cy="31.2"
          rx="2"
          ry="0.6"
          fill="#38bdf8"
          className="opacity-50"
        />
      </g>
    </svg>
  );
}
