"use client";

import React, { useId, useEffect, useRef } from "react";
import { YasproEmblem } from "@/components/ui/YasproEmblem";

interface YasproBrandSparkleBadgeProps {
  className?: string;
}

export function YasproBrandSparkleBadge({ className = "" }: YasproBrandSparkleBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasId = useId();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || 340);
    let height = (canvas.height = canvas.offsetHeight || 60);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 340;
      height = canvas.height = canvas.offsetHeight || 60;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#a78bfa", "#c4b5fd", "#06b6d4", "#67e8f9", "#f59e0b", "#ffffff"];
    const count = 42;

    const sparkles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.05 + 0.02,
    }));

    let isVisible = true;
    let animId: number | null = null;
    let lastTime = 0;
    const FRAME_MS = 1000 / 30; // 30 FPS cap for small badge

    const render = (now: number) => {
      if (!isVisible) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(render);
      if (now - lastTime < FRAME_MS) return;
      lastTime = now;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (const s of sparkles) {
        s.pulse += s.pulseSpeed;
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const currentAlpha = Math.max(0.1, Math.min(1, s.alpha + Math.sin(s.pulse) * 0.35));
        const currentSize = s.size + Math.sin(s.pulse) * 0.4;

        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = s.color;

        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, currentSize), 0, Math.PI * 2);
        ctx.fill();

        // Shimmer flare for accent sparks
        if (currentSize > 1.6) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - currentSize * 2, s.y);
          ctx.lineTo(s.x + currentSize * 2, s.y);
          ctx.moveTo(s.x, s.y - currentSize * 2);
          ctx.lineTo(s.x, s.y + currentSize * 2);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible && !animId) {
          lastTime = performance.now();
          animId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      style={{ direction: "ltr" }}
      className={`relative inline-flex items-center gap-3.5 px-4 py-2 rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md overflow-hidden group shadow-lg shadow-brand-purple/10 ${className}`}
    >
      {/* Sparkles Canvas Inside Badge */}
      <canvas
        id={canvasId}
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 size-full"
      />


      {/* Brand Typography & Emblem */}
      <div className="relative z-10 flex items-center gap-2 font-latin" dir="ltr" style={{ direction: "ltr" }}>
        <YasproEmblem
          size={22}
          idPrefix="badge-logo"
          className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
        />
        <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-brand-purple-light to-brand-cyan bg-clip-text text-transparent drop-shadow-sm font-display font-latin">
          YASPRO
        </span>
        <span className="h-3 w-[1px] bg-white/20 inline-block self-center mx-1" />
        <span className="text-xs font-medium text-text-secondary tracking-wide">
          AI Media Hub · UAE · Egypt · Jordan
        </span>
      </div>

      {/* Subtle border glow animation */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-brand-purple/20 group-hover:border-brand-purple/40 transition-colors" />
    </div>
  );
}
