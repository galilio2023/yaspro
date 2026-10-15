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
  Table,
  LayoutGrid,
  Eye,
  Phone,
  Sparkles,
} from "lucide-react";
import { updateInquiryStatus, deleteCmsInquiry } from "@/lib/actions/inquiries-leads-operations";
import type { Inquiry } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
} from "@/components/admin";
import { AdminModal } from "@/components/admin/shared/AdminModal";
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

export function resolveInquiryCategory(inq: Inquiry): {
  typeKey: string;
  label: string;
  icon: React.ReactNode;
  badgeStyle: string;
} {
  const msg = inq.message || "";
  if (msg.includes("[Social Media Package Subscription Request]")) {
    return {
      typeKey: "social_media_package",
      label: "Social Retainer Lead",
      icon: <Sparkles size={12} className="text-brand-mauve" />,
      badgeStyle: "bg-brand-mauve/20 text-brand-mauve border-brand-mauve/40",
    };
  }
  if (msg.includes("[Equipment Rental Reservation Request]")) {
    return {
      typeKey: "gear_rental",
      label: "Gear Rental RFP",
      icon: <Camera size={12} className="text-emerald-400" />,
      badgeStyle: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }
  if (inq.inquiryType === "ob_van" || msg.includes("[OB-VAN")) {
    return {
      typeKey: "ob_van",
      label: "OB Van Broadcast",
      icon: <Radio size={12} className="text-brand-mauve" />,
      badgeStyle: "bg-brand-violet/25 text-brand-lavender border-brand-mauve/30",
    };
  }
  if (inq.inquiryType === "outdoor_filming" || msg.includes("[Outdoor Filming")) {
    return {
      typeKey: "outdoor_filming",
      label: "Outdoor Filming",
      icon: <Camera size={12} className="text-emerald-400" />,
      badgeStyle: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }
  if (inq.inquiryType === "studio_booking") {
    return {
      typeKey: "studio_booking",
      label: "Soundstage Inquiry",
      icon: <Layers size={12} className="text-brand-lavender" />,
      badgeStyle: "bg-brand-violet/20 text-brand-lavender border-brand-mauve/20",
    };
  }
  if (inq.inquiryType === "technical_support") {
    return {
      typeKey: "technical_support",
      label: "Technical Support",
      icon: <Wrench size={12} className="text-stone-300" />,
      badgeStyle: "bg-stone-500/15 text-stone-300 border-stone-500/30",
    };
  }
  return {
    typeKey: inq.inquiryType || "general",
    label: INQUIRY_LABELS[inq.inquiryType] || "General Inquiry",
    icon: INQUIRY_ICONS[inq.inquiryType] || <HelpCircle size={12} className="text-slate-400" />,
    badgeStyle: "bg-white/5 text-slate-300 border-white/10",
  };
}

export function InquiriesManager({ initialInquiries }: InquiriesManagerProps) {
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>(initialInquiries);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
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

      const cat = resolveInquiryCategory(i);
      const matchesType = !type || type === "all" || cat.typeKey === type || i.inquiryType === type;

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
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, isResolved: newStatus } : null));
      }
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
        if (selectedInquiry?.id === inquiryToDelete.id) {
          setSelectedInquiry(null);
        }
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

      {/* Search & Filters with Table/Cards View Toggle */}
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
            <option value="social_media_package">Social Media Retainers ✨</option>
            <option value="gear_rental">Cinema Gear Rentals 🎥</option>
            <option value="ob_van">OB Van Broadcast 📡</option>
            <option value="outdoor_filming">Outdoor Filming 🎬</option>
            <option value="studio_booking">Studio Booking 🏢</option>
            <option value="technical_support">Technical Support 🔧</option>
            <option value="general">General Inquiry 💬</option>
          </select>
        }
        actions={
          <div className="flex items-center p-1 bg-white/[0.04] rounded-xl border border-white/10 shrink-0" role="group" aria-label="View Mode">
            <button
              type="button"
              aria-pressed={viewMode === "table"}
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-brand-mauve text-white shadow-sm shadow-brand-violet/20"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <Table size={13} />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              aria-pressed={viewMode === "cards"}
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-brand-mauve text-white shadow-sm shadow-brand-violet/20"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Cards View"
              aria-label="Cards View"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        }
      />

      {/* Main Content: DataTable vs Cards */}
      {viewMode === "table" ? (
        <div>
          <DataTable>
            <DataTableHeader>
              <tr>
                <th className="py-3 px-4">Client &amp; Organization</th>
                <th className="py-3 px-4">Inquiry Type</th>
                <th className="py-3 px-4">Message Brief</th>
                <th className="py-3 px-4">Received</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-end">Actions</th>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {filter.filteredData.length === 0 ? (
                <DataTableEmpty
                  colSpan={6}
                  message="No inquiries match your current filters."
                  onReset={filter.resetFilters}
                />
              ) : (
                filter.pagination.paginatedItems.map((inq) => (
                  <DataTableRow
                    key={inq.id}
                    className={inq.isResolved ? "opacity-60 hover:opacity-100" : ""}
                  >
                    {/* Client & Organization */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User size={13} className="text-brand-mauve shrink-0" />
                        <span>{inq.name}</span>
                      </div>
                      {inq.company && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building size={11} className="text-stone-300 shrink-0" />
                          <span className="truncate max-w-[180px]">{inq.company}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-brand-mauve font-mono mt-0.5 truncate max-w-[200px]">
                        <a
                          href={`mailto:${inq.email}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate">{inq.email}</span>
                        </a>
                      </div>
                    </td>

                    {/* Inquiry Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(() => {
                        const cat = resolveInquiryCategory(inq);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${cat.badgeStyle}`}>
                            {cat.icon}
                            <span>{cat.label}</span>
                          </span>
                        );
                      })()}
                    </td>

                    {/* Message Brief */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(inq)}
                        className="text-start group block cursor-pointer w-full"
                        title="Click to view full message"
                        aria-label={`View full message from ${inq.name}`}
                      >
                        <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                          {inq.message}
                        </p>
                        <span className="text-[10px] text-brand-mauve opacity-0 group-hover:opacity-100 transition-opacity font-medium mt-0.5 inline-block">
                          View full brief →
                        </span>
                      </button>
                    </td>

                    {/* Received */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      <div>
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(inq.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inq.isResolved
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-brand-violet/25 text-brand-lavender border-brand-mauve/30"
                        }`}
                      >
                        {inq.isResolved ? "Resolved" : "Pending Action"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.phone && (
                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${inq.name}, thank you for contacting Yas Productions regarding your inquiry. How can our production team assist you?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                            title="Chat on WhatsApp"
                            aria-label={`Chat with ${inq.name} on WhatsApp`}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="View Full Inquiry"
                          aria-label={`View full inquiry from ${inq.name}`}
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleResolved(inq)}
                          disabled={updatingId === inq.id}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[36px] ${
                            inq.isResolved
                              ? "bg-white/5 hover:bg-white/10 text-slate-400"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                          }`}
                          title={inq.isResolved ? "Reopen Lead" : "Mark Resolved"}
                          aria-label={inq.isResolved ? "Reopen Lead" : "Mark Resolved"}
                        >
                          {inq.isResolved ? "Reopen" : "Resolve"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setInquiryToDelete(inq)}
                          disabled={updatingId === inq.id}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Delete Inquiry"
                          aria-label={`Delete inquiry from ${inq.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>
        </div>
      ) : (
        /* Cards View */
        <div className="space-y-3">
          {filter.filteredData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-2xl bg-white/[0.01] border border-white/10 text-xs space-y-3">
              <p>No inquiries match your current filters.</p>
              <button
                type="button"
                onClick={filter.resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-mauve border border-brand-mauve/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
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
                      {(() => {
                        const cat = resolveInquiryCategory(inq);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${cat.badgeStyle}`}>
                            {cat.icon}
                            {cat.label}
                          </span>
                        );
                      })()}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          inq.isResolved
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-brand-violet/25 text-brand-lavender border-brand-mauve/30"
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
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors w-full justify-center min-h-[36px]"
                        aria-label={`Chat with ${inq.name} on WhatsApp`}
                      >
                        <span>WhatsApp</span>
                        <ExternalLink size={13} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleResolved(inq)}
                      disabled={updatingId === inq.id}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer w-full text-center disabled:opacity-50 min-h-[36px] ${
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
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50 self-end min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete Inquiry"
                      aria-label={`Delete inquiry from ${inq.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls
        currentPage={filter.pagination.currentPage}
        pageCount={filter.pagination.pageCount}
        total={filter.pagination.total}
        startIndex={filter.pagination.startIndex}
        endIndex={filter.pagination.endIndex}
        onPrev={filter.pagination.prevPage}
        onNext={filter.pagination.nextPage}
      />

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <AdminModal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry from ${selectedInquiry.name}`}
          description={`Received on ${new Date(selectedInquiry.createdAt).toLocaleString()} · ${
            resolveInquiryCategory(selectedInquiry).label
          }`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Client Name</span>
                <span className="font-semibold text-white text-sm flex items-center gap-1.5 mt-0.5">
                  <User size={13} className="text-brand-mauve" />
                  {selectedInquiry.name}
                </span>
              </div>
              {selectedInquiry.company && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Company / Agency</span>
                  <span className="text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <Building size={13} className="text-stone-300" />
                    {selectedInquiry.company}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Email Address</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="text-brand-mauve hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Mail size={13} />
                  {selectedInquiry.email}
                </a>
              </div>
              {selectedInquiry.phone && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Phone / Mobile</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="text-slate-300 hover:text-white flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone size={13} />
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">
                Client Narrative Brief / Message
              </span>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-slate-200 leading-relaxed whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  selectedInquiry.isResolved
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-brand-violet/25 text-brand-lavender border-brand-mauve/30"
                }`}
              >
                {selectedInquiry.isResolved ? "Resolved Lead" : "Action Required (Open)"}
              </span>

              <div className="flex items-center gap-2">
                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello ${selectedInquiry.name}, thank you for contacting Yas Productions regarding your inquiry. How can our production team assist you?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  type="button"
                  disabled={updatingId === selectedInquiry.id}
                  onClick={() => handleToggleResolved(selectedInquiry)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                    selectedInquiry.isResolved
                      ? "bg-white/5 hover:bg-white/10 text-slate-300"
                      : "btn-brand font-bold"
                  }`}
                >
                  {updatingId === selectedInquiry.id
                    ? "Updating..."
                    : selectedInquiry.isResolved
                    ? "Reopen Lead"
                    : "Mark Resolved"}
                </button>
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      {/* Delete Confirmation Modal */}
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
