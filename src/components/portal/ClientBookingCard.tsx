"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  ChevronDown,
  Sparkles,
  Camera,
  Users,
  Video,
} from "lucide-react";
import type { Booking } from "@/db/schema";
import { BookingPaymentModal } from "@/features/booking/components/BookingPaymentModal";
import { cn } from "@/lib/utils";

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
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSessionType(type: string, isGearRental: boolean, equipmentCount: number) {
  if (isGearRental) {
    return equipmentCount > 0 ? `Cinema Gear Rental (${equipmentCount} items)` : "Cinema Gear Rental";
  }
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ClientBookingCard({ booking }: { booking: Booking }) {
  const [currentBooking, setCurrentBooking] = useState<Booking>(booking);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isGearRental = !currentBooking.studioId && Array.isArray(currentBooking.equipmentIds) && currentBooking.equipmentIds.length > 0;
  const equipmentCount = Array.isArray(currentBooking.equipmentIds) ? currentBooking.equipmentIds.length : 0;
  const cfg = STATUS_CONFIG[currentBooking.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = cfg?.icon ?? AlertCircle;
  const payCfg = PAYMENT_CONFIG[currentBooking.paymentStatus] ?? PAYMENT_CONFIG.unpaid;
  const durationLabel = isGearRental
    ? `${Math.max(1, Math.round(currentBooking.durationHours / 24))} day(s) rental`
    : `${currentBooking.durationHours}h · ${currentBooking.headcount} person${currentBooking.headcount !== 1 ? "s" : ""}`;

  const handlePaymentSuccess = (paymentStatus: "deposit_paid" | "paid", transactionId: string) => {
    setCurrentBooking((prev) => ({
      ...prev,
      paymentStatus,
      paymentReference: transactionId,
      status: prev.status === "pending" ? "confirmed" : prev.status,
    }));
  };

  return (
    <div className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0">
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Column: Title, Reference, Date */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">
              {formatSessionType(currentBooking.sessionType, isGearRental, equipmentCount)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              #{currentBooking.referenceCode}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium" dir="ltr">
            {formatDate(currentBooking.scheduledAt)}
          </div>
          <div className="text-[11px] text-slate-500">
            {durationLabel}
            {currentBooking.propsNotes ? ` · ${currentBooking.propsNotes}` : ""}
          </div>
        </div>

        {/* Right Column: Pricing, Badges, Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span className="text-xs font-bold text-white font-mono" dir="ltr">
            {Number(currentBooking.totalAmount).toLocaleString()} {currentBooking.currency}
          </span>

          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${payCfg.color}`}>
            {payCfg.label}
          </span>

          {cfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              <StatusIcon size={10} />
              {cfg.label}
            </span>
          )}

          {/* Settle Online Action */}
          {currentBooking.paymentStatus === "unpaid" && (
            <button
              type="button"
              onClick={() => setIsPaymentOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              title="Pay 50% deposit or full balance"
            >
              <CreditCard size={12} />
              <span>Pay Online</span>
            </button>
          )}

          {/* Expand Call Sheet Details */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? "Collapse call sheet" : "View call sheet & specs"}
            aria-expanded={isExpanded}
          >
            <ChevronDown size={14} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Expanded Call Sheet Drawer */}
      {isExpanded && (
        <div className="px-6 py-4 mx-6 mb-4 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <FileText size={13} className="text-purple-400" />
              <span>Production Call Sheet &amp; Specifications</span>
            </div>
            {currentBooking.paymentReference && (
              <span className="text-[10px] font-mono text-emerald-400">
                Txn Ref: {currentBooking.paymentReference}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Crew &amp; Headcount</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Users size={12} className="text-cyan-400" />
                <span>{currentBooking.headcount} Team Member{currentBooking.headcount > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Post-Production Services</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Sparkles size={12} className="text-purple-400" />
                <span>
                  {[
                    currentBooking.needsEditing && "Editing",
                    currentBooking.needsColorGrading && "Color",
                    currentBooking.needsSoundMastering && "Mastering",
                  ].filter(Boolean).join(", ") || "Standard Ingest"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Allocated Stage / Asset</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Video size={12} className="text-amber-400" />
                <span>{currentBooking.studioId ? "Soundstage Facility" : "Direct Gear Dispatch"}</span>
              </div>
            </div>
          </div>

          {currentBooking.specialRequests && (
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-0.5">Special Requests / Notes</span>
              <p className="text-xs text-slate-300 leading-relaxed">{currentBooking.specialRequests}</p>
            </div>
          )}
        </div>
      )}

      {/* Online Payment Modal */}
      <BookingPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        bookingId={currentBooking.id}
        referenceCode={currentBooking.referenceCode}
        totalAmount={Number(currentBooking.totalAmount)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
