"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Film,
  ExternalLink,
  Layers,
  Sliders,
} from "lucide-react";
import type { PodcastStudio, PodcastAddon } from "@/features/podcast-booking/types";
import {
  upsertCmsPodcastSet,
  togglePodcastSetAvailability,
  deleteCmsPodcastSet,
  upsertCmsPodcastAddon,
  togglePodcastAddonStatus,
  deleteCmsPodcastAddon,
} from "@/lib/actions/podcast-operations";
import { PodcastSetFormModal, type PodcastSetFormData } from "@/components/admin/forms/PodcastSetFormModal";
import { PodcastAddonFormModal, type PodcastAddonFormData } from "@/components/admin/forms/PodcastAddonFormModal";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface PodcastManagerProps {
  initialSets: PodcastStudio[];
  initialAddons: (PodcastAddon & { isActive?: boolean })[];
}

export function PodcastManager({ initialSets, initialAddons }: PodcastManagerProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sets" | "addons">("sets");
  const [sets, setSets] = useState<PodcastStudio[]>(initialSets);
  const [addons, setAddons] = useState<(PodcastAddon & { isActive?: boolean })[]>(initialAddons);

  const [setsPage, setSetsPage] = useState(0);
  const [addonsPage, setAddonsPage] = useState(0);
  const pageSize = 6;

  const setsTotal = sets.length;
  const setsPageCount = Math.ceil(setsTotal / pageSize) || 1;
  const safeSetsPage = Math.min(setsPage, Math.max(0, setsPageCount - 1));
  const setsStartIndex = safeSetsPage * pageSize;
  const setsEndIndex = Math.min(setsStartIndex + pageSize, setsTotal);
  const paginatedSets = sets.slice(setsStartIndex, setsEndIndex);

  const addonsTotal = addons.length;
  const addonsPageCount = Math.ceil(addonsTotal / pageSize) || 1;
  const safeAddonsPage = Math.min(addonsPage, Math.max(0, addonsPageCount - 1));
  const addonsStartIndex = safeAddonsPage * pageSize;
  const addonsEndIndex = Math.min(addonsStartIndex + pageSize, addonsTotal);
  const paginatedAddons = addons.slice(addonsStartIndex, addonsEndIndex);

  // Set modal state
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<PodcastStudio | null>(null);
  const [setModalError, setSetModalError] = useState<string | null>(null);
  const [isSavingSet, setIsSavingSet] = useState(false);

  // Addon modal state
  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<(PodcastAddon & { isActive?: boolean }) | null>(null);
  const [addonModalError, setAddonModalError] = useState<string | null>(null);
  const [isSavingAddon, setIsSavingAddon] = useState(false);

  // ─── Set Handlers ─────────────────────────────────────────────────────────

  const handleOpenNewSet = () => {
    setEditingSet(null);
    setSetModalError(null);
    setIsSetModalOpen(true);
  };

  const handleEditSet = (item: PodcastStudio) => {
    setEditingSet(item);
    setSetModalError(null);
    setIsSetModalOpen(true);
  };

  const handleSaveSet = async (formData: PodcastSetFormData) => {
    setIsSavingSet(true);
    setSetModalError(null);
    try {
      const res = await upsertCmsPodcastSet(formData);
      if (res.success) {
        setSets((prev) => {
          const idx = prev.findIndex((s) => s.key === formData.id);
          const updated: PodcastStudio = {
            key: formData.id,
            name: formData.name,
            seats: formData.seats,
            location: formData.location,
            image: formData.image,
            gradient: formData.gradient,
            description: formData.description,
            isAvailable: formData.isAvailable,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
        setIsSetModalOpen(false);
      } else {
        setSetModalError(res.error || "Failed to save podcast set.");
      }
    } catch (e) {
      setSetModalError((e as Error).message || "Failed to save set.");
    } finally {
      setIsSavingSet(false);
    }
  };

  const handleToggleSet = async (item: PodcastStudio) => {
    const nextVal = !item.isAvailable;
    setSets((prev) =>
      prev.map((s) => (s.key === item.key ? { ...s, isAvailable: nextVal } : s))
    );
    setActionError(null);
    try {
      const res = await togglePodcastSetAvailability(item.key, nextVal);
      if (!res.success) throw new Error(res.error || "Failed to update set.");
    } catch (err) {
      setSets((prev) => prev.map((s) => s.key === item.key ? { ...s, isAvailable: item.isAvailable } : s));
      setActionError(err instanceof Error ? err.message : "Failed to update set.");
    }
  };

  const handleDeleteSet = async (key: string) => {
    if (!confirm(`Are you sure you want to delete set "${key}"?`)) return;
    const index = sets.findIndex((s) => s.key === key);
    const removed = sets[index];
    if (!removed) return;
    setActionError(null);
    setSets((prev) => prev.filter((s) => s.key !== key));
    try {
      const res = await deleteCmsPodcastSet(key);
      if (!res.success) throw new Error(res.error || "Failed to delete set.");
    } catch (err) {
      setSets((prev) => {
        if (prev.some((s) => s.key === key)) return prev;
        const restored = [...prev];
        restored.splice(index, 0, removed);
        return restored;
      });
      setActionError(err instanceof Error ? err.message : "Failed to delete set.");
    }
  };

  // ─── Addon Handlers ───────────────────────────────────────────────────────

  const handleOpenNewAddon = () => {
    setEditingAddon(null);
    setAddonModalError(null);
    setIsAddonModalOpen(true);
  };

  const handleEditAddon = (item: PodcastAddon & { isActive?: boolean }) => {
    setEditingAddon(item);
    setAddonModalError(null);
    setIsAddonModalOpen(true);
  };

  const handleSaveAddon = async (formData: PodcastAddonFormData) => {
    setIsSavingAddon(true);
    setAddonModalError(null);
    try {
      const res = await upsertCmsPodcastAddon(formData);
      if (res.success) {
        setAddons((prev) => {
          const idx = prev.findIndex((a) => a.key === formData.id);
          const updated = {
            key: formData.id,
            title: formData.title,
            desc: formData.desc,
            priceNum: formData.priceNum,
            priceDisplay: formData.priceDisplay,
            unit: formData.unit,
            gradient: formData.gradient,
            vimeoEmbed: formData.vimeoEmbed,
            isActive: formData.isActive,
          };
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return [...prev, updated];
        });
        setIsAddonModalOpen(false);
      } else {
        setAddonModalError(res.error || "Failed to save podcast add-on.");
      }
    } catch (e) {
      setAddonModalError((e as Error).message || "Failed to save add-on.");
    } finally {
      setIsSavingAddon(false);
    }
  };

  const handleToggleAddon = async (item: PodcastAddon & { isActive?: boolean }) => {
    const nextVal = item.isActive === false ? true : false;
    setAddons((prev) =>
      prev.map((a) => (a.key === item.key ? { ...a, isActive: nextVal } : a))
    );
    setActionError(null);
    try {
      const res = await togglePodcastAddonStatus(item.key, nextVal);
      if (!res.success) throw new Error(res.error || "Failed to update addon.");
    } catch (err) {
      setAddons((prev) => prev.map((a) => a.key === item.key ? { ...a, isActive: item.isActive } : a));
      setActionError(err instanceof Error ? err.message : "Failed to update addon.");
    }
  };

  const handleDeleteAddon = async (key: string) => {
    if (!confirm(`Are you sure you want to delete add-on "${key}"?`)) return;
    const index = addons.findIndex((a) => a.key === key);
    const removed = addons[index];
    if (!removed) return;
    setActionError(null);
    setAddons((prev) => prev.filter((a) => a.key !== key));
    try {
      const res = await deleteCmsPodcastAddon(key);
      if (!res.success) throw new Error(res.error || "Failed to delete addon.");
    } catch (err) {
      setAddons((prev) => {
        if (prev.some((a) => a.key === key)) return prev;
        const restored = [...prev];
        restored.splice(index, 0, removed);
        return restored;
      });
      setActionError(err instanceof Error ? err.message : "Failed to delete addon.");
    }
  };

  return (
    <div className="space-y-6">
      {actionError && <div role="alert" className="text-xs text-rose-400">{actionError}</div>}
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Podcast Studio Sets & Post-Production Add-ons
            </h2>
            <p className="text-xs text-text-muted">
              Live broadcast acoustics, camera sets, guest capacities, and upsell addons.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/podcast-production"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-300 text-xs font-semibold hover:text-white hover:border-white/20 transition-colors"
          >
            <span>Live Wizard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {activeTab === "sets" ? (
            <button
              onClick={handleOpenNewSet}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Set</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewAddon}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Add-on</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("sets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sets"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Studio Sets ({sets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("addons")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "addons"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Post-Production Add-ons ({addons.length})</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "sets" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedSets.map((set) => (
              <div
                key={set.key}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  set.isAvailable
                    ? "bg-white/[0.02] border-white/10 hover:border-brand-mauve/40"
                    : "bg-white/[0.01] border-white/5 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{set.name}</h3>
                      <span className="text-[10px] font-mono text-brand-mauve">key: {set.key}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        set.isAvailable
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {set.isAvailable ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Users className="w-3.5 h-3.5 text-brand-mauve" />
                    <span>{set.seats} Person Seating</span>
                    <span>•</span>
                    <span className="truncate">{set.location}</span>
                  </div>

                  {set.description && (
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {set.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleToggleSet(set)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {set.isAvailable ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSet(set)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Edit Set"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSet(set.key)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Set"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={safeSetsPage}
            pageCount={setsPageCount}
            total={setsTotal}
            startIndex={setsStartIndex}
            endIndex={setsEndIndex}
            onPrev={() => setSetsPage((p) => Math.max(0, p - 1))}
            onNext={() => setSetsPage((p) => Math.min(setsPageCount - 1, p + 1))}
            variant="card"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedAddons.map((addon) => {
              const isActive = addon.isActive !== false;
              return (
                <div
                  key={addon.key}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? "bg-white/[0.02] border-white/10 hover:border-brand-mauve/40"
                      : "bg-white/[0.01] border-white/5 opacity-60"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{addon.title}</h3>
                        <span className="text-[10px] font-mono text-brand-mauve">key: {addon.key}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-white">{addon.priceDisplay}</span>
                      <span className="text-[11px] text-text-muted">/ {addon.unit}</span>
                    </div>

                    {addon.desc && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {addon.desc}
                      </p>
                    )}

                    {addon.vimeoEmbed && (
                      <div className="flex items-center gap-1.5 text-[10px] text-brand-mauve">
                        <Film className="w-3 h-3" />
                        <span>Video reel attached</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleToggleAddon(addon)}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {isActive ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Enable</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditAddon(addon)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Edit Add-on"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddon(addon.key)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete Add-on"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationControls
            currentPage={safeAddonsPage}
            pageCount={addonsPageCount}
            total={addonsTotal}
            startIndex={addonsStartIndex}
            endIndex={addonsEndIndex}
            onPrev={() => setAddonsPage((p) => Math.max(0, p - 1))}
            onNext={() => setAddonsPage((p) => Math.min(addonsPageCount - 1, p + 1))}
            variant="card"
          />
        </div>
      )}

      {/* Modals */}
      <PodcastSetFormModal
        isOpen={isSetModalOpen}
        onClose={() => setIsSetModalOpen(false)}
        onSave={handleSaveSet}
        initialSet={
          editingSet
            ? {
                id: editingSet.key,
                name: editingSet.name,
                seats: editingSet.seats,
                location: editingSet.location,
                image: editingSet.image,
                gradient: editingSet.gradient,
                description: editingSet.description,
                isAvailable: editingSet.isAvailable,
              }
            : null
        }
        isSubmitting={isSavingSet}
        error={setModalError}
      />

      <PodcastAddonFormModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        onSave={handleSaveAddon}
        initialAddon={
          editingAddon
            ? {
                id: editingAddon.key,
                title: editingAddon.title,
                desc: editingAddon.desc,
                priceNum: editingAddon.priceNum,
                priceDisplay: editingAddon.priceDisplay,
                unit: editingAddon.unit,
                gradient: editingAddon.gradient,
                vimeoEmbed: editingAddon.vimeoEmbed,
                isActive: editingAddon.isActive,
              }
            : null
        }
        isSubmitting={isSavingAddon}
        error={addonModalError}
      />
    </div>
  );
}
