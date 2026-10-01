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
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element before trap activates
    triggerRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => Array.from(containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]'
    ) ?? []).filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);

    (initialFocusRef?.current ?? getFocusable()[0] ?? containerRef.current)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusable = getFocusable();
        const index = focusable.indexOf(document.activeElement as HTMLElement);
        const nextIndex = e.shiftKey
          ? (index <= 0 ? focusable.length - 1 : index - 1)
          : (index + 1) % focusable.length;
        e.preventDefault();
        (focusable[nextIndex] ?? containerRef.current).focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (autoRestoreFocus && triggerRef.current) {
        if (triggerRef.current.isConnected) triggerRef.current.focus();
      }
    };
  }, [isOpen, containerRef, initialFocusRef, autoRestoreFocus]);
}
