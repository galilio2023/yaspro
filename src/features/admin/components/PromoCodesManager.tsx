"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Search,
  Calendar,
  Percent,
  Coins,
  History,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { PromoCode, PromoUsage } from "@/db/schema";
import {
  createCmsPromoCode,
  toggleCmsPromoCodeStatus,
  deleteCmsPromoCode,
  type CreatePromoInput,
} from "@/lib/actions/promo-codes-operations";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface PromoCodesManagerProps {
  initialPromoCodes: PromoCode[];
  initialUsages: PromoUsage[];
}

const APPLICABLE_OPTIONS = [
  { id: "all", label: "All Pillars" },
  { id: "studio_booking", label: "Studio Bookings" },
  { id: "podcast_booking", label: "Podcast Sessions" },
  { id: "offer_claim", label: "Package Bundles" },
  { id: "gear_rental", label: "Gear Rental" },
];

export function PromoCodesManager({ initialPromoCodes, initialUsages }: PromoCodesManagerProps) {
  const [activeTab, setActiveTab] = useState<"codes" | "usages">("codes");
  const [promos, setPromos] = useState<PromoCode[]>(initialPromoCodes);
  const [usages] = useState<PromoUsage[]>(initialUsages);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [now] = useState(() => Date.now());

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("10");
  const [minSpend, setMinSpend] = useState<string>("0");
  const [maxUses, setMaxUses] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [applicableTypes, setApplicableTypes] = useState<string[]>(["all"]);
  const [isActive, setIsActive] = useState(true);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3000);

  // Filtered promos
  const filteredPromos = promos.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.code.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.isActive) ||
      (statusFilter === "inactive" && !p.isActive);
    return matchesSearch && matchesStatus;
  });

  const paginationPromos = usePagination(filteredPromos, 15);

  // Filtered usages
  const filteredUsages = usages.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      u.code.toLowerCase().includes(q) ||
      u.userEmail.toLowerCase().includes(q) ||
      u.orderReference.toLowerCase().includes(q)
    );
  });

  const paginationUsages = usePagination(filteredUsages, 15);

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountValue("10");
    setMinSpend("0");
    setMaxUses("");
    setExpiresAt("");
    setApplicableTypes(["all"]);
    setIsActive(true);
    setFormError(null);
  };

  const handleToggleActive = async (promo: PromoCode) => {
    const newStatus = !promo.isActive;
    try {
      const res = await toggleCmsPromoCodeStatus(promo.id, newStatus);
      if (res.success) {
        setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, isActive: newStatus } : p)));
        showFeedback(`Promo ${promo.code} is now ${newStatus ? "active" : "inactive"}`);
      } else {
        showFeedback(res.error || "Failed to update status");
      }
    } catch {
      showFeedback("Failed to update status");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError("Please enter a valid discount value greater than 0.");
      return;
    }
    if (discountType === "percentage" && val > 100) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    const payload: CreatePromoInput = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: val,
      minSpend: parseFloat(minSpend) || 0,
      applicableTypes: applicableTypes.length > 0 ? applicableTypes : ["all"],
      maxUses: maxUses ? parseInt(maxUses, 10) : null,
      expiresAt: expiresAt || null,
      isActive,
    };

    setIsSubmitting(true);
    try {
      const res = await createCmsPromoCode(payload);
      if (res.success && res.data) {
        setPromos((prev) => [res.data!, ...prev]);
        showFeedback(res.message || "Promo code created successfully!");
        setIsCreateOpen(false);
        resetForm();
      } else {
        setFormError(res.error || "Failed to create promo code.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCmsPromoCode(promoToDelete.id);
      if (res.success) {
        setPromos((prev) => prev.filter((p) => p.id !== promoToDelete.id));
        showFeedback(`Promo code ${promoToDelete.code} deleted.`);
        setPromoToDelete(null);
      } else {
        showFeedback(res.error || "Failed to delete promo code.");
      }
    } catch {
      showFeedback("Failed to delete promo code.");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleApplicable = (id: string) => {
    if (id === "all") {
      setApplicableTypes(["all"]);
      return;
    }
    let updated = applicableTypes.filter((t) => t !== "all");
    if (updated.includes(id)) {
      updated = updated.filter((t) => t !== id);
      if (updated.length === 0) updated = ["all"];
    } else {
      updated.push(id);
    }
    setApplicableTypes(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
              <Tag size={20} />
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight font-display">Promo Codes Engine</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Create coupons, manage discounts, configure limits, and track redemption activity across all pillars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-mauve hover:bg-brand-mauve-soft text-black font-semibold text-sm transition-all shadow-lg shadow-brand-violet/30 active:scale-95"
          >
            <Plus size={16} />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {feedback && <FeedbackAlert type="success" message={feedback} onDismiss={clearFeedback} />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-px">
        <button
          onClick={() => setActiveTab("codes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "codes"
              ? "border-brand-mauve text-brand-mauve font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Tag size={16} />
          <span>Active Codes ({promos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("usages")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === "usages"
              ? "border-brand-mauve text-brand-mauve font-semibold"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <History size={16} />
          <span>Redemption Logs ({usages.length})</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === "codes" ? "Search promo code..." : "Search email, code, ref..."}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-mauve transition-colors"
          />
        </div>

        {activeTab === "codes" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              aria-label="Filter promo codes by status"
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-sm text-zinc-300 focus:outline-none focus:border-brand-mauve"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Codes Table */}
      {activeTab === "codes" && (
        <div className="rounded-2xl border border-white/10 bg-[#0c0b10] overflow-hidden">
          <DataTable>
            <DataTableHeader>
              <tr>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Coupon Code</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Discount</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Min Spend</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Applicable For</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Redemptions</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Expires</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Status</th>
                <th className="py-3.5 px-4 text-right text-xs font-semibold text-zinc-400">Actions</th>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {paginationPromos.paginatedItems.length === 0 ? (
                <DataTableEmpty colSpan={8} message="No promo codes match your query." />
              ) : (
                paginationPromos.paginatedItems.map((promo) => {
                  const isExpired = promo.expiresAt && new Date(promo.expiresAt).getTime() < now;
                  const isMaxedOut = promo.maxUses && promo.usedCount >= promo.maxUses;
                  return (
                    <DataTableRow key={promo.id}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white tracking-wider px-2.5 py-1 rounded-lg bg-brand-violet/20 border border-brand-mauve/40 text-sm">
                            {promo.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-mauve-soft">
                          {promo.discountType === "percentage" ? (
                            <>
                              <Percent size={14} />
                              <span>{promo.discountValue}% OFF</span>
                            </>
                          ) : (
                            <>
                              <Coins size={14} />
                              <span>{promo.discountValue} AED</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">
                        {parseFloat(promo.minSpend || "0") > 0 ? `${promo.minSpend} AED` : "No Min"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(promo.applicableTypes) && promo.applicableTypes.includes("all") ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                              All Pillars
                            </span>
                          ) : (
                            (promo.applicableTypes as string[] || []).map((t) => (
                              <span
                                key={t}
                                className="text-[11px] px-2 py-0.5 rounded-full bg-brand-violet/20 border border-brand-mauve/20 text-brand-mauve-soft"
                              >
                                {t.replace("_", " ")}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">
                        <span className="font-mono">
                          {promo.usedCount}
                          {promo.maxUses ? ` / ${promo.maxUses}` : " (unlimited)"}
                        </span>
                        {isMaxedOut && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30 text-red-400">
                            Maxed
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-400">
                        {promo.expiresAt ? (
                          <span className={isExpired ? "text-red-400 font-medium" : ""}>
                            {new Date(promo.expiresAt).toLocaleDateString()}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          "Never"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(promo)}
                          className="flex items-center gap-1.5 text-xs transition-colors"
                        >
                          {promo.isActive ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                              <ToggleRight size={14} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                              <ToggleLeft size={14} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPromoToDelete(promo)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete promo code"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </DataTableRow>
                  );
                })
              )}
            </DataTableBody>
          </DataTable>

          {paginationPromos.pageCount > 1 && (
            <PaginationControls
              currentPage={paginationPromos.currentPage}
              pageCount={paginationPromos.pageCount}
              total={paginationPromos.total}
              startIndex={paginationPromos.startIndex}
              endIndex={paginationPromos.endIndex}
              onPrev={paginationPromos.prevPage}
              onNext={paginationPromos.nextPage}
              variant="table"
            />
          )}
        </div>
      )}

      {/* Usages Table */}
      {activeTab === "usages" && (
        <div className="rounded-2xl border border-white/10 bg-[#0c0b10] overflow-hidden">
          <DataTable>
            <DataTableHeader>
              <tr>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Code</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Customer Email</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Order Reference</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Discount Applied</th>
                <th className="py-3.5 px-4 text-left text-xs font-semibold text-zinc-400">Redeemed At</th>
              </tr>
            </DataTableHeader>
            <DataTableBody>
              {paginationUsages.paginatedItems.length === 0 ? (
                <DataTableEmpty colSpan={5} message="No redemption logs found." />
              ) : (
                paginationUsages.paginatedItems.map((u) => (
                  <DataTableRow key={u.id}>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-white/5 border border-white/10">
                        {u.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-300">{u.userEmail}</td>
                    <td className="py-3 px-4 text-sm font-mono text-brand-mauve-soft">{u.orderReference}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-emerald-400">-{u.discountApplied} AED</td>
                    <td className="py-3 px-4 text-sm text-zinc-400">{new Date(u.usedAt).toLocaleString()}</td>
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DataTable>

          {paginationUsages.pageCount > 1 && (
            <PaginationControls
              currentPage={paginationUsages.currentPage}
              pageCount={paginationUsages.pageCount}
              total={paginationUsages.total}
              startIndex={paginationUsages.startIndex}
              endIndex={paginationUsages.endIndex}
              onPrev={paginationUsages.prevPage}
              onNext={paginationUsages.nextPage}
              variant="table"
            />
          )}
        </div>
      )}

      {/* Create Promo Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#121118] border border-white/15 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-brand-mauve" />
                <h3 className="text-lg font-bold text-white font-display">Create New Promo Code</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP25, RAMADAN, YASPRO"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white font-mono font-bold tracking-wider placeholder-zinc-500 focus:outline-none focus:border-brand-mauve"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-sm text-white focus:outline-none focus:border-brand-mauve"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Value {discountType === "percentage" ? "(%)" : "(AED)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-mauve"
                  />
                </div>
              </div>

              {/* Min Spend & Max Uses */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Min Spend (AED)</label>
                  <input
                    type="number"
                    min="0"
                    value={minSpend}
                    onChange={(e) => setMinSpend(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-mauve"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-mauve"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Expiration Date (Optional)</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-sm focus:outline-none focus:border-brand-mauve [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Applicable Pillars */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Applicable Business Pillars</label>
                <div className="grid grid-cols-2 gap-2">
                  {APPLICABLE_OPTIONS.map((opt) => {
                    const isChecked = applicableTypes.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => toggleApplicable(opt.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                          isChecked
                            ? "bg-brand-violet/20 border-brand-mauve text-white"
                            : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span
                          className={`size-3.5 rounded flex items-center justify-center border text-[9px] ${
                            isChecked ? "bg-brand-mauve border-brand-mauve text-black font-bold" : "border-zinc-600"
                          }`}
                        >
                          {isChecked && "✓"}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-mauve hover:bg-brand-mauve-soft text-black font-semibold text-sm transition-all shadow-lg shadow-brand-violet/30 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save Promo Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {promoToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(promoToDelete)}
          onClose={() => setPromoToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Promo Code"
          message={`Are you sure you want to permanently delete promo code "${promoToDelete.code}"? Customers will no longer be able to redeem this coupon.`}
          confirmLabel="Delete Code"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
