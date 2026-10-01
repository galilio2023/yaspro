"use client";

import React, { useRef, useCallback } from "react";
import { Printer, X, CheckCircle2 } from "lucide-react";
import type { Booking } from "@/db/schema";
import type { EnrichedBooking } from "@/lib/actions/bookings-rfp-operations";
import { formatCurrency } from "@/lib/utils";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface BookingCallSheetModalProps {
  booking: (Booking & Partial<EnrichedBooking>) | null;
  onClose: () => void;
}

/**
 * Printable production call sheet modal.
 * Extracted from BookingsManager to satisfy the Single Responsibility Principle.
 */
export function BookingCallSheetModal({
  booking,
  onClose,
}: BookingCallSheetModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useFocusTrap({
    isOpen: Boolean(booking),
    onClose: handleClose,
    containerRef: modalRef,
  });

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent print:z-auto">
      {/* Scoped print styles — isolated to this modal */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #call-sheet-printable, #call-sheet-printable * { visibility: visible; }
          #call-sheet-printable {
            position: absolute; left: 0; top: 0;
            width: 100% !important; max-width: 100% !important;
            max-height: none !important; overflow: visible !important;
            box-shadow: none !important; border: none !important;
            background: white !important; color: #0f172a !important;
          }
          #call-sheet-printable * {
            color: #0f172a !important;
            border-color: #cbd5e1 !important;
            background-color: transparent !important;
          }
          #call-sheet-printable .no-print { display: none !important; }
        }
      `}</style>

      <div
        ref={modalRef}
        id="call-sheet-printable"
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-sheet-modal-title"
        tabIndex={-1}
        className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        {/* — Modal Controls — */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 no-print">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
              <YasproEmblem size={16} idPrefix="callsheet-emblem" />
            </div>
            <div>
              <h2
                id="call-sheet-modal-title"
                className="text-base font-bold text-white flex items-center gap-1.5"
              >
                <span>YASPRO</span>
                <span className="text-purple-400 font-normal">Call Sheet</span>
              </h2>
              <span className="text-[10px] font-mono text-purple-400">
                REF: {booking.referenceCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-600/20"
            >
              <Printer size={13} />
              <span>Print Call Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Call Sheet"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* — Print-Only Header — */}
        <div className="hidden print:block pb-4 border-b border-slate-300 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                YasPro Production Call Sheet
              </h1>
              <p className="text-xs text-slate-600">
                {booking.studioName || "Yas Pro Soundstages"} &bull; Dubai Studio City
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-slate-900 block">
                REF: {booking.referenceCode}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Client: {booking.userName || "Direct Client"} {booking.userCompany ? `(${booking.userCompany})` : ""}
              </span>
              {booking.userPhone && (
                <span className="text-[10px] text-slate-500 font-mono block">
                  Tel: {booking.userPhone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* — Call Sheet Content — */}
        <div className="space-y-6 text-xs text-slate-300">
          {/* Client & Production Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Production Client
              </span>
              <span className="font-bold text-white text-sm block">
                {booking.userName || "Direct Client"}
              </span>
              <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-mono">
                {booking.userEmail && <div>Email: {booking.userEmail}</div>}
                {booking.userPhone && <div>Phone: {booking.userPhone}</div>}
                {booking.userCompany && <div>Company: {booking.userCompany}</div>}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Stage Location &amp; Facility
              </span>
              <span className="font-bold text-purple-300 text-sm block">
                {booking.studioName || (booking.equipmentIds && booking.equipmentIds.length > 0 ? "Cinema Gear Dispatch Facility" : "Main Production Stage")}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Yas Pro Production Hub &bull; Dubai Studio City
              </p>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Category: {booking.sessionType.replace(/_/g, " ").toUpperCase()}
              </div>
            </div>
          </div>

          {/* Studio & Date Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            {[
              {
                label: "Shoot Date",
                value: new Date(booking.scheduledAt).toLocaleDateString(),
              },
              {
                label: "Call Time",
                value: new Date(booking.scheduledAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
              { label: "Duration", value: `${booking.durationHours} Hours` },
              { label: "Headcount", value: `${booking.headcount} Pax` },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  {label}
                </span>
                <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Session Type & Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Production Category
              </span>
              <span className="font-bold text-white text-sm capitalize block">
                {booking.sessionType.replace("_", " ")}
              </span>
              <p className="text-[11px] text-slate-400">
                Yas Pro Soundstage Facilities &bull; Dubai Studio City
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Financial Reconciliation
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-mono">
                  {formatCurrency(Number(booking.totalAmount), booking.currency || "AED")}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30 font-mono">
                  {booking.paymentStatus || "UNPAID"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Currency: {booking.currency || "AED"}
              </span>
            </div>
          </div>

          {/* Post-Production Deliverables */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">
              Post-Production Deliverables
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {[
                { label: "Offline Editing", active: booking.needsEditing },
                { label: "Color Grading", active: booking.needsColorGrading },
                { label: "Sound Mastering", active: booking.needsSoundMastering },
                { label: "Special Requests", active: Boolean(booking.specialRequests) },
              ].map(({ label, active }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className={active ? "text-emerald-400" : "text-slate-600"}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Production Notes */}
          {(booking.propsNotes || booking.specialRequests) && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Special Studio Directives &amp; Production Notes
              </span>
              {booking.propsNotes && (
                <div>
                  <span className="text-[10px] text-purple-400 font-mono block font-semibold">
                    Props &amp; Staging:
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {booking.propsNotes}
                  </p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <span className="text-[10px] text-purple-400 font-mono block font-semibold">
                    Special Client Requests:
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {booking.specialRequests}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Safety Footer */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/20 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Yas Pro Security Desk: +971 55 401 0465</span>
            <span>Stage Access Badges Required at Entry Gate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
