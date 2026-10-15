"use client";

import React from "react";
import Image from "next/image";
import {
  Camera,
  Plus,
  Edit3,
  Trash2,
  Tag,
  CheckCircle,
  XCircle,
  PackageCheck,
  Disc,
} from "lucide-react";
import { upsertCmsEquipment, deleteCmsEquipment } from "@/lib/actions/equipment-gear";
import type { Equipment } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
  GearFormModal,
} from "@/components/admin";
import {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableEmpty,
} from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAdminCrud } from "../hooks/useAdminCrud";
import { useAdminFilter } from "../hooks/useAdminFilter";

interface GearManagerProps {
  initialEquipment: Equipment[];
}

export function GearManager({ initialEquipment }: GearManagerProps) {
  const crud = useAdminCrud<Equipment>({
    initialData: initialEquipment,
    upsertAction: upsertCmsEquipment,
    deleteAction: deleteCmsEquipment,
    getItemId: (g) => g.id,
    getItemSlug: (g) => g.slug,
    getItemName: (g) => g.name,
    defaultNewItem: {
      name: "",
      category: "cameras",
      dailyRate: "1500.00",
      securityDeposit: "2000.00",
      description: "",
      imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
      isPopular: false,
      isKit: false,
      isAvailable: true,
    },
  });

  const filter = useAdminFilter<Equipment, string, "all" | "available" | "unavailable">({
    data: crud.items,
    initialFilter: "all",
    initialSecondaryFilter: "all",
    pageSize: 15,
    predicate: (g, q, category, availability) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        (g.arabicName && g.arabicName.toLowerCase().includes(q)) ||
        (g.slug && g.slug.toLowerCase().includes(q)) ||
        (g.description && g.description.toLowerCase().includes(q));

      const matchesCategory = category === "all" || g.category === category;
      const matchesAvailability =
        !availability || availability === "all"
          ? true
          : availability === "available"
          ? g.isAvailable
          : !g.isAvailable;

      return Boolean(matchesSearch && matchesCategory && matchesAvailability);
    },
  });

  const totalCameras = crud.items.filter((g) => g.category === "cameras").length;
  const totalLenses = crud.items.filter((g) => g.category === "lenses").length;
  const totalLighting = crud.items.filter((g) => g.category === "lighting").length;
  const totalAudio = crud.items.filter((g) => g.category === "audio").length;
  const totalAvailable = crud.items.filter((g) => g.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Fleet & Studio Equipment CMS"
        description="Manage cinema cameras, anamorphic lenses, lighting packages, and real-time fleet availability."
        icon={Camera}
        feedback={crud.feedback}
        onDismissFeedback={crud.clearFeedback}
        actions={
          <button
            type="button"
            onClick={() => crud.handleOpenNew()}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Equipment</span>
          </button>
        }
      />

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={5}
        stats={[
          {
            label: "Total Fleet",
            value: crud.items.length,
            unit: "Assets",
            icon: PackageCheck,
            variant: "default",
          },
          {
            label: "Available",
            value: totalAvailable,
            unit: "Ready",
            icon: CheckCircle,
            variant: "success",
          },
          {
            label: "Cameras",
            value: totalCameras,
            unit: "Bodies",
            icon: Camera,
            variant: "brand",
          },
          {
            label: "Lenses & Glass",
            value: totalLenses,
            unit: "Sets",
            icon: Disc,
            variant: "default",
          },
          {
            label: "Lighting & Audio",
            value: totalLighting + totalAudio,
            unit: "Kits",
            variant: "default",
          },
        ]}
      />

      {/* Filter & Search Bar */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search gear by model, brand, slug or specs..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Gear", count: crud.items.length },
          { id: "cameras", label: "Cameras", count: totalCameras },
          { id: "lenses", label: "Lenses", count: totalLenses },
          { id: "lighting", label: "Lighting", count: totalLighting },
          { id: "audio", label: "Audio", count: totalAudio },
        ]}
        secondaryFilters={
          <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/5">
            {[
              { id: "all", label: "All Status" },
              { id: "available", label: "Available" },
              { id: "unavailable", label: "Booked" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  filter.setSecondaryFilterValue(
                    opt.id as "all" | "available" | "unavailable"
                  )
                }
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  (filter.secondaryFilterValue || "all") === opt.id
                    ? "bg-white/10 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Equipment Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">Equipment Item</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Daily Rate</th>
            <th className="py-3 px-4">Deposit</th>
            <th className="py-3 px-4">Availability</th>
            <th className="py-3 px-4 text-end">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {filter.filteredData.length === 0 ? (
            <DataTableEmpty
              colSpan={6}
              message="No equipment found matching your filter criteria."
              onReset={filter.resetFilters}
            />
          ) : (
            filter.pagination.paginatedItems.map((g) => (
              <DataTableRow key={g.id}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                      {g.imageUrl && (
                        <Image src={g.imageUrl} alt={g.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{g.name}</span>
                      {g.arabicName && (
                        <span className="text-[11px] text-slate-400 font-arabic block">
                          {g.arabicName}
                        </span>
                      )}
                      {g.isPopular && (
                        <span className="text-[10px] text-brand-mauve flex items-center gap-1 mt-0.5 font-medium">
                          <Tag size={10} /> Popular Choice
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-lavender font-mono text-[11px] capitalize">
                    {g.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-white font-mono">
                  AED {Number(g.dailyRate).toLocaleString()} / day
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono">
                  AED {Number(g.securityDeposit || 0).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {g.isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle size={12} /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                      <XCircle size={12} /> On Set / Reserved
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-end">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => crud.handleOpenEdit(g)}
                      className="p-2 rounded-xl bg-brand-violet/20 hover:bg-brand-violet/35 text-brand-mauve transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Edit Equipment"
                      aria-label={`Edit ${g.name}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenDelete(g)}
                      className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Delete Equipment"
                      aria-label={`Delete ${g.name}`}
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

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={filter.pagination.currentPage}
        pageCount={filter.pagination.pageCount}
        total={filter.pagination.total}
        startIndex={filter.pagination.startIndex}
        endIndex={filter.pagination.endIndex}
        onPrev={filter.pagination.prevPage}
        onNext={filter.pagination.nextPage}
      />

      {/* Edit / Create Form Modal */}
      <GearFormModal
        isOpen={Boolean(crud.editingItem)}
        onClose={crud.handleCloseEdit}
        onSave={crud.handleSave}
        initialGear={crud.editingItem}
        isSubmitting={crud.isSubmitting}
        error={crud.formError}
      />

      {/* Delete Confirmation Modal */}
      {crud.itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(crud.itemToDelete)}
          onClose={crud.handleCloseDelete}
          onConfirm={crud.handleConfirmDelete}
          title="Delete Equipment"
          message={
            crud.deleteError ||
            `Are you sure you want to permanently remove "${crud.itemToDelete.name}" from fleet inventory?`
          }
          confirmLabel={crud.deleteError ? "Understood" : "Delete Equipment"}
          variant={crud.deleteError ? "warning" : "danger"}
          isSubmitting={crud.isDeleting}
        />
      )}
    </div>
  );
}
