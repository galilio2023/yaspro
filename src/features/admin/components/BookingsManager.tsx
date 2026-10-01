"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  CalendarCheck,
  FileText,
} from "lucide-react";
import { updateBookingStatus, updateBookingPaymentStatus, type EnrichedBooking } from "@/lib/actions/bookings-rfp-operations";
import { formatCurrency } from "@/lib/utils";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { BookingCallSheetModal } from "./BookingCallSheetModal";

interface BookingsManagerProps {
  initialBookings: EnrichedBooking[];
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookingList, setBookingList] = useState<EnrichedBooking[]>(initialBookings);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [callSheetBookingId, setCallSheetBookingId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const pagination = usePagination(bookingList, 20);

  const callSheetBooking =
    bookingList.find((b) => b.id === callSheetBookingId) ?? null;

  const markUpdating = (id: string, active: boolean) =>
    setUpdatingIds((prev) => {
      const next = new Set(prev);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    markUpdating(id, true);
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        showFeedback(`Booking marked as ${newStatus}`);
      } else {
        alert(res.error || "Failed to update booking status.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while updating status.");
    } finally {
      markUpdating(id, false);
    }
  };

  const handlePaymentStatusChange = async (
    id: string,
    paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded"
  ) => {
    markUpdating(id, true);
    try {
      const res = await updateBookingPaymentStatus(id, paymentStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, paymentStatus } : b))
        );
        showFeedback(`Payment updated to ${paymentStatus.replace("_", " ")}`);
      } else {
        alert(res.error || "Failed to update payment status.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while updating payment.");
    } finally {
      markUpdating(id, false);
    }
  };

  const handleCloseCallSheet = useCallback(() => {
    setCallSheetBookingId(null);
    triggerRef.current?.focus();
  }, []);

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
          <FeedbackAlert
            type="success"
            message={feedback}
            onDismiss={clearFeedback}
          />
        )}
      </div>

      {/* Bookings Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">Reference</th>
            <th className="py-3 px-4">Client &amp; Contact</th>
            <th className="py-3 px-4">Session &amp; Stage</th>
            <th className="py-3 px-4">Scheduled Date</th>
            <th className="py-3 px-4">Duration</th>
            <th className="py-3 px-4">Amount</th>
            <th className="py-3 px-4">Payment</th>
            <th className="py-3 px-4">Booking Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {bookingList.length === 0 ? (
            <DataTableEmpty colSpan={9} message="No bookings logged yet in the database." />
          ) : (
            pagination.paginatedItems.map((b) => (
              <DataTableRow key={b.id}>
                {/* Reference */}
                <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                  {b.referenceCode}
                </td>

                {/* Client & Contact */}
                <td className="py-3.5 px-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white text-xs">
                      {b.userName || "Direct Client"}
                    </span>
                    {b.userEmail && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {b.userEmail}
                      </span>
                    )}
                    {(b.userPhone || b.userCompany) && (
                      <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1 mt-0.5">
                        {b.userPhone && <span>{b.userPhone}</span>}
                        {b.userCompany && <span className="text-slate-500">({b.userCompany})</span>}
                      </span>
                    )}
                  </div>
                </td>

                {/* Session Type & Studio */}
                <td className="py-3.5 px-4 capitalize text-slate-300">
                  <span className="font-semibold text-white block">
                    {b.sessionType.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-purple-300 font-medium block">
                    {b.studioName || "Soundstage"}
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

                {/* Booking Status */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={b.status} />
                </td>

                {/* Action Controls */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    <button
                      type="button"
                      ref={(el) => {
                        if (el && b.id === callSheetBookingId) triggerRef.current = el;
                      }}
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
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <PaginationControls
        currentPage={pagination.currentPage}
        pageCount={pagination.pageCount}
        total={pagination.total}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPrev={pagination.prevPage}
        onNext={pagination.nextPage}
        variant="table"
      />

      {/* Printable Call Sheet Modal */}
      <BookingCallSheetModal
        booking={callSheetBooking}
        onClose={handleCloseCallSheet}
      />
    </div>
  );
}
