"use client";

import { useEffect, useRef, RefObject } from "react";
import { lockScroll, unlockScroll } from "./useScrollLock";

const activeTraps: { containerRef: RefObject<HTMLElement | null>; focus: () => void }[] = [];

export interface UseFocusTrapOptions {
  isOpen: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  autoRestoreFocus?: boolean;
  lockScroll?: boolean;
}

/**
 * Accessible keyboard focus trap hook.
 * Handles:
 * - Focus confinement within container (Tab and Shift+Tab cycling)
 * - Escape key dismissal
 * - Active element restoration upon close
 * - Initial focus targeting
 * - Automatic background body/html scroll locking (with scrollbar width compensation)
 */
export function useFocusTrap({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  autoRestoreFocus = true,
  lockScroll: shouldLockScroll = true,
}: UseFocusTrapOptions) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (shouldLockScroll) {
      lockScroll();
    }

    // Capture currently focused element before trap activates
    triggerRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => Array.from(containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]'
    ) ?? []).filter((el) => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);

    const focus = () => (initialFocusRef?.current ?? getFocusable()[0] ?? containerRef.current)?.focus();
    const trap = { containerRef, focus };
    activeTraps.push(trap);
    focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTraps.at(-1) !== trap || e.defaultPrevented) return;
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

    const handleFocusIn = (event: FocusEvent) => {
      if (activeTraps.at(-1) === trap && containerRef.current &&
          !containerRef.current.contains(event.target as Node)) focus();
    };
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (shouldLockScroll) {
        unlockScroll();
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("focusin", handleFocusIn);
      const wasTopmost = activeTraps.at(-1) === trap;
      const index = activeTraps.indexOf(trap);
      if (index !== -1) activeTraps.splice(index, 1);
      if (!wasTopmost) return;
      const previous = activeTraps.at(-1);
      const trigger = triggerRef.current;
      if (autoRestoreFocus && trigger?.isConnected &&
          (!previous || previous.containerRef.current?.contains(trigger))) {
        trigger.focus();
      } else if (previous) {
        previous.focus();
      }
    };
  }, [isOpen, containerRef, initialFocusRef, autoRestoreFocus, shouldLockScroll]);
}
