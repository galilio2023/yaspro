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
  Sparkles,
  Settings,
  Mic,
  CalendarOff,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { AdminSignOutButton } from "./AdminSignOutButton";
import { cn } from "@/lib/utils";
import { useLanguage, AppTranslationKey } from "@/components/providers/LanguageProvider";

interface AdminNavItem {
  href: string;
  key: AppTranslationKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: readonly AdminNavItem[] = [
  { href: "/admin", key: "admin.overview", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/offers", key: "admin.offers", label: "Offers & Bundles", icon: Sparkles },
  { href: "/admin/podcast", key: "admin.podcast", label: "Podcast Sets & Addons", icon: Mic },
  { href: "/admin/blackouts", key: "admin.blackouts", label: "Studio Blackouts", icon: CalendarOff },
  { href: "/admin/users", key: "admin.users", label: "Users & Accounts", icon: UserCheck },
  { href: "/admin/inquiries", key: "admin.inquiries", label: "Inquiries & Leads", icon: MessageSquare },
  { href: "/admin/studios", key: "admin.studios", label: "Soundstages & Rates", icon: Layers },
  { href: "/admin/bookings", key: "admin.bookings", label: "Studio Bookings", icon: CalendarCheck },
  { href: "/admin/broadcast", key: "admin.broadcast", label: "Broadcast & OB Van", icon: Radio },
  { href: "/admin/gear", key: "admin.gear", label: "Gear & Equipment", icon: Camera },
  { href: "/admin/projects", key: "admin.projects", label: "Projects CMS", icon: Film },
  { href: "/admin/influencers", key: "admin.creators", label: "Creators CMS", icon: Users },
  { href: "/admin/settings", key: "admin.settings", label: "Settings & Config", icon: Settings },
];

export interface AdminSidebarProps {
  adminName: string;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-r rtl:md:border-r-0 rtl:md:border-l border-white/10 bg-[#0c0b10] backdrop-blur-xl p-4 sm:p-6 shrink-0 flex-col justify-between">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <BrandLogo href="/admin" />
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-mauve/15 text-brand-mauve border border-brand-mauve/30 shrink-0">
              {t("admin.badge")}
            </span>
          </div>
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
                <span>{t(item.key)}</span>
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
            <span>{t("admin.database")}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t("admin.databaseDesc")}
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
            {t("admin.publicSite")} <ArrowUpRight size={12} className="rtl:scale-x-[-1]" />
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end">
          <AdminSignOutButton />
        </div>
      </div>
    </aside>
  );
}
