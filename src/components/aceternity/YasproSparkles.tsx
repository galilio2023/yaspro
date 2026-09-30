"use client";

import React, { useId, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface YasproSparklesProps {
  id?: string;
  className?: string;
  background?: string;
  onZIndexChange?: (isForeground: boolean) => void;
}

// Vibrant brand colors
const PALETTE = [
  "#a78bfa", // Electric Violet
  "#c4b5fd", // Bright Violet
  "#06b6d4", // Aurora Teal / Cyan
  "#67e8f9", // Light Cyan
  "#f59e0b", // Cosmic Gold
  "#fcd34d", // Bright Gold
  "#ec4899", // Neon Pink / Magenta
  "#ffffff", // Sparkle White
];

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  hasTarget: boolean;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  pulsePhase: number;
}

export const YasproSparkles: React.FC<YasproSparklesProps> = ({
  id,
  className,
  background = "transparent",
  onZIndexChange,
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Mouse tracking for interactive drift
    const mouse = { x: -1000, y: -1000, active: false };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("touchend", handlePointerLeave, { passive: true });

    // Generate high-density, crystal-clear coordinates for "YASPRO"
    const sampleWordCoordinates = (
      w: number,
      h: number
    ): { x: number; y: number }[] => {
      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d", { willReadFrequently: true });
      if (!offCtx) return [];

      offCanvas.width = w;
      offCanvas.height = h;

      const cx = w / 2;
      const cy = h / 2;

      // Font size responsive: scale boldly
      const mainFontSize = Math.min(Math.max(w * 0.16, 68), 210);
      const subFontSize = Math.max(mainFontSize * 0.15, 14);

      // Render bold, heavy typography "YASPRO"
      offCtx.font = `900 ${mainFontSize}px "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillText("YASPRO", cx, cy - mainFontSize * 0.08);

      // Subtitle
      offCtx.font = `800 ${subFontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      offCtx.fillText("✦  A I   M E D I A   H U B  ✦", cx, cy + mainFontSize * 0.52);

      const imgData = offCtx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const points: { x: number; y: number }[] = [];

      // Very fine grid step (2px on desktop, 3px on mobile) to produce solid, readable letters
      const step = w < 768 ? 3 : 2.5;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (Math.floor(y) * w + Math.floor(x)) * 4;
          if (data[index + 3] > 80) {
            points.push({ x, y });
          }
        }
      }
      return points;
    };

    let wordTargets = sampleWordCoordinates(width, height);

    // Ensure we have enough particles to fill the word targets + ambient field
    const ambientCount = width < 768 ? 250 : 450;
    const totalCount = Math.max(wordTargets.length, 1200) + ambientCount;

    const particles: Particle[] = [];

    for (let i = 0; i < totalCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const baseAlpha = Math.random() * 0.5 + 0.45;
      const baseSize = Math.random() * 2.0 + 1.2;

      let targetX = x;
      let targetY = y;
      let hasTarget = false;

      if (i < wordTargets.length) {
        targetX = wordTargets[i].x;
        targetY = wordTargets[i].y;
        hasTarget = true;
      }

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        targetX,
        targetY,
        hasTarget,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: baseSize,
        baseSize,
        color,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.04 + 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
      wordTargets = sampleWordCoordinates(width, height);

      particles.forEach((p, idx) => {
        if (idx < wordTargets.length) {
          p.targetX = wordTargets[idx].x;
          p.targetY = wordTargets[idx].y;
          p.hasTarget = true;
        } else {
          p.hasTarget = false;
        }
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Animation cycle state machine:
    // 0 -> 2.5s   : Free ambient floating (background z-0)
    // 2.5s -> 4.0s : Particles converge rapidly to lock into "YASPRO" [1.5s assemble] (elevates to z-30)
    // 4.0s -> 10.5s: FULL SHOWCASE & PROMOTION HOLD [6.5 continuous seconds to breathe & shine] (foreground z-30)
    // 10.5s -> 12.0s: Gentle explosion & dispersion [1.5s disperse, drops back behind z-0]
    // 12.0s -> 14.5s: Settle back into ambient cosmic stars (total cycle: 14.5s)
    const CYCLE_DURATION = 14500;
    let startTime = performance.now();
    let currentIsForeground = false;

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      const elapsed = (now - startTime) % CYCLE_DURATION;

      let morphWeight = 0;
      let shouldBeForeground = false;

      if (elapsed < 2500) {
        // Phase 1: Ambient float (background z-0)
        morphWeight = 0;
        shouldBeForeground = false;
      } else if (elapsed >= 2500 && elapsed < 4000) {
        // Phase 2: Converging into YASPRO [1.5s] (bring to foreground z-30)
        const t = (elapsed - 2500) / 1500;
        morphWeight = 1 - Math.pow(1 - t, 3);
        shouldBeForeground = true;
      } else if (elapsed >= 4000 && elapsed < 10500) {
        // Phase 3: FULL PROMOTIONAL SHOWCASE [6.5 SECONDS HOLD]
        morphWeight = 1;
        shouldBeForeground = true;
      } else if (elapsed >= 10500 && elapsed < 12000) {
        // Phase 4: Dispersing back [1.5s]
        const t = (elapsed - 10500) / 1500;
        morphWeight = 1 - (t * t * (3 - 2 * t));
        // Drop foreground z-index after initial burst
        shouldBeForeground = t < 0.2;
      } else {
        morphWeight = 0;
        shouldBeForeground = false;
      }

      // Update z-index state if changed
      if (shouldBeForeground !== currentIsForeground) {
        currentIsForeground = shouldBeForeground;
        if (onZIndexChange) {
          onZIndexChange(shouldBeForeground);
        }
      }

      ctx.clearRect(0, 0, width, height);

      // Shimmer wave across text during showcase
      const waveX = ((elapsed - 4000) / 6500) * (width * 1.8) - width * 0.4;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.twinkleSpeed;

        // Ambient drift
        p.originX += p.vx;
        p.originY += p.vy;

        if (p.originX < 0) p.originX = width;
        if (p.originX > width) p.originX = 0;
        if (p.originY < 0) p.originY = height;
        if (p.originY > height) p.originY = 0;

        // Interpolated position
        let currentTargetX = p.originX;
        let currentTargetY = p.originY;

        if (p.hasTarget && morphWeight > 0.001) {
          currentTargetX = p.originX + (p.targetX - p.originX) * morphWeight;
          currentTargetY = p.originY + (p.targetY - p.originY) * morphWeight;
        }

        // Mouse repelling physics
        if (mouse.active) {
          const dx = currentTargetX - mouse.x;
          const dy = currentTargetY - mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 110;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 26;
            currentTargetX += (dx / dist) * force;
            currentTargetY += (dy / dist) * force;
          }
        }

        // Particle chasing physics
        const pursuitSpeed = morphWeight > 0.8 ? 0.35 : 0.18;
        p.x += (currentTargetX - p.x) * pursuitSpeed;
        p.y += (currentTargetY - p.y) * pursuitSpeed;

        // Dynamic size and glow
        let currentSize = p.baseSize + Math.sin(p.pulsePhase) * 0.4;
        let currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.2;

        // When locked into YASPRO, pump up visibility, thickness, and glow
        if (p.hasTarget && morphWeight > 0.3) {
          currentAlpha = Math.min(1, currentAlpha + 0.45 * morphWeight);
          currentSize = p.baseSize + 0.8 * morphWeight;

          // Shimmer energy wave
          if (morphWeight > 0.8) {
            const distToWave = Math.abs(p.x - waveX);
            if (distToWave < 140) {
              const waveBoost = 1 - distToWave / 140;
              currentSize += waveBoost * 1.8;
              currentAlpha = 1;
            }
          }
        }

        currentAlpha = Math.max(0.25, Math.min(1, currentAlpha));

        // Draw particle with glow
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        // Glowing halo when formed
        if (p.hasTarget && morphWeight > 0.5) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
        } else {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.7, currentSize), 0, Math.PI * 2);
        ctx.fill();

        // Star sparkle flare on key particles during hold
        if (currentSize > 2.6 && p.hasTarget && morphWeight > 0.85) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(p.x - currentSize * 2.5, p.y);
          ctx.lineTo(p.x + currentSize * 2.5, p.y);
          ctx.moveTo(p.x, p.y - currentSize * 2.5);
          ctx.lineTo(p.x, p.y + currentSize * 2.5);
          ctx.stroke();
        }

        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        startTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationFrameId);
      if (onZIndexChange) {
        onZIndexChange(false);
      }
    };
  }, [onZIndexChange]);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      style={{ background }}
    />
  );
};
