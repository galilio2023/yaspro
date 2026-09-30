"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
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
import { updateInquiryStatus, deleteCmsInquiry } from "@/lib/cms-actions";
import type { Inquiry } from "@/db/schema";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
}

const INQUIRY_ICONS: Record<string, React.ReactNode> = {
  ob_van: <Radio size={14} className="text-amber-400" />,
  live_broadcast: <Radio size={14} className="text-cyan-400" />,
  outdoor_filming: <Camera size={14} className="text-emerald-400" />,
  studio_booking: <Layers size={14} className="text-purple-400" />,
  technical_support: <Wrench size={14} className="text-blue-400" />,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  const filteredInquiries = inquiriesList.filter((i) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      i.name.toLowerCase().includes(query) ||
      i.email.toLowerCase().includes(query) ||
      (i.company && i.company.toLowerCase().includes(query)) ||
      i.message.toLowerCase().includes(query);
    const matchesType = filterType === "all" || i.inquiryType === filterType;
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "resolved"
        ? i.isResolved
        : !i.isResolved;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pagination = usePagination(filteredInquiries, 20);

  const totalPending = inquiriesList.filter((i) => !i.isResolved).length;
  const totalResolved = inquiriesList.filter((i) => i.isResolved).length;

  const handleToggleResolved = async (inquiry: Inquiry) => {
    const newStatus = !inquiry.isResolved;
    setUpdatingId(inquiry.id);
    const res = await updateInquiryStatus(inquiry.id, newStatus);
    if (res.success) {
      setInquiriesList((prev) =>
        prev.map((i) => (i.id === inquiry.id ? { ...i, isResolved: newStatus } : i))
      );
      showFeedback(`Inquiry marked as ${newStatus ? "resolved" : "open"}`);
    } else {
      alert(res.error || "Failed to update status");
    }
    setUpdatingId(null);
  };

  const handleDelete = async (inquiry: Inquiry) => {
    if (!confirm(`Delete inquiry from ${inquiry.name}? This action cannot be undone.`)) return;
    setUpdatingId(inquiry.id);
    const res = await deleteCmsInquiry(inquiry.id);
    if (res.success) {
      setInquiriesList((prev) => prev.filter((i) => i.id !== inquiry.id));
      showFeedback("Inquiry deleted");
    } else {
      alert(res.error || "Failed to delete inquiry");
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <MessageSquare size={24} className="text-purple-400" />
            Client Inquiries &amp; Production Leads
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Incoming briefs from contact inquiries, OB Van quotes, and influencer collaboration forms.
          </p>
        </div>
        {feedback && (
          <FeedbackAlert type="success" message={feedback} onDismiss={clearFeedback} />
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Inquiries", icon: <MessageSquare size={14} className="text-purple-400" />, value: inquiriesList.length, color: "text-white" },
          { label: "Action Required (Open)", icon: <Clock size={14} className="text-amber-400" />, value: totalPending, color: "text-amber-400" },
          { label: "Resolved Leads", icon: <CheckCircle2 size={14} className="text-brand-teal" />, value: totalResolved, color: "text-brand-teal-light" },
        ].map(({ label, icon, value, color }) => (
          <div key={label} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              {icon} {label}
            </span>
            <span className={`text-2xl font-bold mt-1 block ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search leads by name, email, company, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          {(["all", "open", "resolved"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                filterStatus === tab
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab === "all" ? "All Status" : tab}
            </button>
          ))}

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Inquiry Types</option>
            <option value="ob_van">OB Van Broadcast</option>
            <option value="live_broadcast">Live Broadcast</option>
            <option value="studio_booking">Studio Booking</option>
            <option value="outdoor_filming">Outdoor Filming</option>
            <option value="technical_support">Technical Support</option>
            <option value="general">General Inquiry</option>
          </select>
        </div>
      </div>

      {/* Inquiries Cards */}
      <div className="space-y-3">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl bg-white/[0.01] border border-white/10">
            No inquiries match your current filters.
          </div>
        ) : (
          pagination.paginatedItems.map((inq) => (
            <div
              key={inq.id}
              className={`p-5 rounded-2xl border transition-all ${
                inq.isResolved
                  ? "bg-white/[0.01] border-white/5 opacity-70"
                  : "bg-slate-900/60 border-white/10 shadow-lg"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category and Status */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-white">
                      {INQUIRY_ICONS[inq.inquiryType] || <HelpCircle size={12} />}
                      {INQUIRY_LABELS[inq.inquiryType] || inq.inquiryType}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        inq.isResolved
                          ? "bg-brand-teal/15 text-brand-teal-light border-brand-teal/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
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
                      <User size={13} className="text-purple-400" /> {inq.name}
                    </span>
                    {inq.company && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Building size={13} className="text-blue-400" /> {inq.company}
                      </span>
                    )}
                    <a
                      href={`mailto:${inq.email}`}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-mono"
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
                      className="px-3 py-1.5 rounded-xl bg-brand-teal/20 hover:bg-brand-teal/30 border border-brand-teal/40 text-brand-teal-light text-xs font-semibold flex items-center gap-1.5 transition-colors w-full justify-center"
                    >
                      <span>WhatsApp</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleResolved(inq)}
                    disabled={updatingId === inq.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer w-full text-center disabled:opacity-50 ${
                      inq.isResolved
                        ? "bg-white/5 hover:bg-white/10 text-slate-400"
                        : "bg-purple-600 hover:bg-purple-500 text-white"
                    }`}
                  >
                    {inq.isResolved ? "Reopen Lead" : "Mark Resolved"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(inq)}
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
        currentPage={pagination.currentPage}
        pageCount={pagination.pageCount}
        total={pagination.total}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPrev={pagination.prevPage}
        onNext={pagination.nextPage}
        variant="card"
      />
    </div>
  );
}
