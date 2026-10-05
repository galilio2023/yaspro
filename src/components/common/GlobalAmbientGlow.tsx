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
        className="absolute -top-[10%] left-[8%] sm:left-[15%] w-[480px] sm:w-[640px] h-[400px] sm:h-[520px] rounded-full opacity-50 sm:opacity-60 blur-[60px] sm:blur-[80px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.45) 0%, rgba(118, 80, 134, 0.25) 45%, rgba(84, 37, 104, 0.1) 65%, transparent 80%)",
        }}
      />

      {/* ── 2. ZONE: Far Right Rim Glow (Pushed Far Outward so Hero Persona Sits in Pitch-Black Void) ── */}
      <div
        className="absolute top-[4%] -right-[18%] sm:-right-[8%] lg:-right-[5%] w-[380px] sm:w-[500px] h-[450px] sm:h-[600px] rounded-full opacity-40 sm:opacity-50 blur-[70px] sm:blur-[95px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(118, 80, 134, 0.4) 0%, rgba(84, 37, 104, 0.2) 50%, transparent 80%)",
        }}
      />

      {/* ── 2B. HERO VISUAL OBSIDIAN VOID MASK: Guarantees 100% pitch-black behind persona & tools ── */}
      <div
        className="absolute top-[2%] right-[2%] sm:right-[6%] lg:right-[8%] w-[420px] sm:w-[560px] lg:w-[620px] h-[480px] sm:h-[580px] rounded-full pointer-events-none transform-gpu"
        style={{
          background:
            "radial-gradient(circle, #050408 0%, rgba(5, 4, 8, 0.95) 55%, transparent 85%)",
        }}
      />

      {/* ── 3. ZONE: Mid-Page Soundstages & Virtual Stages (Isolated Left Pool) ── */}
      <div
        className="absolute top-[38%] -left-[10%] sm:-left-[2%] w-[480px] sm:w-[680px] h-[480px] sm:h-[680px] rounded-full opacity-50 sm:opacity-60 blur-[60px] sm:blur-[80px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(84, 37, 104, 0.55) 0%, rgba(118, 80, 134, 0.3) 45%, rgba(38, 14, 48, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 4. ZONE: Showcase & Portfolio Depth (Isolated Right Pool) ── */}
      <div
        className="absolute top-[65%] -right-[10%] sm:-right-[2%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full opacity-50 sm:opacity-60 blur-[60px] sm:blur-[85px] transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(152, 123, 165, 0.45) 0%, rgba(84, 37, 104, 0.4) 45%, rgba(62, 27, 76, 0.1) 70%, transparent 85%)",
        }}
      />

      {/* ── 5. ZONE: Bottom CTA & Footer Base (Isolated Grounding Core) ── */}
      <div
        className="absolute -bottom-[6%] left-[25%] w-[520px] sm:w-[750px] h-[380px] sm:h-[540px] rounded-full opacity-55 sm:opacity-65 blur-[60px] sm:blur-[80px] transform-gpu"
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
