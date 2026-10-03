"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CustomCinemaCursor } from "@/components/ui/CustomCinemaCursor";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lastPathnameRef = useRef(pathname);

  // 1. Scroll Restoration: Hash Navigation Prioritized, Followed by Reload Restoration
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Check URL hash first: explicit anchor intent takes priority over stored reload positions
    if (window.location.hash) {
      const hash = window.location.hash;
      const scrollToAnchor = () => {
        try {
          const targetEl = document.querySelector(hash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "instant", block: "start" });
            return true;
          }
        } catch {}
        return false;
      };

      if (!scrollToAnchor()) {
        let attempts = 0;
        const intervalId = setInterval(() => {
          attempts++;
          if (scrollToAnchor() || attempts > 20) {
            clearInterval(intervalId);
          }
        }, 50);
        return () => clearInterval(intervalId);
      }
      return;
    }

    // Detect if the current load is a browser reload/refresh
    let isReload = false;
    try {
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (navEntry) {
        isReload = navEntry.type === "reload";
      } else {
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
            // Restore immediately before browser paint
            window.scrollTo({ top: targetY, behavior: "instant" });

            let cancelled = false;
            let observer: ResizeObserver | null = null;

            const attemptScroll = () => {
              if (cancelled) return;
              window.scrollTo({ top: targetY, behavior: "instant" });
              if (Math.abs(window.scrollY - targetY) <= 2) {
                cleanup();
              }
            };

            const cleanup = () => {
              cancelled = true;
              if (observer) {
                observer.disconnect();
                observer = null;
              }
              window.removeEventListener("wheel", handleUserInteract);
              window.removeEventListener("touchstart", handleUserInteract);
              window.removeEventListener("keydown", handleUserInteract);
            };

            const handleUserInteract = () => {
              // Yield control if user initiates manual scroll/touch
              cleanup();
            };

            window.addEventListener("wheel", handleUserInteract, { passive: true });
            window.addEventListener("touchstart", handleUserInteract, { passive: true });
            window.addEventListener("keydown", handleUserInteract, { passive: true });

            // Ensure target is reached as async components/images expand document height
            if (typeof ResizeObserver !== "undefined" && document.body) {
              observer = new ResizeObserver(() => {
                attemptScroll();
              });
              observer.observe(document.body);
            }

            const timeoutId = setTimeout(cleanup, 2000);

            return () => {
              clearTimeout(timeoutId);
              cleanup();
            };
          }
        }
      } catch {
        // Ignore storage access errors
      }
    }
  }, [pathname]);

  // 2. Track & Persist Scroll Position on Active Page (overwrite or clear on scrollY === 0)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const key = `yaspro_scroll_${pathname}`;
          if (window.scrollY > 0) {
            sessionStorage.setItem(key, Math.round(window.scrollY).toString());
          } else {
            sessionStorage.removeItem(key);
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
