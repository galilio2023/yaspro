"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * GlobalAmbientGlow
 * High-contrast luxury studio aesthetic:
 * - Deep, pitch-black obsidian canvas (#040306 / #050507) as base.
 * - Suppressed on /admin dashboard routes to provide clean, crisp, unobstructed enterprise views.
 */
export function GlobalAmbientGlow() {
  const pathname = usePathname();

  // Completely eliminate ambient glow across all admin routes
  if (pathname && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#050408]"
    >
      {/* ── 1. ZONE: Top Hero / Header Crown (Separated Island) ── */}
      <div
        className="absolute -top-[8%] sm:-top-[10%] left-[4%] sm:left-[15%] w-[280px] sm:w-[480px] lg:w-[640px] h-[240px] sm:h-[400px] lg:h-[520px] rounded-full opacity-60 sm:opacity-55 lg:opacity-60 blur-[45px] sm:blur-[60px] lg:blur-[80px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.5) 0%, rgba(118, 80, 134, 0.28) 45%, rgba(84, 37, 104, 0.12) 65%, transparent 80%)",
        }}
      />

      {/* ── 2. ZONE: Far Right Rim Glow (Pushed Far Outward so Hero Persona Sits in Pitch-Black Void) ── */}
      <div
        className="absolute top-[4%] -right-[12%] sm:-right-[8%] lg:-right-[5%] w-[240px] sm:w-[380px] lg:w-[500px] h-[300px] sm:h-[450px] lg:h-[600px] rounded-full opacity-50 sm:opacity-45 lg:opacity-50 blur-[45px] sm:blur-[70px] lg:blur-[95px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(118, 80, 134, 0.45) 0%, rgba(84, 37, 104, 0.22) 50%, transparent 80%)",
        }}
      />

      {/* ── 2B. HERO VISUAL OBSIDIAN VOID MASK: Desktop-only void behind 2-column persona ── */}
      <div
        className="hidden lg:block absolute top-[2%] right-[6%] lg:right-[8%] w-[560px] lg:w-[620px] h-[580px] rounded-full pointer-events-none transform-gpu"
        style={{
          background:
            "radial-gradient(circle, #050408 0%, rgba(5, 4, 8, 0.95) 55%, transparent 85%)",
        }}
      />

      {/* ── 3. ZONE: Mid-Page Soundstages & Virtual Stages (Isolated Left Pool) ── */}
      <div
        className="absolute top-[38%] -left-[12%] sm:-left-[6%] lg:-left-[2%] w-[280px] sm:w-[480px] lg:w-[680px] h-[280px] sm:h-[480px] lg:h-[680px] rounded-full opacity-55 sm:opacity-50 lg:opacity-60 blur-[45px] sm:blur-[60px] lg:blur-[80px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(84, 37, 104, 0.55) 0%, rgba(118, 80, 134, 0.3) 45%, rgba(38, 14, 48, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 4. ZONE: Showcase & Portfolio Depth (Isolated Right Pool) ── */}
      <div
        className="absolute top-[65%] -right-[12%] sm:-right-[6%] lg:-right-[2%] w-[280px] sm:w-[500px] lg:w-[700px] h-[280px] sm:h-[500px] lg:h-[700px] rounded-full opacity-55 sm:opacity-50 lg:opacity-60 blur-[45px] sm:blur-[60px] lg:blur-[85px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.45) 0%, rgba(84, 37, 104, 0.4) 45%, rgba(62, 27, 76, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 5. ZONE: Bottom CTA & Footer Base (Isolated Grounding Core) ── */}
      <div
        className="absolute -bottom-[6%] left-[10%] sm:left-[20%] lg:left-[25%] w-[300px] sm:w-[520px] lg:w-[750px] h-[260px] sm:h-[380px] lg:h-[540px] rounded-full opacity-60 sm:opacity-55 lg:opacity-65 blur-[45px] sm:blur-[60px] lg:blur-[80px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(118, 80, 134, 0.5) 0%, rgba(84, 37, 104, 0.35) 45%, rgba(38, 14, 48, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── Deep Obsidian Contrast Mask: Darkens Interstitial Gaps for Clear Separation ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 50%, transparent 35%, rgba(4, 3, 6, 0.5) 65%, rgba(2, 2, 4, 0.85) 100%)",
        }}
      />

      {/* Subtle pitch-black directional separator ribbons between zones (scaled responsively) */}
      <div className="absolute top-[24%] inset-x-0 h-16 sm:h-28 lg:h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
      <div className="absolute top-[52%] inset-x-0 h-16 sm:h-28 lg:h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
      <div className="absolute top-[80%] inset-x-0 h-16 sm:h-28 lg:h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
    </div>
  );
}
