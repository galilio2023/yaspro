"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function CustomCinemaCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Smooth physical spring physics for the cursor ring
  const springConfig = { damping: 25, stiffness: 280, mass: 0.5 };
  const cursorX = useSpring(-100, springConfig);
  const cursorY = useSpring(-100, springConfig);

  useEffect(() => {
    // Only enable on non-touch pointer devices and if reduced motion is not preferred
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactiveEl = target.closest("a, button, [role='button'], input, textarea, select, [data-cursor]");
      const customCursorData = target.closest("[data-cursor]")?.getAttribute("data-cursor");

      if (customCursorData) {
        setCursorText(customCursorData);
        setIsPointer(true);
      } else if (interactiveEl) {
        setCursorText("");
        setIsPointer(true);
      } else {
        setCursorText("");
        setIsPointer(false);
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Precision Center Dot */}
      <motion.div
        className="fixed top-0 left-0 size-2 -ml-1 -mt-1 rounded-full bg-brand-mauve shadow-[0_0_10px_rgba(152,123,165,0.9)]"
        style={{
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`,
        }}
      />

      {/* Outer Magnetic Aura / Shimmer Ring */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full flex items-center justify-center transition-colors duration-200 pointer-events-none will-change-transform ${
          cursorText
            ? "size-20 -ml-10 -mt-10 bg-brand-violet/25 border border-brand-mauve/60 shadow-[0_0_24px_rgba(118,80,134,0.5)]"
            : isPointer
            ? "size-12 -ml-6 -mt-6 bg-brand-violet/20 border border-brand-mauve/50 shadow-[0_0_18px_rgba(84,37,104,0.45)]"
            : "size-8 -ml-4 -mt-4 border border-brand-mauve/20 bg-white/[0.04]"
        }`}
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        {cursorText && (
          <span className="text-[9px] font-mono font-bold tracking-widest text-brand-lavender uppercase text-center px-1">
            {cursorText}
          </span>
        )}
      </motion.div>
    </div>
  );
}
