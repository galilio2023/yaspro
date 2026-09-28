import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Film,
  Users,
  Camera,
  CalendarCheck,
  FileSpreadsheet,
  ArrowUpRight,
  Database,
  UserCheck,
  MessageSquare,
  Layers,
  Radio,
} from "lucide-react";

export const metadata = {
  title: "Admin CMS | Yas Productions",
  description: "Enterprise content & operations management backed by Neon PostgreSQL and Drizzle ORM.",
};

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let shouldRedirect = false;
  let adminName = "System Administrator";

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("ep-xxx")) {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session || (session.user as { role?: string }).role !== "admin") {
        shouldRedirect = true;
      } else {
        adminName = session.user.name || "Administrator";
      }
    } catch (err) {
      console.error("Admin layout auth check error:", err);
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    redirect("/login?error=admin_required");
  }
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-purple-600 selection:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
                Y
              </div>
              <div>
                <span className="font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                  YasPro CMS
                </span>
                <span className="block text-[10px] text-purple-400 font-mono tracking-wider uppercase">
                  Neon • Drizzle
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <Icon size={18} className="text-purple-400/80 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Database Status Footer */}
        <div className="pt-6 border-t border-white/10 mt-6">
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
            <span className="flex items-center gap-1.5 text-slate-300 font-medium truncate max-w-[130px]" title={adminName}>
              <UserCheck size={14} className="text-emerald-400 shrink-0" />
              {adminName}
            </span>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 shrink-0"
            >
              Public Site <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
