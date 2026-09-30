"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  LayoutDashboard,
  Film,
  Users,
  Camera,
  CalendarCheck,
  FileSpreadsheet,
  Database,
  UserCheck,
  MessageSquare,
  Layers,
  Radio,
  ArrowUpRight,
} from "lucide-react";
import { YasproEmblem } from "@/components/ui/YasproEmblem";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Accounts", icon: UserCheck },
  { href: "/admin/inquiries", label: "Inquiries & Leads", icon: MessageSquare },
  { href: "/admin/studios", label: "Soundstages & Rates", icon: Layers },
  { href: "/admin/bookings", label: "Studio Bookings", icon: CalendarCheck },
  { href: "/admin/rfps", label: "Enterprise RFPs", icon: FileSpreadsheet },
  { href: "/admin/broadcast", label: "Broadcast & OB Van", icon: Radio },
  { href: "/admin/gear", label: "Gear & Equipment", icon: Camera },
  { href: "/admin/projects", label: "Projects CMS", icon: Film },
  { href: "/admin/influencers", label: "Creators CMS", icon: Users },
];

interface AdminMobileNavProps {
  adminName: string;
}

export function AdminMobileNav({ adminName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar — hidden on md+ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/30">
            <YasproEmblem size={16} idPrefix="mob-emblem" className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
              YASPRO
            </span>
            <span className="ml-1 text-xs font-bold text-purple-400">CMS</span>
          </div>
        </Link>

        <button
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
                <div className="size-9 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/25 border border-purple-400/30">
                  <YasproEmblem size={18} idPrefix="mob-panel-emblem" className="filter drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">
                      YASPRO
                    </span>
                    <span className="ml-1 text-xs font-bold text-purple-400">CMS</span>
                  </div>
                  <span className="block text-[10px] text-purple-400 font-mono tracking-wider uppercase">
                    Neon • Drizzle
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                  >
                    <Icon size={18} className="text-purple-400/80 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-4 pb-6 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs">
                <div className="flex items-center gap-2 text-purple-300 font-medium">
                  <Database size={14} className="text-purple-400" />
                  <span>PostgreSQL Connection</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connected to Neon serverless database with automated fallback.
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <span
                  className="flex items-center gap-1.5 text-slate-300 font-medium truncate max-w-[130px]"
                  title={adminName}
                >
                  <UserCheck size={14} className="text-emerald-400 shrink-0" />
                  {adminName}
                </span>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 shrink-0"
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
