import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBookings } from "@/lib/cms-actions";
import Link from "next/link";
import {
  CalendarCheck,
  DollarSign,
  Layers,
  Clock,
  ArrowRight,
  Sparkles,
  Camera,
  Headphones,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import type { Booking } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Client Portal",
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  },
} as const;

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSessionType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function computeStats(bookings: Booking[]) {
  const totalBookings = bookings.length;
  const activeSessions = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  ).length;
  const amountSpent = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === "pending" || b.status === "confirmed") &&
        b.scheduledAt &&
        new Date(b.scheduledAt) > new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    );
  const nextSession = upcoming[0]?.scheduledAt ?? null;

  return { totalBookings, activeSessions, amountSpent, nextSession };
}

export default async function PortalDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/portal");

  const bookings = await getClientBookings(session.user.id);
  const { totalBookings, activeSessions, amountSpent, nextSession } =
    computeStats(bookings);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900 border border-emerald-500/20 backdrop-blur-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <ShieldCheck size={14} /> Verified Client Account
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Welcome back, {session.user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Your production hub — manage sessions, track invoices, and reach your
          concierge from one place.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
            <Layers size={14} className="text-emerald-400" /> Total Bookings
          </div>
          <div className="text-3xl font-extrabold text-white">{totalBookings}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
            <CalendarCheck size={14} className="text-cyan-400" /> Active Sessions
          </div>
          <div className="text-3xl font-extrabold text-white">{activeSessions}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
            <DollarSign size={14} className="text-amber-400" /> Amount Spent
          </div>
          <div className="text-2xl font-extrabold text-white">
            {amountSpent > 0
              ? `${amountSpent.toLocaleString()} AED`
              : "—"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
            <Clock size={14} className="text-purple-400" /> Next Session
          </div>
          <div className="text-sm font-bold text-white">
            {nextSession ? formatDate(nextSession) : "None scheduled"}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/studio-booking"
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group"
          >
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Book Studio</div>
              <div className="text-[11px] text-slate-400">Reserve a soundstage</div>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
          </Link>

          <Link
            href="/shop"
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group"
          >
            <div className="size-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
              <Camera size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Rent Gear</div>
              <div className="text-[11px] text-slate-400">Cinema & broadcast equipment</div>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
          </Link>

          <Link
            href="/portal/support"
            className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group"
          >
            <div className="size-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
              <Headphones size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Contact Concierge</div>
              <div className="text-[11px] text-slate-400">Priority production support</div>
            </div>
            <ArrowRight size={16} className="ml-auto text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900/10 via-slate-900 to-slate-900 border border-emerald-500/20 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarCheck size={16} className="text-emerald-400" /> Recent Sessions
          </h3>
          <Link
            href="/portal/bookings"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight size={12} className="rtl:rotate-180" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center px-6">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={20} className="text-slate-500" />
            </div>
            <p className="text-xs text-slate-400 mb-3">No sessions booked yet.</p>
            <Link
              href="/studio-booking"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Book your first session <ArrowRight size={12} className="rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentBookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = cfg?.icon ?? AlertCircle;
              return (
                <div
                  key={b.id}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {formatSessionType(b.sessionType)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        #{b.referenceCode}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400" dir="ltr">
                      {formatDate(b.scheduledAt)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {b.durationHours}h · {b.headcount} person
                      {b.headcount !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-white" dir="ltr">
                      {Number(b.totalAmount).toLocaleString()} {b.currency}
                    </span>
                    {cfg && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.color}`}
                      >
                        <StatusIcon size={10} />
                        {cfg.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
