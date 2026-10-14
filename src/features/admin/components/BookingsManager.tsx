"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  CalendarCheck,
  FileText,
  Search,
  Mic,
  Tag,
  Video,
  Scissors,
  Share2,
  Building2,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  User,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import {
  updateBookingStatus,
  updateBookingPaymentStatus,
  createManualCmsBooking,
  updateCmsBookingDetails,
  deleteCmsBooking,
  type EnrichedBooking,
} from "@/lib/actions/bookings-rfp-operations";
import type { Studio, SessionType } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { BookingCallSheetModal } from "./BookingCallSheetModal";

interface BookingsManagerProps {
  initialBookings: EnrichedBooking[];
  studios?: Studio[];
}

interface BookingFormData {
  id?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  studioId: string;
  sessionType: SessionType;
  date: string;
  timeSlot: string;
  durationHours: number;
  headcount: number;
  totalAmount: string;
  currency: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "unpaid" | "deposit_paid" | "paid" | "refunded";
  notes: string;
}

const DEFAULT_FORM_DATA: BookingFormData = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientCompany: "",
  studioId: "",
  sessionType: "video_production",
  date: new Date().toISOString().slice(0, 10),
  timeSlot: "10:00",
  durationHours: 4,
  headcount: 5,
  totalAmount: "4000.00",
  currency: "AED",
  status: "confirmed",
  paymentStatus: "unpaid",
  notes: "",
};

export function BookingsManager({
  initialBookings,
  studios = [],
}: BookingsManagerProps) {
  const [bookingList, setBookingList] = useState<EnrichedBooking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "studios" | "podcasts" | "offers">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "completed" | "cancelled"
  >("all");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "unpaid" | "deposit_paid" | "paid" | "refunded"
  >("all");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [callSheetBookingId, setCallSheetBookingId] = useState<string | null>(null);

  // Modal states for Create / Edit / Delete
  const [formData, setFormData] = useState<BookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<EnrichedBooking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const isPodcastBooking = (b: EnrichedBooking) =>
    Boolean(b.podcastDetails || b.referenceCode.startsWith("YAS-POD-") || b.sessionType === "podcast");

  const isOfferBooking = (b: EnrichedBooking) =>
    Boolean(b.offerDetails || b.referenceCode.startsWith("YAS-OFR-"));

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
      (b.podcastDetails?.packageName && b.podcastDetails.packageName.toLowerCase().includes(q)) ||
      (b.offerDetails?.offerTitle && b.offerDetails.offerTitle.toLowerCase().includes(q)) ||
      b.sessionType.toLowerCase().includes(q);

    const isPod = isPodcastBooking(b);
    const isOff = isOfferBooking(b);
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "podcasts"
        ? isPod
        : categoryFilter === "offers"
        ? isOff
        : !isPod && !isOff;

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesPayment;
  });

  const pagination = usePagination(filteredBookings, 20);

  const totalPending = bookingList.filter((b) => b.status === "pending").length;
  const totalConfirmed = bookingList.filter((b) => b.status === "confirmed").length;
  const totalCompleted = bookingList.filter((b) => b.status === "completed").length;
  const totalPaid = bookingList.filter(
    (b) => b.paymentStatus === "paid" || b.paymentStatus === "deposit_paid"
  ).length;

  const totalPodcasts = bookingList.filter(isPodcastBooking).length;
  const totalOffers = bookingList.filter(isOfferBooking).length;
  const totalSoundstages = bookingList.length - totalPodcasts - totalOffers;

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
        showFeedback(`Payment updated to ${paymentStatus}`);
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

  // Open Create Modal
  const handleOpenNew = () => {
    setModalError(null);
    setFormData({
      ...DEFAULT_FORM_DATA,
      studioId: studios[0]?.id || "",
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (b: EnrichedBooking) => {
    setModalError(null);
    const scheduledDateObj = new Date(b.scheduledAt);
    const dateStr = !isNaN(scheduledDateObj.getTime())
      ? scheduledDateObj.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const hours = String(scheduledDateObj.getHours()).padStart(2, "0");
    const mins = String(scheduledDateObj.getMinutes()).padStart(2, "0");
    const timeSlotStr = `${hours}:${mins}`;

    let parsedNotes = b.specialRequests || "";
    if (parsedNotes.startsWith("[Contact: ")) {
      const bracketIdx = parsedNotes.indexOf("]");
      if (bracketIdx !== -1) {
        parsedNotes = parsedNotes.substring(bracketIdx + 1).trim();
      }
    }

    setFormData({
      id: b.id,
      clientName: b.userName || "",
      clientEmail: b.userEmail || "",
      clientPhone: b.userPhone || "",
      clientCompany: b.userCompany || "",
      studioId: b.studioId || "",
      sessionType: b.sessionType as SessionType,
      date: dateStr,
      timeSlot: timeSlotStr,
      durationHours: b.durationHours,
      headcount: b.headcount,
      totalAmount: b.totalAmount,
      currency: b.currency || "AED",
      status: b.status,
      paymentStatus: (b.paymentStatus as BookingFormData["paymentStatus"]) || "unpaid",
      notes: parsedNotes,
    });
  };

  // Submit Create or Edit Form
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!formData.clientName.trim() || !formData.clientEmail.trim() || !formData.clientPhone.trim()) {
      setModalError("Client name, email, and phone number are required.");
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const scheduledAt = new Date(`${formData.date}T${formData.timeSlot}:00`);

      if (formData.id) {
        // Edit existing booking
        const res = await updateCmsBookingDetails({
          id: formData.id,
          studioId: formData.studioId || null,
          sessionType: formData.sessionType,
          scheduledAt,
          durationHours: Number(formData.durationHours) || 1,
          headcount: Number(formData.headcount) || 1,
          totalAmount: formData.totalAmount,
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientCompany: formData.clientCompany,
          notes: formData.notes,
        });

        if (res.success) {
          const selectedStudio = studios.find((s) => s.id === formData.studioId);
          setBookingList((prev) =>
            prev.map((b) =>
              b.id === formData.id
                ? {
                    ...b,
                    userName: formData.clientName,
                    userEmail: formData.clientEmail,
                    userPhone: formData.clientPhone,
                    userCompany: formData.clientCompany,
                    studioId: formData.studioId || null,
                    studioName: selectedStudio?.name || b.studioName,
                    sessionType: formData.sessionType,
                    scheduledAt,
                    durationHours: Number(formData.durationHours),
                    headcount: Number(formData.headcount),
                    totalAmount: formData.totalAmount,
                    status: formData.status,
                    paymentStatus: formData.paymentStatus,
                    specialRequests: `[Contact: ${formData.clientName} | ${formData.clientEmail} | ${formData.clientPhone}${
                      formData.clientCompany ? ` | ${formData.clientCompany}` : ""
                    }] ${formData.notes}`,
                  }
                : b
            )
          );
          showFeedback("Booking details and schedule successfully updated.");
          setFormData(null);
        } else {
          setModalError(res.error || "Failed to update booking.");
        }
      } else {
        // Create manual booking
        const res = await createManualCmsBooking({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          clientCompany: formData.clientCompany,
          studioId: formData.studioId || null,
          sessionType: formData.sessionType,
          scheduledAt,
          durationHours: Number(formData.durationHours) || 1,
          headcount: Number(formData.headcount) || 1,
          totalAmount: formData.totalAmount,
          currency: formData.currency,
          status: formData.status,
          paymentStatus: formData.paymentStatus,
          notes: formData.notes,
        });

        if (res.success && res.booking) {
          const selectedStudio = studios.find((s) => s.id === formData.studioId);
          const enrichedNewBooking: EnrichedBooking = {
            ...res.booking,
            studioName: selectedStudio?.name || null,
          };
          setBookingList((prev) => [enrichedNewBooking, ...prev]);
          showFeedback(`New manual booking ${enrichedNewBooking.referenceCode} created.`);
          setFormData(null);
        } else {
          setModalError(res.error || "Failed to create booking.");
        }
      }
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCmsBooking(bookingToDelete.id);
      if (res.success) {
        setBookingList((prev) => prev.filter((b) => b.id !== bookingToDelete.id));
        showFeedback(`Booking ${bookingToDelete.referenceCode} has been deleted.`);
        setBookingToDelete(null);
      } else {
        alert(res.error || "Failed to delete booking.");
      }
    } catch (err) {
      alert((err as Error).message || "An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <CalendarCheck className="text-brand-mauve" /> Studio Bookings &amp; Financial Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, create, reschedule, and manage reservations for soundstages, podcasts, and bundles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <FeedbackAlert
              type="success"
              message={feedback}
              onDismiss={clearFeedback}
            />
          )}

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} /> Create Manual Booking
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Bookings</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">
            {bookingList.length}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-brand-mauve font-mono uppercase block">Pending Approval</span>
          <span className="text-xl font-bold text-brand-mauve font-mono mt-1 block">
            {totalPending}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Confirmed Sessions</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">
            {totalConfirmed}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-sky-400 font-mono uppercase block">Paid / Deposit Paid</span>
          <span className="text-xl font-bold text-sky-300 font-mono mt-1 block">
            {totalPaid}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px overflow-x-auto scrollbar-none">
        {[
          { id: "all", label: "All Bookings", count: bookingList.length, icon: CalendarCheck },
          { id: "studios", label: "Soundstages", count: totalSoundstages, icon: Building2 },
          { id: "podcasts", label: "Podcast Studio", count: totalPodcasts, icon: Mic },
          { id: "offers", label: "Offers & Bundles", count: totalOffers, icon: Tag },
        ].map((cat) => {
          const Icon = cat.icon;
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoryFilter(cat.id as typeof categoryFilter);
                pagination.resetPage();
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-brand-mauve text-brand-mauve font-semibold"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-zinc-300">
                {cat.count}
              </span>
            </button>
          );
        })}
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-mauve transition-colors"
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
                    ? "bg-brand-violet text-white font-bold border border-brand-mauve/40 shadow-lg shadow-brand-violet/25"
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
            { id: "all", label: "All Status", count: bookingList.length },
            { id: "pending", label: "Pending", count: totalPending },
            { id: "confirmed", label: "Confirmed", count: totalConfirmed },
            { id: "completed", label: "Completed", count: totalCompleted },
            {
              id: "cancelled",
              label: "Cancelled",
              count: bookingList.filter((b) => b.status === "cancelled").length,
            },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setStatusFilter(tab.id as typeof statusFilter);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-brand-violet text-white font-bold border border-brand-mauve/30"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Bookings Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-white/[0.02] border border-white/5">
            No bookings matching your search or filters.
          </div>
        ) : (
          pagination.paginatedItems.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-[#0b0f19] border border-white/10 space-y-3 shadow-lg"
            >
              {/* Card Header: Reference & Booking Status */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-brand-mauve text-xs">
                    {b.referenceCode}
                  </span>
                  {b.podcastDetails && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
                      Podcast
                    </span>
                  )}
                  {b.offerDetails && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                      Bundle
                    </span>
                  )}
                </div>
                <StatusBadge status={b.status} />
              </div>

              {/* Client & Session Info */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Client:</span>
                  <div className="text-right">
                    <span className="font-semibold text-white block">
                      {b.userName || "Direct Client"}
                    </span>
                    {b.userEmail && (
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {b.userEmail}
                      </span>
                    )}
                    {b.userPhone && (
                      <span className="text-[10px] text-brand-mauve font-mono block">
                        {b.userPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <span className="text-slate-400">Session / Stage:</span>
                  <div className="text-right">
                    <span className="font-semibold text-white block">
                      {b.podcastDetails
                        ? `Podcast: ${b.podcastDetails.packageName || "Studio Setup"}`
                        : b.offerDetails
                        ? `Bundle: ${b.offerDetails.offerTitle}`
                        : b.studioName ||
                          (b.equipmentIds && b.equipmentIds.length > 0
                            ? `${b.equipmentIds.length} Equipment items`
                            : b.sessionType.replace("_", " "))}
                    </span>

                    {/* Podcast deliverables pills */}
                    {b.podcastDetails && (
                      <div className="flex items-center gap-1 justify-end mt-1 flex-wrap">
                        {b.podcastDetails.includeVideo && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-violet/20 border border-brand-mauve/30 text-[10px] text-brand-mauve font-mono">
                            <Video size={10} /> 4K Video
                          </span>
                        )}
                        {b.podcastDetails.needsEditing && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-[10px] text-sky-300 font-mono">
                            <Scissors size={10} /> Editing
                          </span>
                        )}
                        {b.podcastDetails.needsSocialClips && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
                            <Share2 size={10} /> Clips
                          </span>
                        )}
                      </div>
                    )}

                    {/* Offer savings pill */}
                    {b.offerDetails?.discountAmount && Number(b.offerDetails.discountAmount) > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono mt-1">
                        Saved {b.offerDetails.discountAmount} AED
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {new Date(b.scheduledAt).toLocaleDateString("en-US", {
                      timeZone: "Asia/Dubai",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {formatCurrency(Number(b.totalAmount), b.currency || "AED")}
                  </span>
                </div>

                {/* Payment Selector */}
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-400">Payment:</span>
                  <select
                    value={b.paymentStatus || "unpaid"}
                    disabled={updatingIds.has(b.id)}
                    onChange={(e) =>
                      handlePaymentStatusChange(
                        b.id,
                        e.target.value as "unpaid" | "deposit_paid" | "paid" | "refunded"
                      )
                    }
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                      b.paymentStatus === "paid"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : b.paymentStatus === "deposit_paid"
                        ? "bg-brand-violet/20 text-brand-mauve border-brand-mauve/30"
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  ref={(el) => {
                    if (el && b.id === callSheetBookingId) triggerRef.current = el;
                  }}
                  onClick={(e) => {
                    triggerRef.current = e.currentTarget;
                    setCallSheetBookingId(b.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <FileText size={13} />
                  <span>Call Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(b)}
                  className="px-3 py-2 rounded-xl bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-mauve/30 text-brand-mauve text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <Edit3 size={13} />
                  <span>Edit / Reschedule</span>
                </button>

                <button
                  type="button"
                  disabled={updatingIds.has(b.id)}
                  onClick={() => handleStatusChange(b.id, "confirmed")}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                >
                  Confirm
                </button>

                <button
                  type="button"
                  onClick={() => setBookingToDelete(b)}
                  className="px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[38px]"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bookings Table (Desktop md+) */}
      <div className="hidden md:block">
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
                  <td className="py-3.5 px-4 font-mono font-semibold text-brand-mauve">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{b.referenceCode}</span>
                      {b.podcastDetails && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
                          Podcast
                        </span>
                      )}
                      {b.offerDetails && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                          Bundle
                        </span>
                      )}
                    </div>
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
                        <span className="text-[10px] text-brand-mauve font-mono flex items-center gap-1 mt-0.5">
                          {b.userPhone && <span>{b.userPhone}</span>}
                          {b.userCompany && <span className="text-slate-500">({b.userCompany})</span>}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Session Type & Studio */}
                  <td className="py-3.5 px-4 capitalize text-slate-300">
                    <span className="font-semibold text-white block">
                      {b.podcastDetails
                        ? `Podcast: ${b.podcastDetails.packageName || "Studio Setup"}`
                        : b.offerDetails
                        ? `Bundle: ${b.offerDetails.offerTitle}`
                        : !b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                        ? "Cinema Gear Rental"
                        : b.sessionType.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-brand-mauve font-medium block">
                      {b.studioName ||
                        (!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                          ? `${b.equipmentIds.length} Equipment Item${
                              b.equipmentIds.length > 1 ? "s" : ""
                            }`
                          : "Soundstage")}
                    </span>

                    {/* Podcast deliverables pills */}
                    {b.podcastDetails && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {b.podcastDetails.includeVideo && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-violet/20 border border-brand-mauve/30 text-[10px] text-brand-mauve font-mono">
                            <Video size={10} /> 4K Video
                          </span>
                        )}
                        {b.podcastDetails.needsEditing && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-[10px] text-sky-300 font-mono">
                            <Scissors size={10} /> Editing
                          </span>
                        )}
                        {b.podcastDetails.needsSocialClips && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
                            <Share2 size={10} /> Clips
                          </span>
                        )}
                      </div>
                    )}

                    {/* Offer savings pill */}
                    {b.offerDetails?.discountAmount && Number(b.offerDetails.discountAmount) > 0 && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono mt-1">
                        Promo: -{b.offerDetails.discountAmount} AED
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                        ? b.propsNotes || "Dispatch & Delivery"
                        : `Headcount: ${b.headcount} pax`}
                    </span>
                  </td>

                  {/* Scheduled Date */}
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {b.schedule && b.schedule.length > 1 ? (
                      b.schedule.map((session) => (
                        <div key={session.id} className="mb-2">
                          {session.studioName} ·{" "}
                          {new Date(session.scheduledAt).toLocaleString("en-US", {
                            timeZone: "Asia/Dubai",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          · {session.durationHours}h · {session.headcount} seats
                        </div>
                      ))
                    ) : (
                      new Date(b.scheduledAt).toLocaleDateString("en-US", {
                        timeZone: "Asia/Dubai",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    )}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {!b.studioId && b.equipmentIds && b.equipmentIds.length > 0
                      ? `${Math.max(1, Math.round(b.durationHours / 24))} Days`
                      : `${
                          b.schedule?.length
                            ? b.schedule.reduce(
                                (total, session) => total + session.durationHours,
                                0
                              )
                            : b.durationHours
                        } hrs`}
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
                          ? "bg-brand-violet/20 text-brand-mauve border-brand-mauve/30"
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
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Generate Printable Call Sheet"
                      >
                        <FileText size={11} />
                        <span>Call Sheet</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(b)}
                        className="px-2 py-1 rounded bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-mauve/30 text-brand-mauve text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        title="Edit Booking & Reschedule"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
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
                        onClick={() => setBookingToDelete(b)}
                        className="p-1 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 transition-colors cursor-pointer"
                        title="Delete Booking"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>
      </div>

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

      {/* Modal: Create or Edit Booking */}
      {formData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheck className="text-brand-mauve" size={20} />
                {formData.id ? "Edit & Reschedule Reservation" : "Create Manual Booking"}
              </h2>
              <button
                type="button"
                onClick={() => setFormData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveBooking} className="mt-4 space-y-4 text-xs">
              {/* Client Information */}
              <div className="space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-mauve block font-bold">
                  Client Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        placeholder="e.g. Sultan Al-Otaibi"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-mauve"
                      />
                      <User size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Email Address *</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        placeholder="client@company.com"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-mauve"
                      />
                      <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-mauve"
                      />
                      <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Company / Organization</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.clientCompany}
                        onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                        placeholder="Agency / Brand"
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-mauve"
                      />
                      <Building size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Soundstage & Session Type */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-mauve block font-bold">
                  Soundstage &amp; Production Type
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Assigned Studio</label>
                    <select
                      value={formData.studioId}
                      onChange={(e) => setFormData({ ...formData, studioId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    >
                      <option value="">No Studio (External / Remote / Gear Only)</option>
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.hourlyRate} AED/hr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Session Type</label>
                    <select
                      value={formData.sessionType}
                      onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as SessionType })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    >
                      <option value="video_production">Video Production</option>
                      <option value="podcast">Podcast Studio</option>
                      <option value="photography">Photography</option>
                      <option value="commercial">Commercial / TVC</option>
                      <option value="interview">Interview</option>
                      <option value="music_video">Music Video</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Schedule and Allocation */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-mauve block font-bold">
                  Schedule &amp; Attendance
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    >
                    </input>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={72}
                      required
                      value={formData.durationHours}
                      onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Headcount (Pax)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={formData.headcount}
                      onChange={(e) => setFormData({ ...formData, headcount: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    />
                  </div>
                </div>
              </div>

              {/* Financials & Status */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-brand-mauve block font-bold">
                  Financials &amp; Administrative State
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Total Fee (AED)</label>
                    <input
                      type="text"
                      required
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-brand-mauve"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Reservation Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as BookingFormData["status"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    >
                      <option value="pending">Pending Approval</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentStatus: e.target.value as BookingFormData["paymentStatus"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="deposit_paid">Deposit Paid (50%)</option>
                      <option value="paid">Paid in Full</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Requests / Production Notes */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Production Notes &amp; Special Equipment Needs
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Teleprompter setup, robotic motion control arm, catering for 8 crew."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-mauve"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{isSubmitting ? "Saving..." : formData.id ? "Update Reservation" : "Save Manual Booking"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookingToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(bookingToDelete)}
          onClose={() => setBookingToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Booking Reservation"
          message={`Are you sure you want to permanently delete reservation "${bookingToDelete.referenceCode}" for ${
            bookingToDelete.userName || "Client"
          }? All associated soundstage schedules and financial records will be removed.`}
          confirmLabel="Delete Booking"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
