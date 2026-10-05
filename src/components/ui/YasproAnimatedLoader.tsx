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

// 48 outer gear grip lines on the outer rim of the "O"
const O_OUTER_TEETH = Array.from({ length: 48 }, (_, i) => i * (360 / 48));

// 24 focal millimeter calibration lines across the body of the "O"
const O_FOCAL_LINES = Array.from({ length: 24 }, (_, i) => i * (360 / 24));

// 36 vernier calibration ticks along the inner rim of the "O"
const O_INNER_TICKS = Array.from({ length: 36 }, (_, i) => i * (360 / 36));

// 12 mechanical shutter door slat seams curved across the "O"
const O_SHUTTER_SLATS = Array.from({ length: 12 }, (_, i) => i * (360 / 12));

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
        isFullscreen && "fixed inset-0 z-[9999] bg-[#070709]/94 backdrop-blur-2xl",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading Yas Pro AI Media Hub"
    >
      {/* Background ambient anamorphic optical flare */}
      <div className="absolute pointer-events-none">
        <div className="w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-cyan-600/10 blur-[100px] animate-pulse motion-reduce:animate-none" />
        <div className="w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-amber-500/10 blur-[80px]" />
      </div>

      {/* Main Cinema Zoom Lens & Aperture Shutter "O" Container */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                scale: [1, 1.06, 0.98, 1],
              }
        }
        transition={{
          duration: 3.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* The Master "O" Itself — Hollow Center, Camera Zoom Rings & Shutter Door Lines */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]",
            isCompact ? "size-20" : "size-32 sm:size-44"
          )}
        >
          <svg
            viewBox="0 0 160 160"
            className="size-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Luminous Bloom Filter */}
              <filter id="yas-lens-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Cinema Titanium Lens Barrel Gradient */}
              <linearGradient id="yas-lens-barrel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#e2e8f0" />
                <stop offset="70%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Signature Accent Gold/Amber Gradient for the Triangle */}
              <linearGradient id="yas-o-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* ── TRACK A: Outer Knurled Grip Ring (Gear Teeth Lines on Outer Rim of the "O") ── */}
            <motion.g
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "80px 80px" }}
            >
              {/* Outer Edge Boundary of the "O" */}
              <circle
                cx="80"
                cy="80"
                r="66"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1"
              />

              {/* 48 Grip Teeth Lines etched along the outer rim of the "O" */}
              {O_OUTER_TEETH.map((deg, idx) => {
                const isMajor = idx % 4 === 0;
                return (
                  <line
                    key={`outer-tooth-${deg}`}
                    x1="80"
                    y1={isMajor ? "14" : "16"}
                    x2="80"
                    y2="20"
                    stroke={isMajor ? "#38bdf8" : "rgba(255, 255, 255, 0.4)"}
                    strokeWidth={isMajor ? "1.4" : "0.8"}
                    strokeLinecap="round"
                    transform={`rotate(${deg} 80 80)`}
                  />
                );
              })}
            </motion.g>

            {/* ── TRACK B: Inner Rim Vernier Calibration Ring (Scrolling on the Inner Edge of the "O") ── */}
            <motion.g
              animate={shouldReduceMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "80px 80px" }}
            >
              {/* Inner Edge Boundary of the "O" (Hollow Center Aperture Hole) */}
              <circle
                cx="80"
                cy="80"
                r="34"
                stroke="rgba(56, 189, 248, 0.6)"
                strokeWidth="1.2"
              />

              {/* 36 Fine Vernier Calibration Ticks carved on the inner rim of the "O" */}
              {O_INNER_TICKS.map((deg, idx) => {
                const isMajor = idx % 3 === 0;
                return (
                  <line
                    key={`inner-tick-${deg}`}
                    x1="80"
                    y1="46"
                    x2="80"
                    y2={isMajor ? "40" : "42"}
                    stroke={isMajor ? "#38bdf8" : "rgba(255, 255, 255, 0.35)"}
                    strokeWidth={isMajor ? "1.2" : "0.7"}
                    strokeLinecap="round"
                    transform={`rotate(${deg} 80 80)`}
                  />
                );
              })}
            </motion.g>

            {/* ── TRACK C: The Main "O" Body — Rotating Shutter Door & Focal Lines with Signature Gold Prism ── */}
            <motion.g
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "80px 80px" }}
            >
              {/* Concentric Circular Grooves Across The Surface of the "O" */}
              <circle
                cx="80"
                cy="80"
                r="60"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.8"
              />
              <circle
                cx="80"
                cy="80"
                r="50"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />
              <circle
                cx="80"
                cy="80"
                r="40"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="0.8"
              />

              {/* 12 Mechanical Shutter Door Slat Seams Curved Across The "O" Body */}
              {O_SHUTTER_SLATS.map((deg) => (
                <path
                  key={`shutter-slat-${deg}`}
                  d="M 80 14 C 92 24, 95 38, 80 46"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="0.9"
                  strokeOpacity="0.55"
                  transform={`rotate(${deg} 80 80)`}
                />
              ))}

              {/* 24 Focal Millimeter Calibration Lines Across The Entire Body of the "O" */}
              {O_FOCAL_LINES.map((deg, idx) => {
                const isPrime = idx % 3 === 0;
                return (
                  <line
                    key={`focal-line-${deg}`}
                    x1="80"
                    y1="18"
                    x2="80"
                    y2="42"
                    stroke={isPrime ? "#f59e0b" : "rgba(255, 255, 255, 0.45)"}
                    strokeWidth={isPrime ? "1.6" : "0.9"}
                    strokeLinecap="round"
                    transform={`rotate(${deg} 80 80)`}
                  />
                );
              })}

              {/* The Iconic Main "O" Body — Thick Luxury Ring with Angled Notch Gap */}
              <circle
                cx="80"
                cy="80"
                r="50"
                stroke="url(#yas-lens-barrel-grad)"
                strokeWidth="24"
                strokeLinecap="round"
                strokeDasharray="245 70"
                strokeDashoffset="18"
                filter="url(#yas-lens-glow)"
              />

              {/* Outer Precision Bevel Contour Line */}
              <circle
                cx="80"
                cy="80"
                r="62"
                stroke="rgba(255, 255, 255, 0.6)"
                strokeWidth="1"
                strokeDasharray="230 65"
                strokeDashoffset="16"
              />

              {/* Inner Precision Bevel Contour Line */}
              <circle
                cx="80"
                cy="80"
                r="38"
                stroke="rgba(255, 255, 255, 0.7)"
                strokeWidth="1"
                strokeDasharray="190 55"
                strokeDashoffset="12"
              />

              {/* The Signature Golden Triangle Prism Nestled at the Notch Gap */}
              <g filter="url(#yas-lens-glow)">
                <polygon
                  points="106,26 132,44 104,56"
                  fill="url(#yas-o-gold-grad)"
                  stroke="#fef08a"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                {/* Specular Inner Triangle Highlight */}
                <polygon
                  points="108,30 126,44 107,51"
                  fill="#ffffff"
                  opacity="0.5"
                />
              </g>
            </motion.g>
          </svg>
        </div>
      </motion.div>

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

export default YasproAnimatedLoader;
