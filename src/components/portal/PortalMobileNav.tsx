"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowUpRight, LogOut, User } from "lucide-react";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { signOut } from "@/lib/auth-client";
import { PortalNavIcon } from "@/components/portal/PortalNavIcon";
import type { PortalNavItem } from "@/components/portal/types";

interface PortalMobileNavProps {
  navItems: PortalNavItem[];
  userName: string;
  userEmail: string;
  userRole: "client" | "enterprise";
  accentColor: "purple" | "emerald";
}

export function PortalMobileNav({
  navItems,
  userName,
  userEmail,
  userRole,
  accentColor,
}: PortalMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const prevIsOpen = useRef(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);

    // Inert every sibling along the dialog's ancestor path, preserving prior state.
    const background = new Map<HTMLElement, boolean>();
    let branch: HTMLElement = dialog;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== branch) {
          background.set(sibling, sibling.inert);
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "Tab") {
        const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0 && !element.closest("[inert]"));
        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = document.activeElement;
        if (!first || !last) {
          e.preventDefault();
        } else if (!dialog.contains(active) || (e.shiftKey ? active === first : active === last)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      for (const [element, wasInert] of background) element.inert = wasInert;
    };
  }, [isOpen]);

  // Return focus to menu toggle button when drawer closes
  useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      menuButtonRef.current?.focus();
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  const isEmerald = accentColor === "emerald";

  const gradientClass = isEmerald
    ? "from-emerald-600 via-emerald-700 to-teal-500"
    : "from-purple-600 via-purple-700 to-indigo-500";

  const shadowClass = isEmerald
    ? "shadow-emerald-500/25 border-emerald-400/30"
    : "shadow-purple-500/25 border-purple-400/30";

  const subtitleClass = isEmerald ? "text-emerald-400" : "text-purple-400";
  const iconClass = isEmerald ? "text-emerald-400/80" : "text-purple-400/80";
  const logoHoverClass = isEmerald
    ? "group-hover:text-emerald-300"
    : "group-hover:text-purple-300";
  const linkAccentClass = isEmerald
    ? "text-emerald-400 hover:text-emerald-300"
    : "text-purple-400 hover:text-purple-300";

  const subtitle = userRole === "client" ? "CLIENT PORTAL" : "ENTERPRISE VAULT";

  return (
    <>
      {/* Mobile Top Bar — hidden on md+ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`size-8 rounded-xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center shadow-lg ${shadowClass} border`}
          >
            <YasproEmblem
              size={16}
              idPrefix="mob-portal-emblem"
              className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            />
          </div>
          <div className="flex items-center">
            <span
              className={`font-extrabold tracking-tight text-white transition-colors ${logoHoverClass}`}
            >
              YASPRO
            </span>
            <span className={`ml-1 text-xs font-bold ${subtitleClass}`}>
              PORTAL
            </span>
          </div>
        </Link>

        <button
          ref={menuButtonRef}
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Full-screen overlay — visible only when open on mobile */}
      {isOpen && (
        <div
          ref={dialogRef}
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-in panel */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-slate-900 border-r border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <Link
                href="/"
                className="flex items-center gap-2.5 group"
                onClick={() => setIsOpen(false)}
              >
                <div
                  className={`size-9 rounded-xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center shadow-lg ${shadowClass} border`}
                >
                  <YasproEmblem
                    size={18}
                    idPrefix="mob-panel-portal-emblem"
                    className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                  />
                </div>
                <div>
                  <div className="flex items-center">
                    <span
                      className={`font-extrabold tracking-tight text-white transition-colors ${logoHoverClass}`}
                    >
                      YASPRO
                    </span>
                    <span className={`ml-1 text-xs font-bold ${subtitleClass}`}>
                      PRO
                    </span>
                  </div>
                  <span
                    className={`block text-[10px] font-mono tracking-wider uppercase ${subtitleClass}`}
                  >
                    {subtitle}
                  </span>
                </div>
              </Link>

              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <PortalNavIcon
                    name={item.icon}
                    size={18}
                    className={`${iconClass} shrink-0`}
                  />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-4 pb-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-4 min-w-0">
                <div className={`p-1.5 rounded-lg bg-white/5 shrink-0 ${isEmerald ? "text-emerald-400" : "text-purple-400"}`}>
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate" title={userName}>
                    {userName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate" title={userEmail}>
                    {userEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    setIsOpen(false);
                    await signOut();
                    router.push("/login");
                    router.refresh();
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut size={13} className="shrink-0" />
                  Sign Out
                </button>

                <Link
                  href="/"
                  target="_blank"
                  className={`flex items-center gap-1 text-xs shrink-0 transition-colors ${linkAccentClass}`}
                  onClick={() => setIsOpen(false)}
                >
                  Public Site <ArrowUpRight size={12} className="rtl:scale-x-[-1]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
