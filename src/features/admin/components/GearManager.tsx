"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Plus, Edit3, Trash2, Save, X, CheckCircle, Tag, Search, SlidersHorizontal, Package, Check, AlertCircle } from "lucide-react";
import { upsertCmsEquipment, deleteCmsEquipment } from "@/lib/actions/equipment-gear";
import type { Equipment } from "@/db/schema";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTableEmpty } from "@/components/ui/data-table";

interface GearManagerProps {
  initialEquipment: Equipment[];
}

export function GearManager({ initialEquipment }: GearManagerProps) {
  const [gearList, setGearList] = useState<Equipment[]>(initialEquipment);
  const [editingGear, setEditingGear] = useState<Partial<Equipment> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | "available" | "unavailable">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(2500);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const targetId = itemToDelete.id || itemToDelete.slug;
      const res = await deleteCmsEquipment(targetId);
      if (res.success) {
        setGearList((prev) => prev.filter((g) => g.id !== itemToDelete.id && g.slug !== itemToDelete.slug));
        showFeedback(`Removed "${itemToDelete.name}" from fleet inventory.`);
        setItemToDelete(null);
      } else {
        setError(res.error || "Failed to delete equipment item.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete equipment item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGear = gearList.filter((g) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      g.name.toLowerCase().includes(q) ||
      (g.arabicName && g.arabicName.toLowerCase().includes(q)) ||
      (g.slug && g.slug.toLowerCase().includes(q)) ||
      (g.description && g.description.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    const matchesAvailability =
      selectedAvailability === "all"
        ? true
        : selectedAvailability === "available"
        ? g.isAvailable
        : !g.isAvailable;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const pagination = usePagination(filteredGear, 15);

  const totalCameras = gearList.filter((g) => g.category === "cameras").length;
  const totalLenses = gearList.filter((g) => g.category === "lenses").length;
  const totalLighting = gearList.filter((g) => g.category === "lighting").length;
  const totalAudio = gearList.filter((g) => g.category === "audio").length;
  const totalBundles = gearList.filter((g) => g.category === "bundles" || g.isKit).length;
  const totalAvailable = gearList.filter((g) => g.isAvailable).length;

  const handleOpenNew = () => {
    setError(null);
    clearFeedback();
    setEditingGear({
      name: "",
      category: "cameras",
      dailyRate: "1500.00",
      securityDeposit: "2000.00",
      description: "",
      imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
      isPopular: false,
      isKit: false,
      isAvailable: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGear?.name || !editingGear?.dailyRate || !editingGear?.category) return;

    setIsSubmitting(true);
    setError(null);
    clearFeedback();

    try {
      const res = await upsertCmsEquipment(
        editingGear as Partial<Equipment> & { name: string; dailyRate: string; category: string }
      );

      if (res.success) {
        showFeedback("Equipment updated in Neon DB catalog!");
        setGearList((prev) => {
          const idx = prev.findIndex((g) => g.id === editingGear.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...editingGear } as Equipment;
            return updated;
          }
          return [
            {
              ...editingGear,
              id: editingGear.id || `gear-${Date.now()}`,
              createdAt: new Date(),
            } as Equipment,
            ...prev,
          ];
        });
        setTimeout(() => {
          setEditingGear(null);
        }, 1200);
      } else {
        setError(res.error || "Failed to update equipment.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update equipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <Camera className="text-emerald-400" /> Gear &amp; Equipment Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage cameras, lenses, lighting kits, and daily AED rental rates in Neon DB.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Fleet</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{gearList.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Available Locker</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{totalAvailable}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-amber-400 font-mono uppercase block">Cameras &amp; Lenses</span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">{totalCameras + totalLenses}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-purple-400 font-mono uppercase block">Lighting &amp; Bundles</span>
          <span className="text-xl font-bold text-purple-300 font-mono mt-1 block">{totalLighting + totalBundles}</span>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search gear by name, slug, specs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.resetPage();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Availability Pills */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {(["all", "available", "unavailable"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setSelectedAvailability(status);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                  selectedAvailability === status
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {status === "all" ? "All Fleet" : status === "available" ? "In Locker" : "Unavailable"}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Gear", count: gearList.length },
            { id: "cameras", label: "Cameras", count: totalCameras },
            { id: "lenses", label: "Lenses", count: totalLenses },
            { id: "lighting", label: "Lighting", count: totalLighting },
            { id: "audio", label: "Audio", count: totalAudio },
            { id: "bundles", label: "Turnkey Kits", count: totalBundles },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-emerald-500 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Drawer */}
      {editingGear && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingGear.id ? "Edit Equipment Item" : "Add Equipment Item"}
              </h3>
              <button
                onClick={() => setEditingGear(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && <FeedbackAlert type="error" message={error} className="mt-4" />}

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Equipment Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingGear.name || ""}
                    onChange={(e) =>
                      setEditingGear({
                        ...editingGear,
                        name: e.target.value,
                        slug: editingGear.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Name (Arabic - الاسم بالعربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="اسم المعدات بالعربية"
                    value={editingGear.arabicName || ""}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, arabicName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slug (Unique Key)</label>
                <input
                  type="text"
                  required
                  value={editingGear.slug || ""}
                  onChange={(e) =>
                    setEditingGear({ ...editingGear, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={editingGear.category || "cameras"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cameras">Cinema Cameras</option>
                    <option value="lenses">Cinema Lenses</option>
                    <option value="lighting">Studio Lighting</option>
                    <option value="audio">Wireless Audio</option>
                    <option value="bundles">Turnkey Bundles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Daily Rate (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingGear.dailyRate || "0.00"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, dailyRate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Security Deposit (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingGear.securityDeposit || "0.00"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, securityDeposit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <AdminImageUploader
                  value={editingGear.imageUrl}
                  onChange={(url) => setEditingGear({ ...editingGear, imageUrl: url })}
                  label="Equipment Image (Cloudinary / CDN)"
                  helperText="Drag & drop camera or gear photo (PNG, JPG, WEBP up to 25MB)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description (English)</label>
                  <textarea
                    rows={3}
                    value={editingGear.description || ""}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Description (Arabic - الوصف بالعربي)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    placeholder="وصف تفصيلي للمعدة والمواصفات الفنية..."
                    value={editingGear.arabicDescription || ""}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, arabicDescription: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500 font-arabic"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg btn-brand text-zinc-950 font-bold flex items-center gap-2 disabled:opacity-50 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Save size={14} /> Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Equipment Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGear.length === 0 ? (
                <DataTableEmpty colSpan={5} message="No equipment found matching your filter criteria." />
              ) : (
                pagination.paginatedItems.map((g) => (
                  <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                          {g.imageUrl && (
                            <Image src={g.imageUrl} alt={g.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{g.name}</span>
                          {g.arabicName && (
                            <span className="text-[11px] text-slate-400 font-arabic block">{g.arabicName}</span>
                          )}
                          {g.isPopular && (
                            <span className="text-[10px] text-amber-300 flex items-center gap-1 mt-0.5">
                              <Tag size={10} /> Popular Choice
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-400 font-medium capitalize">
                        {g.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white font-mono">
                      AED {Number(g.dailyRate).toLocaleString()} / day
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      AED {Number(g.securityDeposit || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setError(null);
                            clearFeedback();
                            setEditingGear(g);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                          title="Edit Equipment"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setError(null);
                            setItemToDelete(g);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Delete Equipment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={pagination.currentPage}
          pageCount={pagination.pageCount}
          total={pagination.total}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
        />
      </div>

      {itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(itemToDelete)}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Fleet Equipment"
          message={`Are you sure you want to permanently remove "${itemToDelete.name}" from the cinema rental fleet? This action cannot be undone.`}
          confirmLabel="Delete Item"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
