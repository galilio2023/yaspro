"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface YasproAnimatedLoaderProps {
  statusText?: string;
  size?: "default" | "compact" | "fullscreen";
  className?: string;
}

const TELEMETRY_STAGES = [
  "INITIALIZING OPTICAL STREAM",
  "CALIBRATING 8K SOUNDSTAGE",
  "SYNCING DUBAI MEDIA HUB",
  "ENGAGING CINEMA SENSORS",
];

export function YasproAnimatedLoader({
  statusText,
  size = "fullscreen",
  className,
}: YasproAnimatedLoaderProps) {
  const [telemetryIndex, setTelemetryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_STAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const isFullscreen = size === "fullscreen";
  const isCompact = size === "compact";

  return (
    <div
      dir="ltr"
      style={{ direction: "ltr" }}
      className={cn(
        "flex flex-col items-center justify-center select-none font-sans",
        isFullscreen && "fixed inset-0 z-[9999] bg-[#070709]/92 backdrop-blur-xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading Yas Pro AI Media Hub"
    >
      {/* Background ambient optical flare (cinematic 3200K tungsten glow) */}
      <div className="absolute pointer-events-none">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 blur-[90px] animate-pulse" />
      </div>

      {/* Main Animated Cinema Sensor SVG */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Calibration HUD Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute rounded-full border border-dashed border-amber-400/25 pointer-events-none",
            isCompact ? "w-20 h-20" : "w-36 h-36 sm:w-44 sm:h-44"
          )}
        />

        {/* Counter-rotating Precision Lens Markings Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className={cn(
            "absolute rounded-full border border-white/10 pointer-events-none",
            isCompact ? "w-24 h-24" : "w-44 h-44 sm:w-52 sm:h-52"
          )}
          style={{
            borderStyle: "dotted",
            borderWidth: "1.5px",
          }}
        />

        {/* Cinema Lens Mount SVG Container */}
        <svg
          viewBox="0 0 120 120"
          className={cn(
            "relative z-10 overflow-visible drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]",
            isCompact ? "w-16 h-16" : "w-28 h-28 sm:w-36 sm:h-36"
          )}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Luminous Bloom Filter */}
            <filter id="yas-loader-bloom" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Lens Housing Radial Gradient */}
            <radialGradient id="yas-loader-housing" cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor="#0b0c10" />
              <stop offset="85%" stopColor="#171822" />
              <stop offset="100%" stopColor="#070709" />
            </radialGradient>

            {/* Optical Sensor Core Radial Gradient */}
            <radialGradient id="yas-loader-sensor" cx="50%" cy="48%" r="48%">
              <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#b45309" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#07070a" />
            </radialGradient>

            {/* Titanium Specular Bezel Gradient */}
            <linearGradient id="yas-loader-silver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Polished 24K Gold Gradient */}
            <linearGradient id="yas-loader-gold" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="35%" stopColor="#fde047" />
              <stop offset="75%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* 1. Outer Knurled Precision Bezel */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="url(#yas-loader-housing)"
            stroke="url(#yas-loader-silver)"
            strokeWidth="1.8"
          />

          {/* 2. Optical Sensor Core */}
          <circle
            cx="60"
            cy="60"
            r="44"
            fill="url(#yas-loader-sensor)"
            stroke="rgba(245, 158, 11, 0.4)"
            strokeWidth="1.2"
          />

          {/* 3. Dynamic Rotating Aperture Blades */}
          <g transform="translate(60, 60)">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="-44"
                  x2="18"
                  y2="-12"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeOpacity="0.5"
                  transform={`rotate(${angle})`}
                />
              ))}
            </motion.g>
          </g>

          {/* 4. Pulsing Luminous Optical Ring */}
          <motion.circle
            cx="60"
            cy="60"
            r="48"
            stroke="url(#yas-loader-gold)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#yas-loader-bloom)"
            strokeDasharray="90 180"
            animate={{
              rotate: [0, 360],
              strokeDasharray: ["60 180", "140 180", "60 180"],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              strokeDasharray: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ transformOrigin: "60px 60px" }}
          />

          {/* 5. Chiseled 3D Yas Pro "Y" Emblem */}
          <g filter="url(#yas-loader-bloom)">
            {/* Left Titanium Arm */}
            <polygon
              points="34,32 50,32 60,56 53,64 34,32"
              fill="url(#yas-loader-silver)"
              stroke="#ffffff"
              strokeWidth="1"
            />

            {/* Right 24K Cinema Gold Arm */}
            <polygon
              points="86,32 70,32 60,56 67,64 86,32"
              fill="url(#yas-loader-gold)"
              stroke="#fef08a"
              strokeWidth="1"
            />

            {/* Center Vertical Spine */}
            <polygon
              points="53,61 67,61 67,88 53,88"
              fill="url(#yas-loader-silver)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* Optical Glint Star Center */}
            <motion.circle
              cx="60"
              cy="56"
              r="3"
              fill="#ffffff"
              animate={{
                scale: [1, 1.45, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </g>
        </svg>
      </div>

      {/* Brand Identity & Editorial Typography */}
      <div className="relative z-10 flex flex-col items-center mt-6 text-center">
        {/* Brand Name */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display drop-shadow">
            YAS
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-amber-400 font-display drop-shadow">
            PRO
          </span>
        </div>

        {/* Brand Tagline */}
        <div className="text-[10px] sm:text-xs font-mono tracking-[0.28em] text-zinc-300 uppercase mt-1">
          AI MEDIA HUB • DUBAI
        </div>

        {/* Dynamic Studio Telemetry HUD */}
        <div className="flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
          {/* Studio Recording Tally Light */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>

          <AnimatePresence mode="wait">
            <motion.span
              key={statusText || telemetryIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              className="text-[10.5px] font-mono tracking-wider text-amber-300/90 whitespace-nowrap"
            >
              {statusText ? statusText : TELEMETRY_STAGES[telemetryIndex]}
            </motion.span>
          </AnimatePresence>

          <span className="text-[9px] font-mono text-zinc-300">
            [8K RAW]
          </span>
        </div>
      </div>
    </div>
  );
}
