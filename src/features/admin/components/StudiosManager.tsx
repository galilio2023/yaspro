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
} from "lucide-react";
import {
  upsertCmsStudio,
  toggleStudioActiveStatus,
  deleteCmsStudio,
} from "@/lib/actions/studios-soundstages-operations";
import type { Studio } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
  StudioFormModal,
} from "@/components/admin";
import { useAdminCrud } from "../hooks/useAdminCrud";
import { useAdminFilter } from "../hooks/useAdminFilter";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { CREW_EQUIPMENT_ITEMS, PROPS_ITEMS, ADDONS_ITEMS } from "@/features/booking/constants";

interface StudiosManagerProps {
  initialStudios: Studio[];
}

export function StudiosManager({ initialStudios }: StudiosManagerProps) {
  const [activeTab, setActiveTab] = React.useState<"stages" | "crew" | "props" | "addons">("stages");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Soundstages & Studio Rates CMS"
        description="Dynamic hourly rates, capacity rules, acoustic amenities, and maintenance blackout toggles."
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

      {/* Navigation Tabs for Soundstages and Wizard Sub-Steps */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
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
          onClick={() => setActiveTab("crew")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "crew"
              ? "bg-brand-violet/30 border border-brand-mauve/40 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-brand-mauve" />
          <span>Stage Crew & Operators ({CREW_EQUIPMENT_ITEMS.length})</span>
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
          <span>Props & Decor Vault ({PROPS_ITEMS.length})</span>
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
          <span>Post-Production Add-ons ({ADDONS_ITEMS.length})</span>
        </button>
      </div>

      {activeTab === "stages" && (
        <>
          {/* Filter & Search Bar */}
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

      {/* Soundstages Grid */}
      {filter.filteredData.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40 text-slate-400 text-xs font-medium space-y-3">
          <p>No soundstages found matching your search or filter criteria.</p>
          <button
            type="button"
            onClick={filter.resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-brand-mauve border border-brand-mauve/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filter.pagination.paginatedItems.map((studio) => {
            const rateNum = parseFloat(studio.hourlyRate) || 0;
            return (
              <div
                key={studio.id || studio.slug}
                className="group relative rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 flex flex-col justify-between hover:border-brand-mauve/40 transition-all shadow-xl hover:shadow-brand-violet/10"
              >
                <div className="space-y-4">
                  {/* Studio Image & Status Pill */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10">
                    <Image
                      src={studio.imageUrl || "/images/projects/dmx.jpg"}
                      alt={studio.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <button
                      type="button"
                      onClick={() => handleToggleActive(studio)}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border transition-all cursor-pointer ${
                        studio.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                      }`}
                    >
                      {studio.isActive ? "● Active Stage" : "○ Under Maintenance"}
                    </button>
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-mauve transition-colors">
                      {studio.name}
                    </h3>
                    {studio.arabicName && (
                      <p className="text-xs text-brand-lavender/80 font-arabic mt-0.5" dir="rtl">
                        {studio.arabicName}
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                      /{studio.slug}
                    </span>
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
                        <Users size={11} className="text-brand-mauve" /> Capacity
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
                          className="text-[10px] px-2 py-0.5 rounded-md bg-brand-violet/15 text-brand-mauve border border-brand-mauve/25"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
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

      {/* Pagination Controls */}
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

      {/* Crew & Operators Tab */}
      {activeTab === "crew" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Stage Crew & Specialized Technical Operators</h3>
              <p className="text-xs text-slate-400">Add-on crew members available during Step 4 of the Studio Booking Wizard.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREW_EQUIPMENT_ITEMS.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-brand-violet/80 text-white border border-brand-mauve/40 uppercase">
                    {item.priceType}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Rate</span>
                  <span className="text-xs font-mono font-bold text-brand-mauve">{formatCurrency(item.price)} {item.priceType === "hourly" ? "/hr" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Props Vault Tab */}
      {activeTab === "props" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Physical Props & Scenic Decor Vault</h3>
              <p className="text-xs text-slate-400">Scenic props and furniture items selectable during Step 5 of the Studio Booking Wizard.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROPS_ITEMS.map((prop) => (
              <div key={prop.id} className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2 text-center">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                  <Image src={prop.imageUrl} alt={prop.title} fill className="object-contain p-2" />
                </div>
                <h4 className="text-[11px] font-bold text-white truncate">{prop.title}</h4>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-mono">{prop.category}</span>
                  <span className="font-mono font-bold text-brand-mauve">{formatCurrency(prop.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post-Production Add-ons Tab */}
      {activeTab === "addons" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Post-Production & Engineering Add-ons</h3>
              <p className="text-xs text-slate-400">Finishing services selectable during Step 6 of the Studio Booking Wizard.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDONS_ITEMS.map((addon) => (
              <div key={addon.id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-white/5">
                  <Image src={addon.imageUrl} alt={addon.title} fill className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{addon.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{addon.description}</p>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Service Fee</span>
                  <span className="text-xs font-mono font-bold text-brand-mauve">{formatCurrency(addon.price)} {addon.priceType === "hourly" ? "/hr" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <StudioFormModal
        isOpen={Boolean(crud.editingItem)}
        onClose={crud.handleCloseEdit}
        onSave={crud.handleSave}
        initialStudio={crud.editingItem}
        isSubmitting={crud.isSubmitting}
        error={crud.formError}
      />

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
