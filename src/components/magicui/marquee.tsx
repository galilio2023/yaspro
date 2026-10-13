"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  children: React.ReactNode;
  repeat?: number;
  gap?: string;
  speedMultiplier?: number;
  enableDrag?: boolean;
  enableWheel?: boolean;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  paused = false,
  children,
  repeat = 4,
  gap = "2.5rem",
  speedMultiplier = 1,
  enableDrag = true,
  enableWheel = true,
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const firstSeqRef = React.useRef<HTMLDivElement>(null);
  const secondSeqRef = React.useRef<HTMLDivElement>(null);

  const [isVisible, setIsVisible] = React.useState(true);

  // Physics & kinetic animation state (held in refs for 60fps/120fps GPU performance)
  const offsetRef = React.useRef(0);
  const strideRef = React.useRef(0);
  const extraVelocityRef = React.useRef(0);
  const isPointerDownRef = React.useRef(false);
  const isHoveredRef = React.useRef(false);
  const hoverDecelRef = React.useRef(1);
  const lastPointerXRef = React.useRef(0);
  const lastTimeRef = React.useRef(0);
  const dragDistanceRef = React.useRef(0);
  const isDraggingRef = React.useRef(false);
  const prefersReducedMotionRef = React.useRef(false);

  // Respect user's system reduced-motion preference
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // Pause animation loop when offscreen to conserve CPU/battery
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "150px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute exact subpixel stride between sequence 0 and sequence 1
  const updateStride = React.useCallback(() => {
    if (firstSeqRef.current && secondSeqRef.current) {
      const stride = secondSeqRef.current.offsetLeft - firstSeqRef.current.offsetLeft;
      if (stride > 0) {
        strideRef.current = stride;
      }
    }
  }, []);

  React.useEffect(() => {
    updateStride();
    const handleResize = () => updateStride();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [updateStride, children]);

  // Main 60fps/120fps kinetic loop
  React.useEffect(() => {
    if (!isVisible) return;

    let rafId: number;
    let prevFrameTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(50, currentTime - prevFrameTime);
      prevFrameTime = currentTime;

      const stride = strideRef.current;
      if (stride > 0) {
        // Smooth hover deceleration and acceleration
        const targetHover = (isHoveredRef.current && pauseOnHover && !isPointerDownRef.current) ? 0 : 1;
        hoverDecelRef.current += (targetHover - hoverDecelRef.current) * 0.12;
        if (Math.abs(targetHover - hoverDecelRef.current) < 0.005) {
          hoverDecelRef.current = targetHover;
        }

        if (!isPointerDownRef.current) {
          // Base cruising speed (~55-60px per second, 0 if user prefers reduced motion)
          const isReducedMotion = prefersReducedMotionRef.current;
          if (isReducedMotion) {
            extraVelocityRef.current = 0;
          }
          const baseVelocity = isReducedMotion
            ? 0
            : (reverse ? 0.95 : -0.95) * speedMultiplier * (paused ? 0 : 1);
          const currentCruiseSpeed = baseVelocity * hoverDecelRef.current;

          // Friction decay on throw or wheel velocity
          extraVelocityRef.current *= Math.pow(0.92, dt / 16.6);
          if (Math.abs(extraVelocityRef.current) < 0.04) {
            extraVelocityRef.current = 0;
          }

          // Combined step
          const frameStep = (currentCruiseSpeed + extraVelocityRef.current) * (dt / 16.6);
          offsetRef.current += frameStep;

          // Seamless infinite modulo wrapping
          while (offsetRef.current <= -stride) {
            offsetRef.current += stride;
          }
          while (offsetRef.current > 0) {
            offsetRef.current -= stride;
          }

          if (trackRef.current) {
            trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, reverse, speedMultiplier, paused, pauseOnHover]);

  // Pointer drag & touch swipe
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enableDrag || e.button !== 0) return;
    isPointerDownRef.current = true;
    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    extraVelocityRef.current = 0;
    dragDistanceRef.current = 0;
    isDraggingRef.current = false;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const now = performance.now();
    const deltaX = e.clientX - lastPointerXRef.current;
    const dt = Math.max(1, now - lastTimeRef.current);

    dragDistanceRef.current += Math.abs(deltaX);
    if (dragDistanceRef.current > 5) {
      isDraggingRef.current = true;
    }

    offsetRef.current += deltaX;

    // Instantaneous fling velocity for throw physics
    extraVelocityRef.current = (deltaX / dt) * 16.6;

    lastPointerXRef.current = e.clientX;
    lastTimeRef.current = now;

    const stride = strideRef.current;
    if (stride > 0) {
      while (offsetRef.current <= -stride) {
        offsetRef.current += stride;
      }
      while (offsetRef.current > 0) {
        offsetRef.current -= stride;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // Clamp fling velocity to comfortable kinetic range
    extraVelocityRef.current = Math.max(-28, Math.min(28, extraVelocityRef.current));

    setTimeout(() => {
      isDraggingRef.current = false;
      dragDistanceRef.current = 0;
    }, 60);
  };

  // Suppress click navigation if user was dragging/swiping
  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current || dragDistanceRef.current > 6) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Native non-passive wheel listener to allow cancelling horizontal gestures in modern browsers
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !enableWheel) return;

    const cancelHorizontalWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2) {
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", cancelHorizontalWheel, { passive: false });
    return () => el.removeEventListener("wheel", cancelHorizontalWheel);
  }, [enableWheel]);

  // Mouse wheel & trackpad boost
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!enableWheel) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 2) {
      // Impulse in scroll direction
      extraVelocityRef.current -= (delta / 80) * 4;
      extraVelocityRef.current = Math.max(-30, Math.min(30, extraVelocityRef.current));
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      onWheel={handleWheel}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      style={{ "--gap": gap } as React.CSSProperties}
      className={cn(
        "relative w-full overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing",
        className
      )}
      {...props}
    >
      <div
        ref={trackRef}
        className="flex w-max flex-row items-center [gap:var(--gap)] will-change-transform"
      >
        {Array(repeat)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              ref={i === 0 ? firstSeqRef : i === 1 ? secondSeqRef : undefined}
              aria-hidden={i > 0 ? true : undefined}
              className="flex shrink-0 items-center justify-around [gap:var(--gap)]"
            >
              {children}
            </div>
          ))}
      </div>
    </div>
  );
}
