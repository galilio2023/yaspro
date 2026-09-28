"use client";

import React, { useState } from "react";
import {
  Layers,
  Edit2,
  Plus,
  CheckCircle2,
  Users,
  DollarSign,
  X,
  Save,
} from "lucide-react";
import { upsertCmsStudio, toggleStudioActiveStatus } from "@/lib/cms-actions";
import type { Studio } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

interface StudiosManagerProps {
  initialStudios: Studio[];
}

export function StudiosManager({ initialStudios }: StudiosManagerProps) {
  const [studiosList, setStudiosList] = useState<Studio[]>(initialStudios);
  const [editingStudio, setEditingStudio] = useState<Partial<Studio> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleActive = async (studio: Studio) => {
    const nextStatus = !studio.isActive;
    const res = await toggleStudioActiveStatus(studio.id || studio.slug, nextStatus);
    if (res.success) {
      setStudiosList((prev) =>
        prev.map((s) => (s.slug === studio.slug ? { ...s, isActive: nextStatus } : s))
      );
      setFeedback(`Studio ${studio.name} marked as ${nextStatus ? "active" : "under maintenance"}`);
      setTimeout(() => setFeedback(null), 3000);
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

    const res = await upsertCmsStudio({
      id: editingStudio.id,
      name: editingStudio.name,
      slug,
      hourlyRate: editingStudio.hourlyRate,
      capacity: editingStudio.capacity || 20,
      description: editingStudio.description || "",
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
        return [{ ...editingStudio, slug, id: `stu-${Date.now()}` } as Studio, ...prev];
      });
      setFeedback("Studio details successfully saved to database.");
      setTimeout(() => setFeedback(null), 3000);
      setEditingStudio(null);
    } else {
      alert(res.error || "Failed to save studio");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Layers size={24} className="text-purple-400" />
            Soundstages &amp; Studio Rates CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic hourly rates, capacity rules, acoustic amenities, and maintenance blackout toggles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {feedback && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>{feedback}</span>
            </div>
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
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Soundstage</span>
          </button>
        </div>
      </div>

      {/* Studio Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studiosList.map((studio) => {
          const rateNum = parseFloat(studio.hourlyRate) || 0;
          return (
            <div
              key={studio.slug}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                studio.isActive
                  ? "bg-slate-900/60 border-white/10 hover:border-purple-500/40 shadow-xl"
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
                    <span className="text-[11px] font-mono text-purple-400">
                      ID: {studio.slug}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(studio)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                      studio.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
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
                      <Users size={11} className="text-purple-400" /> Capacity
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
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
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

                <button
                  type="button"
                  onClick={() => setEditingStudio(studio)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Edit Stage Specs</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Studio Modal */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl">
            <button
              type="button"
              onClick={() => setEditingStudio(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-white mb-1">
              {editingStudio.id ? "Edit Soundstage Specifications" : "Provision New Soundstage"}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Update hourly rates, maximum headcount, and amenities visible in the public booking wizard.
            </p>

            <form onSubmit={handleSaveStudio} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Stage Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Studio C — Green Cyc Stage"
                  value={editingStudio.name || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Stage Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe lighting grid, dimensions, and acoustic isolation..."
                  value={editingStudio.description || ""}
                  onChange={(e) => setEditingStudio({ ...editingStudio, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingStudio.isActive ?? true}
                  onChange={(e) => setEditingStudio({ ...editingStudio, isActive: e.target.checked })}
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300">
                  Stage is open and available for instant booking in wizard
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} />
                  <span>{isSubmitting ? "Saving..." : "Save Soundstage"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
