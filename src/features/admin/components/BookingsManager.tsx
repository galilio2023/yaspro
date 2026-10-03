"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  CalendarCheck,
  FileText,
  Search,
  Clock,
  CheckCircle2,
  DollarSign,
  Filter,
  Layers,
  AlertCircle,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed" | "cancelled">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "unpaid" | "deposit_paid" | "paid" | "refunded">("all");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [callSheetBookingId, setCallSheetBookingId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filteredBookings = bookingList.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.referenceCode.toLowerCase().includes(q) ||
      (b.userName && b.userName.toLowerCase().includes(q)) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(q)) ||
      (b.userPhone && b.userPhone.toLowerCase().includes(q)) ||
      (b.userCompany && b.userCompany.toLowerCase().includes(q)) ||
      (b.studioName && b.studioName.toLowerCase().includes(q)) ||
      b.sessionType.toLowerCase().includes(q);

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const pagination = usePagination(filteredBookings, 20);

  const totalPending = bookingList.filter((b) => b.status === "pending").length;
  const totalConfirmed = bookingList.filter((b) => b.status === "confirmed").length;
  const totalCompleted = bookingList.filter((b) => b.status === "completed").length;
  const totalPaid = bookingList.filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "deposit_paid").length;

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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Bookings</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{bookingList.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-amber-400 font-mono uppercase block">Pending Approval</span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">{totalPending}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Confirmed Sessions</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{totalConfirmed}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-blue-400 font-mono uppercase block">Paid / Deposit Paid</span>
          <span className="text-xl font-bold text-blue-300 font-mono mt-1 block">{totalPaid}</span>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search reference, client, email, studio..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.resetPage();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Payment Status Quick Filter Pills */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
            {(["all", "paid", "deposit_paid", "unpaid"] as const).map((payStatus) => (
              <button
                key={payStatus}
                type="button"
                onClick={() => {
                  setPaymentFilter(payStatus);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                  paymentFilter === payStatus
                    ? "bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {payStatus === "all" ? "All Payments" : payStatus.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Bookings", count: bookingList.length },
            { id: "pending", label: "Pending", count: totalPending },
            { id: "confirmed", label: "Confirmed", count: totalConfirmed },
            { id: "completed", label: "Completed", count: totalCompleted },
            { id: "cancelled", label: "Cancelled", count: bookingList.filter(b => b.status === "cancelled").length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as any);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-amber-500 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
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
          {filteredBookings.length === 0 ? (
            <DataTableEmpty colSpan={9} message="No bookings matching your search or filters." />
          ) : (
            pagination.paginatedItems.map((b) => (
              <DataTableRow key={b.id}>
                {/* Reference */}
                <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">
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
                      <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                        {b.userPhone && <span>{b.userPhone}</span>}
                        {b.userCompany && <span className="text-slate-500">({b.userCompany})</span>}
                      </span>
                    )}
                  </div>
                </td>

                {/* Session Type & Studio */}
                <td className="py-3.5 px-4 capitalize text-slate-300">
                  <span className="font-semibold text-white block">
                    {!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                      ? "Cinema Gear Rental"
                      : b.sessionType.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-amber-300 font-medium block">
                    {b.studioName || (!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                      ? `${b.equipmentIds.length} Equipment Item${b.equipmentIds.length > 1 ? "s" : ""}`
                      : "Soundstage")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                      ? b.propsNotes || "Dispatch & Delivery"
                      : `Headcount: ${b.headcount} pax`}
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
                  {!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                    ? `${Math.max(1, Math.round(b.durationHours / 24))} Days`
                    : `${b.durationHours} hrs`}
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
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
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
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="Generate Printable Call Sheet"
                    >
                      <FileText size={11} />
                      <span>Call Sheet</span>
                    </button>

                    <button
                      type="button"
                      disabled={updatingIds.has(b.id)}
                      onClick={() => handleStatusChange(b.id, "confirmed")}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
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
