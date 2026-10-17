"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Film,
  Users,
  Camera,
  CalendarCheck,
  Database,
  UserCheck,
  MessageSquare,
  Layers,
  Radio,
  ArrowUpRight,
  Sparkles,
  Settings,
  Mic,
  CalendarOff,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
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

interface AdminMobileNavProps {
  adminName: string;
}

export function AdminMobileNav({ adminName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile Top Bar — hidden on md+ */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0c0b10]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <BrandLogo href="/admin" />
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-mauve/15 text-brand-mauve border border-brand-mauve/30 shrink-0">
            {t("admin.badge")}
          </span>
        </div>

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
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#0c0b10] border-r rtl:border-r-0 rtl:border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-left rtl:slide-in-from-right duration-200">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <BrandLogo href="/admin" />
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-mauve/15 text-brand-mauve border border-brand-mauve/30 shrink-0">
                  {t("admin.badge")}
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
                    onClick={() => setIsOpen(false)}
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

            {/* Footer */}
            <div className="px-4 pb-6 pt-4 border-t border-white/10">
              <div className="p-3 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 text-xs">
                <div className="flex items-center gap-2 text-brand-lavender font-medium">
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
                  className="flex items-center gap-1 text-brand-mauve hover:text-brand-lavender shrink-0"
                  onClick={() => setIsOpen(false)}
                >
                  {t("admin.publicSite")} <ArrowUpRight size={12} className="rtl:scale-x-[-1]" />
                </Link>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end">
                <AdminSignOutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
