"use client";

import React from "react";
import { Activity, Sparkles } from "lucide-react";

interface PhonemeData {
  symbol: string;
  name: string;
  mouthOpen: number; // 0 to 1
  mouthWide: number; // 0 to 1
}

const PHONEMES: PhonemeData[] = [
  { symbol: "/aa/", name: "Open Vowel (Fatha)", mouthOpen: 0.85, mouthWide: 0.6 },
  { symbol: "/th/", name: "Dental Fricative (Dhad)", mouthOpen: 0.35, mouthWide: 0.8 },
  { symbol: "/q/", name: "Uvular Plosive (Qaf)", mouthOpen: 0.5, mouthWide: 0.5 },
  { symbol: "/m/", name: "Bilabial Nasal (Meem)", mouthOpen: 0.05, mouthWide: 0.4 },
  { symbol: "/ee/", name: "Close Front (Kasra)", mouthOpen: 0.3, mouthWide: 0.9 },
  { symbol: "/w/", name: "Labialized (Waw)", mouthOpen: 0.6, mouthWide: 0.2 },
];

interface LipSyncMeshVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0 to 100
  accuracy: string;
}

export function LipSyncMeshVisualizer({
  isPlaying,
  progress,
  accuracy,
}: LipSyncMeshVisualizerProps) {
  // Cycle through phonemes based on progress
  const activePhonemeIndex = isPlaying
    ? Math.floor((progress / 100) * PHONEMES.length * 4) % PHONEMES.length
    : 0;
  const currentPhoneme = PHONEMES[activePhonemeIndex];

  // SVG mouth geometry interpolation
  const baseOpen = isPlaying ? currentPhoneme.mouthOpen * 26 : 4;
  const baseWide = isPlaying ? currentPhoneme.mouthWide * 38 : 28;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-black/75 border border-white/10 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${isPlaying ? "bg-brand-teal animate-pulse" : "bg-white/30"}`} />
          <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
            Neural Viseme Tracker
          </span>
        </div>
        <span className="text-[10px] font-mono text-brand-teal-light bg-brand-teal/15 px-2 py-0.5 rounded border border-brand-teal/30">
          {accuracy}
        </span>
      </div>

      {/* Center Animated Mouth Mesh & Landmark Points */}
      <div className="relative aspect-[16/10] sm:aspect-video w-full rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center overflow-hidden my-1">
        {/* Facial Feature Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#a855f7 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* 3D Wireframe Silhouette SVG */}
        <svg viewBox="0 0 160 100" className="w-36 sm:w-44 h-auto">
          {/* Facial Landmark Target Crosshairs */}
          <circle cx="80" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <circle cx="45" cy="50" r="2" fill="#06b6d4" opacity="0.6" />
          <circle cx="115" cy="50" r="2" fill="#06b6d4" opacity="0.6" />
          <circle cx="80" cy="24" r="2" fill="#a855f7" opacity="0.6" />
          <circle cx="80" cy="76" r="2" fill="#a855f7" opacity="0.6" />

          {/* Dynamic Interpolated Lip Curves */}
          <path
            d={`M ${80 - baseWide} 50 Q 80 ${50 - baseOpen} ${80 + baseWide} 50 Q 80 ${50 + baseOpen} ${80 - baseWide} 50 Z`}
            fill={isPlaying ? "url(#lipGlow)" : "rgba(168,85,247,0.15)"}
            stroke={isPlaying ? "#06b6d4" : "rgba(255,255,255,0.3)"}
            strokeWidth="1.8"
            className="transition-all duration-75"
          />

          {/* Inner Lip Depth Shadow */}
          {isPlaying && (
            <ellipse
              cx="80"
              cy="50"
              rx={baseWide * 0.7}
              ry={baseOpen * 0.65}
              fill="#020617"
              stroke="#a855f7"
              strokeWidth="0.8"
              opacity="0.8"
              className="transition-all duration-75"
            />
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="lipGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Live Active Viseme Tag */}
        <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-brand-cyan border border-white/10 flex items-center gap-1">
          <Activity size={10} className="shrink-0" />
          <span>Viseme: {isPlaying ? currentPhoneme.symbol : "/idle/"}</span>
        </div>

        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-text-muted border border-white/10">
          {isPlaying ? currentPhoneme.name : "Ready"}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-secondary pt-2 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-brand-purple-light" />
          <span>ARKit 52 Blendshapes</span>
        </span>
        <span className="text-brand-cyan font-bold">120 FPS Sub-pixel</span>
      </div>
    </div>
  );
}
