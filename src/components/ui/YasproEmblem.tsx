import React from "react";
import { cn } from "@/lib/utils";

export interface YasproEmblemProps {
  className?: string;
  size?: number | string;
  idPrefix?: string;
}

/**
 * YASPRO Cinema Lens "Y" Emblem
 *
 * Design:
 * - Circular precision cinema lens chassis with knurled bezel and f-stop optics
 * - Neon rim illumination: Electric Violet (left) & Luminous Cyber Cyan (right)
 * - Inner multi-blade aperture iris shutter
 * - Chiseled 3D geometric titanium "Y" with dual-tone specular facets
 */
export function YasproEmblem({
  className,
  size = 32,
  idPrefix = "yas-emblem",
}: YasproEmblemProps) {
  const outerGlowId = `${idPrefix}-outer-glow`;
  const ringGradId = `${idPrefix}-ring-grad`;
  const yFacetLeftId = `${idPrefix}-y-facet-left`;
  const yFacetRightId = `${idPrefix}-y-facet-right`;
  const yFacetStemId = `${idPrefix}-y-facet-stem`;
  const irisGradId = `${idPrefix}-iris-grad`;
  const neonCyanId = `${idPrefix}-neon-cyan`;
  const neonVioletId = `${idPrefix}-neon-violet`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block shrink-0 overflow-visible align-middle select-none", className)}
      aria-hidden="true"
    >
      <defs>
        {/* Neon Bloom Glow Filter */}
        <filter id={outerGlowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer Titanium Chasis Gradient */}
        <radialGradient id={ringGradId} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="90%" stopColor="#1e293b" />
          <stop offset="98%" stopColor="#334155" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>

        {/* Violet Neon Glow (Left-to-top) */}
        <linearGradient id={neonVioletId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        {/* Cyan Neon Glow (Right-to-top) */}
        <linearGradient id={neonCyanId} x1="100%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0891b2" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>

        {/* Aperture Iris Metallic Sheen */}
        <radialGradient id={irisGradId} cx="50%" cy="50%" r="48%">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="60%" stopColor="#0b0f19" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>

        {/* 3D "Y" Left Arm Facet Gradient */}
        <linearGradient id={yFacetLeftId} x1="20%" y1="20%" x2="50%" y2="55%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="80%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* 3D "Y" Right Arm Facet Gradient */}
        <linearGradient id={yFacetRightId} x1="80%" y1="20%" x2="50%" y2="55%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* 3D "Y" Center Stem Gradient */}
        <linearGradient id={yFacetStemId} x1="45%" y1="50%" x2="55%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="40%" stopColor="#64748b" />
          <stop offset="85%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
      </defs>

      {/* 1. Outer Dark Lens Housing */}
      <circle cx="50" cy="50" r="47" fill={`url(#${ringGradId})`} stroke="#334155" strokeWidth="1.2" />

      {/* 2. Precision Knurling & Optical Calibrations */}
      <circle cx="50" cy="50" r="43" stroke="#475569" strokeWidth="0.8" strokeDasharray="1.5 3.5" opacity="0.75" />
      <circle cx="50" cy="50" r="40" fill={`url(#${irisGradId})`} stroke="#1e293b" strokeWidth="1.5" />

      {/* 3. Cinema Aperture Blades */}
      <g opacity="0.35" stroke="#64748b" strokeWidth="0.75">
        <line x1="50" y1="10" x2="35" y2="40" />
        <line x1="85" y1="32" x2="58" y2="48" />
        <line x1="80" y1="75" x2="52" y2="58" />
        <line x1="38" y1="88" x2="42" y2="55" />
        <line x1="15" y1="62" x2="40" y2="48" />
        <line x1="22" y1="25" x2="46" y2="38" />
      </g>

      {/* 4. Left Neon Violet Glowing Arc Rim */}
      <path
        d="M 50 4 A 46 46 0 0 0 50 96"
        stroke={`url(#${neonVioletId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        filter={`url(#${outerGlowId})`}
      />

      {/* 5. Right Neon Cyan Glowing Arc Rim */}
      <path
        d="M 50 4 A 46 46 0 0 1 50 96"
        stroke={`url(#${neonCyanId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
        filter={`url(#${outerGlowId})`}
      />

      {/* 6. Geometric Beveled 3D "Y" */}
      <g filter={`url(#${outerGlowId})`}>
        {/* Left Arm Beveled Polygon */}
        <polygon
          points="24,24 38,24 50,47 43,53 24,24"
          fill={`url(#${yFacetLeftId})`}
          stroke="#a855f7"
          strokeWidth="0.8"
        />

        {/* Right Arm Beveled Polygon */}
        <polygon
          points="76,24 62,24 50,47 57,53 76,24"
          fill={`url(#${yFacetRightId})`}
          stroke="#06b6d4"
          strokeWidth="0.8"
        />

        {/* Center Chiseled Spine */}
        <polygon
          points="43,51 57,51 57,78 43,78"
          fill={`url(#${yFacetStemId})`}
          stroke="#64748b"
          strokeWidth="0.6"
        />

        {/* Diamond Base Wedge */}
        <polygon
          points="43,78 50,84 57,78 50,75"
          fill="#38bdf8"
          opacity="0.9"
        />

        {/* Specular Highlight Ridges */}
        <line x1="24" y1="24" x2="43" y2="52" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
        <line x1="76" y1="24" x2="57" y2="52" stroke="#67e8f9" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
        <line x1="50" y1="47" x2="50" y2="84" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.75" />
      </g>
    </svg>
  );
}
