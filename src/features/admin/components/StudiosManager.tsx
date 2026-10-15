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

interface StudiosManagerProps {
  initialStudios: Studio[];
}

export function StudiosManager({ initialStudios }: StudiosManagerProps) {
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

  const handleToggleActive = async (studio: Studio) => {
    const nextStatus = !studio.isActive;
    const targetId = studio.id || studio.slug;
    const res = await toggleStudioActiveStatus(targetId, nextStatus);
    if (res.success) {
      crud.updateItemDirect(targetId, { isActive: nextStatus });
      crud.showFeedback(
        `Studio ${studio.name} marked as ${nextStatus ? "active" : "under maintenance"}`
      );
    } else {
      alert(res.error || "Failed to update studio status");
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
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/40 text-slate-400 text-xs font-medium">
          No soundstages found matching your search or filter criteria.
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
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit Stage Specs</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenDelete(studio)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                      title="Delete Soundstage"
                    >
                      <Trash2 size={13} />
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
