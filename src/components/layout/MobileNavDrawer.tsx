"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/lib/auth-client";

export interface NavLinkItem {
  label: string;
  href: string;
  key?: string;
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
  const { t, isArabic } = useLanguage();
  const { data: session } = useSession();
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
            dir="ltr"
            style={{ direction: "ltr" }}
            className="lg:hidden fixed inset-y-0 right-0 w-[85vw] max-w-xs bg-[#0b0a0f] backdrop-blur-2xl border-l border-white/10 z-[75] flex flex-col justify-between p-5 sm:p-7 overflow-y-auto shadow-2xl shadow-black/80"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-white/10">
                <div dir="ltr" style={{ direction: "ltr" }} className="flex items-center gap-2 font-latin">
                  <div className="size-7 rounded-xl border border-white/20 bg-white/[0.08] flex items-center justify-center p-0.5 shadow-sm">
                    <YasproEmblem size={18} idPrefix="drawer-logo" />
                  </div>
                  <span className="font-extrabold text-sm tracking-tight text-white font-display">
                    YAS<span className="text-amber-400">PRO</span>
                  </span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="px-4 text-[10px] uppercase tracking-widest text-text-ghost font-mono mb-1 text-left">
                {isArabic ? "التنقل" : "Navigate"}
              </p>

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
                        ? "text-amber-400 bg-amber-500/10 border border-amber-500/30"
                        : "text-text-secondary hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{(link.key && t(link.key)) || link.label}</span>
                    <ArrowRight
                      size={15}
                      className={cn(
                        "transition-transform rtl:rotate-180",
                        isActive ? "text-amber-400" : "text-text-ghost"
                      )}
                    />
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              {/* Primary CTA */}
              <Link
                href="/studio-booking"
                onClick={onClose}
                className="w-full btn-brand py-3.5 px-4 rounded-xl flex items-center justify-between text-xs font-bold uppercase tracking-wider"
              >
                <span>{t("nav.bookStudio")}</span>
                <ArrowRight size={14} className="rtl:rotate-180" />
              </Link>

              {/* WhatsApp */}
              <a
                href="https://wa.me/971554010465"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
              >
                💬 {t("nav.whatsApp")} Hotline
              </a>

              {/* Portal / Sign In */}
              <div className="w-full">
                {session?.user ? (
                  <Link
                    href="/portal"
                    onClick={onClose}
                    className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-center text-emerald-300 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{session.user.name} ({t("nav.portal")})</span>
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/portal"
                      onClick={onClose}
                      className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center text-slate-200 transition-colors"
                    >
                      {t("nav.portal")}
                    </Link>
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-center text-slate-200 transition-colors"
                    >
                      {t("nav.signIn")}
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-ghost px-1">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-brand-gold" />
                  {isArabic ? "دبي · القاهرة · عَمّان" : "Dubai · Cairo · Amman"}
                </span>
                <span className="text-amber-400 font-latin" dir="ltr">400M+ Network</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
