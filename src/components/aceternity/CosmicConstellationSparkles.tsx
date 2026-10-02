"use client";

import React, { useId, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CosmicConstellationSparklesProps {
  id?: string;
  className?: string;
}

// Warm cinema tungsten & amber studio palette
const PALETTE = [
  "245, 158, 11",   // Cinema Amber
  "251, 191, 36",   // Warm Gold
  "217, 119, 6",    // Tungsten Bronze
  "254, 243, 199",  // Warm Ivory
  "255, 255, 255",  // Specular White
];

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  camTargetX: number;
  camTargetY: number;
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

export const CosmicConstellationSparkles: React.FC<CosmicConstellationSparklesProps> = ({
  id,
  className,
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // Mouse drift with cached bounding rect to prevent synchronous layout reflows
    const mouse = { x: -1000, y: -1000, active: false };
    let cachedRect = canvas.getBoundingClientRect();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isVisible) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      mouse.x = clientX - cachedRect.left;
      mouse.y = clientY - cachedRect.top;
      mouse.active = true;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    if (!isTouch) {
      window.addEventListener("touchmove", handlePointerMove, { passive: true });
      window.addEventListener("touchend", handlePointerLeave, { passive: true });
    }

    // Refresh cached rectangle on scroll so coordinates remain accurate while visible
    const handleScroll = () => {
      if (isVisible) {
        cachedRect = canvas.getBoundingClientRect();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

    // Place the constellations prominently across the focal area
    const getConstellationCenter = (w: number, h: number) => {
      if (w >= 1024) {
        return { cx: w * 0.48, cy: h * 0.44, scale: Math.min(w * 0.50, h * 0.74, 490) };
      } else {
        return { cx: w * 0.50, cy: h * 0.38, scale: Math.min(w * 0.90, h * 0.56, 410) };
      }
    };

    // 1. Generate Cinema Camera Device Constellation
    const generateCameraPoints = (w: number, h: number): { x: number; y: number }[] => {
      const off = document.createElement("canvas");
      const oCtx = off.getContext("2d", { willReadFrequently: true });
      if (!oCtx) return [];
      off.width = w;
      off.height = h;

      const { cx, cy, scale } = getConstellationCenter(w, h);

      oCtx.strokeStyle = "#ffffff";
      oCtx.fillStyle = "#ffffff";
      oCtx.lineWidth = 5;
      oCtx.lineCap = "round";
      oCtx.lineJoin = "round";

      oCtx.save();
      oCtx.translate(cx, cy);

      const s = scale / 300;

      // Camera Main Body
      oCtx.beginPath();
      oCtx.roundRect(-80 * s, -50 * s, 120 * s, 100 * s, 14 * s);
      oCtx.stroke();

      // Top Handle
      oCtx.beginPath();
      oCtx.moveTo(-60 * s, -50 * s);
      oCtx.lineTo(-60 * s, -85 * s);
      oCtx.lineTo(25 * s, -85 * s);
      oCtx.lineTo(25 * s, -50 * s);
      oCtx.stroke();

      // Top Monitor
      oCtx.beginPath();
      oCtx.roundRect(15 * s, -110 * s, 42 * s, 28 * s, 6 * s);
      oCtx.stroke();

      // Lens Barrel
      oCtx.beginPath();
      oCtx.rect(40 * s, -34 * s, 50 * s, 68 * s);
      oCtx.stroke();

      // Matte Box
      oCtx.beginPath();
      oCtx.moveTo(90 * s, -45 * s);
      oCtx.lineTo(128 * s, -62 * s);
      oCtx.lineTo(128 * s, 62 * s);
      oCtx.lineTo(90 * s, 45 * s);
      oCtx.closePath();
      oCtx.stroke();

      // Internal Lens Rings
      oCtx.beginPath();
      oCtx.arc(65 * s, 0, 22 * s, 0, Math.PI * 2);
      oCtx.arc(65 * s, 0, 12 * s, 0, Math.PI * 2);
      oCtx.stroke();

      // Side Battery Pack
      oCtx.beginPath();
      oCtx.roundRect(-108 * s, -38 * s, 28 * s, 76 * s, 8 * s);
      oCtx.stroke();

      // Rec Indicator
      oCtx.beginPath();
      oCtx.arc(-45 * s, -28 * s, 6 * s, 0, Math.PI * 2);
      oCtx.fill();

      // Beam Rays
      oCtx.beginPath();
      oCtx.arc(135 * s, 0, 30 * s, -Math.PI * 0.35, Math.PI * 0.35);
      oCtx.arc(135 * s, 0, 55 * s, -Math.PI * 0.35, Math.PI * 0.35);
      oCtx.stroke();

      // Brand Name & Camera Constellation
      oCtx.font = `900 ${22 * s}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      oCtx.textAlign = "center";
      oCtx.fillText("Y A S P R O", 0, 84 * s);

      oCtx.font = `700 ${10 * s}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      oCtx.fillText("4 K   P R O D U C T I O N S", 0, 102 * s);

      oCtx.restore();

      const isMobile = w < 768;
      const imgData = oCtx.getImageData(0, 0, w, h).data;
      const points: { x: number; y: number }[] = [];
      const step = isMobile ? 6 : 4;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = (y * w + x) * 4;
          if (imgData[idx + 3] > 60) {
            points.push({ x, y });
          }
        }
      }
      return points;
    };

    let camPoints = generateCameraPoints(width, height);

    // Optimized particle count: 200 particles on mobile, 750 on desktop
    const isMobileDevice = width < 768 || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
    const targetCount = camPoints.length;
    const ambientCount = isMobileDevice ? 80 : 350;
    const totalCount = targetCount + ambientCount;

    const particles: Particle[] = [];

    for (let i = 0; i < totalCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const baseAlpha = Math.random() * 0.25 + 0.35; // Rich opacity for visible obsidian silhouettes
      const baseSize = Math.random() * 0.7 + 0.9; // 0.9px - 1.6px defined stardust beads

      const camTarget = i < camPoints.length ? camPoints[i] : { x: Math.random() * width, y: Math.random() * height };

      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        camTargetX: camTarget.x,
        camTargetY: camTarget.y,
        hasTarget: i < targetCount,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: baseSize,
        baseSize,
        color,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.015 + 0.008, // Slow, natural breathing twinkle
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      cachedRect = canvas.getBoundingClientRect();
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
      camPoints = generateCameraPoints(width, height);

      particles.forEach((p, idx) => {
        if (idx < camPoints.length) {
          p.camTargetX = camPoints[idx].x;
          p.camTargetY = camPoints[idx].y;
        }
      });
    };
    window.addEventListener("resize", handleResize, { passive: true });

    const CYCLE_DURATION = 20000;
    let startTime = performance.now();
    let elapsedTime = 0;
    let lastFrame = 0;
    // 30 FPS target on touch/mobile devices saves heavy main-thread churn; 50 FPS on desktop
    const TARGET_FPS_MS = isMobileDevice ? 1000 / 30 : 1000 / 50;

    // PAUSE ANIMATION COMPLETELY WHEN SCROLLED PAST HERO (IntersectionObserver)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cachedRect = canvas.getBoundingClientRect();
          startTime = performance.now() - (elapsedTime % CYCLE_DURATION);
          if (!wasVisible && !animId) {
            animId = requestAnimationFrame(render);
          }
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let isModalOpen = false;

    const render = (now: number) => {
      if (!isVisible || isModalOpen) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(render);
      if (now - lastFrame < TARGET_FPS_MS) return;
      lastFrame = now;

      elapsedTime = now - startTime;
      const elapsed = elapsedTime % CYCLE_DURATION;

      let camWeight = 0;

      // CYCLE: Ambient Stars & 4K Cinema Rig
      // 0s - 2.5s: Ambient cosmic floating stardust
      // 2.5s - 4.5s: Particles gather into 4K Cinema Camera Rig
      // 4.5s - 13.5s: 9s solid hold on Cinema Camera Rig
      // 13.5s - 15.5s: Disperse back into floating stars
      // 15.5s - 20.0s: Ambient cosmic twinkle
      if (elapsed < 2500) {
        camWeight = 0;
      } else if (elapsed >= 2500 && elapsed < 4500) {
        const t = (elapsed - 2500) / 2000;
        camWeight = 1 - Math.pow(1 - t, 3);
      } else if (elapsed >= 4500 && elapsed < 13500) {
        camWeight = 1;
      } else if (elapsed >= 13500 && elapsed < 15500) {
        const t = (elapsed - 13500) / 2000;
        camWeight = 1 - (t * t * (3 - 2 * t));
      } else {
        camWeight = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const isSolidHold = camWeight === 1;

      // Additive blending for a beautiful neon glow
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.pulsePhase += p.twinkleSpeed;

        p.originX += p.vx;
        p.originY += p.vy;

        if (p.originX < 0) p.originX = width;
        if (p.originX > width) p.originX = 0;
        if (p.originY < 0) p.originY = height;
        if (p.originY > height) p.originY = 0;

        let tx = p.originX;
        let ty = p.originY;

        if (p.hasTarget && camWeight > 0.001) {
          tx = tx + (p.camTargetX - tx) * camWeight;
          ty = ty + (p.camTargetY - ty) * camWeight;
        }

        // Mouse repelling physics
        if (mouse.active) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = 120;
          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 32;
            tx += (dx / dist) * force;
            ty += (dy / dist) * force;
          }
        }

        if (isSolidHold && p.hasTarget) {
          p.x = tx;
          p.y = ty;
        } else {
          const pursuitSpeed = camWeight > 0.7 ? 0.38 : 0.18;
          p.x += (tx - p.x) * pursuitSpeed;
          p.y += (ty - p.y) * pursuitSpeed;
        }

        const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.1;
        const currentSize = p.baseSize + Math.sin(p.pulsePhase) * 0.15;

        // Distinct stardust opacity when forming the camera and brand name
        const finalAlpha = p.hasTarget && camWeight > 0.15
          ? Math.min(0.94, currentAlpha + 0.35 * camWeight)
          : currentAlpha;

        const finalSize = p.hasTarget && camWeight > 0.15
          ? p.baseSize + 0.55 * camWeight
          : currentSize;

        const r = Math.max(1.15, finalSize * 1.35);

        ctx.globalAlpha = Math.max(0.25, Math.min(0.96, finalAlpha));

        // Bright, beautiful glowing gradient
        const grad = ctx.createRadialGradient(
          p.x - r * 0.25,
          p.y - r * 0.25,
          0,
          p.x,
          p.y,
          r
        );
        grad.addColorStop(0, "rgba(255, 255, 255, 1)"); // Bright white core
        grad.addColorStop(0.4, `rgba(${p.color}, 0.8)`); // Vibrant color
        grad.addColorStop(1, `rgba(${p.color}, 0)`); // Fade out to transparent

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden || isModalOpen) {
        cancelAnimationFrame(animId);
      } else {
        startTime = performance.now() - (elapsedTime % CYCLE_DURATION);
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Pause canvas particle loop when a video modal is open to free CPU/GPU
    const handleCinemaOpen = () => {
      isModalOpen = true;
      cancelAnimationFrame(animId);
    };
    const handleCinemaClose = () => {
      isModalOpen = false;
      startTime = performance.now() - (elapsedTime % CYCLE_DURATION);
      animId = requestAnimationFrame(render);
    };
    window.addEventListener("yaspro:cinema-modal-open", handleCinemaOpen);
    window.addEventListener("yaspro:cinema-modal-close", handleCinemaClose);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("yaspro:cinema-modal-open", handleCinemaOpen);
      window.removeEventListener("yaspro:cinema-modal-close", handleCinemaClose);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 size-full z-20", className)}
    />
  );
};
