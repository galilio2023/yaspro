"use client";

import React, { useState, useCallback } from "react";
import {
  Layers,
  Edit2,
  Trash2,
  Plus,
  Users,
  DollarSign,
  Save,
  Search,
} from "lucide-react";
import { upsertCmsStudio, toggleStudioActiveStatus, deleteCmsStudio } from "@/lib/actions/studios-soundstages-operations";
import type { Studio } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";

interface StudiosManagerProps {
  initialStudios: Studio[];
}

export function StudiosManager({ initialStudios }: StudiosManagerProps) {
  const [studiosList, setStudiosList] = useState<Studio[]>(initialStudios);
  const [editingStudio, setEditingStudio] = useState<Partial<Studio> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "maintenance">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studioToDelete, setStudioToDelete] = useState<Studio | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(4000);

  const handleConfirmDelete = async () => {
    if (!studioToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const targetId = studioToDelete.id || studioToDelete.slug;
      const res = await deleteCmsStudio(targetId);
      if (res.success) {
        setStudiosList((prev) => prev.filter((s) => s.id !== studioToDelete.id && s.slug !== studioToDelete.slug));
        showFeedback(`Soundstage "${studioToDelete.name}" deleted successfully.`);
        setStudioToDelete(null);
      } else {
        setDeleteError(res.error || "Failed to delete studio stage.");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete studio stage.");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = studiosList.filter((s) => s.isActive).length;
  const maintenanceCount = studiosList.filter((s) => !s.isActive).length;
  const avgHourlyRate =
    studiosList.length > 0
      ? Math.round(
          studiosList.reduce((acc, s) => acc + (parseFloat(s.hourlyRate) || 0), 0) /
            studiosList.length
        )
      : 0;

  const filteredStudios = studiosList.filter((studio) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      studio.name.toLowerCase().includes(q) ||
      studio.slug.toLowerCase().includes(q) ||
      (studio.description && studio.description.toLowerCase().includes(q)) ||
      (Array.isArray(studio.amenities) &&
        (studio.amenities as string[]).some((a) => a.toLowerCase().includes(q)));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && studio.isActive) ||
      (statusFilter === "maintenance" && !studio.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCloseDialog = useCallback(() => {
    setEditingStudio(null);
  }, []);

  const handleToggleActive = async (studio: Studio) => {
    const nextStatus = !studio.isActive;
    const res = await toggleStudioActiveStatus(studio.id || studio.slug, nextStatus);
    if (res.success) {
      setStudiosList((prev) =>
        prev.map((s) => (s.slug === studio.slug ? { ...s, isActive: nextStatus } : s))
      );
      showFeedback(`Studio ${studio.name} marked as ${nextStatus ? "active" : "under maintenance"}`);
    } else {
      alert(res.error || "Failed to update studio status");
    }
  };

  const handleSaveStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudio?.name || !editingStudio.hourlyRate) {
      alert("Please provide a stage name and hourly rate.");
      return;
    }

    setIsSubmitting(true);
    const slug =
      editingStudio.slug ||
      editingStudio.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    try {
      const res = await upsertCmsStudio({
        id: editingStudio.id,
        name: editingStudio.name,
        arabicName: editingStudio.arabicName,
        slug,
        hourlyRate: editingStudio.hourlyRate,
        capacity: editingStudio.capacity || 20,
        description: editingStudio.description || "",
        arabicDescription: editingStudio.arabicDescription,
        imageUrl: editingStudio.imageUrl || "/images/projects/dmx.jpg",
        amenities: (editingStudio.amenities as string[]) || [
          "10Gbps Symmetrical Fiber",
          "Green Room",
          "Sound Isolated",
        ],
        isActive: editingStudio.isActive ?? true,
      });

      if (res.success) {
        setStudiosList((prev) => {
          const exists = prev.some((s) => s.slug === slug);
          if (exists) {
            return prev.map((s) => (s.slug === slug ? ({ ...s, ...editingStudio, slug } as Studio) : s));
          }
          return [{ ...editingStudio, slug, id: editingStudio.id || slug } as Studio, ...prev];
        });
        showFeedback("Studio details successfully saved to database.");
        setEditingStudio(null);
      } else {
        alert(res.error || "Failed to save studio");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save studio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Layers size={24} className="text-amber-400" />
            Soundstages &amp; Studio Rates CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic hourly rates, capacity rules, acoustic amenities, and maintenance blackout toggles.
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
            onClick={() =>
              setEditingStudio({
                name: "",
                slug: "",
                hourlyRate: "1000.00",
                capacity: 25,
                description: "",
                isActive: true,
                amenities: ["10Gbps Symmetrical Fiber", "Green Room", "Hair & Makeup Suite"],
              })
            }
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Soundstage</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-medium">Total Soundstages</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white font-mono">{studiosList.length}</span>
            <span className="text-[11px] text-amber-400 font-medium">Stages</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 backdrop-blur-xl">
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono font-medium">Active / Bookable</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{activeCount}</span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Live</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/20 backdrop-blur-xl">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider font-mono font-medium">Maintenance Mode</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{maintenanceCount}</span>
            <span className="text-[11px] text-amber-400/80 font-medium">Offline</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-medium">Average Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white font-mono">{formatCurrency(avgHourlyRate)}</span>
            <span className="text-[11px] text-slate-400 font-medium">/hr</span>
          </div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/50 border border-white/10">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search soundstages by name, slug, amenities or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: "All Stages", count: studiosList.length },
            { id: "active", label: "Active", count: activeCount },
            { id: "maintenance", label: "Maintenance", count: maintenanceCount },
          ].map((status) => {
            const isActive = statusFilter === status.id;
            return (
              <button
                key={status.id}
                type="button"
                onClick={() => setStatusFilter(status.id as "all" | "active" | "maintenance")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{status.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-amber-400 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {status.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Studio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudios.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-3xl border border-white/5 bg-slate-900/30">
            <Layers size={36} className="mx-auto text-slate-600 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">No Soundstages Match Filters</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or status filter to locate stages.
            </p>
          </div>
        ) : (
          filteredStudios.map((studio) => {
          const rateNum = parseFloat(studio.hourlyRate) || 0;
          return (
            <div
              key={studio.slug}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                studio.isActive
                  ? "bg-slate-900/60 border-white/10 hover:border-amber-500/40 shadow-xl"
                  : "bg-white/[0.01] border-white/5 opacity-60"
              }`}
            >
              <div className="space-y-4">
                {/* Header & Status Toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">
                      {studio.name}
                    </h3>
                    <span className="text-[11px] font-mono text-amber-400">
                      ID: {studio.slug}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(studio)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      studio.isActive
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                    }`}
                  >
                    {studio.isActive ? "Active / Bookable" : "Maintenance Mode"}
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {studio.description || "High-specification soundstage with full lighting grid."}
                </p>

                {/* Pricing & Capacity KPIs */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase">
                      <DollarSign size={11} className="text-emerald-400" /> Hourly Rate
                    </span>
                    <span className="font-extrabold text-white text-base font-mono mt-0.5 block">
                      {formatCurrency(rateNum)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono uppercase">
                      <Users size={11} className="text-amber-400" /> Capacity
                    </span>
                    <span className="font-extrabold text-white text-base font-mono mt-0.5 block">
                      {studio.capacity} People
                    </span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-500">
                    Stage Amenities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {((studio.amenities as string[]) || []).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-white/10 mt-5 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {studio.isActive ? "Instant Cal Sync" : "Stage Blocked"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingStudio(studio)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 size={12} />
                    <span>Edit Stage Specs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setStudioToDelete(studio);
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                    title="Delete Soundstage"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        }))}
      </div>

      {/* Edit / Create Studio Modal */}
      <Dialog
        isOpen={Boolean(editingStudio)}
        onClose={handleCloseDialog}
        title={editingStudio?.id ? "Edit Soundstage Specifications" : "Provision New Soundstage"}
        description="Update hourly rates, maximum headcount, and amenities visible in the public booking wizard."
        maxWidth="lg"
      >
        {editingStudio && (
          <form onSubmit={handleSaveStudio} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Stage Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio C — Green Cyc Stage"
                  value={editingStudio.name || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Stage Name (Arabic - اسم الاستوديو)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: استوديو ج — استوديو الكروما الخضراء"
                  value={editingStudio.arabicName || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, arabicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-arabic"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Hourly Rate (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="800.00"
                  value={editingStudio.hourlyRate || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, hourlyRate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Max Headcount</label>
                <input
                  type="number"
                  required
                  placeholder="25"
                  value={editingStudio.capacity || 20}
                  onChange={(e) =>
                    setEditingStudio({ ...editingStudio, capacity: parseInt(e.target.value) || 10 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <AdminImageUploader
                value={editingStudio.imageUrl}
                onChange={(url) => setEditingStudio({ ...editingStudio, imageUrl: url })}
                label="Studio Soundstage Cover Photo (Cloudinary / CDN)"
                helperText="Drag & drop studio or stage photo (PNG, JPG, WEBP up to 25MB)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Description (English)</label>
                <textarea
                  rows={3}
                  placeholder="Describe lighting grid, dimensions, and acoustic isolation..."
                  value={editingStudio.description || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Description (Arabic - الوصف بالعربي)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder="وصف شبكة الإضاءة، الأبعاد، والعزل الصوتي..."
                  value={editingStudio.arabicDescription || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, arabicDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none font-arabic"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Stage Amenities (Comma separated)</label>
              <input
                type="text"
                placeholder="10Gbps Symmetrical Fiber, Green Room, Hair & Makeup Suite, Sound Isolated"
                value={
                  Array.isArray(editingStudio.amenities)
                    ? (editingStudio.amenities as string[]).join(", ")
                    : ""
                }
                onChange={(e) =>
                  setEditingStudio({
                    ...editingStudio,
                    amenities: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveToggle"
                checked={editingStudio.isActive ?? true}
                onChange={(e) => setEditingStudio({ ...editingStudio, isActive: e.target.checked })}
                className="rounded border-white/20 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isActiveToggle" className="text-slate-300">
                Stage is open and available for instant booking in wizard
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingStudio(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Save size={14} />
                <span>{isSubmitting ? "Saving..." : "Save Soundstage"}</span>
              </button>
            </div>
          </form>
        )}
      </Dialog>
      {studioToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(studioToDelete)}
          onClose={() => {
            setStudioToDelete(null);
            setDeleteError(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Soundstage"
          message={
            deleteError ||
            `Are you sure you want to permanently remove "${studioToDelete.name}" (${studioToDelete.slug})? If there are any associated bookings, deletion will be blocked.`
          }
          confirmLabel={deleteError ? "Understood" : "Delete Soundstage"}
          variant={deleteError ? "warning" : "danger"}
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
