"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Printer,
  FileText,
  X,
} from "lucide-react";
import { updateBookingStatus, updateBookingPaymentStatus } from "@/lib/cms-actions";
import type { Booking } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { IyasProIcon } from "@/components/ui/IyasProIcon";

interface BookingsManagerProps {
  initialBookings: Booking[];
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [callSheetBookingId, setCallSheetBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedBookings = bookingList.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const totalBookings = bookingList.length;

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const callSheetBooking = bookingList.find((b) => b.id === callSheetBookingId) || null;

  // Manage keyboard focus trap and restoration for the Call Sheet modal
  useEffect(() => {
    if (!callSheetBooking) return;

    // Move focus into the modal
    modalRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCallSheetBookingId(null);
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      // Restore focus to trigger button
      triggerRef.current?.focus();
    };
  }, [callSheetBooking]);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        setFeedback(`Booking marked as ${newStatus}`);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(res.error || "Failed to update booking status.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while updating status.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handlePaymentStatusChange = async (
    id: string,
    paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded"
  ) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      const res = await updateBookingPaymentStatus(id, paymentStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, paymentStatus } : b))
        );
        setFeedback(`Payment updated to ${paymentStatus.replace("_", " ")}`);
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(res.error || "Failed to update payment status.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while updating payment.");
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <CalendarCheck className="text-amber-400" /> Studio Bookings &amp; Financial Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review sessions, reconcile wire/card payments, approve reservations, and export official Call Sheets.
          </p>
        </div>

        {feedback && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Session &amp; Stage</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookingList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No bookings logged yet in the database.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Reference */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                      {b.referenceCode}
                    </td>

                    {/* Session Type */}
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      <span className="font-semibold text-white block">
                        {b.sessionType.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Headcount: {b.headcount} pax
                      </span>
                    </td>

                    {/* Scheduled Date */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {new Date(b.scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {b.durationHours} hrs
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-semibold text-white font-mono">
                      {formatCurrency(Number(b.totalAmount), b.currency || "AED")}
                    </td>

                    {/* Payment Reconciliation */}
                    <td className="py-3.5 px-4">
                      <select
                        value={b.paymentStatus || "unpaid"}
                        disabled={updatingIds.has(b.id)}
                        onChange={(e) =>
                          handlePaymentStatusChange(
                            b.id,
                            e.target.value as "unpaid" | "deposit_paid" | "paid" | "refunded"
                          )
                        }
                        className={`text-[10px] font-semibold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          b.paymentStatus === "paid"
                            ? "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30"
                            : b.paymentStatus === "deposit_paid"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : b.paymentStatus === "refunded"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="deposit_paid">Deposit (50%)</option>
                        <option value="paid">Paid Full</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>

                    {/* Booking Lifecycle Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          b.status === "confirmed"
                            ? "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30"
                            : b.status === "completed"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : b.status === "cancelled"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {b.status === "confirmed" && <CheckCircle2 size={11} />}
                        {b.status === "pending" && <Clock size={11} />}
                        {b.status === "cancelled" && <XCircle size={11} />}
                        {b.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Action Controls & Call Sheet */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            triggerRef.current = e.currentTarget;
                            setCallSheetBookingId(b.id);
                          }}
                          className="px-2 py-1 rounded bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                          title="Generate Printable Call Sheet"
                        >
                          <FileText size={11} />
                          <span>Call Sheet</span>
                        </button>

                        <button
                          type="button"
                          disabled={updatingIds.has(b.id)}
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          className="px-2 py-1 rounded bg-brand-teal/20 hover:bg-brand-teal/30 border border-brand-teal/30 text-brand-teal-light text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Confirm
                        </button>

                        <button
                          type="button"
                          disabled={updatingIds.has(b.id)}
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Complete
                        </button>

                        <button
                          type="button"
                          disabled={updatingIds.has(b.id)}
                          onClick={() => handleStatusChange(b.id, "cancelled")}
                          className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalBookings > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.01] text-xs text-slate-400">
            <span>
              Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalBookings)} of {totalBookings}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono text-slate-300">{currentPage + 1} / {Math.ceil(totalBookings / PAGE_SIZE)}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalBookings / PAGE_SIZE) - 1, p + 1))}
                disabled={currentPage >= Math.ceil(totalBookings / PAGE_SIZE) - 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Production Call Sheet Modal (Print Ready) */}
      {callSheetBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent print:z-auto">
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #call-sheet-printable, #call-sheet-printable * {
                visibility: visible;
              }
              #call-sheet-printable {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: 100% !important;
                max-height: none !important;
                overflow: visible !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                color: #0f172a !important;
              }
              #call-sheet-printable * {
                color: #0f172a !important;
                border-color: #cbd5e1 !important;
                background-color: transparent !important;
              }
              #call-sheet-printable .no-print {
                display: none !important;
              }
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
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 no-print">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  <IyasProIcon size={16} idPrefix="callsheet-emblem" />
                </div>
                <div>
                  <h2 id="call-sheet-modal-title" className="text-base font-bold text-white flex items-center gap-1.5">
                    <span>iYASPRO</span>
                    <span className="text-purple-400 font-normal">Call Sheet</span>
                  </h2>
                  <span className="text-[10px] font-mono text-purple-400">
                    REF: {callSheetBooking.referenceCode}
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
                  onClick={() => setCallSheetBookingId(null)}
                  aria-label="Close Call Sheet"
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Print Header (Visible on Paper / Print Only) */}
            <div className="hidden print:block pb-4 border-b border-slate-300 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-slate-900">YasPro Production Call Sheet</h1>
                  <p className="text-xs text-slate-600">Yas Pro Soundstage Facilities &bull; Dubai Studio City</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    REF: {callSheetBooking.referenceCode}
                  </span>
                  <span className="text-[10px] text-slate-500">Official Production Schedule</span>
                </div>
              </div>
            </div>

            {/* Call Sheet Content */}
            <div className="space-y-6 text-xs text-slate-300">
              {/* Studio & Date Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Shoot Date
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                    {new Date(callSheetBooking.scheduledAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Call Time
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                    {new Date(callSheetBooking.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Duration
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                    {callSheetBooking.durationHours} Hours
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Headcount
                  </span>
                  <span className="font-bold text-white text-xs mt-0.5 block font-mono">
                    {callSheetBooking.headcount} Pax
                  </span>
                </div>
              </div>

              {/* Session Type & Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Production Category
                  </span>
                  <span className="font-bold text-white text-sm capitalize block">
                    {callSheetBooking.sessionType.replace("_", " ")}
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
                      {formatCurrency(Number(callSheetBooking.totalAmount), callSheetBooking.currency || "AED")}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-brand-teal/15 text-brand-teal-light border border-brand-teal/30 font-mono">
                      {callSheetBooking.paymentStatus || "UNPAID"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Currency: {callSheetBooking.currency || "AED"}
                  </span>
                </div>
              </div>

              {/* Post-Production & Extras */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Post-Production Deliverables
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={13}
                      className={callSheetBooking.needsEditing ? "text-emerald-400" : "text-slate-600"}
                    />
                    <span>Offline Editing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={13}
                      className={callSheetBooking.needsColorGrading ? "text-emerald-400" : "text-slate-600"}
                    />
                    <span>Color Grading</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={13}
                      className={callSheetBooking.needsSoundMastering ? "text-emerald-400" : "text-slate-600"}
                    />
                    <span>Sound Mastering</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={13}
                      className={callSheetBooking.specialRequests ? "text-emerald-400" : "text-slate-600"}
                    />
                    <span>Special Requests</span>
                  </div>
                </div>
              </div>

              {/* Production Notes & Directives */}
              {(callSheetBooking.propsNotes || callSheetBooking.specialRequests) && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Special Studio Directives &amp; Production Notes
                  </span>
                  {callSheetBooking.propsNotes && (
                    <div>
                      <span className="text-[10px] text-purple-400 font-mono block font-semibold">Props &amp; Staging:</span>
                      <p className="text-xs text-slate-300 mt-0.5">{callSheetBooking.propsNotes}</p>
                    </div>
                  )}
                  {callSheetBooking.specialRequests && (
                    <div>
                      <span className="text-[10px] text-purple-400 font-mono block font-semibold">Special Client Requests:</span>
                      <p className="text-xs text-slate-300 mt-0.5">{callSheetBooking.specialRequests}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Studio Contact / Safety Footer */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/20 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Yas Pro Security Desk: +971 55 401 0465</span>
                <span>Stage Access Badges Required at Entry Gate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
