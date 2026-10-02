import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientBookings } from "@/lib/cms-actions";
import Link from "next/link";
import { FileSpreadsheet, CheckCircle2, AlertCircle, MessageSquare, ArrowRight } from "lucide-react";
import type { Booking } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing & Invoices | Client Portal" };

const PAYMENT_CONFIG: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid in Full", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  deposit_paid: { label: "Deposit Paid", color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" },
  unpaid: { label: "Awaiting Payment", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
};

function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function InvoiceRow({ b }: { b: Booking }) {
  const payCfg = PAYMENT_CONFIG[b.paymentStatus] ?? PAYMENT_CONFIG.unpaid;
  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono font-bold text-slate-300">#{b.referenceCode}</span>
          <span className="text-[10px] text-slate-500">{formatDate(b.scheduledAt)}</span>
        </div>
        {b.paymentReference && (
          <div className="text-[10px] text-slate-500 font-mono">Ref: {b.paymentReference}</div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-extrabold text-white" dir="ltr">
          {Number(b.totalAmount).toLocaleString()} {b.currency}
        </span>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${payCfg.color}`}>
          {b.paymentStatus === "paid" && <CheckCircle2 size={10} />}
          {payCfg.label}
        </span>
      </div>
    </div>
  );
}

export default async function InvoicesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/portal/invoices");

  const bookings = await getClientBookings(session.user.id);
  const withAmounts = bookings.filter((b) => Number(b.totalAmount) > 0);
  // Payment records store a status/reference, but no received deposit amount.
  const summariesIncomplete = withAmounts.some((b) => b.paymentStatus === "deposit_paid");
  const totalPaid = withAmounts
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);
  const totalOutstanding = withAmounts
    .filter((b) => b.paymentStatus === "unpaid")
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Billing & Invoices</h1>
        <p className="text-sm text-slate-400 mt-1">Payment history and outstanding balances for your sessions.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 flex flex-col gap-1">
          <div className="text-[11px] text-emerald-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {summariesIncomplete ? "Known Paid" : "Total Paid"}
          </div>
          <div className="text-2xl font-extrabold text-white" dir="ltr">{totalPaid.toLocaleString()} AED</div>
        </div>
        <div className="p-5 rounded-2xl bg-amber-900/20 border border-amber-500/20 flex flex-col gap-1">
          <div className="text-[11px] text-amber-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
            <AlertCircle size={12} /> {summariesIncomplete ? "Known Outstanding" : "Outstanding"}
          </div>
          <div className="text-2xl font-extrabold text-white" dir="ltr">{totalOutstanding.toLocaleString()} AED</div>
        </div>
      </div>

      {summariesIncomplete && (
        <p className="text-sm text-amber-300" role="status">
          These summaries are incomplete: received deposits and remaining balances for deposit-paid bookings are unavailable.
          The amounts shown exclude those bookings. Contact your concierge for complete account totals.
        </p>
      )}

      {/* Tax invoice notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/60 border border-white/10">
        <MessageSquare size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          For official VAT tax invoices, contact your production concierge directly.{" "}
          <a href="https://wa.me/971554010465" target="_blank" rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
            WhatsApp +971 55 401 0465
          </a>
          {" "}or{" "}
          <Link href="/portal/support" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            open a support ticket
          </Link>.
        </div>
      </div>

      {/* Invoice list */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-amber-400" /> All Invoices
          </h2>
          <span className="text-[11px] text-slate-400">{withAmounts.length} records</span>
        </div>
        {withAmounts.length === 0 ? (
          <div className="py-12 text-center px-6">
            <AlertCircle size={20} className="text-slate-500 mx-auto mb-3" />
            <p className="text-xs text-slate-400 mb-3">No billing records yet.</p>
            <Link href="/studio-booking" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Book your first session <ArrowRight size={12} className="rtl:rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {withAmounts.map((b) => <InvoiceRow key={b.id} b={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
