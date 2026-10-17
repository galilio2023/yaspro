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
  Users,
  Video,
} from "lucide-react";
import type { Booking } from "@/db/schema";
import { BookingPaymentModal } from "@/features/booking/components/BookingPaymentModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  cancelled: XCircle,
  completed: CheckCircle2,
} as const;

const STATUS_COLORS = {
  pending: "text-brand-lavender bg-brand-violet/25 border-brand-mauve/40",
  confirmed: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  cancelled: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  completed: "text-slate-400 bg-slate-500/10 border-slate-500/30",
} as const;

const PAYMENT_COLORS: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  deposit_paid: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  unpaid: "text-brand-lavender bg-brand-violet/25 border-brand-mauve/40",
};

function formatDate(date: Date | string | null, isArabic: boolean) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(isArabic ? "ar-AE" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientBookingCard({ booking }: { booking: Booking }) {
  const { t, dir, isArabic } = useLanguage();
  const [currentBooking, setCurrentBooking] = useState<Booking>(booking);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const isGearRental = !currentBooking.studioId && Array.isArray(currentBooking.equipmentIds) && currentBooking.equipmentIds.length > 0;
  const equipmentCount = Array.isArray(currentBooking.equipmentIds) ? currentBooking.equipmentIds.length : 0;

  const statusKey = currentBooking.status as keyof typeof STATUS_ICONS;
  const StatusIcon = STATUS_ICONS[statusKey] ?? AlertCircle;
  const statusColor = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;
  const statusLabel =
    currentBooking.status === "confirmed"
      ? t("portal.bookings.statusConfirmed")
      : currentBooking.status === "cancelled"
      ? t("portal.bookings.statusCancelled")
      : currentBooking.status === "completed"
      ? t("portal.bookings.statusCompleted")
      : t("portal.bookings.statusPending");

  const paymentColor = PAYMENT_COLORS[currentBooking.paymentStatus] ?? PAYMENT_COLORS.unpaid;
  const paymentLabel =
    currentBooking.paymentStatus === "paid"
      ? t("portal.bookings.paymentPaid")
      : currentBooking.paymentStatus === "deposit_paid"
      ? t("portal.bookings.paymentDepositPaid")
      : t("portal.bookings.paymentUnpaid");

  const sessionTypeTitle = isGearRental
    ? equipmentCount > 0
      ? t("portal.bookings.gearRentalItems", { count: equipmentCount })
      : t("portal.bookings.gearRental")
    : currentBooking.sessionType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const durationLabel = isGearRental
    ? t("portal.bookings.rentalDays", { count: Math.max(1, Math.round(currentBooking.durationHours / 24)) })
    : t("portal.bookings.sessionDuration", { hours: currentBooking.durationHours, count: currentBooking.headcount });

  const handlePaymentSuccess = (paymentStatus: "deposit_paid" | "paid", transactionId: string) => {
    setCurrentBooking((prev) => ({
      ...prev,
      paymentStatus,
      paymentReference: transactionId,
      status: prev.status === "pending" ? "confirmed" : prev.status,
    }));
  };

  return (
    <div dir={dir} className="hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0">
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Column: Title, Reference, Date */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">
              {sessionTypeTitle}
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10" dir="ltr">
              #{currentBooking.referenceCode}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-medium" dir="ltr">
            {formatDate(currentBooking.scheduledAt, isArabic)}
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

          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${paymentColor}`}>
            {paymentLabel}
          </span>

          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
            <StatusIcon size={10} />
            {statusLabel}
          </span>

          {/* Settle Online Action */}
          {currentBooking.paymentStatus === "unpaid" && (
            <button
              type="button"
              onClick={() => setIsPaymentOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              title={t("portal.bookings.payOnlineTitle")}
            >
              <CreditCard size={12} />
              <span>{t("portal.bookings.payOnline")}</span>
            </button>
          )}

          {/* Expand Call Sheet Details */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? t("portal.bookings.collapseCallSheet") : t("portal.bookings.viewCallSheet")}
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
              <FileText size={13} className="text-brand-lavender" />
              <span>{t("portal.bookings.callSheetTitle")}</span>
            </div>
            {currentBooking.paymentReference && (
              <span className="text-[10px] font-mono text-emerald-400" dir="ltr">
                Txn Ref: {currentBooking.paymentReference}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t("portal.bookings.crewHeadcount")}</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Users size={12} className="text-stone-300" />
                <span>{t("portal.bookings.teamMembers", { count: currentBooking.headcount })}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t("portal.bookings.postServices")}</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Sparkles size={12} className="text-brand-lavender" />
                <span>
                  {[
                    currentBooking.needsEditing && t("portal.bookings.editing"),
                    currentBooking.needsColorGrading && t("portal.bookings.colorGrading"),
                    currentBooking.needsSoundMastering && t("portal.bookings.soundMastering"),
                  ].filter(Boolean).join(", ") || t("portal.bookings.standardIngest")}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">{t("portal.bookings.allocatedStage")}</div>
              <div className="font-semibold text-white mt-0.5 flex items-center gap-1">
                <Video size={12} className="text-brand-lavender" />
                <span>{currentBooking.studioId ? t("portal.bookings.soundstageFacility") : t("portal.bookings.gearDispatch")}</span>
              </div>
            </div>
          </div>

          {currentBooking.specialRequests && (
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wide mb-0.5">{t("portal.bookings.specialRequestsTitle")}</span>
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
