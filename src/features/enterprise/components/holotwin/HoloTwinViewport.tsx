"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Crosshair, Sun, Moon } from "lucide-react";
import { DigitalTwinLocation } from "../../types";

export type LightingPreset = "golden_hour" | "high_noon" | "cyber_night" | "blue_hour";

interface HoloTwinViewportProps {
  selectedTwin: DigitalTwinLocation;
  lighting: LightingPreset;
  focalLength: number;
  showWireframe: boolean;
}

export function HoloTwinViewport({
  selectedTwin,
  lighting,
  focalLength,
  showWireframe,
}: HoloTwinViewportProps) {
  const getLightingStyle = () => {
    switch (lighting) {
      case "golden_hour":
        return "bg-gradient-to-t from-amber-600/30 via-orange-500/10 to-transparent mix-blend-color-dodge";
      case "high_noon":
        return "bg-gradient-to-b from-white/20 via-sky-300/10 to-transparent mix-blend-screen";
      case "cyber_night":
        return "bg-gradient-to-tr from-purple-900/40 via-cyan-900/20 to-transparent mix-blend-color-dodge";
      case "blue_hour":
        return "bg-gradient-to-t from-blue-900/40 via-indigo-950/20 to-transparent mix-blend-multiply";
    }
  };

  const getLightingKelvin = () => {
    switch (lighting) {
      case "golden_hour":
        return "3,200K Warm";
      case "high_noon":
        return "5,600K Daylight";
      case "cyber_night":
        return "7,800K Cyber";
      case "blue_hour":
        return "4,100K Twilight";
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9]">
      {/* Base Photorealistic 3D Environment Image */}
      <Image
        src={selectedTwin.image}
        alt={selectedTwin.name}
        fill
        className={`object-cover transition-transform duration-700 ${
          showWireframe ? "opacity-40 grayscale contrast-200" : "opacity-100"
        }`}
        sizes="(max-width: 1200px) 100vw, 1200px"
        priority
      />

      {/* Dynamic Real-Time Lighting Shader Layer */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${getLightingStyle()}`} />

      {/* Optional Nanite Wireframe Grid Overlay */}
      {showWireframe && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {/* Top Left Viewport HUD */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1 pointer-events-none max-w-[65%] sm:max-w-none">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-brand-purple/40 text-[10px] sm:text-xs font-mono text-brand-purple-light">
          <span className="size-1.5 sm:size-2 rounded-full bg-brand-purple-light animate-pulse shrink-0" />
          <span className="font-bold">UNREAL 5.4</span>
          <span className="text-white/40 hidden xs:inline">|</span>
          <span className="text-white/90 truncate hidden xs:inline">{selectedTwin.featuredPill}</span>
        </div>
        <div className="bg-black/75 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-white/10 text-[9px] sm:text-[11px] font-mono text-text-secondary w-fit">
          Poly: {selectedTwin.polyCount}
        </div>
      </div>

      {/* Top Right Live Telemetry */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 pointer-events-none">
        <div className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-500/40 text-[10px] sm:text-xs font-mono text-emerald-400 flex items-center gap-1 sm:gap-1.5">
          <CheckCircle2 size={12} className="shrink-0" />
          <span className="font-bold">120 FPS</span>
          <span className="text-white/40 hidden sm:inline">|</span>
          <span className="text-white/90 hidden sm:inline">1.8ms</span>
        </div>
      </div>

      {/* Bottom Left Crosshair & Optics */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 pointer-events-none">
        <div className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-white/10 text-[10px] sm:text-[11px] font-mono text-white/80 flex items-center gap-1.5 sm:gap-2">
          <Crosshair size={12} className="text-brand-gold shrink-0" />
          <span className="hidden sm:inline">ARRI Alexa 35</span>
          <span className="text-brand-cyan font-bold">{focalLength}mm</span>
        </div>
      </div>

      {/* Bottom Right Lighting Kelvin Display */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 pointer-events-none">
        <div className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/10 text-[10px] sm:text-xs font-mono text-white/90 flex items-center gap-1.5">
          {lighting === "golden_hour" || lighting === "high_noon" ? (
            <Sun size={12} className="text-amber-400 shrink-0" />
          ) : (
            <Moon size={12} className="text-brand-cyan shrink-0" />
          )}
          <span>{getLightingKelvin()}</span>
        </div>
      </div>
    </div>
  );
}
