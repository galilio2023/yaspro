import React from "react";

/**
 * GlobalAmbientGlow
 * High-contrast luxury studio aesthetic:
 * - Deep, pitch-black obsidian canvas (#040306 / #050507) as base.
 * - Distinct, isolated pools of vibrant violet and mauve light situated in separated spatial zones:
 *   1. Upper Hero / Brand Crown
 *   2. Floating Persona Backlight
 *   3. Mid-Page Virtual Studios Anchor (Left)
 *   4. Showcase & Masterpieces Anchor (Right)
 *   5. Grounding Base Core (Bottom CTA)
 * - Tighter radial falloffs + rich black interstitial gaps give clear separation instead of a continuous wash.
 */
export function GlobalAmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#050408]"
    >
      {/* ── 1. ZONE: Top Hero / Header Crown (Separated Island) ── */}
      <div
        className="absolute -top-[10%] left-[12%] sm:left-[22%] w-[520px] sm:w-[720px] h-[440px] sm:h-[580px] rounded-full opacity-60 sm:opacity-70 blur-[90px] sm:blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.55) 0%, rgba(118, 80, 134, 0.35) 45%, rgba(84, 37, 104, 0.15) 65%, transparent 80%)",
          willChange: "transform",
        }}
      />

      {/* ── 2. ZONE: Floating VR Persona Halo (Isolated Top-Right Glow) ── */}
      <div
        className="absolute top-[6%] -right-[6%] sm:right-[5%] w-[420px] sm:w-[560px] h-[420px] sm:h-[560px] rounded-full opacity-55 sm:opacity-65 blur-[85px] sm:blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(118, 80, 134, 0.5) 0%, rgba(84, 37, 104, 0.3) 45%, rgba(62, 27, 76, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 3. ZONE: Mid-Page Soundstages & Virtual Stages (Isolated Left Pool) ── */}
      <div
        className="absolute top-[38%] -left-[10%] sm:-left-[2%] w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full opacity-50 sm:opacity-60 blur-[100px] sm:blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(84, 37, 104, 0.55) 0%, rgba(118, 80, 134, 0.3) 45%, rgba(38, 14, 48, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 4. ZONE: Showcase & Portfolio Depth (Isolated Right Pool) ── */}
      <div
        className="absolute top-[65%] -right-[10%] sm:-right-[2%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full opacity-50 sm:opacity-60 blur-[105px] sm:blur-[135px]"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.45) 0%, rgba(84, 37, 104, 0.4) 45%, rgba(62, 27, 76, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 5. ZONE: Bottom CTA & Footer Base (Isolated Grounding Core) ── */}
      <div
        className="absolute -bottom-[6%] left-[25%] w-[520px] sm:w-[750px] h-[380px] sm:h-[540px] rounded-full opacity-55 sm:opacity-65 blur-[95px] sm:blur-[125px]"
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

      {/* Subtle pitch-black directional separator ribbons between zones */}
      <div className="absolute top-[24%] inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
      <div className="absolute top-[52%] inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
      <div className="absolute top-[80%] inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#050408]/60 to-transparent pointer-events-none" />
    </div>
  );
}
export default GlobalAmbientGlow;
