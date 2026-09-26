"use client";

import React, { useId, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
}

export const SparklesCore: React.FC<SparklesCoreProps> = ({
  id,
  className,
  background = "transparent",
  minSize = 0.6,
  maxSize = 1.8,
  // Hard cap at 40 — was 70, caused main-thread overload on mobile
  particleDensity = 40,
  particleColor = "#ffffff",
}) => {
  const generatedId = useId();
  const canvasId = id || generatedId;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolvedColor =
      typeof window !== "undefined" && particleColor.startsWith("var(")
        ? getComputedStyle(document.documentElement)
            .getPropertyValue(particleColor.slice(4, -1).trim())
            .trim() || "#ffffff"
        : particleColor;

    let animationFrameId: number;
    let lastTime = 0;
    const FPS = 30; // throttle to 30 fps — invisible to eye, halves CPU cost
    const FRAME_MS = 1000 / FPS;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Density cap: never more than 80 particles
    const particleCount = Math.min(
      80,
      Math.floor((width * height) / (10000 / particleDensity) * 0.1)
    );

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (maxSize - minSize) + minSize,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.7 + 0.2,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    const render = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (timestamp - lastTime < FRAME_MS) return;
      lastTime = timestamp;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += 0.008 * p.opacityDir;

        if (p.opacity <= 0.1 || p.opacity >= 0.9) p.opacityDir *= -1;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = resolvedColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(render);

    // Pause when tab is hidden — saves CPU/battery
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, [maxSize, minSize, particleColor, particleDensity]);

  return (
    <canvas
      id={canvasId}
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      style={{ background }}
    />
  );
};
