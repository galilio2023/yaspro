import React from "react";
import Link from "next/link";
import {
  Film,
  Users,
  Camera,
  CalendarCheck,
  ArrowRight,
  TrendingUp,
  Server,
  Layers,
  UserCheck,
  MessageSquare,
  Radio,
  ExternalLink,
} from "lucide-react";
import { getCmsOverviewStats } from "@/lib/cms-actions";

export default async function AdminDashboardPage() {
  const stats = await getCmsOverviewStats();
  const metricsUnavailable = stats.status === "unavailable";

  const METRIC_CARDS = [
    {
      title: "Registered Users",
      value: stats.totalUsers,
      badge: `${stats.clientUsers} Clients`,
      description: "Verified media clients & accounts",
      href: "/admin/users",
      icon: UserCheck,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
    {
      title: "Client Leads & Inquiries",
      value: stats.totalInquiries,
      badge: `${stats.pendingInquiries || 0} Action Req`,
      description: "Contact briefs, quotes & RFPs",
      href: "/admin/inquiries",
      icon: MessageSquare,
      color: "from-brand-violet/20 to-slate-900/60 border-brand-mauve/20 text-brand-lavender",
    },
    {
      title: "Soundstages & Rates",
      value: stats.totalStudios,
      badge: `${stats.activeStudios} Active Stages`,
      description: "Hourly rates, capacity & amenities",
      href: "/admin/studios",
      icon: Layers,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
    {
      title: "Studio Bookings",
      value: stats.totalBookings,
      badge: `${stats.pendingBookings} Pending`,
      description: "Calendar sessions & call sheets",
      href: "/admin/bookings",
      icon: CalendarCheck,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
    {
      title: "Broadcast & OB Van",
      value: "Live Edge",
      badge: "ST-2110 PTP",
      description: "Ka-band telemetry & C2C ingest",
      href: "/admin/broadcast",
      icon: Radio,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Gear & Studio Inventory",
      value: stats.totalGear,
      description: "Cinema cameras, lighting, & kits",
      href: "/admin/gear",
      icon: Camera,
      color: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/30 text-emerald-300",
    },
    {
      title: "Projects Portfolio",
      value: stats.totalProjects,
      description: "Live commercial & government films",
      href: "/admin/projects",
      icon: Film,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
    {
      title: "Creator Roster",
      value: stats.totalInfluencers,
      description: "Mawthooq licensed Arab influencers",
      href: "/admin/influencers",
      icon: Users,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-[#0c0b10] border border-brand-mauve/20 backdrop-blur-xl shadow-xl shadow-brand-violet/5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-mauve/10 border border-brand-mauve/30 text-brand-mauve text-xs font-mono uppercase tracking-wider mb-2.5">
            <Server size={12} /> Neon Serverless + Drizzle ORM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Operational Management Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Real-time operations for Yas Productions soundstages, creator roster,
            cinema fleet inventory, and live client briefs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-2 text-slate-200"
          >
            <span>Live Site</span>
            <ExternalLink size={13} className="rtl:rotate-180" />
          </Link>
          <Link
            href="/admin/projects"
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Manage Content</span>
            <Layers size={14} />
          </Link>
        </div>
      </div>

      {metricsUnavailable && (
        <div role="status" className="p-4 rounded-xl border border-brand-mauve/30 bg-brand-mauve/10 text-brand-mauve text-xs">
          Current metrics are unavailable. Refresh this page to retry.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-5 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-md hover:scale-[1.02] transition-all flex flex-col justify-between group shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                {card.badge && !metricsUnavailable && (
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-mauve/20 text-brand-mauve border border-brand-mauve/30 font-mono">
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white block font-mono">
                  {metricsUnavailable ? "Unavailable" : card.value}
                </span>
                <span className="font-semibold text-slate-200 text-sm mt-1 block group-hover:text-white">
                  {card.title}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{card.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                <span>Open Section</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform text-brand-mauve" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Database Quick Actions & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <TrendingUp size={16} className="text-brand-mauve" />
            <span>Fast Management Tasks</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link
              href="/admin/projects"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-mauve block mb-1">Add Portfolio Film</span>
              <span className="text-slate-400">Add high-resolution project with 4K Vimeo embedding</span>
            </Link>
            <Link
              href="/admin/influencers"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-mauve block mb-1">Sync Creator Media Kit</span>
              <span className="text-slate-400">Update follower stats & Mawthooq compliance records</span>
            </Link>
            <Link
              href="/admin/gear"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-emerald-300 block mb-1">Update Rental Rates</span>
              <span className="text-slate-400">Manage daily rates, camera kits, and equipment stock</span>
            </Link>
            <Link
              href="/admin/bookings"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-lavender block mb-1">Studio Booking Board</span>
              <span className="text-slate-400">Review schedule allocations & automated call sheets</span>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Server size={16} className="text-emerald-400" />
            <span>Drizzle & Neon Engine Architecture</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span>Database Provider</span>
              <span className="font-mono text-brand-mauve">Neon Serverless (PostgreSQL 16)</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span>Type-Safe ORM</span>
              <span className="font-mono text-emerald-300">Drizzle ORM v0.45</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span>Seed & Catalog Sync</span>
              <span className="font-mono text-brand-mauve">npm run db:push / npm run seed</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span>Availability Strategy</span>
              <span className="font-mono text-brand-mauve">Dual-layer (DB First + Instant Fallback)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
