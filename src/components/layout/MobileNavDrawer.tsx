"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IyasProIcon } from "@/components/ui/IyasProIcon";

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
              <div className="flex items-center justify-between mb-5 px-1 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <IyasProIcon size={16} idPrefix="drawer-logo" className="filter drop-shadow-[0_0_6px_rgba(167,139,250,0.6)]" />
                  <span className="font-extrabold text-sm tracking-wide text-white font-display">
                    iYAS<span className="text-brand-purple-light">PRO</span>
                  </span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
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
              <Link
                href="/studio-booking"
                onClick={onClose}
                className="relative group w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-bold tracking-wide text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              >
                {/* Luminous Ambient Halo Glow */}
                <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-teal opacity-60 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-300 pointer-events-none" />

                {/* Shimmer Border Gradient Line */}
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-purple-light/80 to-brand-teal p-[1px] pointer-events-none">
                  <span className="block size-full rounded-2xl bg-[#090616]" />
                </span>

                {/* Surface Reflection Gloss */}
                <span className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Left Content: Active Studio Live Beacon + Label */}
                <div className="relative z-10 flex items-center gap-2.5">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </span>
                  <span className="flex items-center gap-1.5 font-display text-[12px] uppercase tracking-wider text-white group-hover:text-brand-purple-lighter transition-colors">
                    <Sparkles size={14} className="text-brand-purple-light group-hover:text-brand-cyan transition-colors" />
                    <span>Book Studio</span>
                  </span>
                </div>

                {/* Forward Chevron Affordance */}
                <svg
                  viewBox="0 0 16 16"
                  className="relative z-10 size-3.5 text-text-muted group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 12l4-4-4-4" />
                </svg>
              </Link>

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
