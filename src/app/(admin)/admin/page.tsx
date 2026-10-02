import React from "react";
import Link from "next/link";
import {
  Film,
  Users,
  Camera,
  CalendarCheck,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Server,
  Layers,
  UserCheck,
  MessageSquare,
  Radio,
} from "lucide-react";
import { getCmsOverviewStats } from "@/lib/cms-actions";

export default async function AdminDashboardPage() {
  const stats = await getCmsOverviewStats();

  const METRIC_CARDS = [
    {
      title: "Registered Users",
      value: stats.totalUsers,
      badge: `${stats.clientUsers} Clients`,
      description: "Verified media clients & accounts",
      href: "/admin/users",
      icon: UserCheck,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Client Leads & Inquiries",
      value: stats.totalInquiries,
      badge: `${stats.pendingInquiries || 0} Action Req`,
      description: "Contact briefs, quotes & RFPs",
      href: "/admin/inquiries",
      icon: MessageSquare,
      color: "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-300",
    },
    {
      title: "Soundstages & Rates",
      value: stats.totalStudios,
      badge: `${stats.activeStudios} Active Stages`,
      description: "Hourly rates, capacity & amenities",
      href: "/admin/studios",
      icon: Layers,
      color: "from-amber-600/20 to-yellow-600/10 border-amber-600/30 text-amber-300",
    },
    {
      title: "Studio Bookings",
      value: stats.totalBookings,
      badge: `${stats.pendingBookings} Pending`,
      description: "Calendar sessions & call sheets",
      href: "/admin/bookings",
      icon: CalendarCheck,
      color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Enterprise RFPs & Tenders",
      value: stats.totalRfps,
      badge: `${stats.pendingRfps} Review Needed`,
      description: "Government & VIP broadcast tenders",
      href: "/admin/rfps",
      icon: FileSpreadsheet,
      color: "from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-300",
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
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Creator Roster",
      value: stats.totalInfluencers,
      description: "Mawthooq licensed Arab influencers",
      href: "/admin/influencers",
      icon: Users,
      color: "from-amber-400/20 to-amber-500/10 border-amber-400/30 text-amber-300",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-[#0c0b10] border border-amber-500/20 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Server size={12} /> Neon Serverless + Drizzle ORM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Operational Management Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time management for all Yas Productions media assets, creator partnerships,
            cinema gear rentals, and enterprise RFP workflows.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/enterprise/portal"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-colors flex items-center gap-2 text-slate-200"
          >
            Enterprise Demo Vault <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
          <Link
            href="/admin/projects"
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold transition-all flex items-center gap-2"
          >
            Manage Content <Layers size={14} />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-md hover:scale-[1.02] transition-all flex flex-col justify-between group`}
            >
              <div className="flex items-start justify-between">
                <div className="size-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={22} />
                </div>
                {card.badge && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {card.badge}
                  </span>
                )}
              </div>

              <div className="mt-6">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white block">
                  {card.value}
                </span>
                <span className="font-semibold text-slate-200 text-base mt-1 block group-hover:text-white">
                  {card.title}
                </span>
                <p className="text-xs text-slate-400 mt-1">{card.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-slate-300 group-hover:text-white">
                <span>View & Manage</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Database Quick Actions & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <TrendingUp size={16} className="text-amber-400" />
            <span>Fast Management Tasks</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link
              href="/admin/projects"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-amber-300 block mb-1">Add Portfolio Film</span>
              <span className="text-slate-400">Add high-resolution project with 4K Vimeo embedding</span>
            </Link>
            <Link
              href="/admin/influencers"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-amber-300 block mb-1">Sync Creator Media Kit</span>
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
              href="/admin/rfps"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-stone-300 block mb-1">Tender Status Board</span>
              <span className="text-slate-400">Update milestone approvals & client notifications</span>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Server size={16} className="text-emerald-400" />
            <span>Drizzle & Neon Engine Architecture</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span>Database Provider</span>
              <span className="font-mono text-amber-300">Neon Serverless (PostgreSQL 16)</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span>Type-Safe ORM</span>
              <span className="font-mono text-emerald-300">Drizzle ORM v0.45</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span>Seed & Catalog Sync</span>
              <span className="font-mono text-amber-300">npm run db:push / npm run seed</span>
            </li>
            <li className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
              <span>Availability Strategy</span>
              <span className="font-mono text-amber-300">Dual-layer (DB First + Instant Fallback)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
