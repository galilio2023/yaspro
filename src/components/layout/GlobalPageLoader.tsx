"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useTransition,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { YasproAnimatedLoader } from "@/components/ui/YasproAnimatedLoader";

interface PageLoaderContextType {
  isLoading: boolean;
  startLoading: (customStatus?: string) => void;
  stopLoading: () => void;
}

const PageLoaderContext = createContext<PageLoaderContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const usePageLoader = () => useContext(PageLoaderContext);

const MIN_LOADER_TIME_MS = 380;
const FAILSAFE_TIMEOUT_MS = 6000;

function RouteWatcher({
  onStop,
  isLoading,
  onPopState,
}: {
  onStop: () => void;
  isLoading: boolean;
  onPopState: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) {
      onStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      const currentSearch = new URLSearchParams(window.location.search).toString();

      if (
        window.location.pathname === pathname &&
        currentSearch === searchParams.toString()
      ) {
        return;
      }

      onPopState();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, searchParams, onPopState]);

  return null;
}

export function GlobalPageLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [customStatus, setCustomStatus] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [, startTransition] = useTransition();

  const loadStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (dismissalTimerRef.current) {
      clearTimeout(dismissalTimerRef.current);
      dismissalTimerRef.current = null;
    }

    if (!loadStartTimeRef.current) {
      setIsLoading(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 200);
      return;
    }

    const elapsed = Date.now() - loadStartTimeRef.current;
    const remaining = Math.max(0, MIN_LOADER_TIME_MS - elapsed);

    setProgress(100);

    dismissalTimerRef.current = setTimeout(() => {
      dismissalTimerRef.current = null;
      startTransition(() => {
        setIsLoading(false);
        setCustomStatus(undefined);
        loadStartTimeRef.current = null;
        setProgress(0);
      });
    }, remaining);
  }, []);

  const startLoading = useCallback((status?: string) => {
    if (dismissalTimerRef.current) {
      clearTimeout(dismissalTimerRef.current);
      dismissalTimerRef.current = null;
    }

    loadStartTimeRef.current = Date.now();
    setCustomStatus(status);
    setIsLoading(true);
    setProgress(15);

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev;
        const inc = Math.random() * 12 + 6;
        return Math.min(prev + inc, 85);
      });
    }, 120);

    // Failsafe auto-dismiss
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stopLoading();
    }, FAILSAFE_TIMEOUT_MS);
  }, [stopLoading]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissalTimerRef.current) clearTimeout(dismissalTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Intercept internal link clicks to trigger loader ahead of route render
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");

      // Ignore external, target blank, hash-only, email, or telephone links
      if (
        !href ||
        targetAttr === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // Same origin only
        if (url.origin !== currentUrl.origin) return;

        // Skip if identical pathname + search
        if (
          url.pathname === currentUrl.pathname &&
          url.search === currentUrl.search
        ) {
          return;
        }

        // Trigger cinematic routing loader
        startLoading();
      } catch {
        // ignore invalid URL
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [startLoading]);

  return (
    <PageLoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      <Suspense fallback={null}>
        <RouteWatcher
          onStop={stopLoading}
          isLoading={isLoading}
          onPopState={startLoading}
        />
      </Suspense>

      {/* 1. Razor Top Edge Laser Progress Bar (Always physical LTR) */}
      <div
        dir="ltr"
        style={{ direction: "ltr" }}
        className="fixed top-0 left-0 right-0 z-[10000] pointer-events-none h-[2.5px] overflow-visible"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-white transition-all duration-200 ease-out shadow-[0_0_14px_rgba(245,158,11,0.9)] relative"
          style={{
            width: `${progress}%`,
            opacity: isLoading || progress > 0 ? 1 : 0,
          }}
        >
          {/* Optical flare head on leading edge */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-4 h-4 rounded-full bg-white blur-[2px] opacity-90" />
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 blur-md opacity-70" />
        </div>
      </div>

      {/* 2. Fullscreen Animated Studio Sensor Hub Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="yaspro-global-route-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
            dir="ltr"
            style={{ direction: "ltr" }}
          >
            <YasproAnimatedLoader statusText={customStatus} size="fullscreen" />
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </PageLoaderContext.Provider>
  );
}
