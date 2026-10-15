"use client";

import React, { useState, useRef } from "react";
import {
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import {
  updateBookingStatus,
  updateBookingPaymentStatus,
  type EnrichedBooking,
} from "@/lib/actions/bookings-rfp-operations";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
} from "@/components/admin";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { useAdminFilter } from "../hooks/useAdminFilter";
import { BookingCallSheetModal } from "./BookingCallSheetModal";

interface BookingsManagerProps {
  initialBookings: EnrichedBooking[];
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookingList, setBookingList] = useState<EnrichedBooking[]>(initialBookings);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [callSheetBookingId, setCallSheetBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filter = useAdminFilter<
    EnrichedBooking,
    "all" | "pending" | "confirmed" | "completed" | "cancelled",
    "all" | "unpaid" | "deposit_paid" | "paid" | "refunded"
  >({
    data: bookingList,
    initialFilter: "all",
    initialSecondaryFilter: "all",
    pageSize: 20,
    predicate: (b, q, status, payment) => {
      const matchesSearch =
        !q ||
        b.referenceCode.toLowerCase().includes(q) ||
        (b.userName && b.userName.toLowerCase().includes(q)) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(q)) ||
        (b.userPhone && b.userPhone.toLowerCase().includes(q)) ||
        (b.userCompany && b.userCompany.toLowerCase().includes(q)) ||
        (b.studioName && b.studioName.toLowerCase().includes(q)) ||
        b.sessionType.toLowerCase().includes(q);

      const matchesStatus = status === "all" || b.status === status;
      const matchesPayment = !payment || payment === "all" || b.paymentStatus === payment;

      return Boolean(matchesSearch && matchesStatus && matchesPayment);
    },
  });

  const totalPending = bookingList.filter((b) => b.status === "pending").length;
  const totalConfirmed = bookingList.filter((b) => b.status === "confirmed").length;
  const totalCompleted = bookingList.filter((b) => b.status === "completed").length;
  const totalPaid = bookingList.filter(
    (b) => b.paymentStatus === "paid" || b.paymentStatus === "deposit_paid"
  ).length;

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
    setErrorMessage(null);
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        showFeedback(`Booking marked as ${newStatus}`);
      } else {
        setErrorMessage(res.error || "Failed to update booking status.");
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "An error occurred while updating status.");
    } finally {
      markUpdating(id, false);
    }
  };

  const handlePaymentStatusChange = async (
    id: string,
    paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded"
  ) => {
    markUpdating(id, true);
    setErrorMessage(null);
    try {
      const res = await updateBookingPaymentStatus(id, paymentStatus);
      if (res.success) {
        setBookingList((prev) =>
          prev.map((b) => (b.id === id ? { ...b, paymentStatus } : b))
        );
        showFeedback(`Payment updated to ${paymentStatus}`);
      } else {
        setErrorMessage(res.error || "Failed to update payment status.");
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "An error occurred while updating payment.");
    } finally {
      markUpdating(id, false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Production Bookings & Call Sheets"
        description="Studio soundstage reservations, calendar allocations, automated call sheets, and deposit tracking."
        icon={CalendarCheck}
        feedback={feedback}
        onDismissFeedback={clearFeedback}
      />

      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white cursor-pointer px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Total Reservations",
            value: bookingList.length,
            unit: "Sessions",
            icon: CalendarCheck,
            variant: "default",
          },
          {
            label: "Pending Review",
            value: totalPending,
            unit: "Pending",
            icon: Clock,
            variant: "warning",
          },
          {
            label: "Confirmed Sessions",
            value: totalConfirmed,
            unit: "Approved",
            icon: CheckCircle2,
            variant: "success",
          },
          {
            label: "Paid / Secured",
            value: totalPaid,
            unit: "Deposits",
            icon: DollarSign,
            variant: "brand",
          },
        ]}
      />

      {/* Filter & Search Bar */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search reference, client, email, studio..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Bookings", count: bookingList.length },
          { id: "pending", label: "Pending", count: totalPending },
          { id: "confirmed", label: "Confirmed", count: totalConfirmed },
          { id: "completed", label: "Completed", count: totalCompleted },
          {
            id: "cancelled",
            label: "Cancelled",
            count: bookingList.filter((b) => b.status === "cancelled").length,
          },
        ]}
        secondaryFilters={
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {[
              { id: "all", label: "All Payments" },
              { id: "paid", label: "Paid" },
              { id: "deposit_paid", label: "Deposit Paid" },
              { id: "unpaid", label: "Unpaid" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  filter.setSecondaryFilterValue(
                    opt.id as "all" | "unpaid" | "deposit_paid" | "paid" | "refunded"
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  (filter.secondaryFilterValue || "all") === opt.id
                    ? "bg-white/10 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Bookings Table */}
      <div>
        <DataTable>
          <DataTableHeader>
            <tr>
              <th className="py-3 px-4">Booking Ref</th>
              <th className="py-3 px-4">Client &amp; Contact</th>
              <th className="py-3 px-4">Session Type &amp; Studio</th>
              <th className="py-3 px-4">Scheduled Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-end">Actions</th>
            </tr>
          </DataTableHeader>
          <DataTableBody>
            {filter.filteredData.length === 0 ? (
              <DataTableEmpty
                colSpan={7}
                message="No reservations found matching your criteria."
                onReset={filter.resetFilters}
              />
            ) : (
              filter.pagination.paginatedItems.map((b) => (
                <DataTableRow key={b.id}>
                  <td className="py-3 px-4 font-mono font-bold text-brand-lavender text-xs">
                    {b.referenceCode}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-semibold text-white block">
                        {b.userName || "Direct Client"}
                      </span>
                      {b.userEmail && (
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {b.userEmail}
                        </span>
                      )}
                      {b.userPhone && (
                        <span className="text-[10px] text-brand-mauve font-mono block">
                          {b.userPhone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-white block">
                      {b.studioName ||
                        (b.equipmentIds && b.equipmentIds.length > 0
                          ? `${b.equipmentIds.length} Equipment items`
                          : b.sessionType.replace("_", " "))}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono capitalize">
                      {b.sessionType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                    {new Date(b.scheduledAt).toLocaleDateString("en-US", {
                      timeZone: "Asia/Dubai",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={b.status}
                      disabled={updatingIds.has(b.id)}
                      onChange={(e) =>
                        handleStatusChange(
                          b.id,
                          e.target.value as "pending" | "confirmed" | "cancelled" | "completed"
                        )
                      }
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-brand-mauve cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={b.paymentStatus || "unpaid"}
                      disabled={updatingIds.has(b.id)}
                      onChange={(e) =>
                        handlePaymentStatusChange(
                          b.id,
                          e.target.value as "unpaid" | "deposit_paid" | "paid" | "refunded"
                        )
                      }
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-brand-mauve cursor-pointer"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="deposit_paid">Deposit Paid</option>
                      <option value="paid">Paid in Full</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-end">
                    <button
                      type="button"
                      ref={triggerRef}
                      onClick={() => setCallSheetBookingId(b.id)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-brand-lavender text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ms-auto"
                      title="Generate Call Sheet"
                      aria-label={`Generate call sheet for booking ${b.referenceCode}`}
                    >
                      <FileText size={14} />
                      <span>Call Sheet</span>
                    </button>
                  </td>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={filter.pagination.currentPage}
        pageCount={filter.pagination.pageCount}
        total={filter.pagination.total}
        startIndex={filter.pagination.startIndex}
        endIndex={filter.pagination.endIndex}
        onPrev={filter.pagination.prevPage}
        onNext={filter.pagination.nextPage}
      />

      {/* Printable Call Sheet Modal */}
      {callSheetBooking && (
        <BookingCallSheetModal
          booking={callSheetBooking}
          onClose={() => setCallSheetBookingId(null)}
        />
      )}
    </div>
  );
}
