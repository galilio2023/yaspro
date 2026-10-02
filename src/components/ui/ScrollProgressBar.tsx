"use client";

import { useEffect, useState } from "react";

/**
 * High-performance 60fps scroll progress bar.
 * Uses requestAnimationFrame with CSS transform scaleX on GPU compositor.
 * Zero layout thrash, zero DOM reflow.
 */
export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min(1, Math.max(0, scrollTop / scrollHeight)));
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none overflow-hidden z-20"
    >
      <div
        className="h-full w-full origin-left bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 transition-transform duration-75 ease-out"
        style={{
          transform: `scaleX(${progress})`,
          willChange: "transform",
        }}
      />
    </div>
  );
}
