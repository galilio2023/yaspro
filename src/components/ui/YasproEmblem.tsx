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
 * High-Contrast Studio Master Edition:
 * - Specular Platinum & Tungsten Gold outer precision knurled bezel
 * - Illuminated Cinema Sensor Core with radiant warm optical backlight
 * - High-luminance 3D chiseled "Y" with pure titanium specular left arm & 24K gold right arm
 * - High-contrast optical iris lines legible at 24px-120px scale
 */
export function YasproEmblem({
  className,
  size = 32,
  idPrefix = "yas-emblem",
}: YasproEmblemProps) {
  const outerGlowId = `${idPrefix}-outer-glow`;
  const ringGradId = `${idPrefix}-ring-grad`;
  const ringStrokeId = `${idPrefix}-ring-stroke`;
  const yFacetLeftId = `${idPrefix}-y-facet-left`;
  const yFacetRightId = `${idPrefix}-y-facet-right`;
  const yFacetStemId = `${idPrefix}-y-facet-stem`;
  const irisGradId = `${idPrefix}-iris-grad`;
  const amberRimId = `${idPrefix}-amber-rim`;
  const platinumRimId = `${idPrefix}-platinum-rim`;

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
        {/* Soft Specular Optical Bloom */}
        <filter id={outerGlowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Outer Lens Housing Gradient */}
        <radialGradient id={ringGradId} cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#12131a" />
          <stop offset="85%" stopColor="#1e202c" />
          <stop offset="96%" stopColor="#2e3244" />
          <stop offset="100%" stopColor="#0b0c10" />
        </radialGradient>

        {/* Outer High-Luminance Bezel Stroke */}
        <linearGradient id={ringStrokeId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
        </linearGradient>

        {/* Radiant Optical Core Glow (Sensor Illumination) */}
        <radialGradient id={irisGradId} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.85" />
          <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#b45309" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0b0b12" />
        </radialGradient>

        {/* Luminous Warm Tungsten Amber Arc */}
        <linearGradient id={amberRimId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>

        {/* Brilliant Platinum Specular Arc */}
        <linearGradient id={platinumRimId} x1="100%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* 3D "Y" Left Arm Facet (Brilliant Specular Titanium Silver) */}
        <linearGradient id={yFacetLeftId} x1="15%" y1="15%" x2="55%" y2="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* 3D "Y" Right Arm Facet (Polished 24K Cinema Gold) */}
        <linearGradient id={yFacetRightId} x1="85%" y1="15%" x2="45%" y2="60%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* 3D "Y" Center Stem Facet (High-Contrast Platinum Alloy) */}
        <linearGradient id={yFacetStemId} x1="45%" y1="50%" x2="55%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* 1. Outer Dark Lens Housing with High-Contrast Bezel */}
      <circle cx="50" cy="50" r="47" fill={`url(#${ringGradId})`} stroke={`url(#${ringStrokeId})`} strokeWidth="1.6" />

      {/* 2. Precision Optical Calibrations Ring */}
      <circle cx="50" cy="50" r="42.5" stroke="#cbd5e1" strokeWidth="0.9" strokeDasharray="2 3" opacity="0.8" />

      {/* 3. Luminous Optical Chamber (Sensor Glow) */}
      <circle cx="50" cy="50" r="39" fill={`url(#${irisGradId})`} stroke="#475569" strokeWidth="1.2" />

      {/* 4. Cinema Aperture Blades (Crisp Light Markings) */}
      <g opacity="0.55" stroke="#f1f5f9" strokeWidth="0.85">
        <line x1="50" y1="11" x2="35" y2="40" />
        <line x1="85" y1="32" x2="58" y2="48" />
        <line x1="80" y1="75" x2="52" y2="58" />
        <line x1="38" y1="88" x2="42" y2="55" />
        <line x1="15" y1="62" x2="40" y2="48" />
        <line x1="22" y1="25" x2="46" y2="38" />
      </g>

      {/* 5. Luminous Warm Tungsten Amber Arc Rim */}
      <path
        d="M 50 3 A 47 47 0 0 0 50 97"
        stroke={`url(#${amberRimId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        filter={`url(#${outerGlowId})`}
      />

      {/* 6. Brilliant Specular Platinum Arc Rim */}
      <path
        d="M 50 3 A 47 47 0 0 1 50 97"
        stroke={`url(#${platinumRimId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        filter={`url(#${outerGlowId})`}
      />

      {/* 7. High-Luminance 3D Geometric "Y" */}
      <g filter={`url(#${outerGlowId})`}>
        {/* Left Arm (Specular Titanium Silver) */}
        <polygon
          points="23,23 38,23 50,47 43,54 23,23"
          fill={`url(#${yFacetLeftId})`}
          stroke="#ffffff"
          strokeWidth="1.2"
        />

        {/* Right Arm (Polished 24K Cinema Gold) */}
        <polygon
          points="77,23 62,23 50,47 57,54 77,23"
          fill={`url(#${yFacetRightId})`}
          stroke="#fde047"
          strokeWidth="1.2"
        />

        {/* Center Chiseled Spine */}
        <polygon
          points="43,51 57,51 57,78 43,78"
          fill={`url(#${yFacetStemId})`}
          stroke="#ffffff"
          strokeWidth="0.8"
        />

        {/* Diamond Base Wedge (Brilliant Amber Gold) */}
        <polygon
          points="43,78 50,85 57,78 50,74"
          fill="#fbbf24"
          stroke="#ffffff"
          strokeWidth="0.8"
        />

        {/* High-Luminance Specular Ridges */}
        <line x1="23" y1="23" x2="43" y2="53" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="77" y1="23" x2="57" y2="53" stroke="#fffbeb" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="47" x2="50" y2="85" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" />

        {/* Center Optical Glint Star */}
        <circle cx="50" cy="47" r="2.2" fill="#ffffff" filter={`url(#${outerGlowId})`} />
      </g>
    </svg>
  );
}
