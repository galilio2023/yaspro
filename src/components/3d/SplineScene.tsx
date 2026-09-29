"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import Spline to prevent SSR issues
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineFallback />,
});

function SplineFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* 3D Orb / Hologram visual loader */}
      <div className="relative flex items-center justify-center">
        <div className="size-48 sm:size-64 rounded-full border border-brand-purple/30 bg-gradient-to-tr from-brand-purple/20 via-brand-cyan/10 to-transparent blur-md animate-pulse-glow" />
        <div className="absolute size-32 sm:size-40 rounded-full border border-brand-cyan/40 bg-brand-purple/10 backdrop-blur-sm animate-spin-around [animation-duration:12s]" />
        <div className="absolute flex flex-col items-center justify-center text-center p-4">
          <div className="size-3 rounded-full bg-brand-purple animate-ping mb-2" />
          <span className="text-xs uppercase tracking-widest text-text-secondary font-mono">
            3D Media Engine
          </span>
        </div>
      </div>
    </div>
  );
}

interface SplineSceneProps {
  scene?: string;
  className?: string;
}

export function SplineScene({
  scene = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",
  className,
}: SplineSceneProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Detect touch/coarse-pointer devices (phones/tablets) where Spline
  // harms performance: ~580 KB runtime + WebGPU/MRT issues on older Android WebViews.
  // Use a ref so we only read matchMedia once (safe during SSR because window is guarded).
  const isTouchDevice =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  // Filter out benign Three.js WebGPURenderer MRT compatibility warning
  React.useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("THREE.WebGPURenderer") &&
        args[0].includes("Multiple Render Targets")
      ) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // Pause Spline rendering overhead when scrolled away from Hero
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
      className={cn(
        "relative h-full w-full max-w-full min-h-[280px] sm:min-h-[350px] overflow-hidden will-change-transform",
        className
      )}
    >
      {/* On touch/mobile skip the heavy Spline WebGL runtime; show the fallback orb */}
      {isTouchDevice ? (
        <SplineFallback />
      ) : !hasError ? (
        <Suspense fallback={<SplineFallback />}>
          <div
            className={cn(
              "size-full transition-opacity duration-700",
              isLoaded ? "opacity-100" : "opacity-0",
              !isVisible && "pointer-events-none invisible"
            )}
          >
            <Spline
              scene={scene}
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
            />
          </div>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <SplineFallback />
            </div>
          )}
        </Suspense>
      ) : (
        <SplineFallback />
      )}
    </div>
  );
}
