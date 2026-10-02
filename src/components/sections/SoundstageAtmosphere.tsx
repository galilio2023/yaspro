"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { studioSprings } from "@/lib/studio-motion";
import { motion } from "framer-motion";

interface SoundstageAtmosphereProps {
  className?: string;
  isArabic?: boolean;
}

export function SoundstageAtmosphere({ className = "", isArabic: _isArabic = false }: SoundstageAtmosphereProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`absolute inset-0 overflow-hidden select-none pointer-events-none ${className}`}
    >
      {/* 1. High-Resolution Soundstage Background Plate */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/branding/yaspro-hero-bg.jpg"
          alt="Yas Pro Virtual Soundstage"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 brightness-75 contrast-125 saturate-90 scale-105"
        />
      </div>

      {/* 2. Interactive Directional Tungsten Keylight (3200K) tracking mouse gently */}
      <motion.div
        className="absolute w-[600px] sm:w-[900px] h-[500px] sm:h-[700px] rounded-full blur-[140px] pointer-events-none opacity-25"
        animate={{
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
        transition={studioSprings.cinematic}
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(217,119,6,0.2) 40%, transparent 75%)",
        }}
      />

      {/* 3. Deep Studio Obsidian Vignette Gradients */}
      {/* Top fade from black */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#070709] via-[#070709]/80 to-transparent z-10" />

      {/* Bottom fade into background */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#070709] via-[#070709]/95 to-transparent z-10" />

      {/* Left and right soft edge curtains */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#070709]/90 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#070709]/90 to-transparent z-10" />

      {/* 4. Overhead Studio Lighting Grid Lines (Film Rigging) */}
      <div
        className="absolute inset-x-0 top-0 h-72 opacity-15 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

    </div>
  );
}
