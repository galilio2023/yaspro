import React from "react";
import Link from "next/link";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { PortalSidebarClient } from "@/components/portal/PortalSidebarClient";
import { PortalNavIcon } from "@/components/portal/PortalNavIcon";
import type { PortalNavItem } from "@/components/portal/types";

interface PortalSidebarProps {
  navItems: PortalNavItem[];
  userName: string;
  userEmail: string;
  userRole: "client" | "enterprise";
  accentColor: "purple" | "emerald" | "amber";
}

export function PortalSidebar({
  navItems,
  userName,
  userEmail,
  userRole,
  accentColor,
}: PortalSidebarProps) {
  const isEmerald = accentColor === "emerald";

  const gradientClass = isEmerald
    ? "from-emerald-600 via-emerald-700 to-emerald-800"
    : "from-amber-500 via-amber-600 to-amber-700";

  const shadowClass = isEmerald
    ? "shadow-emerald-500/25 border-emerald-400/30"
    : "shadow-amber-500/20 border-amber-500/30";

  const subtitleClass = isEmerald ? "text-emerald-400" : "text-amber-400";

  const iconClass = isEmerald ? "text-emerald-400/80" : "text-amber-400/80";

  const logoHoverClass = isEmerald
    ? "group-hover:text-emerald-300"
    : "group-hover:text-amber-300";

  const subtitle = userRole === "client" ? "CLIENT PORTAL" : "ENTERPRISE VAULT";

  return (
    <aside className="hidden md:flex w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shrink-0 flex-col justify-between">
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className={`size-9 rounded-xl bg-gradient-to-tr ${gradientClass} flex items-center justify-center shadow-lg ${shadowClass} border`}
            >
              <YasproEmblem
                size={18}
                idPrefix="portal-emblem"
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
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
      </div>

      {/* Footer: user info + sign out (client component) */}
      <PortalSidebarClient
        userName={userName}
        userEmail={userEmail}
        accentColor={accentColor}
      />
    </aside>
  );
}
