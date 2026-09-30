"use client";

import { useEffect, useRef, RefObject } from "react";

export interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  autoRestoreFocus?: boolean;
}

/**
 * Accessible keyboard focus trap hook.
 * Handles:
 * - Focus confinement within container (Tab and Shift+Tab cycling)
 * - Escape key dismissal
 * - Active element restoration upon close
 * - Initial focus targeting
 */
export function useFocusTrap({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  autoRestoreFocus = true,
}: UseFocusTrapOptions) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element before trap activates
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Target initial focus
    const focusTimer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          containerRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (autoRestoreFocus && triggerRef.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, containerRef, initialFocusRef, autoRestoreFocus]);
}
