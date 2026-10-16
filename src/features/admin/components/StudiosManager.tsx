"use client";

import React from "react";
import Image from "next/image";
import {
  Layers,
  Edit2,
  Trash2,
  Plus,
  Users,
  DollarSign,
  Activity,
  Wrench,
  Camera,
  Sparkles,
  Film,
} from "lucide-react";
import {
  upsertCmsStudio,
  toggleStudioActiveStatus,
  deleteCmsStudio,
} from "@/lib/actions/studios-soundstages-operations";
import {
  upsertStudioSessionType,
  deleteStudioSessionType,
  upsertStudioCrewItem,
  deleteStudioCrewItem,
  upsertStudioPropItem,
  deleteStudioPropItem,
  upsertStudioAddonItem,
  deleteStudioAddonItem,
  type StudioWizardCatalog,
} from "@/lib/actions/studio-wizard-catalog-operations";
import type { Studio } from "@/db/schema";
import type {
  SessionTypeItem,
  CrewEquipmentItem,
  PropItem,
  AddonItem,
} from "@/features/booking/types";
import { formatCurrency } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
  StudioFormModal,
} from "@/components/admin";
import { AdminModal } from "@/components/admin/shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
} from "@/components/admin/shared/AdminFormFields";
import { useAdminCrud } from "../hooks/useAdminCrud";
import { useAdminFilter } from "../hooks/useAdminFilter";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  SESSION_TYPES,
  CREW_EQUIPMENT_ITEMS,
  PROPS_ITEMS,
  ADDONS_ITEMS,
  PROP_CATEGORIES,
} from "@/features/booking/constants";

interface StudiosManagerProps {
  initialStudios: Studio[];
  initialWizardCatalog?: StudioWizardCatalog;
}

export function StudiosManager({
  initialStudios,
  initialWizardCatalog,
}: StudiosManagerProps) {
  const [activeTab, setActiveTab] = React.useState<
    "stages" | "sessions" | "crew" | "props" | "addons"
  >("stages");

  const [sessionTypes, setSessionTypes] = React.useState<SessionTypeItem[]>(
    () => initialWizardCatalog?.sessionTypes ?? [...SESSION_TYPES]
  );
  const [crewItems, setCrewItems] = React.useState<CrewEquipmentItem[]>(
    () => initialWizardCatalog?.crewEquipment ?? [...CREW_EQUIPMENT_ITEMS]
  );
  const [propItems, setPropItems] = React.useState<PropItem[]>(
    () => initialWizardCatalog?.props ?? [...PROPS_ITEMS]
  );
  const [addonItems, setAddonItems] = React.useState<AddonItem[]>(
    () => initialWizardCatalog?.addons ?? [...ADDONS_ITEMS]
  );

  // Sub-catalog modal states
  const [editingSession, setEditingSession] = React.useState<SessionTypeItem | null>(null);
  const [editingCrew, setEditingCrew] = React.useState<CrewEquipmentItem | null>(null);
  const [editingProp, setEditingProp] = React.useState<PropItem | null>(null);
  const [editingAddon, setEditingAddon] = React.useState<AddonItem | null>(null);
  const [subCatalogBusy, setSubCatalogBusy] = React.useState(false);
  const [subCatalogError, setSubCatalogError] = React.useState<string | null>(null);

  const crud = useAdminCrud<Studio>({
    initialData: initialStudios,
    upsertAction: upsertCmsStudio,
    deleteAction: deleteCmsStudio,
    getItemId: (s) => s.id,
    getItemSlug: (s) => s.slug,
    getItemName: (s) => s.name,
    defaultNewItem: {
      name: "",
      slug: "",
      hourlyRate: "1000.00",
      capacity: 25,
      description: "",
      isActive: true,
      amenities: ["10Gbps Symmetrical Fiber", "Green Room", "Hair & Makeup Suite"],
    },
  });

  const filter = useAdminFilter<Studio, "all" | "active" | "maintenance">({
    data: crud.items,
    initialFilter: "all",
    pageSize: 12,
    predicate: (studio, q, status) => {
      const matchesSearch =
        !q ||
        studio.name.toLowerCase().includes(q) ||
        studio.slug.toLowerCase().includes(q) ||
        (studio.description && studio.description.toLowerCase().includes(q)) ||
        (Array.isArray(studio.amenities) &&
          (studio.amenities as string[]).some((a) => a.toLowerCase().includes(q)));
      const matchesStatus =
        status === "all" ||
        (status === "active" && studio.isActive) ||
        (status === "maintenance" && !studio.isActive);
      return Boolean(matchesSearch && matchesStatus);
    },
  });

  const activeCount = crud.items.filter((s) => s.isActive).length;
  const maintenanceCount = crud.items.filter((s) => !s.isActive).length;
  const avgHourlyRate =
    crud.items.length > 0
      ? Math.round(
          crud.items.reduce((acc, s) => acc + (parseFloat(s.hourlyRate) || 0), 0) /
            crud.items.length
        )
      : 0;

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleToggleActive = async (studio: Studio) => {
    const nextStatus = !studio.isActive;
    const targetId = studio.id || studio.slug;
    setErrorMessage(null);
    try {
      const res = await toggleStudioActiveStatus(targetId, nextStatus);
      if (res.success) {
        crud.updateItemDirect(targetId, { isActive: nextStatus });
        crud.showFeedback(
          `Studio ${studio.name} marked as ${nextStatus ? "active" : "under maintenance"}`
        );
      } else {
        setErrorMessage(res.error || "Failed to update studio status");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update studio status");
    }
  };

  const applyCatalogUpdate = (data?: StudioWizardCatalog, message?: string) => {
    if (data) {
      setSessionTypes(data.sessionTypes);
      setCrewItems(data.crewEquipment);
      setPropItems(data.props);
      setAddonItems(data.addons);
    }
    if (message) crud.showFeedback(message);
  };

  // ─── Sub-step Save & Delete Handlers ──────────────────────────────────────────

  const handleSaveSessionType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setSubCatalogBusy(true);
    setSubCatalogError(null);
    try {
      const res = await upsertStudioSessionType(editingSession);
      if (res.success) {
        applyCatalogUpdate(res.data, res.message);
        setEditingSession(null);
      } else {
        setSubCatalogError(res.error || "Failed to save session format.");
      }
    } catch (err) {
      setSubCatalogError((err as Error).message || "Failed to save session format.");
    } finally {
      setSubCatalogBusy(false);
    }
  };

  const handleDeleteSessionType = async (id: string) => {
    if (!confirm(`Are you sure you want to delete session format "${id}"?`)) return;
    setErrorMessage(null);
    try {
      const res = await deleteStudioSessionType(id);
      if (res.success) applyCatalogUpdate(res.data, res.message);
      else setErrorMessage(res.error || "Failed to delete session format.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete session format.");
    }
  };

  const handleSaveCrewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrew) return;
    setSubCatalogBusy(true);
    setSubCatalogError(null);
    try {
      const res = await upsertStudioCrewItem(editingCrew);
      if (res.success) {
        applyCatalogUpdate(res.data, res.message);
        setEditingCrew(null);
      } else {
        setSubCatalogError(res.error || "Failed to save crew item.");
      }
    } catch (err) {
      setSubCatalogError((err as Error).message || "Failed to save crew item.");
    } finally {
      setSubCatalogBusy(false);
    }
  };

  const handleDeleteCrewItem = async (id: string) => {
    if (!confirm(`Are you sure you want to delete crew item "${id}"?`)) return;
    setErrorMessage(null);
    try {
      const res = await deleteStudioCrewItem(id);
      if (res.success) applyCatalogUpdate(res.data, res.message);
      else setErrorMessage(res.error || "Failed to delete crew item.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete crew item.");
    }
  };

  const handleSavePropItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setSubCatalogBusy(true);
    setSubCatalogError(null);
    try {
      const res = await upsertStudioPropItem(editingProp);
      if (res.success) {
        applyCatalogUpdate(res.data, res.message);
        setEditingProp(null);
      } else {
        setSubCatalogError(res.error || "Failed to save prop item.");
      }
    } catch (err) {
      setSubCatalogError((err as Error).message || "Failed to save prop item.");
    } finally {
      setSubCatalogBusy(false);
    }
  };

  const handleDeletePropItem = async (id: string) => {
    if (!confirm(`Are you sure you want to delete prop item "${id}"?`)) return;
    setErrorMessage(null);
    try {
      const res = await deleteStudioPropItem(id);
      if (res.success) applyCatalogUpdate(res.data, res.message);
      else setErrorMessage(res.error || "Failed to delete prop item.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete prop item.");
    }
  };

  const handleSaveAddonItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon) return;
    setSubCatalogBusy(true);
    setSubCatalogError(null);
    try {
      const res = await upsertStudioAddonItem(editingAddon);
      if (res.success) {
        applyCatalogUpdate(res.data, res.message);
        setEditingAddon(null);
      } else {
        setSubCatalogError(res.error || "Failed to save add-on.");
      }
    } catch (err) {
      setSubCatalogError((err as Error).message || "Failed to save add-on.");
    } finally {
      setSubCatalogBusy(false);
    }
  };

  const handleDeleteAddonItem = async (id: string) => {
    if (!confirm(`Are you sure you want to delete add-on "${id}"?`)) return;
    setErrorMessage(null);
    try {
      const res = await deleteStudioAddonItem(id);
      if (res.success) applyCatalogUpdate(res.data, res.message);
      else setErrorMessage(res.error || "Failed to delete add-on.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete add-on.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Soundstages & Studio Rates CMS"
        description="Dynamic hourly rates, capacity rules, session formats, crew operators, props vault, and post-production add-ons."
        icon={Layers}
        feedback={crud.feedback}
        onDismissFeedback={crud.clearFeedback}
        actions={
          <button
            type="button"
            onClick={() => crud.handleOpenNew()}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Soundstage</span>
          </button>
        }
      />

      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white cursor-pointer px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Total Soundstages",
            value: crud.items.length,
            unit: "Stages",
            icon: Layers,
            variant: "default",
          },
          {
            label: "Active / Bookable",
            value: activeCount,
            unit: "Live",
            icon: Activity,
            variant: "success",
          },
          {
            label: "Maintenance Mode",
            value: maintenanceCount,
            unit: "Offline",
            icon: Wrench,
            variant: "warning",
          },
          {
            label: "Average Rate",
            value: formatCurrency(avgHourlyRate),
            unit: "/hr",
            icon: DollarSign,
            variant: "default",
          },
        ]}
      />

      {/* Navigation Tabs for Soundstages and All Wizard Steps */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "stages"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-brand-mauve" />
          <span>Soundstages ({crud.items.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "sessions"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Film className="w-4 h-4 text-brand-mauve" />
          <span>Step 2: Session Formats ({sessionTypes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("crew")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "crew"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-brand-mauve" />
          <span>Step 4: Crew & Operators ({crewItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("props")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "props"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Camera className="w-4 h-4 text-brand-mauve" />
          <span>Step 5: Props Vault ({propItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("addons")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "addons"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-mauve" />
          <span>Step 6: Post-Production ({addonItems.length})</span>
        </button>
      </div>

      {activeTab === "stages" && (
        <>
          <AdminFilterBar
            searchQuery={filter.searchQuery}
            onSearchChange={filter.setSearchQuery}
            searchPlaceholder="Search soundstages by name, slug, amenities or specs..."
            filterValue={filter.filterValue}
            onFilterChange={filter.setFilterValue}
            filterOptions={[
              { id: "all", label: "All Stages", count: crud.items.length },
              { id: "active", label: "Active", count: activeCount },
              { id: "maintenance", label: "Maintenance", count: maintenanceCount },
            ]}
          />

          {filter.filteredData.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-white/10">
              <p className="text-sm text-slate-400">
                No soundstages match your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filter.pagination.paginatedItems.map((studio) => {
                const rateNum = parseFloat(studio.hourlyRate) || 0;
                return (
                  <div
                    key={studio.id || studio.slug}
                    className={`p-6 rounded-3xl border transition-all backdrop-blur-xl flex flex-col justify-between ${
                      studio.isActive
                        ? "bg-slate-900/60 border-white/10 hover:border-brand-mauve/40"
                        : "bg-slate-950/60 border-white/5 opacity-75"
                    }`}
                  >
                    <div className="space-y-4">
                      {studio.imageUrl && (
                        <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950">
                          <Image
                            src={studio.imageUrl}
                            alt={studio.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg font-extrabold text-white tracking-tight">
                            {studio.name}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(studio)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-colors cursor-pointer min-h-[28px] ${
                              studio.isActive
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                            }`}
                            aria-label={`Mark ${studio.name} as ${studio.isActive ? "maintenance" : "active"}`}
                          >
                            {studio.isActive ? "● Active" : "○ Maintenance"}
                          </button>
                        </div>

                        {studio.arabicName && (
                          <p className="text-xs text-brand-lavender/80 font-arabic mt-0.5" dir="rtl">
                            {studio.arabicName}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                          /{studio.slug}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {studio.description || "High-specification soundstage with full lighting grid."}
                      </p>

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
                            <Users size={11} className="text-brand-mauve" /> Capacity
                          </span>
                          <span className="font-extrabold text-white text-base font-mono mt-0.5 block">
                            {studio.capacity} People
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-mono text-slate-500">
                          Stage Amenities
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {((studio.amenities as string[]) || []).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-brand-violet/15 text-brand-mauve border border-brand-mauve/25"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-white/10 mt-5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {studio.isActive ? "Instant Cal Sync" : "Stage Blocked"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => crud.handleOpenEdit(studio)}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[36px]"
                          aria-label={`Edit specifications for ${studio.name}`}
                        >
                          <Edit2 size={13} />
                          <span>Edit Stage Specs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => crud.handleOpenDelete(studio)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Delete Soundstage"
                          aria-label={`Delete soundstage ${studio.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <PaginationControls
            currentPage={filter.pagination.currentPage}
            pageCount={filter.pagination.pageCount}
            total={filter.pagination.total}
            startIndex={filter.pagination.startIndex}
            endIndex={filter.pagination.endIndex}
            onPrev={filter.pagination.prevPage}
            onNext={filter.pagination.nextPage}
            variant="card"
          />
        </>
      )}

      {/* Session Formats Tab (Step 2) */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Session Formats (Wizard Step 2)</h3>
              <p className="text-xs text-slate-400">
                Production formats and base hourly rates displayed in Step 2 of the Studio Booking Wizard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubCatalogError(null);
                setEditingSession({
                  id: `session-${Date.now()}`,
                  title: "",
                  description: "",
                  price: 350,
                  imageUrl: "/images/studios/nature-grid.jpg",
                });
              }}
              className="px-4 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Session Format</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionTypes.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                    <Image src={item.imageUrl || "/images/studios/nature-grid.jpg"} alt={item.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-brand-mauve">
                    {formatCurrency(item.price)} /hr
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSubCatalogError(null);
                        setEditingSession(item);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    {sessionTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSessionType(item.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 cursor-pointer"
                        title="Delete Session Format"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crew & Operators Tab (Step 4) */}
      {activeTab === "crew" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Stage Crew & Specialized Technical Operators (Wizard Step 4)</h3>
              <p className="text-xs text-slate-400">Add-on crew members and equipment packages available during Step 4 of the Studio Booking Wizard.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubCatalogError(null);
                setEditingCrew({
                  id: `crew-${Date.now()}`,
                  title: "",
                  description: "",
                  price: 250,
                  priceType: "hourly",
                  category: "crew",
                  imageUrl: "/images/studios/nature-grid.jpg",
                });
              }}
              className="px-4 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Crew / Operator</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crewItems.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                    <Image src={item.imageUrl || "/images/studios/nature-grid.jpg"} alt={item.title} fill className="object-cover" />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-brand-violet/80 text-white border border-brand-mauve/40 uppercase">
                      {item.priceType}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-brand-mauve">
                    {formatCurrency(item.price)} {item.priceType === "hourly" ? "/hr" : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSubCatalogError(null);
                        setEditingCrew(item);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCrewItem(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 cursor-pointer"
                      title="Delete Crew Item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Props Vault Tab (Step 5) */}
      {activeTab === "props" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Physical Props & Scenic Decor Vault (Wizard Step 5)</h3>
              <p className="text-xs text-slate-400">Scenic props and furniture items selectable during Step 5 of the Studio Booking Wizard.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubCatalogError(null);
                setEditingProp({
                  id: `prop-${Date.now()}`,
                  title: "",
                  price: 75,
                  priceType: "flat",
                  category: "Furniture",
                  imageUrl: "/images/studios/nature-grid.jpg",
                });
              }}
              className="px-4 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Scenic Prop</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {propItems.map((prop) => (
              <div key={prop.id} className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-2 text-center">
                <div className="space-y-2">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                    <Image src={prop.imageUrl || "/images/studios/nature-grid.jpg"} alt={prop.title} fill className="object-contain p-2" />
                  </div>
                  <h4 className="text-[11px] font-bold text-white truncate">{prop.title}</h4>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono truncate">{prop.category}</span>
                    <span className="font-mono font-bold text-brand-mauve">{formatCurrency(prop.price)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSubCatalogError(null);
                      setEditingProp(prop);
                    }}
                    className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 size={11} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePropItem(prop.id)}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 cursor-pointer"
                    title="Delete Prop"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Production Add-ons Tab (Step 6) */}
      {activeTab === "addons" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Post-Production & Engineering Add-ons (Wizard Step 6)</h3>
              <p className="text-xs text-slate-400">Finishing services selectable during Step 6 of the Studio Booking Wizard.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSubCatalogError(null);
                setEditingAddon({
                  id: `addon-${Date.now()}`,
                  title: "",
                  description: "",
                  price: 350,
                  priceType: "flat",
                  imageUrl: "/images/studios/nature-grid.jpg",
                });
              }}
              className="px-4 py-2 rounded-xl btn-brand text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Add Post-Production Service</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addonItems.map((addon) => (
              <div key={addon.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                    <Image src={addon.imageUrl || "/images/studios/nature-grid.jpg"} alt={addon.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{addon.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{addon.description}</p>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-mauve">
                    {formatCurrency(addon.price)} {addon.priceType === "hourly" ? "/hr" : ""}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSubCatalogError(null);
                        setEditingAddon(addon);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddonItem(addon.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 cursor-pointer"
                      title="Delete Add-on"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Studio Stage Form Modal */}
      <StudioFormModal
        isOpen={Boolean(crud.editingItem)}
        onClose={crud.handleCloseEdit}
        onSave={crud.handleSave}
        initialStudio={crud.editingItem}
        isSubmitting={crud.isSubmitting}
        error={crud.formError}
      />

      {/* Session Format Modal (Step 2) */}
      <AdminModal
        isOpen={Boolean(editingSession)}
        onClose={() => setEditingSession(null)}
        title="Configure Session Format (Step 2)"
        description="Edit session format title, description, hourly rate, and cover image."
      >
        {editingSession && (
          <form onSubmit={handleSaveSessionType} className="space-y-4">
            {subCatalogError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {subCatalogError}
              </div>
            )}
            <AdminInput
              label="Format Title"
              required
              value={editingSession.title}
              onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
            />
            <AdminInput
              label="Hourly Rate (AED)"
              type="number"
              required
              min={0}
              value={editingSession.price}
              onChange={(e) => setEditingSession({ ...editingSession, price: Number(e.target.value) })}
            />
            <AdminTextarea
              label="Description"
              value={editingSession.description}
              onChange={(e) => setEditingSession({ ...editingSession, description: e.target.value })}
            />
            <AdminInput
              label="Cover Image URL"
              value={editingSession.imageUrl}
              onChange={(e) => setEditingSession({ ...editingSession, imageUrl: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subCatalogBusy}
                className="px-4 py-2 rounded-xl btn-brand text-xs font-bold cursor-pointer"
              >
                {subCatalogBusy ? "Saving..." : "Save Format"}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Crew / Equipment Modal (Step 4) */}
      <AdminModal
        isOpen={Boolean(editingCrew)}
        onClose={() => setEditingCrew(null)}
        title="Configure Stage Crew / Operator (Step 4)"
        description="Edit crew role or studio equipment rate and billing cadence."
      >
        {editingCrew && (
          <form onSubmit={handleSaveCrewItem} className="space-y-4">
            {subCatalogError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {subCatalogError}
              </div>
            )}
            <AdminInput
              label="Title"
              required
              value={editingCrew.title}
              onChange={(e) => setEditingCrew({ ...editingCrew, title: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminInput
                label="Rate (AED)"
                type="number"
                required
                min={0}
                value={editingCrew.price}
                onChange={(e) => setEditingCrew({ ...editingCrew, price: Number(e.target.value) })}
              />
              <AdminSelect
                label="Billing Cadence"
                value={editingCrew.priceType}
                onChange={(e) =>
                  setEditingCrew({
                    ...editingCrew,
                    priceType: e.target.value as "hourly" | "flat",
                  })
                }
                options={[
                  { value: "hourly", label: "Hourly (/hr)" },
                  { value: "flat", label: "Flat Session Rate" },
                ]}
              />
              <AdminSelect
                label="Category"
                value={editingCrew.category}
                onChange={(e) =>
                  setEditingCrew({
                    ...editingCrew,
                    category: e.target.value as "crew" | "equipment",
                  })
                }
                options={[
                  { value: "crew", label: "Crew Operator" },
                  { value: "equipment", label: "Stage Equipment" },
                ]}
              />
            </div>
            <AdminTextarea
              label="Description"
              value={editingCrew.description}
              onChange={(e) => setEditingCrew({ ...editingCrew, description: e.target.value })}
            />
            <AdminInput
              label="Image URL"
              value={editingCrew.imageUrl}
              onChange={(e) => setEditingCrew({ ...editingCrew, imageUrl: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingCrew(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subCatalogBusy}
                className="px-4 py-2 rounded-xl btn-brand text-xs font-bold cursor-pointer"
              >
                {subCatalogBusy ? "Saving..." : "Save Crew Item"}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Prop Modal (Step 5) */}
      <AdminModal
        isOpen={Boolean(editingProp)}
        onClose={() => setEditingProp(null)}
        title="Configure Scenic Prop (Step 5)"
        description="Edit prop title, category, rental fee, and preview image."
      >
        {editingProp && (
          <form onSubmit={handleSavePropItem} className="space-y-4">
            {subCatalogError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {subCatalogError}
              </div>
            )}
            <AdminInput
              label="Prop Title"
              required
              value={editingProp.title}
              onChange={(e) => setEditingProp({ ...editingProp, title: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdminInput
                label="Price (AED)"
                type="number"
                required
                min={0}
                value={editingProp.price}
                onChange={(e) => setEditingProp({ ...editingProp, price: Number(e.target.value) })}
              />
              <AdminSelect
                label="Category"
                value={editingProp.category}
                onChange={(e) => setEditingProp({ ...editingProp, category: e.target.value })}
                options={PROP_CATEGORIES.filter((c) => c !== "All").map((c) => ({
                  value: c,
                  label: c,
                }))}
              />
            </div>
            <AdminInput
              label="Image URL"
              value={editingProp.imageUrl}
              onChange={(e) => setEditingProp({ ...editingProp, imageUrl: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subCatalogBusy}
                className="px-4 py-2 rounded-xl btn-brand text-xs font-bold cursor-pointer"
              >
                {subCatalogBusy ? "Saving..." : "Save Prop"}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Post-Production Add-on Modal (Step 6) */}
      <AdminModal
        isOpen={Boolean(editingAddon)}
        onClose={() => setEditingAddon(null)}
        title="Configure Post-Production Add-on (Step 6)"
        description="Edit finishing service title, description, and service rate."
      >
        {editingAddon && (
          <form onSubmit={handleSaveAddonItem} className="space-y-4">
            {subCatalogError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {subCatalogError}
              </div>
            )}
            <AdminInput
              label="Service Title"
              required
              value={editingAddon.title}
              onChange={(e) => setEditingAddon({ ...editingAddon, title: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdminInput
                label="Price (AED)"
                type="number"
                required
                min={0}
                value={editingAddon.price}
                onChange={(e) => setEditingAddon({ ...editingAddon, price: Number(e.target.value) })}
              />
              <AdminSelect
                label="Billing Cadence"
                value={editingAddon.priceType}
                onChange={(e) =>
                  setEditingAddon({
                    ...editingAddon,
                    priceType: e.target.value as "hourly" | "flat",
                  })
                }
                options={[
                  { value: "flat", label: "Flat Service Rate" },
                  { value: "hourly", label: "Hourly (/hr)" },
                ]}
              />
            </div>
            <AdminTextarea
              label="Description"
              value={editingAddon.description}
              onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
            />
            <AdminInput
              label="Image URL"
              value={editingAddon.imageUrl}
              onChange={(e) => setEditingAddon({ ...editingAddon, imageUrl: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingAddon(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={subCatalogBusy}
                className="px-4 py-2 rounded-xl btn-brand text-xs font-bold cursor-pointer"
              >
                {subCatalogBusy ? "Saving..." : "Save Add-on"}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      {crud.itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(crud.itemToDelete)}
          onClose={crud.handleCloseDelete}
          onConfirm={crud.handleConfirmDelete}
          title="Delete Soundstage"
          message={
            crud.deleteError ||
            `Are you sure you want to permanently remove "${crud.itemToDelete.name}" (${crud.itemToDelete.slug})? If there are any associated bookings, deletion will be blocked.`
          }
          confirmLabel={crud.deleteError ? "Understood" : "Delete Soundstage"}
          variant={crud.deleteError ? "warning" : "danger"}
          isSubmitting={crud.isDeleting}
        />
      )}
    </div>
  );
}
