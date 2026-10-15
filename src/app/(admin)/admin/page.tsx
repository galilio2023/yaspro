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
  Sparkles,
  CreditCard,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { getCmsOverviewStats } from "@/lib/cms-actions";
import { formatCurrency } from "@/lib/utils";

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
      badge: `${stats.retainerLeads || 0} Retainers · ${stats.pendingInquiries || 0} Open`,
      description: "Social retainers, briefs & RFPs",
      href: "/admin/inquiries",
      icon: MessageSquare,
      color: "from-brand-violet/20 to-slate-900/60 border-brand-mauve/20 text-brand-lavender",
    },
    {
      title: "Turnkey Offers & Bundles",
      value: stats.offerBookings || 0,
      badge: "Turnkey Packages",
      description: "Packaged productions & live mixing",
      href: "/admin/offers",
      icon: Sparkles,
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
      title: "Soundstages & Rates",
      value: stats.totalStudios,
      badge: `${stats.activeStudios} Active Stages`,
      description: "Hourly rates, capacity & amenities",
      href: "/admin/studios",
      icon: Layers,
      color: "from-brand-violet/25 to-brand-violet/10 border-brand-mauve/30 text-brand-mauve",
    },
    {
      title: "Broadcast & OB Van",
      value: `${stats.broadcastLeads || 0} RFPs`,
      badge: "Ka-Band Telemetry",
      description: "Mobile live edge broadcast vehicle",
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
            cinema fleet inventory, turnkey offers, and live client briefs.
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
            href="/admin/offers"
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Manage Offers</span>
            <Sparkles size={14} />
          </Link>
        </div>
      </div>

      {metricsUnavailable && (
        <div role="status" className="p-4 rounded-xl border border-brand-mauve/30 bg-brand-mauve/10 text-brand-mauve text-xs">
          Current metrics are unavailable. Refresh this page to retry.
        </div>
      )}

      {/* Financial Telemetry Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-brand-violet/20 via-slate-900/80 to-[#0c0b10] border border-brand-mauve/30 shadow-xl shadow-brand-violet/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand-mauve-soft text-xs font-mono font-semibold uppercase tracking-wider">
            <DollarSign size={14} className="text-brand-mauve" />
            <span>Total Gross Booked Pipeline</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {metricsUnavailable ? "Unavailable" : formatCurrency(stats.totalBookedRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Across soundstage sessions, turnkey bundles, and gear orders
          </p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-s border-white/10 md:ps-6 pt-3 md:pt-0">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Settled &amp; Paid Revenue</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {metricsUnavailable ? "Unavailable" : formatCurrency(stats.paidRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Verified payments captured through Ziina Payment Intent
          </p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-s border-white/10 md:ps-6 pt-3 md:pt-0">
          <div className="flex items-center gap-2 text-brand-lavender text-xs font-mono font-semibold uppercase tracking-wider">
            <CreditCard size={14} className="text-brand-mauve" />
            <span>Active Financial Gateways</span>
          </div>
          <div className="text-sm font-semibold text-white mt-1">
            Ziina Digital Direct + Apple Pay
          </div>
          <p className="text-[11px] text-slate-400">
            Dual-currency AED settlement with automatic call sheet issue
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
              href="/admin/offers"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-mauve block mb-1">Manage Turnkey Offers</span>
              <span className="text-slate-400">Configure bundles, promo codes, and blackout hours</span>
            </Link>
            <Link
              href="/admin/inquiries?filter=social_media_package"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-lavender block mb-1">Review Retainer Leads</span>
              <span className="text-slate-400">High-value commercial social media subscriptions</span>
            </Link>
            <Link
              href="/admin/projects"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-brand-mauve block mb-1">Add Portfolio Film</span>
              <span className="text-slate-400">Set deliverables, tech stack, and 4K Vimeo stream</span>
            </Link>
            <Link
              href="/admin/broadcast"
              className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors block"
            >
              <span className="font-semibold text-emerald-300 block mb-1">OB Van &amp; Broadcast</span>
              <span className="text-slate-400">Manage live telemetry and broadcast command feeds</span>
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Server size={16} className="text-emerald-400" />
            <span>Drizzle &amp; Neon Engine Architecture</span>
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
              <span>Seed &amp; Catalog Sync</span>
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
