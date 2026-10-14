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
  Sparkles,
  DollarSign,
  Calendar,
  Briefcase,
  Star,
  Film,
  Phone,
} from "lucide-react";
import {
  updateInquiryStatus,
  deleteCmsInquiry,
  updateCampaignInquiryStatus,
  deleteCmsCampaignInquiry,
} from "@/lib/actions/inquiries-leads-operations";
import type { Inquiry, CampaignInquiry } from "@/db/schema";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface InquiriesManagerProps {
  initialInquiries: Inquiry[];
  initialCampaignInquiries?: CampaignInquiry[];
}

const INQUIRY_ICONS: Record<string, React.ReactNode> = {
  ob_van: <Radio size={14} className="text-brand-mauve" />,
  live_broadcast: <Radio size={14} className="text-brand-mauve" />,
  outdoor_filming: <Camera size={14} className="text-emerald-400" />,
  studio_booking: <Layers size={14} className="text-brand-mauve" />,
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

const PILLAR_LABELS: Record<string, string> = {
  general: "General Inquiry",
  studios: "Studios & Soundstages",
  podcast: "Podcast Studio",
  production: "Film & Video Production",
  influencers: "Influencer Collaboration",
  social_media: "Growth & Social Media",
  equipment_rental: "Gear & Equipment Rental",
  outdoor_broadcast: "OB Van Live Broadcast",
};

const PILLAR_ICONS: Record<string, React.ReactNode> = {
  general: <Briefcase size={14} className="text-slate-400" />,
  studios: <Layers size={14} className="text-brand-mauve" />,
  podcast: <Radio size={14} className="text-brand-mauve" />,
  production: <Film size={14} className="text-emerald-400" />,
  influencers: <Star size={14} className="text-brand-mauve" />,
  social_media: <Sparkles size={14} className="text-brand-mauve" />,
  equipment_rental: <Camera size={14} className="text-emerald-400" />,
  outdoor_broadcast: <Radio size={14} className="text-brand-mauve" />,
};

const BUDGET_LABELS: Record<string, string> = {
  under_10k: "< 10,000 AED",
  "10k_25k": "10k - 25k AED",
  "25k_50k": "25k - 50k AED",
  "50k_100k": "50k - 100k AED",
  "100k_plus": "100,000+ AED",
};

const TIMELINE_LABELS: Record<string, string> = {
  immediate: "Immediate (< 2 wks)",
  next_month: "Next Month",
  quarter: "This Quarter",
  flexible: "Flexible / Planning",
};

type CampaignStatus = "new" | "contacted" | "in_progress" | "closed";

export function InquiriesManager({
  initialInquiries,
  initialCampaignInquiries = [],
}: InquiriesManagerProps) {
  const [activeTab, setActiveTab] = useState<"leads" | "campaigns">("leads");

  // General Leads State
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<Inquiry | null>(null);

  // Campaign RFPs State
  const [campaignsList, setCampaignsList] = useState<CampaignInquiry[]>(initialCampaignInquiries);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState("");
  const [campaignPillarFilter, setCampaignPillarFilter] = useState<string>("all");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<"all" | CampaignStatus>("all");
  const [updatingCampaignId, setUpdatingCampaignId] = useState<string | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignInquiry | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  // Filtered Leads
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

  // Filtered Campaigns
  const filteredCampaigns = campaignsList.filter((c) => {
    const q = campaignSearchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      (c.targetName && c.targetName.toLowerCase().includes(q)) ||
      (c.targetId && c.targetId.toLowerCase().includes(q)) ||
      c.message.toLowerCase().includes(q);
    const matchesPillar = campaignPillarFilter === "all" || c.pillar === campaignPillarFilter;
    const matchesStatus = campaignStatusFilter === "all" || c.status === campaignStatusFilter;
    return matchesSearch && matchesPillar && matchesStatus;
  });

  const paginationCampaigns = usePagination(filteredCampaigns, 20);

  const totalNewCampaigns = campaignsList.filter((c) => c.status === "new").length;
  const totalContactedCampaigns = campaignsList.filter((c) => c.status === "contacted").length;
  const totalActiveCampaigns = campaignsList.filter((c) => c.status === "in_progress").length;
  const totalClosedCampaigns = campaignsList.filter((c) => c.status === "closed").length;

  // General Lead Handlers
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

  const handleConfirmDeleteLead = async () => {
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

  // Campaign RFP Handlers
  const handleUpdateCampaignStatus = async (
    id: string,
    newStatus: CampaignStatus
  ) => {
    setUpdatingCampaignId(id);
    setErrorMessage(null);
    try {
      const res = await updateCampaignInquiryStatus(id, newStatus);
      if (res.success) {
        setCampaignsList((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        showFeedback(`Campaign RFP status updated to ${newStatus}`);
      } else {
        setErrorMessage(res.error || "Failed to update campaign status");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update campaign status");
    } finally {
      setUpdatingCampaignId(null);
    }
  };

  const handleConfirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    setIsDeleting(true);
    setErrorMessage(null);
    setUpdatingCampaignId(campaignToDelete.id);
    try {
      const res = await deleteCmsCampaignInquiry(campaignToDelete.id);
      if (res.success) {
        setCampaignsList((prev) => prev.filter((c) => c.id !== campaignToDelete.id));
        showFeedback(`Campaign RFP from ${campaignToDelete.name} deleted.`);
        setCampaignToDelete(null);
      } else {
        setErrorMessage(res.error || "Failed to delete campaign inquiry");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete campaign inquiry");
    } finally {
      setIsDeleting(false);
      setUpdatingCampaignId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <MessageSquare size={24} className="text-brand-mauve" />
            Client Inquiries &amp; Campaign RFPs Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage incoming briefs, OB Van broadcasts, influencer campaigns, and multi-service RFPs.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {feedback && (
            <FeedbackAlert type="success" message={feedback} onDismiss={clearFeedback} />
          )}
          {errorMessage && (
            <FeedbackAlert type="error" message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("leads")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "leads"
              ? "border-brand-mauve text-brand-mauve font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <MessageSquare size={16} />
          <span>General &amp; Studio Leads ({inquiriesList.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "campaigns"
              ? "border-brand-mauve text-brand-mauve font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles size={16} />
          <span>Services &amp; Campaign RFPs ({campaignsList.length})</span>
        </button>
      </div>

      {/* ─── TAB 1: General & Studio Leads ────────────────────────────────────── */}
      {activeTab === "leads" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Total Leads",
                icon: <MessageSquare size={14} className="text-brand-mauve" />,
                value: inquiriesList.length,
                color: "text-white",
              },
              {
                label: "Action Required (Open)",
                icon: <Clock size={14} className="text-brand-mauve" />,
                value: totalPending,
                color: "text-brand-mauve",
              },
              {
                label: "Resolved Inquiries",
                icon: <CheckCircle2 size={14} className="text-emerald-400" />,
                value: totalResolved,
                color: "text-emerald-300",
              },
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
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-mauve transition-colors"
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
                      ? "bg-brand-violet text-white font-bold border border-brand-mauve/40 shadow-lg shadow-brand-violet/25"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab === "all" ? "All Status" : tab}
                </button>
              ))}

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-brand-mauve"
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
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-brand-mauve/15 text-brand-mauve border-brand-mauve/30"
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
                          className="text-brand-mauve hover:text-white flex items-center gap-1 font-mono transition-colors"
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
            currentPage={pagination.currentPage}
            pageCount={pagination.pageCount}
            total={pagination.total}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
            variant="card"
          />
        </>
      )}

      {/* ─── TAB 2: Services & Campaign RFPs ─────────────────────────────────── */}
      {activeTab === "campaigns" && (
        <>
          {/* Campaign KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Total RFPs</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {campaignsList.length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-brand-mauve font-mono uppercase block">New Inbound</span>
              <span className="text-xl font-bold text-brand-mauve font-mono mt-1 block">
                {totalNewCampaigns}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-sky-400 font-mono uppercase block">Contacted / In Progress</span>
              <span className="text-xl font-bold text-sky-300 font-mono mt-1 block">
                {totalContactedCampaigns + totalActiveCampaigns}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] text-emerald-400 font-mono uppercase block">Closed Deals</span>
              <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">
                {totalClosedCampaigns}
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search RFPs by client, target, agency, keywords..."
                value={campaignSearchQuery}
                onChange={(e) => setCampaignSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-mauve transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
              <select
                value={campaignStatusFilter}
                onChange={(e) =>
                  setCampaignStatusFilter(e.target.value as "all" | CampaignStatus)
                }
                aria-label="Filter by campaign status"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Campaign Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={campaignPillarFilter}
                onChange={(e) => setCampaignPillarFilter(e.target.value)}
                aria-label="Filter by service pillar"
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-brand-mauve"
              >
                <option value="all">All Service Pillars</option>
                <option value="studios">Studios &amp; Soundstages</option>
                <option value="podcast">Podcast Studio</option>
                <option value="production">Studio &amp; Video Production</option>
                <option value="influencers">Influencer Collaboration</option>
                <option value="social_media">Growth &amp; Social Media</option>
                <option value="equipment_rental">Gear &amp; Equipment Rental</option>
                <option value="outdoor_broadcast">OB Van Live Broadcast</option>
                <option value="general">General Campaign</option>
              </select>
            </div>
          </div>

          {/* Campaign RFPs Cards */}
          <div className="space-y-3">
            {filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-white/[0.01] border border-white/10">
                No campaign RFPs match your current filters.
              </div>
            ) : (
              paginationCampaigns.paginatedItems.map((rfp) => {
                const isUpdating = updatingCampaignId === rfp.id;
                return (
                  <div
                    key={rfp.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      rfp.status === "closed"
                        ? "bg-white/[0.01] border-white/5 opacity-75"
                        : "bg-slate-900/60 border-white/10 shadow-lg"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      <div className="space-y-3 flex-1">
                        {/* Badges & Meta */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
                            {PILLAR_ICONS[rfp.pillar] || <Briefcase size={12} />}
                            {PILLAR_LABELS[rfp.pillar] || rfp.pillar}
                          </span>

                          {rfp.targetName && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-white">
                              Target: <strong className="text-brand-mauve">{rfp.targetName}</strong>
                            </span>
                          )}

                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(rfp.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Client details */}
                        <div className="flex items-center gap-4 text-xs flex-wrap text-slate-300">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            <User size={13} className="text-brand-mauve" /> {rfp.name}
                          </span>
                          {rfp.company && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Building size={13} className="text-stone-300" /> {rfp.company}
                            </span>
                          )}
                          <a
                            href={`mailto:${rfp.email}`}
                            className="text-brand-mauve hover:text-white flex items-center gap-1 font-mono transition-colors"
                          >
                            <Mail size={13} /> {rfp.email}
                          </a>
                          {rfp.phone && (
                            <span className="text-slate-400 flex items-center gap-1 font-mono">
                              <Phone size={13} /> {rfp.phone}
                            </span>
                          )}
                        </div>

                        {/* Deliverables / Scope pills */}
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          {rfp.budgetRange && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-emerald-400 font-mono">
                              <DollarSign size={13} />
                              <span>{BUDGET_LABELS[rfp.budgetRange] || rfp.budgetRange}</span>
                            </div>
                          )}

                          {rfp.timeline && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-sky-300">
                              <Calendar size={13} />
                              <span>{TIMELINE_LABELS[rfp.timeline] || rfp.timeline}</span>
                            </div>
                          )}

                          {rfp.goals && Array.isArray(rfp.goals) && rfp.goals.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {rfp.goals.map((g) => (
                                <span
                                  key={g}
                                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-300 font-mono"
                                >
                                  #{g.replace(/_/g, " ")}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Campaign Message / Brief */}
                        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200 leading-relaxed">
                          {rfp.message}
                        </div>
                      </div>

                      {/* Action & Status Selectors */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2.5 shrink-0 pt-2 lg:pt-0">
                        <div className="flex flex-col gap-1 w-full lg:w-44">
                          <label className="text-[10px] uppercase font-mono text-slate-400">
                            Workflow Stage
                          </label>
                          <select
                            value={rfp.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleUpdateCampaignStatus(rfp.id, e.target.value as CampaignStatus)
                            }
                            className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none transition-colors cursor-pointer ${
                              rfp.status === "new"
                                ? "bg-brand-violet/30 text-brand-mauve border-brand-mauve/40"
                                : rfp.status === "contacted"
                                ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
                                : rfp.status === "in_progress"
                                ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            <option value="new" className="bg-zinc-900 text-white">
                              New Inbound
                            </option>
                            <option value="contacted" className="bg-zinc-900 text-white">
                              Contacted
                            </option>
                            <option value="in_progress" className="bg-zinc-900 text-white">
                              In Progress
                            </option>
                            <option value="closed" className="bg-zinc-900 text-white">
                              Deal Closed
                            </option>
                          </select>
                        </div>

                        {rfp.phone && (
                          <a
                            href={`https://wa.me/${rfp.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                              `Hello ${rfp.name}, thank you for your campaign brief regarding ${rfp.targetName || "our services"} at Yas Productions. We would love to discuss next steps with you.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors justify-center w-full lg:w-44"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink size={12} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setCampaignToDelete(rfp)}
                          disabled={isUpdating}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer disabled:opacity-50 self-end"
                          title="Delete Campaign RFP"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <PaginationControls
            currentPage={paginationCampaigns.currentPage}
            pageCount={paginationCampaigns.pageCount}
            total={paginationCampaigns.total}
            startIndex={paginationCampaigns.startIndex}
            endIndex={paginationCampaigns.endIndex}
            onPrev={paginationCampaigns.prevPage}
            onNext={paginationCampaigns.nextPage}
            variant="card"
          />
        </>
      )}

      {/* Delete Confirmation Modal for Leads */}
      {inquiryToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(inquiryToDelete)}
          onClose={() => setInquiryToDelete(null)}
          onConfirm={handleConfirmDeleteLead}
          title="Delete Client Inquiry"
          message={`Are you sure you want to permanently delete the inquiry from "${inquiryToDelete.name}" (${inquiryToDelete.email})? This action cannot be undone.`}
          confirmLabel="Delete Inquiry"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}

      {/* Delete Confirmation Modal for Campaign RFPs */}
      {campaignToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(campaignToDelete)}
          onClose={() => setCampaignToDelete(null)}
          onConfirm={handleConfirmDeleteCampaign}
          title="Delete Campaign RFP"
          message={`Are you sure you want to permanently delete the campaign RFP from "${campaignToDelete.name}" (${campaignToDelete.email})? This action cannot be undone.`}
          confirmLabel="Delete Campaign RFP"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
