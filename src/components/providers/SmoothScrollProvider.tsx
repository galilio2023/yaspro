"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CustomCinemaCursor } from "@/components/ui/CustomCinemaCursor";

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lastPathnameRef = useRef(pathname);

  // 1. Scroll Restoration on Refresh & Hash Navigation
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if the current load is a browser reload/refresh
    let isReload = false;
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        isReload = navEntry.type === "reload";
      } else {
        // Fallback for older browsers
        isReload = (performance as unknown as { navigation?: { type?: number } }).navigation?.type === 1;
      }
    } catch {
      isReload = false;
    }

    if (isReload) {
      try {
        const savedScroll = sessionStorage.getItem(`yaspro_scroll_${pathname}`);
        if (savedScroll) {
          const targetY = parseInt(savedScroll, 10);
          if (!isNaN(targetY) && targetY > 0) {
            // Restore immediately and after hydration to counter Next.js layout expansion
            window.scrollTo({ top: targetY, behavior: "instant" });
            const rafId = requestAnimationFrame(() => {
              window.scrollTo({ top: targetY, behavior: "instant" });
            });
            const timerId = setTimeout(() => {
              window.scrollTo({ top: targetY, behavior: "instant" });
            }, 80);

            return () => {
              cancelAnimationFrame(rafId);
              clearTimeout(timerId);
            };
          }
        }
      } catch {
        // Ignore storage access errors
      }
    } else if (window.location.hash) {
      // Direct anchor link on initial load
      const hash = window.location.hash;
      const timerId = setTimeout(() => {
        try {
          const targetEl = document.querySelector(hash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "instant", block: "start" });
          }
        } catch {}
      }, 50);
      return () => clearTimeout(timerId);
    }
  }, [pathname]);

  // 2. Track & Persist Scroll Position on Active Page
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          if (window.scrollY > 0) {
            sessionStorage.setItem(`yaspro_scroll_${pathname}`, window.scrollY.toString());
          }
        } catch {}
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  // 3. Clear Stored Position on Route Changes to Start Fresh at Top
  useEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      try {
        sessionStorage.removeItem(`yaspro_scroll_${lastPathnameRef.current}`);
      } catch {}
      lastPathnameRef.current = pathname;
    }
  }, [pathname]);

  return (
    <>
      <CustomCinemaCursor />
      {children}
    </>
  );
}
