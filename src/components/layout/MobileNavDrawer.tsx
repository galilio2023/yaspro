"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
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

export function MobileNavDrawer({
  isOpen,
  onClose,
  pathname,
  navLinks,
}: MobileNavDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="lg:hidden fixed inset-y-0 right-0 w-full max-w-xs bg-secondary/98 backdrop-blur-2xl border-l border-brand-purple/15 z-50 flex flex-col justify-between p-7 overflow-y-auto shadow-2xl shadow-brand-purple/20"
        >
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-ghost font-mono mb-4 px-2">
              Menu
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
      )}
    </AnimatePresence>
  );
}
