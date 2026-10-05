"use client";

import React, { useEffect, useRef } from "react";

interface OrbitItem {
  id: string;
  name: string;
  angle: number; // degrees
  neonShadow: string;
  neonGlow: string;
  icon: React.ReactNode;
}

const ORBIT_ITEMS: OrbitItem[] = [
  {
    id: "snapchat",
    name: "Snapchat",
    angle: 0,
    // Cyber Yellow Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(255,252,0,0.9),0_0_28px_rgba(255,252,0,0.65),0_0_50px_rgba(251,191,36,0.4)] group-hover:shadow-[0_0_18px_rgba(255,252,0,1),0_0_42px_rgba(255,252,0,0.85),0_0_70px_rgba(251,191,36,0.6)]",
    neonGlow: "bg-amber-300/60 group-hover:bg-amber-300/90",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#FFFC00" />
        <g transform="translate(8, 8)">
          <path
            d="M12.001 2c-3.15 0-5.74 2.1-5.74 5.38 0 1.2.35 2.37.93 3.32-.23.1-.73.3-1.42.23-.33-.03-.5.15-.54.34-.05.21.08.43.34.58.53.31 1.25.43 1.95.42.06.33.19.82.52 1.34-1.25.32-2.73 1.09-2.95 2.36-.08.43.2.77.62.88.94.24 2.21-.13 3.4-.64.49.52 1.22.95 2.15 1.09-.13.31-.38.74-.95 1.05-.33.18-.32.41-.21.57.14.2.43.28.84.18 1.13-.27 2.15-1.07 2.6-1.57.45.5 1.47 1.3 2.6 1.57.41.1.7-.02.84-.18.11-.16.12-.39-.21-.57-.57-.31-.82-.74-.95-1.05.93-.14 1.66-.57 2.15-1.09 1.19.51 2.46.88 3.4.64.42-.11.7-.45.62-.88-.22-1.27-1.7-2.04-2.95-2.36.33-.52.46-1.01.52-1.34.7.01 1.42-.11 1.95-.42.26-.15.39-.37.34-.58-.04-.19-.21-.37-.54-.34-.69.07-1.19-.13-1.42-.23.58-.95.93-2.12.93-3.32C17.741 4.1 15.151 2 12.001 2z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1.2"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "smart-camera",
    name: "Smart Cinema Camera",
    angle: 45,
    // Electric Sky Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(56,189,248,0.95),0_0_28px_rgba(14,165,233,0.7),0_0_50px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_18px_rgba(56,189,248,1),0_0_42px_rgba(14,165,233,0.9),0_0_70px_rgba(99,102,241,0.6)]",
    neonGlow: "bg-sky-400/60 group-hover:bg-sky-400/90",
    icon: (
      <svg viewBox="0 0 48 48" className="size-full">
        <defs>
          <linearGradient id="cam-stage-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="45%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#cam-stage-bg)" />
        {/* Top Handle / NATO Rail */}
        <path
          d="M21 16 V12 C21 11 22 11 23 11 H28 C29 11 30 11 30 12 V16"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Top EVF / Production Monitor */}
        <rect x="22.5" y="7.5" width="8" height="5" rx="1" fill="#030712" stroke="#38bdf8" strokeWidth="0.8" />
        <path
          d="M24 10 H25.5 L26 8.8 L27 11.2 L27.6 10 H29.5"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="0.7"
          strokeLinecap="round"
        />
        {/* Rear V-Mount Battery Pack */}
        <rect x="33" y="19" width="3.5" height="12" rx="1" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
        <line x1="34" y1="22" x2="34" y2="28" stroke="#64748b" strokeWidth="0.7" />
        {/* Camera Brain / Magnesium Alloy Body */}
        <rect x="19" y="16" width="14" height="16" rx="2.5" fill="#090d16" stroke="#64748b" strokeWidth="0.9" />
        {/* Side Vents & Controls */}
        <line x1="22" y1="25" x2="30" y2="25" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="27.5" x2="30" y2="27.5" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
        {/* Gold PL Mount Ring */}
        <rect x="17" y="19" width="2.2" height="10" rx="0.5" fill="#f59e0b" />
        {/* Cine Lens Barrel */}
        <rect x="13" y="20" width="4" height="8" rx="0.6" fill="#1e293b" stroke="#94a3b8" strokeWidth="0.7" />
        <line x1="15" y1="20" x2="15" y2="28" stroke="#cbd5e1" strokeWidth="0.6" />
        {/* Carbon Fiber Matte Box Sunshade */}
        <path d="M13 18 L6.5 14.5 V33.5 L13 30 Z" fill="#030712" stroke="#475569" strokeWidth="0.9" />
        {/* Anamorphic Front Lens Element / Blue Glass Flare Reflection */}
        <ellipse cx="6.5" cy="24" rx="1.6" ry="6.5" fill="#0284c7" fillOpacity="0.85" />
        <ellipse cx="6.5" cy="24" rx="0.8" ry="3.8" fill="#38bdf8" />
        {/* Live Red Tally REC Light */}
        <circle cx="30.5" cy="18.5" r="1.5" fill="#ef4444" />
        <circle cx="30.5" cy="18.5" r="3" fill="#ef4444" fillOpacity="0.45" />
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    angle: 90,
    // Radiant Magenta / Pink Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(236,72,153,0.95),0_0_28px_rgba(225,48,108,0.7),0_0_50px_rgba(217,70,239,0.45)] group-hover:shadow-[0_0_18px_rgba(236,72,153,1),0_0_42px_rgba(225,48,108,0.9),0_0_70px_rgba(217,70,239,0.65)]",
    neonGlow: "bg-pink-500/60 group-hover:bg-pink-500/90",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full">
        <defs>
          <radialGradient id="ig-full-bg" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="10%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#ig-full-bg)" />
        <g transform="translate(10, 10)">
          <rect
            x="1.5"
            y="1.5"
            width="17"
            height="17"
            rx="4.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
          />
          <circle cx="10" cy="10" r="4.2" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
          <circle cx="14.6" cy="5.4" r="1.3" fill="#FFFFFF" />
        </g>
      </svg>
    ),
  },
  {
    id: "studio-mic",
    name: "Broadcast Studio Microphone",
    angle: 135,
    // Hot Rose / Crimson Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(244,63,94,0.95),0_0_28px_rgba(225,29,72,0.7),0_0_50px_rgba(244,63,94,0.4)] group-hover:shadow-[0_0_18px_rgba(244,63,94,1),0_0_42px_rgba(225,29,72,0.9),0_0_70px_rgba(244,63,94,0.6)]",
    neonGlow: "bg-rose-500/60 group-hover:bg-rose-500/90",
    icon: (
      <svg viewBox="0 0 48 48" className="size-full">
        <defs>
          <linearGradient id="mic-stage-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#881337" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#mic-stage-bg)" />
        {/* Broadcast Spider Shockmount Suspension Rings */}
        <circle cx="24" cy="23.5" r="15" fill="none" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="24" cy="23.5" r="13" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="3 3" />
        {/* Elastic Tension Bands */}
        <line x1="12" y1="17.5" x2="19" y2="21.5" stroke="#cbd5e1" strokeWidth="0.9" />
        <line x1="12" y1="29.5" x2="19" y2="25.5" stroke="#cbd5e1" strokeWidth="0.9" />
        <line x1="36" y1="17.5" x2="29" y2="21.5" stroke="#cbd5e1" strokeWidth="0.9" />
        <line x1="36" y1="29.5" x2="29" y2="25.5" stroke="#cbd5e1" strokeWidth="0.9" />
        {/* Studio Microphone Lower Metal Body */}
        <rect x="20.5" y="22" width="7" height="11" rx="1.2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.7" />
        {/* Gold Diamond Polar Badge */}
        <polygon points="24,25.5 25.6,27.5 24,29.5 22.4,27.5" fill="#f59e0b" />
        {/* Dual-Mesh Capsule Grille (Upper Dome) */}
        <path
          d="M20.5 22 V14 C20.5 10.8 27.5 10.8 27.5 14 V22 Z"
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth="0.9"
        />
        {/* Internal Gold Condenser Diaphragm Reflection */}
        <circle cx="24" cy="16.5" r="2.4" fill="#f59e0b" fillOpacity="0.8" />
        {/* Fine Acoustic Ribs */}
        <line x1="20.5" y1="16.5" x2="27.5" y2="16.5" stroke="#94a3b8" strokeWidth="0.7" />
        <line x1="20.5" y1="19.2" x2="27.5" y2="19.2" stroke="#94a3b8" strokeWidth="0.7" />
        <line x1="24" y1="11.5" x2="24" y2="22" stroke="#94a3b8" strokeWidth="0.7" />
        {/* Swivel Mount & XLR Base */}
        <rect x="22" y="33" width="4" height="4" rx="0.6" fill="#334155" />
        <path d="M24 37 V42 H19.5" fill="none" stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="38" r="1.5" fill="#f59e0b" />
        {/* Live ON-AIR Tally Beacon */}
        <circle cx="24" cy="7.2" r="1.3" fill="#ef4444" />
        <circle cx="24" cy="7.2" r="2.8" fill="#ef4444" fillOpacity="0.45" />
        {/* Lateral Soundwave Telemetry */}
        <path d="M13.5 17.5 C11.5 21 11.5 26 13.5 29.5" fill="none" stroke="#fda4af" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <path d="M34.5 17.5 C36.5 21 36.5 26 34.5 29.5" fill="none" stroke="#fda4af" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    name: "TikTok",
    angle: 180,
    // Electric Cyber Cyan Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(6,182,212,0.95),0_0_28px_rgba(34,211,238,0.7),0_0_50px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_18px_rgba(6,182,212,1),0_0_42px_rgba(34,211,238,0.9),0_0_70px_rgba(6,182,212,0.6)]",
    neonGlow: "bg-cyan-400/60 group-hover:bg-cyan-400/90",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full">
        <defs>
          <linearGradient id="tiktok-full-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#tiktok-full-bg)" />
        <g transform="translate(11, 9)">
          <path
            d="M14.59 5.69a4.83 4.83 0 0 1-3.77-4.25V1h-2.5v11.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V7.36a6.34 6.34 0 0 0-.86-.06A6.33 6.33 0 0 0 0 13.63a6.34 6.34 0 0 0 9.27 5.57 6.27 6.27 0 0 0 3.41-5.57V7.75a8.16 8.16 0 0 0 4.77 1.52v-2.7a4.85 4.85 0 0 1-2.86-.88z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    angle: 225,
    // Brilliant Laser Red Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(255,0,0,0.95),0_0_28px_rgba(239,68,68,0.7),0_0_50px_rgba(255,0,0,0.45)] group-hover:shadow-[0_0_18px_rgba(255,0,0,1),0_0_42px_rgba(239,68,68,0.95),0_0_70px_rgba(255,0,0,0.65)]",
    neonGlow: "bg-red-500/60 group-hover:bg-red-500/90",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full">
        <circle cx="20" cy="20" r="20" fill="#FF0000" />
        <g transform="translate(10, 10)">
          <path
            d="M19.5 4.8a2.5 2.5 0 0 0-1.8-1.8C16.1 2.5 10 2.5 10 2.5s-6.1 0-7.7.5a2.5 2.5 0 0 0-1.8 1.8C0 6.4 0 10 0 10s0 3.6.5 5.2a2.5 2.5 0 0 0 1.8 1.8c1.6.5 7.7.5 7.7.5s6.1 0 7.7-.5a2.5 2.5 0 0 0 1.8-1.8c.5-1.6.5-5.2.5-5.2s0-3.6-.5-5.2z"
            fill="#CC0000"
            opacity="0.3"
          />
          <path d="M8 14.5l5.5-4.5L8 5.5z" fill="#FFFFFF" />
        </g>
      </svg>
    ),
  },
  {
    id: "neural-ai",
    name: "Neural AI",
    angle: 270,
    // Cosmic Ultraviolet / Violet Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(168,85,247,0.95),0_0_28px_rgba(147,51,234,0.7),0_0_50px_rgba(168,85,247,0.45)] group-hover:shadow-[0_0_18px_rgba(168,85,247,1),0_0_42px_rgba(147,51,234,0.9),0_0_70px_rgba(168,85,247,0.65)]",
    neonGlow: "bg-purple-500/60 group-hover:bg-purple-500/90",
    icon: (
      <svg viewBox="0 0 40 40" className="size-full">
        <defs>
          <linearGradient id="ai-full-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#ai-full-bg)" />
        <g transform="translate(8, 8)">
          <path
            fill="#FFFFFF"
            d="m12 2 2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
          />
          <path
            fill="#FFFFFF"
            opacity="0.9"
            d="m19 16 1.2 3.6L24 21l-3.8 1.4L19 26l-1.2-3.6L14 21l3.8-1.4L19 16z"
            transform="scale(0.5) translate(14, 2)"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "broadcast",
    name: "Live Satellite",
    angle: 315,
    // Radioactive Emerald / Mint Neon
    neonShadow:
      "shadow-[0_0_12px_rgba(16,185,129,0.95),0_0_28px_rgba(52,211,153,0.7),0_0_50px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_18px_rgba(16,185,129,1),0_0_42px_rgba(52,211,153,0.9),0_0_70px_rgba(16,185,129,0.6)]",
    neonGlow: "bg-emerald-400/60 group-hover:bg-emerald-400/90",
    icon: (
      <div className="relative size-full">
        <svg viewBox="0 0 40 40" className="size-full">
          <defs>
            <linearGradient id="sat-full-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#sat-full-bg)" />
          <g transform="translate(10, 10)">
            <path
              d="M12 5l-3-3-3 3 3 3"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M15 8l3 3-3 3-3-3"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M7 9l3 3 5-5-3-3Z"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#FFFFFF"
              fillOpacity="0.3"
            />
            <path d="M14 6l2-2" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M8 17a5 5 0 0 0-5-5"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
        {/* Pulsing signal telemetry dot */}
        <span className="absolute top-1 right-1 flex h-2 w-2 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200" />
        </span>
      </div>
    ),
  },
];

const REVOLUTION_DURATION_MS = 28000; // 28s per full 360 rotation
const CELESTIAL_TILT_DEG = -14;       // Saturn-style diagonal tilt around the head

export function HeroMediaOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const dimsRef = useRef<{ w: number; h: number }>({ w: 380, h: 506 });
  const staticRenderRef = useRef<() => void>(() => {});

  // Responsive dimension tracker
  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const measure = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        dimsRef.current = { w: rect.width, h: rect.height };
        staticRenderRef.current();
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // 60/120fps direct GPU animation loop (Zero React re-renders)
  useEffect(() => {
    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animId: number | undefined;
    let lastTime = performance.now();
    let progress = 0; // 0..1

    const tiltRad = (CELESTIAL_TILT_DEG * Math.PI) / 180;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);

    const render = () => {
      const { w, h } = dimsRef.current;
      const cx = w / 2;
      const cy = h * 0.29; // Anchored directly at the filmmaker's head / VR headset
      const rx = Math.min(w * 0.58, 225);
      const ry = rx * 0.34; // 3D foreshortened vertical radius

      const nodes = containerRef.current?.querySelectorAll<HTMLElement>("[data-orbit-node]");
      if (nodes && nodes.length > 0) {
        nodes.forEach((el) => {
          const angleDeg = parseFloat(el.dataset.angle || "0");
          const baseRad = (angleDeg * Math.PI) / 180;
          const currentAngle = baseRad + progress * Math.PI * 2;

          // Elliptical position before tilt
          const px = rx * Math.cos(currentAngle);
          const py = ry * Math.sin(currentAngle);

          // Apply celestial diagonal tilt
          const x = px * cosTilt - py * sinTilt;
          const y = px * sinTilt + py * cosTilt;

          // Depth calculation: sin(currentAngle) < 0 is top (behind head), > 0 is bottom (front of head)
          const sinVal = Math.sin(currentAngle);
          const isBehind = sinVal < 0;
          const depthNorm = (sinVal + 1) / 2; // 0 (furthest back) to 1 (closest front)

          const scale = 0.72 + depthNorm * 0.45;
          const opacity = 0.52 + depthNorm * 0.48;

          el.style.transform = `translate3d(${cx + x}px, ${cy + y}px, 0) translate(-50%, -50%) scale(${scale})`;
          el.style.zIndex = isBehind ? "5" : "25";
          el.style.opacity = String(opacity);
        });
      }
    };

    const loop = (currentTime: number) => {
      if (!reduceMotion) {
        const delta = currentTime - lastTime;
        lastTime = currentTime;

        const speed = isHoveredRef.current ? 0.2 : 1.0;
        progress = (progress + (delta / REVOLUTION_DURATION_MS) * speed) % 1;
      }

      render();

      if (!reduceMotion) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (reduceMotion) {
      staticRenderRef.current = render;
      render();
    } else {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      staticRenderRef.current = () => {};
      if (animId !== undefined) {
        cancelAnimationFrame(animId);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-visible select-none"
    >
      {/* ── Orbiting Nodes (Borderless with Custom Multi-Tier Neon Shadow & Ambient Glow) ── */}
      {ORBIT_ITEMS.map((item) => (
        <div
          key={item.id}
          data-orbit-node="true"
          data-angle={item.angle}
          className="absolute left-0 top-0 will-change-transform pointer-events-auto group"
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
          }}
        >
          {/* Layer 1: Ambient Neon Back-Glow Aura */}
          <div
            className={`absolute -inset-1 sm:-inset-1.5 rounded-full ${item.neonGlow} blur-md opacity-60 group-hover:opacity-100 transition-all duration-300 pointer-events-none`}
          />

          {/* Layer 2: Borderless Sphere with Multi-Tier Direct Neon Shadow */}
          <div
            title={item.name}
            className={`relative flex items-center justify-center size-10 sm:size-11 rounded-full overflow-hidden ${item.neonShadow} transition-transform duration-300 group-hover:scale-135 cursor-pointer`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HeroMediaOrbit;
