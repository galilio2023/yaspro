"use client";

import React from "react";
import { Sparkles, Radio } from "lucide-react";

interface OrbitItem {
  id: string;
  name: string;
  angle: number;
  radius: number;
  duration: number;
  reverse?: boolean;
  borderClass: string;
  shadowClass: string;
  icon: React.ReactNode;
}

const ORBIT_ITEMS: OrbitItem[] = [
  {
    id: "snapchat",
    name: "Snapchat",
    angle: 0,
    radius: 195,
    duration: 30,
    borderClass: "border-amber-400/50",
    shadowClass: "shadow-[0_0_20px_rgba(251,191,36,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 fill-amber-400">
        <path d="M12.001 2c-3.15 0-5.74 2.1-5.74 5.38 0 1.2.35 2.37.93 3.32-.23.1-.73.3-1.42.23-.33-.03-.5.15-.54.34-.05.21.08.43.34.58.53.31 1.25.43 1.95.42.06.33.19.82.52 1.34-1.25.32-2.73 1.09-2.95 2.36-.08.43.2.77.62.88.94.24 2.21-.13 3.4-.64.49.52 1.22.95 2.15 1.09-.13.31-.38.74-.95 1.05-.33.18-.32.41-.21.57.14.2.43.28.84.18 1.13-.27 2.15-1.07 2.6-1.57.45.5 1.47 1.3 2.6 1.57.41.1.7-.02.84-.18.11-.16.12-.39-.21-.57-.57-.31-.82-.74-.95-1.05.93-.14 1.66-.57 2.15-1.09 1.19.51 2.46.88 3.4.64.42-.11.7-.45.62-.88-.22-1.27-1.7-2.04-2.95-2.36.33-.52.46-1.01.52-1.34.7.01 1.42-.11 1.95-.42.26-.15.39-.37.34-.58-.04-.19-.21-.37-.54-.34-.69.07-1.19-.13-1.42-.23.58-.95.93-2.12.93-3.32C17.741 4.1 15.151 2 12.001 2z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    name: "Instagram",
    angle: 60,
    radius: 195,
    duration: 30,
    borderClass: "border-pink-500/50",
    shadowClass: "shadow-[0_0_22px_rgba(236,72,153,0.55)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5">
        <defs>
          <linearGradient id="ig-grad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="5%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="90%" stopColor="#285AEB" />
          </linearGradient>
        </defs>
        <rect
          width="20"
          height="20"
          x="2"
          y="2"
          rx="5"
          ry="5"
          fill="none"
          stroke="url(#ig-grad)"
          strokeWidth="2.2"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="url(#ig-grad)"
          strokeWidth="2.2"
        />
        <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad)" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    name: "TikTok",
    angle: 120,
    radius: 195,
    duration: 30,
    borderClass: "border-cyan-400/50",
    shadowClass: "shadow-[0_0_20px_rgba(6,182,212,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 fill-cyan-400">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.36a6.34 6.34 0 0 0-.86-.06A6.33 6.33 0 0 0 3.1 15.63a6.34 6.34 0 0 0 9.27 5.57 6.27 6.27 0 0 0 3.41-5.57V8.75a8.16 8.16 0 0 0 4.77 1.52v-3.45a4.85 4.85 0 0 1-.96-.13z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    angle: 180,
    radius: 195,
    duration: 30,
    borderClass: "border-red-500/50",
    shadowClass: "shadow-[0_0_20px_rgba(239,68,68,0.5)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 fill-red-500">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "neural-ai",
    name: "Neural AI",
    angle: 240,
    radius: 195,
    duration: 30,
    borderClass: "border-purple-400/50",
    shadowClass: "shadow-[0_0_22px_rgba(168,85,247,0.55)]",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5">
        <defs>
          <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ai-grad)"
          d="m12 2 2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
        />
        <path
          fill="url(#ai-grad)"
          opacity="0.85"
          d="m19 16 1.2 3.6L24 21l-3.8 1.4L19 26l-1.2-3.6L14 21l3.8-1.4L19 16z"
          transform="scale(0.5) translate(14, 2)"
        />
      </svg>
    ),
  },
  {
    id: "broadcast",
    name: "Live Satellite",
    angle: 300,
    radius: 195,
    duration: 30,
    borderClass: "border-emerald-400/50",
    shadowClass: "shadow-[0_0_20px_rgba(16,185,129,0.5)]",
    icon: <Radio className="size-5 text-emerald-400" />,
  },
];

export function HeroMediaOrbit() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible select-none z-30"
    >
      {ORBIT_ITEMS.map((item) => (
        <div
          key={item.id}
          style={
            {
              "--duration": item.duration,
              "--radius": item.radius,
              "--angle": item.angle,
            } as React.CSSProperties
          }
          className="animate-orbit absolute flex items-center justify-center pointer-events-auto"
        >
          <div
            title={item.name}
            className={`flex items-center justify-center size-10 sm:size-11 rounded-full bg-zinc-950/90 backdrop-blur-md border ${item.borderClass} ${item.shadowClass} transition-transform duration-300 hover:scale-130 cursor-pointer`}
          >
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HeroMediaOrbit;
