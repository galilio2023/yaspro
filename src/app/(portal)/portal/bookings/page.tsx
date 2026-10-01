import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBookings } from "@/lib/cms-actions";
import Link from "next/link";
import {
  CalendarCheck,
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import { ClientBookingCard } from "@/components/portal/ClientBookingCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Bookings | Client Portal" };

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
            {upcoming.map((b) => (
              <ClientBookingCard key={b.id} booking={b} />
            ))}
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
            {past.map((b) => (
              <ClientBookingCard key={b.id} booking={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
