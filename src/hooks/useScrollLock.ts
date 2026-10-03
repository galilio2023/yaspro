"use client";

import { useEffect } from "react";

// Global counter for active scroll locks to handle nested modals / drawers
let lockCount = 0;
let originalBodyOverflow = "";
let originalHtmlOverflow = "";
let originalBodyPaddingRight = "";

export function lockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (lockCount === 0) {
    // Measure scrollbar width before locking to avoid layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;
  }
}

/**
 * React hook to lock body & html scroll while a modal, drawer, or dialog is open.
 * Uses a ref-counted lock mechanism so nested modals cleanly preserve scroll lock
 * until the last one closes, and compensates for scrollbar width to prevent layout shifts.
 */
export function useScrollLock(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
