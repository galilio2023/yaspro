import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBookings } from "@/lib/cms-actions";
import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import type { Booking } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Bookings | Client Portal" };

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
} as const;

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  deposit_paid: { label: "Deposit Paid", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  unpaid: { label: "Unpaid", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatSessionType(type: string, isGearRental: boolean, equipmentCount: number) {
  if (isGearRental) {
    return equipmentCount > 0 ? `Cinema Gear Rental (${equipmentCount} items)` : "Cinema Gear Rental";
  }
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function BookingRow({ b }: { b: Booking }) {
  const isGearRental = !b.studioId && Array.isArray(b.equipmentIds) && b.equipmentIds.length > 0;
  const equipmentCount = Array.isArray(b.equipmentIds) ? b.equipmentIds.length : 0;
  const cfg = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg?.icon ?? AlertCircle;
  const payCfg = PAYMENT_CONFIG[b.paymentStatus] ?? PAYMENT_CONFIG.unpaid;
  const durationLabel = isGearRental
    ? `${Math.max(1, Math.round(b.durationHours / 24))} day(s) rental`
    : `${b.durationHours}h · ${b.headcount} person${b.headcount !== 1 ? "s" : ""}`;

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">
            {formatSessionType(b.sessionType, isGearRental, equipmentCount)}
          </span>
          <span className="text-[10px] font-mono text-slate-500">#{b.referenceCode}</span>
        </div>
        <div className="text-[11px] text-slate-400" dir="ltr">{formatDate(b.scheduledAt)}</div>
        <div className="text-[11px] text-slate-500">
          {durationLabel}
          {b.propsNotes ? ` · ${b.propsNotes}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <span className="text-xs font-bold text-white" dir="ltr">
          {Number(b.totalAmount).toLocaleString()} {b.currency}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${payCfg.color}`}>
          {payCfg.label}
        </span>
        {cfg && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.color}`}>
            <StatusIcon size={10} />{cfg.label}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/portal/bookings");

  const bookings = await getClientBookings(session.user.id);
  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const past = bookings.filter((b) => b.status === "completed" || b.status === "cancelled");

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Bookings</h1>
        <p className="text-sm text-slate-400 mt-1">All your studio sessions, call sheets, and booking history.</p>
      </div>

      <div className="rounded-3xl bg-gradient-to-r from-emerald-900/10 via-slate-900 to-slate-900 border border-emerald-500/20 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CalendarCheck size={16} className="text-emerald-400" /> Upcoming Sessions
          </h2>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {upcoming.length} active
          </span>
        </div>
        {upcoming.length === 0 ? (
          <div className="py-12 text-center px-6">
            <AlertCircle size={20} className="text-slate-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400 mb-3">No upcoming sessions.</p>
            <Link href="/studio-booking" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Book a session <ArrowRight size={12} className="rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {upcoming.map((b) => <BookingRow key={b.id} b={b} />)}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-slate-400" /> Session History
            </h2>
            <span className="text-[11px] text-slate-400">{past.length} sessions</span>
          </div>
          <div className="divide-y divide-white/5 opacity-80">
            {past.map((b) => <BookingRow key={b.id} b={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}
