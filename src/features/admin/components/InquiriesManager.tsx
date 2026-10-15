"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Mail,
  Building,
  User,
  Radio,
  Camera,
  Layers,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { updateInquiryStatus, deleteCmsInquiry } from "@/lib/actions/inquiries-leads-operations";
import type { Inquiry } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
} from "@/components/admin";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { useAdminFilter } from "../hooks/useAdminFilter";

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
}

const INQUIRY_ICONS: Record<string, React.ReactNode> = {
  ob_van: <Radio size={14} className="text-brand-mauve" />,
  live_broadcast: <Radio size={14} className="text-brand-mauve" />,
  outdoor_filming: <Camera size={14} className="text-emerald-400" />,
  studio_booking: <Layers size={14} className="text-brand-lavender" />,
  technical_support: <Wrench size={14} className="text-stone-300" />,
  general: <HelpCircle size={14} className="text-slate-400" />,
};

const INQUIRY_LABELS: Record<string, string> = {
  ob_van: "OB Van Broadcast",
  live_broadcast: "Live Broadcast",
  outdoor_filming: "Outdoor Filming",
  studio_booking: "Studio Booking",
  technical_support: "Technical Support",
  general: "General Inquiry",
};

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>(initialInquiries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filter = useAdminFilter<Inquiry, "all" | "open" | "resolved", string>({
    data: inquiriesList,
    initialFilter: "all",
    initialSecondaryFilter: "all",
    pageSize: 20,
    predicate: (i, query, status, type) => {
      const matchesSearch =
        !query ||
        i.name.toLowerCase().includes(query) ||
        i.email.toLowerCase().includes(query) ||
        (i.company && i.company.toLowerCase().includes(query)) ||
        i.message.toLowerCase().includes(query);

      const matchesStatus =
        status === "all"
          ? true
          : status === "resolved"
          ? i.isResolved
          : !i.isResolved;

      const matchesType = !type || type === "all" || i.inquiryType === type;

      return Boolean(matchesSearch && matchesStatus && matchesType);
    },
  });

  const totalPending = inquiriesList.filter((i) => !i.isResolved).length;
  const totalResolved = inquiriesList.filter((i) => i.isResolved).length;

  const handleToggleResolved = async (inquiry: Inquiry) => {
    const newStatus = !inquiry.isResolved;
    setUpdatingId(inquiry.id);
    setErrorMessage(null);
    const res = await updateInquiryStatus(inquiry.id, newStatus);
    if (res.success) {
      setInquiriesList((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, isResolved: newStatus } : i))
      );
      showFeedback(`Inquiry marked as ${newStatus ? "resolved" : "open"}`);
    } else {
      setErrorMessage(res.error || "Failed to update status");
    }
    setUpdatingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!inquiryToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    setUpdatingId(inquiryToDelete.id);
    try {
      const res = await deleteCmsInquiry(inquiryToDelete.id);
      if (res.success) {
        setInquiriesList((prev) => prev.filter((i) => i.id !== inquiryToDelete.id));
        showFeedback(`Inquiry from ${inquiryToDelete.name} deleted.`);
        setInquiryToDelete(null);
      } else {
        setErrorMessage(res.error || "Failed to delete inquiry");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete inquiry");
    } finally {
      setIsDeleting(false);
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Client Inquiries & Production Leads"
        description="Incoming briefs from contact inquiries, OB Van quotes, and studio production requests."
        icon={MessageSquare}
        feedback={feedback}
        onDismissFeedback={clearFeedback}
      />

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <AdminStatsGrid
        columns={3}
        stats={[
          {
            label: "Total Inquiries",
            value: inquiriesList.length,
            unit: "Leads",
            icon: MessageSquare,
            variant: "default",
          },
          {
            label: "Action Required (Open)",
            value: totalPending,
            unit: "Pending",
            icon: Clock,
            variant: "warning",
          },
          {
            label: "Resolved Leads",
            value: totalResolved,
            unit: "Completed",
            icon: CheckCircle2,
            variant: "success",
          },
        ]}
      />

      {/* Search & Filters */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search leads by name, email, company, keyword..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Status", count: inquiriesList.length },
          { id: "open", label: "Open Leads", count: totalPending },
          { id: "resolved", label: "Resolved", count: totalResolved },
        ]}
        secondaryFilters={
          <select
            value={filter.secondaryFilterValue || "all"}
            onChange={(e) => filter.setSecondaryFilterValue(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-brand-mauve cursor-pointer"
          >
            <option value="all">All Inquiry Types</option>
            <option value="ob_van">OB Van Broadcast</option>
            <option value="live_broadcast">Live Broadcast</option>
            <option value="studio_booking">Studio Booking</option>
            <option value="outdoor_filming">Outdoor Filming</option>
            <option value="technical_support">Technical Support</option>
            <option value="general">General Inquiry</option>
          </select>
        }
      />

      {/* Inquiries Cards */}
      <div className="space-y-3">
        {filter.filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-white/[0.01] border border-white/10 text-xs">
            No inquiries match your current filters.
          </div>
        ) : (
          filter.pagination.paginatedItems.map((inq) => (
            <div
              key={inq.id}
              className={`p-5 rounded-2xl border transition-all ${
                inq.isResolved
                  ? "bg-white/[0.01] border-white/5 opacity-70"
                  : "bg-slate-900/60 border-white/10 shadow-lg"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 flex-1">
                  {/* Category and Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-white">
                      {INQUIRY_ICONS[inq.inquiryType] || <HelpCircle size={12} />}
                      {INQUIRY_LABELS[inq.inquiryType] || inq.inquiryType}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        inq.isResolved
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {inq.isResolved ? "Resolved" : "Pending Action"}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(inq.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center gap-4 text-xs flex-wrap text-slate-300">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <User size={13} className="text-brand-mauve" /> {inq.name}
                    </span>
                    {inq.company && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building size={13} className="text-stone-300" /> {inq.company}
                      </span>
                    )}
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-brand-mauve hover:text-brand-mauve-soft flex items-center gap-1 font-mono transition-colors"
                    >
                      <Mail size={13} /> {inq.email}
                    </a>
                  </div>

                  {/* Message */}
                  <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200 leading-relaxed">
                    {inq.message}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center md:flex-col justify-end gap-2 shrink-0">
                  {inq.phone && (
                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hello ${inq.name}, thank you for contacting Yas Productions regarding your inquiry. How can our production team assist you?`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors w-full justify-center"
                    >
                      <span>WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleResolved(inq)}
                    disabled={updatingId === inq.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-full text-center disabled:opacity-50 ${
                      inq.isResolved
                        ? "bg-white/5 hover:bg-white/10 text-slate-400"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    }`}
                  >
                    {inq.isResolved ? "Reopen Lead" : "Mark Resolved"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setInquiryToDelete(inq)}
                    disabled={updatingId === inq.id}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50 self-end"
                    title="Delete Inquiry"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PaginationControls
        currentPage={filter.pagination.currentPage}
        pageCount={filter.pagination.pageCount}
        total={filter.pagination.total}
        startIndex={filter.pagination.startIndex}
        endIndex={filter.pagination.endIndex}
        onPrev={filter.pagination.prevPage}
        onNext={filter.pagination.nextPage}
      />

      {inquiryToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(inquiryToDelete)}
          onClose={() => setInquiryToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Client Inquiry"
          message={`Are you sure you want to permanently delete the inquiry from "${inquiryToDelete.name}" (${inquiryToDelete.email})? This action cannot be undone.`}
          confirmLabel="Delete Inquiry"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
