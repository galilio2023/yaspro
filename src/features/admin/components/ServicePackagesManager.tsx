"use client";

import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Mic,
  Gift,
  Share2,
  Film,
  Clock,
  CheckCircle2,
  Layers,
} from "lucide-react";
import type { ServicePackage } from "@/db/schema";
import {
  createCmsPackage,
  updateCmsPackage,
  toggleCmsPackageStatus,
  deleteCmsPackage,
} from "@/lib/actions/service-packages";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface ServicePackagesManagerProps {
  initialPackages: ServicePackage[];
}

const PILLARS = [
  { id: "all", label: "All Pillars", icon: Boxes },
  { id: "podcast", label: "Podcast Studio", icon: Mic },
  { id: "offers", label: "Offers & Bundles", icon: Gift },
  { id: "social_media", label: "Social Media Retainers", icon: Share2 },
  { id: "production", label: "Film Production", icon: Film },
  { id: "soundstage", label: "Soundstages", icon: Layers },
];

export function ServicePackagesManager({ initialPackages }: ServicePackagesManagerProps) {
  const [packages, setPackages] = useState<ServicePackage[]>(initialPackages);
  const [activePillar, setActivePillar] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pkgToDelete, setPkgToDelete] = useState<ServicePackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [id, setId] = useState("");
  const [pillar, setPillar] = useState<"podcast" | "offers" | "social_media" | "soundstage" | "broadcast" | "gear" | "production">("podcast");
  const [title, setTitle] = useState("");
  const [arabicTitle, setArabicTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [price, setPrice] = useState("1000");
  const [currency, setCurrency] = useState("AED");
  const [badge, setBadge] = useState("");
  const [hours, setHours] = useState("");
  const [episodesCount, setEpisodesCount] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(4000);

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      pkg.title.toLowerCase().includes(q) ||
      (pkg.arabicTitle && pkg.arabicTitle.toLowerCase().includes(q)) ||
      (pkg.subtitle && pkg.subtitle.toLowerCase().includes(q)) ||
      (pkg.badge && pkg.badge.toLowerCase().includes(q));

    const matchesPillar = activePillar === "all" || pkg.pillar === activePillar;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && pkg.isActive) ||
      (statusFilter === "inactive" && !pkg.isActive);

    return matchesSearch && matchesPillar && matchesStatus;
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
  } = usePagination(filteredPackages, 12);

  const openCreateModal = () => {
    setEditingPkg(null);
    setId("");
    setPillar(activePillar !== "all" ? (activePillar as "podcast" | "offers" | "social_media" | "soundstage" | "broadcast" | "gear" | "production") : "podcast");
    setTitle("");
    setArabicTitle("");
    setSubtitle("");
    setPrice("1200");
    setCurrency("AED");
    setBadge("");
    setHours("2");
    setEpisodesCount("1");
    setDeliverables(["Full 4K Multi-Camera Production", "Dedicated Sound Engineer", "Instant Cloud Delivery"]);
    setImageUrl("");
    setIsFeatured(false);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: ServicePackage) => {
    setEditingPkg(pkg);
    setId(pkg.id);
    setPillar(pkg.pillar as "podcast" | "offers" | "social_media" | "soundstage" | "broadcast" | "gear" | "production");
    setTitle(pkg.title);
    setArabicTitle(pkg.arabicTitle || "");
    setSubtitle(pkg.subtitle || "");
    setPrice(String(pkg.price));
    setCurrency(pkg.currency);
    setBadge(pkg.badge || "");
    setHours(pkg.hours !== null ? String(pkg.hours) : "");
    setEpisodesCount(pkg.episodesCount !== null ? String(pkg.episodesCount) : "");
    setDeliverables(pkg.deliverables && pkg.deliverables.length > 0 ? [...pkg.deliverables] : [""]);
    setImageUrl(pkg.imageUrl || "");
    setIsFeatured(pkg.isFeatured);
    setIsActive(pkg.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddDeliverable = () => {
    setDeliverables((prev) => [...prev, ""]);
  };

  const handleUpdateDeliverable = (index: number, val: string) => {
    setDeliverables((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Package title is required.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError("Valid price is required (0 or greater).");
      return;
    }

    const cleanDeliverables = deliverables.map((d) => d.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingPkg) {
        // Update
        const res = await updateCmsPackage({
          id: editingPkg.id,
          pillar,
          title: title.trim(),
          arabicTitle: arabicTitle.trim() || null,
          subtitle: subtitle.trim() || null,
          price: numPrice,
          currency: currency.trim() || "AED",
          badge: badge.trim() || null,
          hours: hours ? parseInt(hours, 10) : null,
          episodesCount: episodesCount ? parseInt(episodesCount, 10) : null,
          deliverables: cleanDeliverables,
          imageUrl: imageUrl.trim() || null,
          isFeatured,
          isActive,
        });

        if (res.success && res.pkg) {
          setPackages((prev) =>
            prev.map((p) => (p.id === editingPkg.id ? res.pkg! : p))
          );
          showFeedback(`Package "${res.pkg.title}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update package.");
        }
      } else {
        // Create
        const res = await createCmsPackage({
          id: id.trim() || undefined,
          pillar,
          title: title.trim(),
          arabicTitle: arabicTitle.trim() || null,
          subtitle: subtitle.trim() || null,
          price: numPrice,
          currency: currency.trim() || "AED",
          badge: badge.trim() || null,
          hours: hours ? parseInt(hours, 10) : null,
          episodesCount: episodesCount ? parseInt(episodesCount, 10) : null,
          deliverables: cleanDeliverables,
          imageUrl: imageUrl.trim() || null,
          isFeatured,
          isActive,
        });

        if (res.success && res.pkg) {
          setPackages((prev) => [res.pkg!, ...prev]);
          showFeedback(`Package "${res.pkg.title}" created successfully.`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create package.");
        }
      }
    } catch (err) {
      setFormError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (pkg: ServicePackage) => {
    const nextState = !pkg.isActive;
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isActive: nextState } : p))
    );

    try {
      const res = await toggleCmsPackageStatus(pkg.id, nextState);
      if (!res.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, isActive: pkg.isActive } : p))
        );
        showFeedback(res.error || "Failed to update package status");
      }
    } catch (err) {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isActive: pkg.isActive } : p))
      );
      showFeedback((err as Error).message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!pkgToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteCmsPackage(pkgToDelete.id);
      if (res.success) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgToDelete.id));
        showFeedback("Package deleted successfully.");
        setPkgToDelete(null);
      } else {
        showFeedback(res.error || "Failed to delete package.");
      }
    } catch (err) {
      showFeedback((err as Error).message || "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Boxes className="text-brand-mauve" size={28} />
            Service Packages & Tiers CMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, price, and customize full service tiers, recording bundles, and social media retainers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-violet/25 hover:shadow-brand-violet/40 border border-brand-mauve/30 shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          Create Service Package
        </button>
      </div>

      {feedback && <FeedbackAlert message={feedback} onDismiss={clearFeedback} />}

      {/* Pillar Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          const isActiveTab = activePillar === p.id;
          const count =
            p.id === "all"
              ? packages.length
              : packages.filter((pkg) => pkg.pillar === p.id).length;

          return (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActiveTab
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/30"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/5"
              }`}
            >
              <Icon size={15} />
              <span>{p.label}</span>
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full ${
                  isActiveTab ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search packages by title, badge, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 transition-colors"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-mauve/60 transition-colors"
          >
            <option value="all" className="bg-[#0f0e15] text-slate-200">
              All Statuses
            </option>
            <option value="active" className="bg-[#0f0e15] text-slate-200">
              Active Only
            </option>
            <option value="inactive" className="bg-[#0f0e15] text-slate-200">
              Disabled Only
            </option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Package Title & Pillar
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Pricing & Specs
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Deliverables & Highlights
            </th>
            <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {paginatedItems.length === 0 ? (
            <DataTableEmpty
              colSpan={5}
              message="No packages match your selected pillar or search query."
            />
          ) : (
            paginatedItems.map((item: ServicePackage) => (
              <DataTableRow key={item.id}>
                {/* Title & Pillar */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold text-brand-lavender bg-brand-violet/40 px-2 py-0.5 rounded-full border border-brand-mauve/30">
                          {item.badge}
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="text-[10px] font-semibold text-brand-mauve-soft flex items-center gap-0.5">
                          <Sparkles size={11} /> Featured
                        </span>
                      )}
                    </div>
                    {item.arabicTitle && (
                      <span className="text-xs text-brand-mauve-soft font-arabic" dir="rtl">
                        {item.arabicTitle}
                      </span>
                    )}
                    {item.subtitle && (
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-sm">
                        {item.subtitle}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      Pillar: {item.pillar} · ID: {item.id}
                    </span>
                  </div>
                </td>

                {/* Pricing & Hours */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-white">
                      {item.currency} {parseFloat(item.price).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {item.hours && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} className="text-brand-mauve" /> {item.hours}h studio
                        </span>
                      )}
                      {item.episodesCount && (
                        <span>· {item.episodesCount} ep</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Deliverables */}
                <td className="px-4 py-4">
                  <div className="space-y-1 max-w-md">
                    {item.deliverables && item.deliverables.slice(0, 3).map((d: string, i: number) => (
                      <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5 truncate">
                        <CheckCircle2 size={13} className="text-brand-mauve shrink-0" />
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                    {item.deliverables && item.deliverables.length > 3 && (
                      <span className="text-[11px] text-brand-mauve-soft block">
                        +{item.deliverables.length - 3} more deliverables
                      </span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                  >
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                        <ToggleRight size={16} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-white/[0.04] px-2 py-1 rounded-full border border-white/10">
                        <ToggleLeft size={16} /> Disabled
                      </span>
                    )}
                  </button>
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit package"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setPkgToDelete(item)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete package"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      {/* Pagination */}
      {filteredPackages.length > 0 && (
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0f0e15] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] sticky top-0 bg-[#0f0e15] z-10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve">
                  <Boxes size={16} />
                </div>
                <h3 className="font-semibold text-white">
                  {editingPkg ? "Edit Service Package" : "Create Service Package"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Service Pillar <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={pillar}
                    onChange={(e) =>
                      setPillar(e.target.value as "podcast" | "offers" | "social_media" | "soundstage" | "broadcast" | "gear" | "production")
                    }
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                  >
                    <option value="podcast" className="bg-[#0f0e15] text-slate-200">
                      Podcast Studio
                    </option>
                    <option value="offers" className="bg-[#0f0e15] text-slate-200">
                      Offers & Bundles
                    </option>
                    <option value="social_media" className="bg-[#0f0e15] text-slate-200">
                      Social Media Retainers
                    </option>
                    <option value="production" className="bg-[#0f0e15] text-slate-200">
                      Film & Commercial Production
                    </option>
                    <option value="soundstage" className="bg-[#0f0e15] text-slate-200">
                      Soundstages
                    </option>
                    <option value="broadcast" className="bg-[#0f0e15] text-slate-200">
                      Broadcast & OB Van
                    </option>
                    <option value="gear" className="bg-[#0f0e15] text-slate-200">
                      Gear Packages
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Most Popular, Best Deal"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Package Title (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Hour Multi-Cam Studio Bundle"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Arabic Title (Optional)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={arabicTitle}
                  onChange={(e) => setArabicTitle(e.target.value)}
                  placeholder="مثال: باقة تصوير 5 ساعات متعددة الكاميرات"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 font-arabic text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subtitle / Pitch
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Immediate publishing with real-time video switching and mastering."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Price (AED) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-mauve/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hours Included
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-mauve/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Episodes Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={episodesCount}
                    onChange={(e) => setEpisodesCount(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-brand-mauve/60"
                  />
                </div>
              </div>

              {/* Deliverables List Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Deliverables & Features List
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="text-xs text-brand-mauve hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={14} /> Add Deliverable
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {deliverables.map((d, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => handleUpdateDeliverable(index, e.target.value)}
                        placeholder={`Deliverable #${index + 1} (e.g. 4K Master Video)`}
                        className="flex-1 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 text-xs"
                      />
                      {deliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDeliverable(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preview Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/offers/5-hour-bundles.webp"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 font-mono text-xs"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-mauve"
                  />
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Sparkles size={12} className="text-brand-mauve" /> Feature this package
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-mauve"
                  />
                  <span className="text-xs text-slate-300">Active / Published</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-violet/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingPkg ? "Save Changes" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!pkgToDelete}
        title="Delete Service Package"
        message={`Are you sure you want to permanently delete the package "${pkgToDelete?.title}"? It will no longer be available for customer checkout.`}
        confirmLabel="Delete Package"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setPkgToDelete(null)}
      />
    </div>
  );
}
