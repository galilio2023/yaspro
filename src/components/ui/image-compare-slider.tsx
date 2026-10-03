"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { SplitSquareVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  initialPosition?: number; // 0 to 100
  position?: number;
  onPositionChange?: (pos: number) => void;
  className?: string;
  aspectRatio?: string;
  children?: React.ReactNode;
}

/**
 * Reusable high-performance Before/After split image comparison slider.
 * Uses requestAnimationFrame throttling and supports mouse, touch, and keyboard interactions.
 */
export function ImageCompareSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before state",
  afterAlt = "After state",
  beforeLabel,
  afterLabel,
  initialPosition = 50,
  position,
  onPositionChange,
  className,
  aspectRatio = "aspect-[16/9]",
  children,
}: ImageCompareSliderProps) {
  const [internalPosition, setInternalPosition] = useState<number>(initialPosition);
  const sliderPosition = position !== undefined ? position : internalPosition;

  const setPosition = useCallback((pos: number) => {
    if (position === undefined) {
      setInternalPosition(pos);
    }
    onPositionChange?.(pos);
  }, [position, onPositionChange]);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafDragRef = useRef<number | null>(null);

  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));

    if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    rafDragRef.current = requestAnimationFrame(() => {
      setPosition(Math.round(percentage * 10) / 10);
    });
  }, [setPosition]);

  const isDraggingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSwipingVerticalRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isSwipingVerticalRef.current = false;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updateSliderFromClientX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0] || !touchStartRef.current || isSwipingVerticalRef.current) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartRef.current.y);

      // If user is predominantly scrolling vertically, do NOT drag the slider
      if (!isDraggingRef.current) {
        if (dy > dx && dy > 6) {
          // Vertical swipe: let page scroll natively and do not commit as tap
          isSwipingVerticalRef.current = true;
          return;
        }
        if (dx > 8 && dx > dy) {
          isDraggingRef.current = true;
          setIsDragging(true);
          updateSliderFromClientX(touch.clientX);
        }
      } else {
        updateSliderFromClientX(touch.clientX);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    const handleTouchEnd = () => {
      // If user tapped without dragging or vertical swipe, commit tap position
      if (touchStartRef.current && !isSwipingVerticalRef.current && !isDraggingRef.current) {
        updateSliderFromClientX(touchStartRef.current.x);
      }
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
      touchStartRef.current = null;
      isSwipingVerticalRef.current = false;
    };

    const handleTouchCancel = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      touchStartRef.current = null;
      isSwipingVerticalRef.current = false;
      if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
      if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    };
  }, [updateSliderFromClientX]);

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Before/After image visual split comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(sliderPosition)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setPosition(Math.max(0, sliderPosition - 5));
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          setPosition(Math.min(100, sliderPosition + 5));
        }
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 select-none cursor-ew-resize group bg-black/60 shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 touch-pan-y",
        aspectRatio,
        className
      )}
    >
      {/* Background (After / Composite image) */}
      <div className="absolute inset-0" suppressHydrationWarning>
        <Image
          src={afterImage}
          alt={afterAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="object-cover"
          priority
        />
        {afterLabel ? (
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/90">
            {afterLabel}
          </div>
        ) : null}
      </div>

      {/* Foreground (Before / Raw image clipped to slider position) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0% ${100 - sliderPosition}% 0% 0%)` }}
        suppressHydrationWarning
      >
        <div className="relative w-full h-full" suppressHydrationWarning>
          <Image
            src={beforeImage}
            alt={beforeAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 80vw"
            className="object-cover"
            priority
          />
          {beforeLabel ? (
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-white/90">
              {beforeLabel}
            </div>
          ) : null}
        </div>
      </div>

      {/* Divider Line & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-white to-amber-500 z-20 pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
        suppressHydrationWarning
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 rounded-full bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/40 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
          <SplitSquareVertical size={16} />
        </div>
      </div>

      {/* Optional Custom Overlays (HUDs, badges, telemetry) */}
      {children}
    </div>
  );
}
