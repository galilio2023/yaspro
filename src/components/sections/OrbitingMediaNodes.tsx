"use client";

import React, { useState } from "react";
import { Cpu, Sparkles, Activity } from "lucide-react";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { ORBIT_NODES, OrbitNodeConfig } from "./ecosystem.data";
import { cn } from "@/lib/utils";

const UNIQUE_RADII = [...new Set(ORBIT_NODES.map((n) => n.radius))];

export function OrbitingMediaNodes() {
  const [hoveredNode, setHoveredNode] = useState<OrbitNodeConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Yas Pro AI Ecosystem interactive telemetry diagram"
      className={cn(
        "relative flex h-[460px] sm:h-[520px] md:h-[560px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#080614] shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none group/orbit [transform:translateZ(0)]",
        !isVisible && "[&_*]:![animation-play-state:paused]"
      )}
    >
      {/* Background Volumetric Glow & Cosmic Nebulae */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[380px] rounded-full bg-brand-purple/20 blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[220px] rounded-full bg-brand-teal/15 blur-[60px]" />
      </div>

      {/* Sweeping Holographic Radar Sweep */}
      <div
        className="pointer-events-none absolute size-[460px] rounded-full opacity-25 animate-spin-around [animation-duration:14s]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(124,58,237,0) 0deg, rgba(6,182,212,0.18) 320deg, rgba(124,58,237,0.4) 360deg)",
        }}
      />

      {/* Top HUD Telemetry Banner */}
      <div className="absolute top-4 inset-x-6 flex items-center justify-between pointer-events-none z-30 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-text-muted border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-brand-cyan animate-ping" />
          <span className="text-white/80 font-bold">YAS NEURAL MESH v4.2</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            LIVE // 0.18ms LATENCY
          </span>
        </div>
      </div>

      {/* Bottom Interactive Telemetry Status Bar */}
      <div className="absolute bottom-4 inset-x-6 flex items-center justify-between pointer-events-none z-30 text-[10px] sm:text-[11px] font-mono border-t border-white/5 pt-2 text-text-muted">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-brand-purple-light" />
          <span className="text-text-secondary">
            {hoveredNode ? (
              <span className="text-white font-semibold">
                NODE LOCKED:{" "}
                <span className="text-brand-cyan">{hoveredNode.name}</span> —{" "}
                <span className="text-text-muted">{hoveredNode.subtitle}</span>
              </span>
            ) : (
              <span>AUTONOMOUS MEDIA ROUTING: 7 ACTIVE NODES</span>
            )}
          </span>
        </div>
        <span className="hidden sm:inline-block text-brand-purple-light/70">
          GCC BROADCAST MESH
        </span>
      </div>

      {/* Concentric Orbital Tracks & Tech Crosshairs */}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {/* Subtle Crosshairs */}
        <line
          x1="50%"
          y1="10%"
          x2="50%"
          y2="90%"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <line
          x1="10%"
          y1="50%"
          x2="90%"
          y2="50%"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Orbit Tracks */}
        {UNIQUE_RADII.map((r, idx) => (
          <g key={r}>
            {/* Primary Track Circle */}
            <circle
              className="stroke-white/10 stroke-1"
              cx="50%"
              cy="50%"
              r={r}
              fill="none"
              strokeDasharray={idx === 1 ? "6 6" : undefined}
            />
            {/* Subtle glow rim for active orbit */}
            <circle
              className="stroke-brand-purple/20 stroke-1 opacity-40"
              cx="50%"
              cy="50%"
              r={r + 1}
              fill="none"
            />
          </g>
        ))}
      </svg>

      {/* ── Center Nucleus: High-Tech "YAS AI" Media Engine ── */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        {/* Outer Tech Ring 1 (Dashed Clockwise) */}
        <div
          className="absolute size-36 sm:size-40 rounded-full border border-dashed border-brand-purple/40 animate-spin-around pointer-events-none"
          style={{ animationDuration: "24s" }}
        />

        {/* Outer Tech Ring 2 (Dotted Counter-Clockwise) */}
        <div
          className="absolute size-32 sm:size-36 rounded-full border border-dotted border-brand-cyan/40 animate-spin-around pointer-events-none"
          style={{ animationDuration: "16s", animationDirection: "reverse" }}
        />

        {/* Pulsing Quantum Energy Halo */}
        <div className="absolute size-24 sm:size-28 rounded-full bg-gradient-to-tr from-brand-purple/50 via-brand-cyan/30 to-brand-purple/60 blur-md animate-pulse pointer-events-none" />

        {/* Central Core Orb */}
        <div className="relative z-10 flex flex-col items-center justify-center size-24 sm:size-28 rounded-full border-2 border-brand-purple-light/50 bg-[#0d0b1a]/95 backdrop-blur-2xl shadow-[0_0_40px_rgba(124,58,237,0.7)] group-hover/orbit:shadow-[0_0_55px_rgba(6,182,212,0.8)] transition-all duration-500">
          <div className="relative flex items-center justify-center mb-1">
            <Cpu className="size-8 sm:size-9 text-brand-cyan animate-pulse drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]" />
            <Sparkles className="size-3 text-brand-purple-lighter absolute -top-1 -right-2 animate-bounce" />
          </div>

          <span className="text-xs sm:text-sm font-extrabold font-display text-white tracking-widest uppercase bg-gradient-to-r from-white via-brand-purple-lighter to-brand-cyan bg-clip-text text-transparent">
            Yas AI
          </span>

          <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-brand-purple-light/90 font-semibold">
            Neural Core
          </span>
        </div>
      </div>

      {/* ── Orbiting Media Nodes ── */}
      {ORBIT_NODES.map((node) => {
        const Icon = node.icon;
        const isHovered = hoveredNode?.id === node.id;

        return (
          <OrbitingCircles
            key={node.id}
            radius={node.radius}
            duration={node.duration}
            delay={node.delay}
            reverse={node.reverse}
            path={false}
          >
            <div
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="relative flex items-center justify-center cursor-pointer group/node"
            >
              {/* Outer Energy Pulse Ring */}
              <div
                className="absolute size-10 sm:size-12 rounded-full opacity-40 blur-xs transition-transform duration-300 group-hover/node:scale-130 group-hover/node:opacity-90"
                style={{ backgroundColor: node.glowColor }}
              />

              {/* Node Button Orb */}
              <div
                className={`relative flex size-9 sm:size-11 items-center justify-center rounded-full border border-white/20 bg-[#120f26]/95 backdrop-blur-md shadow-lg transition-all duration-300 group-hover/node:scale-125 group-hover/node:border-white/60 ${
                  isHovered ? "ring-2 ring-white/60 scale-125" : ""
                }`}
                style={{
                  boxShadow: `0 0 16px ${node.glowColor}40`,
                }}
              >
                <Icon className={`size-4 sm:size-5 ${node.colorClass}`} />
              </div>

              {/* Hover Holographic Tooltip */}
              <div className="pointer-events-none absolute left-1/2 bottom-full -translate-x-1/2 mb-3.5 opacity-0 group-hover/node:opacity-100 transition-all duration-200 z-50 whitespace-nowrap">
                <div className="px-3 py-1.5 rounded-xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-0.5">
                  <span className="text-[11px] font-bold text-white font-display">
                    {node.name}
                  </span>
                  <span className="text-[9px] font-mono text-text-muted">
                    {node.subtitle}
                  </span>
                </div>
              </div>
            </div>
          </OrbitingCircles>
        );
      })}
    </div>
  );
}
