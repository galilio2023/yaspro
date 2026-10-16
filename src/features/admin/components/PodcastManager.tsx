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
import type { PodcastStudio, PodcastAddon, PodcastService } from "@/features/podcast-booking/types";
import {
  upsertCmsPodcastSet,
  togglePodcastSetAvailability,
  deleteCmsPodcastSet,
  upsertCmsPodcastAddon,
  togglePodcastAddonStatus,
  deleteCmsPodcastAddon,
  upsertCmsPodcastService,
  togglePodcastServiceStatus,
  deleteCmsPodcastService,
} from "@/lib/actions/podcast-operations";
import { PodcastSetFormModal, type PodcastSetFormData } from "@/components/admin/forms/PodcastSetFormModal";
import { PodcastAddonFormModal, type PodcastAddonFormData } from "@/components/admin/forms/PodcastAddonFormModal";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface PodcastManagerProps {
  initialSets: PodcastStudio[];
  initialAddons: (PodcastAddon & { isActive?: boolean })[];
  initialServices?: (PodcastService & { isActive?: boolean })[];
}

export function PodcastManager({ initialSets, initialAddons, initialServices = [] }: PodcastManagerProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sets" | "tiers" | "addons">("sets");
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

  // Service / Tier state (placed after existing hooks to preserve hook index order in tests)
  const [services, setServices] = useState<(PodcastService & { isActive?: boolean })[]>(initialServices);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<(PodcastService & { isActive?: boolean }) | null>(null);
  const [serviceForm, setServiceForm] = useState({
    id: "",
    title: "",
    subtitle: "",
    price: 490,
    priceUnit: "hour",
    featuresText: "",
    badge: "",
    isActive: true,
  });
  const [serviceModalError, setServiceModalError] = useState<string | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);

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

  // ─── Service / Tier Handlers ──────────────────────────────────────────────

  const handleOpenNewService = () => {
    setEditingService(null);
    setServiceModalError(null);
    setServiceForm({
      id: "",
      title: "",
      subtitle: "",
      price: 490,
      priceUnit: "hour",
      featuresText: "",
      badge: "",
      isActive: true,
    });
    setIsServiceModalOpen(true);
  };

  const handleEditService = (item: PodcastService & { isActive?: boolean }) => {
    setEditingService(item);
    setServiceModalError(null);
    setServiceForm({
      id: item.key,
      title: item.title,
      subtitle: item.sub || "",
      price: item.price,
      priceUnit: "hour",
      featuresText: (item.highlights || []).join("\n"),
      badge: item.badge || "",
      isActive: item.isActive !== false,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingService(true);
    setServiceModalError(null);
    try {
      const highlights = serviceForm.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);
      const res = await upsertCmsPodcastService({
        key: serviceForm.id,
        title: serviceForm.title,
        sub: serviceForm.subtitle,
        price: Number(serviceForm.price),
        highlights,
        badge: serviceForm.badge.trim() || undefined,
        isActive: serviceForm.isActive,
      });
      if (res.success && res.data) {
        setServices(res.data);
        setIsServiceModalOpen(false);
      } else {
        setServiceModalError(res.error || "Failed to save production tier.");
      }
    } catch (err) {
      setServiceModalError((err as Error).message || "Failed to save tier.");
    } finally {
      setIsSavingService(false);
    }
  };

  const handleToggleService = async (item: PodcastService & { isActive?: boolean }) => {
    const nextVal = item.isActive === false ? true : false;
    setServices((prev) =>
      prev.map((s) => (s.key === item.key ? { ...s, isActive: nextVal } : s))
    );
    setActionError(null);
    try {
      const res = await togglePodcastServiceStatus(item.key, nextVal);
      if (!res.success) throw new Error(res.error || "Failed to update tier.");
    } catch (err) {
      setServices((prev) => prev.map((s) => (s.key === item.key ? { ...s, isActive: item.isActive } : s)));
      setActionError(err instanceof Error ? err.message : "Failed to update tier.");
    }
  };

  const handleDeleteService = async (key: string) => {
    if (!confirm(`Are you sure you want to delete production tier "${key}"?`)) return;
    const index = services.findIndex((s) => s.key === key);
    const removed = services[index];
    if (!removed) return;
    setActionError(null);
    setServices((prev) => prev.filter((s) => s.key !== key));
    try {
      const res = await deleteCmsPodcastService(key);
      if (!res.success) throw new Error(res.error || "Failed to delete tier.");
    } catch (err) {
      setServices((prev) => {
        if (prev.some((s) => s.key === key)) return prev;
        const restored = [...prev];
        restored.splice(index, 0, removed);
        return restored;
      });
      setActionError(err instanceof Error ? err.message : "Failed to delete tier.");
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
              Podcast Studio Sets, Production Tiers & Add-ons
            </h2>
            <p className="text-xs text-text-muted">
              Live broadcast acoustics, camera sets, step-by-step production tiers, and upsell addons.
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
          ) : activeTab === "tiers" ? (
            <button
              onClick={handleOpenNewService}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Tier</span>
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
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
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
          onClick={() => setActiveTab("tiers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "tiers"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Step 3: Production Tiers ({services.length})</span>
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
      ) : activeTab === "tiers" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const isActive = service.isActive !== false;
            return (
              <div
                key={service.key}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-white/[0.02] border-white/10 hover:border-brand-mauve/40"
                    : "bg-white/[0.01] border-white/5 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{service.title}</h3>
                      <span className="text-[10px] font-mono text-brand-mauve">key: {service.key}</span>
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
                    <span className="text-lg font-bold text-white">AED {service.price}</span>
                    <span className="text-[11px] text-text-muted">/ hour</span>
                    {service.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-brand-violet/20 text-brand-mauve text-[10px] font-bold">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{service.sub}</p>

                  {service.highlights && service.highlights.length > 0 && (
                    <ul className="space-y-1 text-[11px] text-slate-400">
                      {service.highlights.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-brand-mauve" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => handleToggleService(service)}
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
                      onClick={() => handleEditService(service)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Edit Tier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.key)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveService}
            className="w-full max-w-lg rounded-2xl bg-[#100a14] border border-white/10 p-6 space-y-4 shadow-2xl shadow-brand-violet/20"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingService ? "Edit Production Tier" : "New Production Tier"}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            {serviceModalError && (
              <div role="alert" className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg">
                {serviceModalError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Key / Slug</label>
                <input
                  required
                  value={serviceForm.id}
                  onChange={(e) => setServiceForm((f) => ({ ...f, id: e.target.value }))}
                  placeholder="recording-with-edit"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Title</label>
                <input
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Recording + Professional Edit"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Subtitle</label>
              <input
                required
                value={serviceForm.subtitle}
                onChange={(e) => setServiceForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Complete episode ready to publish"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Price (AED)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Unit</label>
                <input
                  readOnly
                  disabled
                  value="per hour"
                  className="w-full rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Badge (Optional)</label>
                <input
                  value={serviceForm.badge}
                  onChange={(e) => setServiceForm((f) => ({ ...f, badge: e.target.value }))}
                  placeholder="Most Popular"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Features (one per line)
              </label>
              <textarea
                rows={4}
                required
                value={serviceForm.featuresText}
                onChange={(e) => setServiceForm((f) => ({ ...f, featuresText: e.target.value }))}
                placeholder={"3x Sony FX30 4K Cinema Cameras\n4x Shure SM7dB Broadcast Microphones"}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingService}
                className="px-4 py-2 rounded-xl bg-brand-violet text-xs font-bold text-white hover:bg-brand-mauve disabled:opacity-50"
              >
                {isSavingService ? "Saving..." : "Save Tier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
