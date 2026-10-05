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

export function YasproAnimatedLoader({
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
        isFullscreen && "fixed inset-0 z-[9999] bg-[#070709]/92 backdrop-blur-xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading Yas Pro AI Media Hub"
    >
      {/* Background ambient optical flare (cinematic deep violet & mauve glow) */}
      <div className="absolute pointer-events-none">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-brand-violet/20 blur-[90px] animate-pulse motion-reduce:animate-none" />
      </div>

      {/* Main Animated Yas Pro "O" Circle Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Calibration HUD Ring */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 18, repeat: Infinity, ease: "linear" }
          }
          className={cn(
            "absolute rounded-full border border-dashed border-brand-mauve/30 pointer-events-none",
            isCompact ? "w-20 h-20" : "w-36 h-36 sm:w-44 sm:h-44"
          )}
        />

        {/* Counter-rotating Precision Lens Markings Ring */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { rotate: -360 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 24, repeat: Infinity, ease: "linear" }
          }
          className={cn(
            "absolute rounded-full border border-white/10 pointer-events-none",
            isCompact ? "w-24 h-24" : "w-44 h-44 sm:w-52 sm:h-52"
          )}
          style={{
            borderStyle: "dotted",
            borderWidth: "1.5px",
          }}
        />

        {/* The Iconic Animated Spinning "O" SVG with Signature Gold Triangle */}
        <motion.div
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: "linear" }
          }
          className={cn(
            "relative z-10 flex items-center justify-center filter drop-shadow-[0_0_28px_rgba(245,158,11,0.35)]",
            isCompact ? "size-18" : "size-28 sm:size-36"
          )}
        >
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Luminous Bloom Filter */}
              <filter id="yas-o-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Ring Gradient: Premium Studio White to Titanium Silver */}
              <linearGradient id="yas-o-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>

              {/* Signature Accent Gold/Amber Gradient for the Triangle */}
              <linearGradient id="yas-o-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Subtle Inner Optical Guide Ring */}
            <circle
              cx="60"
              cy="60"
              r="22"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />

            {/* The Main "O" Body — Thick Luxury Ring with Angled Notch Gap */}
            <circle
              cx="60"
              cy="60"
              r="36"
              stroke="url(#yas-o-ring-grad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="182 45"
              strokeDashoffset="12"
              filter="url(#yas-o-glow)"
            />

            {/* Inner Precision Bevel Contour */}
            <circle
              cx="60"
              cy="60"
              r="29"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
              strokeDasharray="150 40"
              strokeDashoffset="10"
            />

            {/* The Signature Golden Triangle Prism Nestled at the Top-Right Notch */}
            <g filter="url(#yas-o-glow)">
              <polygon
                points="77,20 98,34 76,43"
                fill="url(#yas-o-gold-grad)"
                stroke="#fef08a"
                strokeWidth="1"
                strokeLinejoin="round"
              />
              {/* Specular Inner Triangle Highlight */}
              <polygon
                points="78,23 94,34 78,39"
                fill="#ffffff"
                opacity="0.45"
              />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Brand Identity: Official Logo Image */}
      <div className="relative z-10 flex flex-col items-center mt-6 text-center">
        <div className="relative shrink-0 flex items-center justify-center">
          <span className="absolute -inset-2 rounded-2xl bg-brand-violet/20 blur-md pointer-events-none opacity-60" />
          <Image
            src="/images/group/yas-pro-media-group.png"
            alt="YAS PRO Media Group"
            width={isCompact ? 130 : 170}
            height={isCompact ? 46 : 60}
            priority
            className={cn(
              "relative z-10 w-auto object-contain filter brightness-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]",
              isCompact ? "h-8" : "h-10 sm:h-12"
            )}
          />
        </div>
      </div>
    </div>
  );
}
