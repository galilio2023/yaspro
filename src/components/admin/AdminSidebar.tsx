"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Users,
  Camera,
  CalendarCheck,
  ArrowUpRight,
  Database,
  UserCheck,
  MessageSquare,
  Layers,
  Radio,
} from "lucide-react";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { AdminSignOutButton } from "./AdminSignOutButton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Accounts", icon: UserCheck },
  { href: "/admin/inquiries", label: "Inquiries & Leads", icon: MessageSquare },
  { href: "/admin/studios", label: "Soundstages & Rates", icon: Layers },
  { href: "/admin/bookings", label: "Studio Bookings", icon: CalendarCheck },
  { href: "/admin/broadcast", label: "Broadcast & OB Van", icon: Radio },
  { href: "/admin/gear", label: "Gear & Equipment", icon: Camera },
  { href: "/admin/projects", label: "Projects CMS", icon: Film },
  { href: "/admin/influencers", label: "Creators CMS", icon: Users },
];

export interface AdminSidebarProps {
  adminName: string;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-[#0c0b10] backdrop-blur-xl p-4 sm:p-6 shrink-0 flex-col justify-between">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-brand-violet/30 border border-brand-mauve/40 flex items-center justify-center shadow-lg shadow-brand-violet/20">
              <YasproEmblem size={18} idPrefix="admin-emblem" />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-extrabold tracking-tight text-white group-hover:text-brand-mauve-soft transition-colors">
                  YASPRO
                </span>
                <span className="ml-1 text-xs font-bold text-brand-mauve">OPS</span>
              </div>
              <span className="block text-[10px] text-brand-mauve-soft font-mono tracking-wider uppercase">
                Studio Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-brand-violet/25 text-white border border-brand-mauve/30 font-semibold shadow-md shadow-brand-violet/15"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-brand-mauve" : "text-brand-mauve-soft"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Database Status Footer */}
      <div className="pt-6 border-t border-white/10 mt-6">
        <div className="p-3 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 text-xs">
          <div className="flex items-center gap-2 text-brand-mauve-soft font-medium">
            <Database size={14} className="text-brand-mauve" />
            <span>Production Database</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Connected to Neon serverless database with automated telemetry.
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
            className="flex items-center gap-1 text-brand-mauve hover:text-brand-mauve-soft shrink-0"
          >
            Public Site <ArrowUpRight size={12} className="rtl:scale-x-[-1]" />
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end">
          <AdminSignOutButton />
        </div>
      </div>
    </aside>
  );
}
