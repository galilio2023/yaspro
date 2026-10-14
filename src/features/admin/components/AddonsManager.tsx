"use client";

import React, { useState } from "react";
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Users,
  Camera,
  Layers,
  Wand2,
} from "lucide-react";
import type { BookingAddon } from "@/db/schema";
import {
  createCmsAddon,
  updateCmsAddon,
  toggleCmsAddonStatus,
  deleteCmsAddon,
} from "@/lib/actions/booking-addons";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePagination } from "@/hooks/usePagination";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface AddonsManagerProps {
  initialAddons: BookingAddon[];
}

const CATEGORIES = [
  { id: "all", label: "All Assets", icon: Sliders },
  { id: "crew", label: "Crew Members", icon: Users },
  { id: "equipment", label: "Equipment & Sound", icon: Camera },
  { id: "props", label: "Props & Decor", icon: Layers },
  { id: "post_production", label: "Post-Production", icon: Wand2 },
];

const PROP_CATEGORIES = [
  "All",
  "Vases",
  "Chairs",
  "Lights",
  "Shelves",
  "Tables",
  "Other",
];

export function AddonsManager({ initialAddons }: AddonsManagerProps) {
  const [addons, setAddons] = useState<BookingAddon[]>(initialAddons);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<BookingAddon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [addonToDelete, setAddonToDelete] = useState<BookingAddon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [id, setId] = useState("");
  const [category, setCategory] = useState<"crew" | "equipment" | "props" | "post_production">("crew");
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("100");
  const [priceUnit, setPriceUnit] = useState<"flat" | "hourly" | "fixed" | "per_day">("flat");
  const [imageUrl, setImageUrl] = useState("");
  const [propCategory, setPropCategory] = useState("Other");
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(4000);

  // Filtered list
  const filteredAddons = addons.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      (a.arabicName && a.arabicName.toLowerCase().includes(q)) ||
      (a.description && a.description.toLowerCase().includes(q)) ||
      (a.propCategory && a.propCategory.toLowerCase().includes(q));

    const matchesCategory =
      activeCategory === "all" || a.category === activeCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.isActive) ||
      (statusFilter === "inactive" && !a.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
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
  } = usePagination(filteredAddons, 15);

  const openCreateModal = () => {
    setEditingAddon(null);
    setId("");
    setCategory(activeCategory !== "all" ? (activeCategory as "crew" | "equipment" | "props" | "post_production") : "crew");
    setName("");
    setArabicName("");
    setDescription("");
    setPrice("100");
    setPriceUnit("flat");
    setImageUrl("");
    setPropCategory("Other");
    setIsPopular(false);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: BookingAddon) => {
    setEditingAddon(item);
    setId(item.id);
    setCategory(item.category as "crew" | "equipment" | "props" | "post_production");
    setName(item.name);
    setArabicName(item.arabicName || "");
    setDescription(item.description || "");
    setPrice(String(item.price));
    setPriceUnit(item.priceUnit as "flat" | "hourly" | "fixed" | "per_day");
    setImageUrl(item.imageUrl || "");
    setPropCategory(item.propCategory || "Other");
    setIsPopular(item.isPopular);
    setIsActive(item.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Asset name is required.");
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError("Valid price is required (0 or greater).");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAddon) {
        // Update
        const res = await updateCmsAddon({
          id: editingAddon.id,
          name: name.trim(),
          arabicName: arabicName.trim() || null,
          category,
          description: description.trim() || null,
          price: numPrice,
          priceUnit,
          imageUrl: imageUrl.trim() || null,
          propCategory: category === "props" ? propCategory : null,
          isPopular,
          isActive,
        });

        if (res.success && res.addon) {
          setAddons((prev) =>
            prev.map((a) => (a.id === editingAddon.id ? res.addon! : a))
          );
          showFeedback(`Asset "${res.addon.name}" updated successfully.`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to update asset.");
        }
      } else {
        // Create
        const res = await createCmsAddon({
          id: id.trim() || undefined,
          name: name.trim(),
          arabicName: arabicName.trim() || null,
          category,
          description: description.trim() || null,
          price: numPrice,
          priceUnit,
          imageUrl: imageUrl.trim() || null,
          propCategory: category === "props" ? propCategory : null,
          isPopular,
          isActive,
        });

        if (res.success && res.addon) {
          setAddons((prev) => [res.addon!, ...prev]);
          showFeedback(`Asset "${res.addon.name}" created successfully.`);
          setIsModalOpen(false);
        } else {
          setFormError(res.error || "Failed to create asset.");
        }
      }
    } catch (err) {
      setFormError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: BookingAddon) => {
    const nextState = !item.isActive;
    // Optimistic update
    setAddons((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, isActive: nextState } : a))
    );

    try {
      const res = await toggleCmsAddonStatus(item.id, nextState);
      if (!res.success) {
        // revert
        setAddons((prev) =>
          prev.map((a) => (a.id === item.id ? { ...a, isActive: item.isActive } : a))
        );
        showFeedback(res.error || "Failed to update status");
      }
    } catch (err) {
      setAddons((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isActive: item.isActive } : a))
      );
      showFeedback((err as Error).message || "An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!addonToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteCmsAddon(addonToDelete.id);
      if (res.success) {
        setAddons((prev) => prev.filter((a) => a.id !== addonToDelete.id));
        showFeedback("Asset deleted successfully.");
        setAddonToDelete(null);
      } else {
        showFeedback(res.error || "Failed to delete asset.");
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
            <Sliders className="text-brand-mauve" size={28} />
            Booking Assets & Add-ons Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Control dynamic crew specialists, production gear, set props, and post-production services.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-brand-violet/25 hover:shadow-brand-violet/40 border border-brand-mauve/30 shrink-0"
        >
          <Plus size={16} />
          Add Asset / Add-on
        </button>
      </div>

      {feedback && <FeedbackAlert message={feedback} onDismiss={clearFeedback} />}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActiveTab = activeCategory === cat.id;
          const count =
            cat.id === "all"
              ? addons.length
              : addons.filter((a) => a.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActiveTab
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/30"
                  : "bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/5"
              }`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
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
            placeholder="Search assets by title, prop type, or description..."
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
              All Availability Statuses
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
              Asset / Name
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Category & Subtype
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Rate / Pricing
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
              message="No booking assets match your category or search filter."
            />
          ) : (
            paginatedItems.map((item: BookingAddon) => (
              <DataTableRow key={item.id}>
                {/* Name & ID */}
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {item.name}
                      </span>
                      {item.isPopular && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-lavender bg-brand-violet/30 px-1.5 py-0.5 rounded border border-brand-mauve/30">
                          <Sparkles size={10} />
                          Featured
                        </span>
                      )}
                    </div>
                    {item.arabicName && (
                      <span className="text-xs text-brand-mauve-soft font-arabic" dir="rtl">
                        {item.arabicName}
                      </span>
                    )}
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                        {item.description}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      ID: {item.id}
                    </span>
                  </div>
                </td>

                {/* Category & Prop Subtype */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200 capitalize">
                      {item.category === "crew" && <Users size={13} className="text-brand-mauve" />}
                      {item.category === "equipment" && <Camera size={13} className="text-brand-mauve" />}
                      {item.category === "props" && <Layers size={13} className="text-brand-mauve" />}
                      {item.category === "post_production" && <Wand2 size={13} className="text-brand-mauve" />}
                      {item.category.replace("_", " ")}
                    </span>
                    {item.propCategory && (
                      <span className="text-[11px] text-brand-mauve-soft bg-white/[0.04] px-2 py-0.5 rounded w-fit border border-white/5">
                        {item.propCategory}
                      </span>
                    )}
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-baseline gap-1 text-sm font-semibold text-white">
                    <span>AED {parseFloat(item.price).toLocaleString()}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      / {item.priceUnit}
                    </span>
                  </div>
                </td>

                {/* Status Toggle */}
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
                      title="Edit asset"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setAddonToDelete(item)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete asset"
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
      {filteredAddons.length > 0 && (
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
          <div className="bg-[#0f0e15] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02] sticky top-0 bg-[#0f0e15] z-10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-violet/20 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve">
                  <Sliders size={16} />
                </div>
                <h3 className="font-semibold text-white">
                  {editingAddon ? "Edit Asset" : "Create New Asset / Add-on"}
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
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as "crew" | "equipment" | "props" | "post_production")
                    }
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                  >
                    <option value="crew" className="bg-[#0f0e15] text-slate-200">
                      Crew Member
                    </option>
                    <option value="equipment" className="bg-[#0f0e15] text-slate-200">
                      Equipment & Sound
                    </option>
                    <option value="props" className="bg-[#0f0e15] text-slate-200">
                      Props & Set Decor
                    </option>
                    <option value="post_production" className="bg-[#0f0e15] text-slate-200">
                      Post-Production Addon
                    </option>
                  </select>
                </div>

                {category === "props" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Prop Subtype
                    </label>
                    <select
                      value={propCategory}
                      onChange={(e) => setPropCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                    >
                      {PROP_CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c} className="bg-[#0f0e15] text-slate-200">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Slug / Identifier (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!!editingAddon}
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      placeholder="e.g. gaffer-lighting"
                      className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 disabled:opacity-40"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Name (English) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gaffer / Key Grip Specialist"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Arabic Name (Optional)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={arabicName}
                  onChange={(e) => setArabicName(e.target.value)}
                  placeholder="مثال: فني إضاءة ومعدات رئيسي"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 text-right font-arabic"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-brand-mauve/60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Billing Unit
                  </label>
                  <select
                    value={priceUnit}
                    onChange={(e) =>
                      setPriceUnit(e.target.value as "flat" | "hourly" | "fixed" | "per_day")
                    }
                    className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-brand-mauve/60"
                  >
                    <option value="flat" className="bg-[#0f0e15] text-slate-200">
                      Flat / Session
                    </option>
                    <option value="hourly" className="bg-[#0f0e15] text-slate-200">
                      Hourly
                    </option>
                    <option value="per_day" className="bg-[#0f0e15] text-slate-200">
                      Per Day
                    </option>
                    <option value="fixed" className="bg-[#0f0e15] text-slate-200">
                      Fixed Price
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe technical capabilities or equipment details..."
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image Path / Asset URL (Optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/booking/crew-40.jpg"
                  className="w-full px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve/60 font-mono text-xs"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-mauve"
                  />
                  <span className="text-xs text-slate-300 flex items-center gap-1">
                    <Sparkles size={12} className="text-brand-mauve" /> Mark as Popular / Featured
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-white/20 bg-white/5 text-brand-violet focus:ring-brand-mauve"
                  />
                  <span className="text-xs text-slate-300">Active / Available</span>
                </label>
              </div>

              {/* Form Actions */}
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
                  className="px-5 py-2.5 bg-brand-violet hover:bg-brand-violet/90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-violet/25 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingAddon ? "Save Changes" : "Create Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!addonToDelete}
        title="Delete Booking Asset"
        message={`Are you sure you want to permanently delete "${addonToDelete?.name}"? It will no longer appear in booking wizard steps.`}
        confirmLabel="Delete Asset"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setAddonToDelete(null)}
      />
    </div>
  );
}
