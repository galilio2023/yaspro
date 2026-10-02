"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import {
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarUserMenuProps {
  user: {
    name: string;
    email?: string;
    role?: string;
  };
}

export function NavbarUserMenu({ user }: NavbarUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const role = user.role || "client";
  const firstName = user.name?.split(" ")[0] || "Account";

  const portalHref =
    role === "admin"
      ? "/admin"
      : role === "enterprise"
      ? "/enterprise/portal"
      : "/portal";

  const bookingsHref = role === "admin" ? "/admin/bookings" : "/portal/bookings";

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch {
      // ignore network signout failure
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-amber-500/40 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer",
          isOpen && "border-amber-500/50 bg-white/[0.08] text-white"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User navigation menu"
      >
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="max-w-[100px] truncate">{firstName}</span>
        <ChevronDown
          size={11}
          className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-scale-in text-xs">
          {/* User Info Header */}
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="font-semibold text-white truncate">{user.name}</div>
            {user.email && (
              <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
            )}
            <div className="mt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold",
                  role === "admin"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : role === "enterprise"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                )}
              >
                <Shield size={9} />
                {role} account
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-0.5">
            <Link
              href={portalHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LayoutDashboard size={14} className="text-amber-400" />
              <span>{role === "admin" ? "Admin CMS" : role === "enterprise" ? "Enterprise Vault" : "Client Portal"}</span>
            </Link>

            <Link
              href={bookingsHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <CalendarCheck size={14} className="text-amber-400" />
              <span>My Bookings</span>
            </Link>

            {role !== "admin" && (
              <Link
                href="/portal/invoices"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FileSpreadsheet size={14} className="text-amber-400" />
                <span>Billing & Invoices</span>
              </Link>
            )}

            <Link
              href="/portal/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings size={14} className="text-slate-400" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-white/10 mt-1 pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
