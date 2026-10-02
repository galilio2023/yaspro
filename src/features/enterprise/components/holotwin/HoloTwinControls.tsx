"use client";

import React from "react";
import { Sun, Moon, Camera, Sliders } from "lucide-react";
import { type LightingPreset } from "./HoloTwinViewport";

interface HoloTwinControlsProps {
  lighting: LightingPreset;
  onSelectLighting: (preset: LightingPreset) => void;
  focalLength: number;
  onChangeFocalLength: (val: number) => void;
  showWireframe: boolean;
  onToggleWireframe: () => void;
}

export function HoloTwinControls({
  lighting,
  onSelectLighting,
  focalLength,
  onChangeFocalLength,
  showWireframe,
  onToggleWireframe,
}: HoloTwinControlsProps) {
  return (
    <div className="p-3.5 sm:p-5 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
      {/* Lighting Temperature Switchers - Horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider hidden md:inline shrink-0 mr-1">
          Lighting:
        </span>
        <button
          type="button"
          onClick={() => onSelectLighting("golden_hour")}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
            lighting === "golden_hour"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 font-bold"
              : "bg-white/5 text-text-secondary hover:text-white"
          }`}
        >
          <Sun size={13} />
          <span>Golden Hour</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectLighting("high_noon")}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
            lighting === "high_noon"
              ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20 font-bold"
              : "bg-white/5 text-text-secondary hover:text-white"
          }`}
        >
          <Sun size={13} />
          <span>Noon 5600K</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectLighting("cyber_night")}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
            lighting === "cyber_night"
              ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold"
              : "bg-white/5 text-text-secondary hover:text-white"
          }`}
        >
          <Moon size={13} />
          <span>Cyber Night</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectLighting("blue_hour")}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
            lighting === "blue_hour"
              ? "bg-amber-600 text-zinc-950 shadow-md shadow-amber-600/30 font-bold"
              : "bg-white/5 text-text-secondary hover:text-white"
          }`}
        >
          <Moon size={13} />
          <span>Blue Hour</span>
        </button>
      </div>

      {/* Optics & Wireframe Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-text-secondary shrink-0" />
          <span className="text-xs font-mono text-text-secondary w-10 text-right">{focalLength}mm</span>
          <input
            type="range"
            min="18"
            max="85"
            step="5"
            value={focalLength}
            onChange={(e) => onChangeFocalLength(Number(e.target.value))}
            className="w-20 sm:w-24 accent-amber-500 cursor-pointer"
            title="Virtual Focal Length"
            aria-label="Virtual camera focal length in millimeters"
          />
        </div>

        <button
          type="button"
          onClick={onToggleWireframe}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            showWireframe
              ? "btn-brand text-zinc-950 font-bold"
              : "bg-white/5 text-text-secondary hover:text-white border border-white/10"
          }`}
        >
          <Sliders size={12} />
          <span>Nanite Wireframe</span>
        </button>
      </div>
    </div>
  );
}
