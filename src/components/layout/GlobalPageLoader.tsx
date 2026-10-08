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

// 750ms matches the 0.72s kinetic YASPRO entrance so users always see the complete assembly
const MIN_LOADER_TIME_MS = 750;
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
  // Start as true so refreshing or first opening the app displays the YASPRO entrance impression
  const [isLoading, setIsLoading] = useState(true);
  const [customStatus, setCustomStatus] = useState<string | undefined>(undefined);
  const [, startTransition] = useTransition();

  const loadStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dismissalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopLoading = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (dismissalTimerRef.current) {
      clearTimeout(dismissalTimerRef.current);
      dismissalTimerRef.current = null;
    }

    if (!loadStartTimeRef.current) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - loadStartTimeRef.current;
    const remaining = Math.max(0, MIN_LOADER_TIME_MS - elapsed);

    dismissalTimerRef.current = setTimeout(() => {
      dismissalTimerRef.current = null;
      startTransition(() => {
        setIsLoading(false);
        setCustomStatus(undefined);
        loadStartTimeRef.current = null;
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

    // Failsafe auto-dismiss
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      stopLoading();
    }, FAILSAFE_TIMEOUT_MS);
  }, [stopLoading]);

  // Initial entrance experience on page mount/refresh: assemble & breathe cleanly, then smoothly dismiss
  useEffect(() => {
    loadStartTimeRef.current = Date.now();
    const initTimer = setTimeout(() => {
      stopLoading();
    }, 2200);

    return () => {
      clearTimeout(initTimer);
    };
  }, [stopLoading]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (dismissalTimerRef.current) clearTimeout(dismissalTimerRef.current);
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

      {/* Fullscreen Animated Studio Sensor Hub Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="yaspro-global-route-loader"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
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
