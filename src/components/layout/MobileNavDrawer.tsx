"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavLinkItem {
  label: string;
  href: string;
}

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  navLinks: readonly NavLinkItem[];
}

const emptySubscribe = () => () => {};

export function MobileNavDrawer({
  isOpen,
  onClose,
  pathname,
  navLinks,
}: MobileNavDrawerProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Auto-close drawer and release scroll lock if viewport resizes to desktop breakpoint
  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleBreakpoint = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        onClose();
      }
    };

    if (mediaQuery.matches) {
      onClose();
      return;
    }

    mediaQuery.addEventListener("change", handleBreakpoint);
    return () => mediaQuery.removeEventListener("change", handleBreakpoint);
  }, [isOpen, onClose]);

  // Handle focus trap, escape key, and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Capture the trigger button that had focus before opening
    triggerElementRef.current = document.activeElement as HTMLElement | null;

    // Move initial focus into the drawer's close button
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (!panelRef.current) return;
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "";
      // Restore focus to the trigger element when drawer closes
      triggerElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-[70]"
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-y-0 right-0 w-full max-w-xs bg-secondary/98 backdrop-blur-2xl border-l border-brand-purple/20 z-[75] flex flex-col justify-between p-7 overflow-y-auto shadow-2xl shadow-brand-purple/30"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-4 px-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-ghost font-mono">
                  Menu
                </p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                >
                  <X size={18} />
                </button>
              </div>
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "text-white bg-gradient-brand shadow-lg shadow-brand-purple/30"
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowRight
                      size={15}
                      className={cn(
                        "transition-transform",
                        isActive ? "text-white" : "text-text-ghost"
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-brand-purple/15 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-text-muted">Language / اللغة</span>
                <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-medium">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-purple text-white font-bold text-[11px]">
                    EN
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-text-muted text-[11px]">
                    العربية
                  </span>
                </div>
              </div>

              <Button
                asChild
                variant="brand"
                size="lg"
                className="w-full rounded-2xl gap-2"
              >
                <Link href="/studio-booking" onClick={onClose}>
                  <Sparkles size={16} />
                  <span>Book Studio Session</span>
                </Link>
              </Button>

              <div className="flex items-center justify-between text-[11px] text-text-ghost px-1">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-brand-gold" />
                  Dubai · Cairo · Amman
                </span>
                <span className="text-brand-purple-mid">400M+ Network</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
