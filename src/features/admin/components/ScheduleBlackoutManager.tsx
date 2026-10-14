"use client";

import React, { useState } from "react";
import {
  CalendarOff,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  Building2,
  X,
  AlertCircle,
  ShieldAlert,
  Layers,
} from "lucide-react";
import type { EnrichedBlockedSchedule } from "@/lib/actions/schedule-blackouts";
import {
  createBlockedSchedule,
  deleteBlockedSchedule,
} from "@/lib/actions/schedule-blackouts";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface StudioOption {
  id: string;
  name: string;
}

interface ScheduleBlackoutManagerProps {
  initialSchedules: EnrichedBlockedSchedule[];
  studios: StudioOption[];
}

const SCOPE_OPTIONS = [
  { id: "all", label: "Facility-Wide (All Services)" },
  { id: "studio_booking", label: "Soundstages Booking Only" },
  { id: "podcast_booking", label: "Podcast Studio Only" },
  { id: "gear_rental", label: "Gear & Equipment Rental" },
];

export function ScheduleBlackoutManager({
  initialSchedules,
  studios,
}: ScheduleBlackoutManagerProps) {
  const [schedules, setSchedules] = useState<EnrichedBlockedSchedule[]>(initialSchedules);
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<string>("all_filter");
  const [studioFilter, setStudioFilter] = useState<string>("all_filter");

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<EnrichedBlockedSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedStudioId, setSelectedStudioId] = useState("");
  const [scope, setScope] = useState<"all" | "studio_booking" | "podcast_booking" | "gear_rental">("all");
  const [reason, setReason] = useState("");

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(4000);

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.reason.toLowerCase().includes(q) ||
      (s.studioName && s.studioName.toLowerCase().includes(q)) ||
      s.startDate.includes(q) ||
      s.endDate.includes(q);

    const matchesScope =
      scopeFilter === "all_filter" || s.scope === scopeFilter;

    const matchesStudio =
      studioFilter === "all_filter" ||
      (studioFilter === "facility_wide" && !s.studioId) ||
      s.studioId === studioFilter;

    return matchesSearch && matchesScope && matchesStudio;
  });

  const {
    paginatedItems,
    currentPage,
    pageCount,
    total,
    startIndex,
    endIndex,
    prevPage,
    nextPage,
  } = usePagination(filteredSchedules, 12);

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSelectedStudioId("");
    setScope("all");
    setReason("");
    setFormError(null);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError("Both start and end dates are required.");
      return;
    }

    if (startDate > endDate) {
      setFormError("End date cannot be earlier than start date.");
      return;
    }

    if (!reason.trim()) {
      setFormError("Please provide a reason or internal note for this blackout.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBlockedSchedule({
        startDate,
        endDate,
        startTime: startTime.trim() || null,
        endTime: endTime.trim() || null,
        studioId: selectedStudioId || null,
        scope,
        reason: reason.trim(),
      });

      if (res.success && res.blockedSchedule) {
        const enriched = {
          ...res.blockedSchedule,
          studioName: studios.find((st) => st.id === selectedStudioId)?.name || null,
        };
        setSchedules((prev) => [enriched, ...prev]);
        showFeedback(res.message || "Schedule blackout created successfully.");
        setIsCreateOpen(false);
        resetForm();
      } else {
        setFormError(res.error || "Failed to block dates.");
      }
    } catch (err) {
      setFormError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteBlockedSchedule(scheduleToDelete.id);
      if (res.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id));
        showFeedback("Blackout removed. Dates are now open for client booking.");
        setScheduleToDelete(null);
      } else {
        showFeedback(res.error || "Failed to remove blackout.");
      }
    } catch (err) {
      showFeedback((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarOff className="text-brand-mauve" size={28} />
            Schedule & Blackouts Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Block calendar dates and times for soundstage maintenance, private bookings, or studio-wide blackouts.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-violet/25 hover:shadow-brand-violet/40 border border-brand-mauve/30 shrink-0"
        >
          <Plus size={16} />
          Block Dates / Add Blackout
        </button>
      </div>

      {feedback && <FeedbackAlert message={feedback} onDismiss={clearFeedback} />}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search reason, studio, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 transition-colors"
          />
        </div>

        <div>
          <select
            value={studioFilter}
            onChange={(e) => setStudioFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-mauve/60 transition-colors"
          >
            <option value="all_filter" className="bg-[#0f0e15] text-slate-200">
              All Studios & Stages
            </option>
            <option value="facility_wide" className="bg-[#0f0e15] text-slate-200">
              Facility-Wide Blackouts Only
            </option>
            {studios.map((st) => (
              <option key={st.id} value={st.id} className="bg-[#0f0e15] text-slate-200">
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-mauve/60 transition-colors"
          >
            <option value="all_filter" className="bg-[#0f0e15] text-slate-200">
              All Service Scopes
            </option>
            {SCOPE_OPTIONS.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-[#0f0e15] text-slate-200">
                {sc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blackouts Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Soundstage / Scope
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Blocked Dates & Times
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Reason / Operational Note
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {paginatedItems.length === 0 ? (
            <DataTableEmpty
              colSpan={4}
              message="No active schedule blackouts match your search or filter."
            />
          ) : (
            paginatedItems.map((item: EnrichedBlockedSchedule) => (
              <DataTableRow key={item.id}>
                {/* Target & Scope */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
                      <Building2 size={15} className="text-brand-mauve shrink-0" />
                      {item.studioName || "Facility-Wide (All Studios)"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full w-fit border border-white/10">
                      <Layers size={11} className="text-brand-mauve-soft" />
                      {SCOPE_OPTIONS.find((s) => s.id === item.scope)?.label || item.scope}
                    </span>
                  </div>
                </td>

                {/* Date & Time Range */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white flex items-center gap-1.5 font-mono">
                      <Calendar size={14} className="text-brand-mauve" />
                      {item.startDate === item.endDate
                        ? item.startDate
                        : `${item.startDate} → ${item.endDate}`}
                    </span>
                    {item.startTime || item.endTime ? (
                      <span className="text-xs text-brand-mauve-soft flex items-center gap-1.5 font-mono">
                        <Clock size={12} />
                        {item.startTime || "00:00"} — {item.endTime || "23:59"}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">All-day blackout (24 hours)</span>
                    )}
                  </div>
                </td>

                {/* Reason */}
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2 max-w-md">
                    <ShieldAlert size={15} className="text-brand-mauve shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200 line-clamp-2">
                      {item.reason}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => setScheduleToDelete(item)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                    title="Remove blackout and reopen dates"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      {/* Pagination */}
      {filteredSchedules.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          pageCount={pageCount}
          total={total}
          startIndex={startIndex}
          endIndex={endIndex}
          onPrev={prevPage}
          onNext={nextPage}
        />
      )}

      {/* Create Blackout Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f0e15] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve">
                  <CalendarOff size={16} />
                </div>
                <h3 className="font-semibold text-white">Block Schedule Dates</h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSchedule} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Studio / Soundstage
                  </label>
                  <select
                    value={selectedStudioId}
                    onChange={(e) => setSelectedStudioId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                  >
                    <option value="" className="bg-[#0f0e15] text-slate-200">
                      Facility-Wide (All Soundstages)
                    </option>
                    {studios.map((st) => (
                      <option key={st.id} value={st.id} className="bg-[#0f0e15] text-slate-200">
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Service Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as "all" | "studio_booking" | "podcast_booking" | "gear_rental")}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                  >
                    {SCOPE_OPTIONS.map((sc) => (
                      <option key={sc.id} value={sc.id} className="bg-[#0f0e15] text-slate-200">
                        {sc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-mauve/60 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-mauve/60 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="e.g. 09:00"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-mauve/60 [color-scheme:dark]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Leave empty for full-day blackout</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="e.g. 18:00"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-mauve/60 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reason / Operational Note <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual acoustic recalibration & cyclorama floor repainting"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-violet/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Blocking Dates..." : "Confirm Blackout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!scheduleToDelete}
        title="Remove Blackout Schedule"
        message={`Are you sure you want to remove the blackout for ${
          scheduleToDelete?.startDate === scheduleToDelete?.endDate
            ? scheduleToDelete?.startDate
            : `${scheduleToDelete?.startDate} to ${scheduleToDelete?.endDate}`
        }? This will immediately reopen these dates on customer booking calendars.`}
        confirmLabel="Remove Blackout"
        isSubmitting={isDeleting}
        onConfirm={handleDeleteSchedule}
        onClose={() => setScheduleToDelete(null)}
      />
    </div>
  );
}
