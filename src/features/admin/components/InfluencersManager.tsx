"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AtSign,
  Video,
  Globe,
} from "lucide-react";
import { upsertCmsInfluencer, deleteCmsInfluencer } from "@/lib/actions/influencers";
import type { Influencer } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
  InfluencerFormModal,
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

interface InfluencersManagerProps {
  initialInfluencers: Influencer[];
}

export function InfluencersManager({ initialInfluencers }: InfluencersManagerProps) {
  const crud = useAdminCrud<Influencer>({
    initialData: initialInfluencers,
    upsertAction: upsertCmsInfluencer,
    deleteAction: deleteCmsInfluencer,
    getItemId: (c) => c.id,
    getItemSlug: (c) => c.slug,
    getItemName: (c) => c.name,
    defaultNewItem: {
      name: "",
      slug: "",
      role: "Creator & Influencer",
      nationality: "UAE",
      flag: "🇦🇪",
      totalFollowers: "10M",
      rawFollowers: 10,
      imageUrl: "/images/influencers/creator-1.jpg",
      isFeatured: true,
    },
  });

  const filter = useAdminFilter<Influencer, string>({
    data: crud.items,
    initialFilter: "all",
    pageSize: 15,
    predicate: (c, q, country) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.instagramHandle && c.instagramHandle.toLowerCase().includes(q)) ||
        (c.youtubeHandle && c.youtubeHandle.toLowerCase().includes(q));

      const matchesCountry =
        country === "all"
          ? true
          : country === "MENA"
          ? !["UAE", "KSA", "Egypt"].includes(c.nationality || "")
          : c.nationality === country;

      return Boolean(matchesSearch && matchesCountry);
    },
  });

  const uaeCount = crud.items.filter((c) => c.nationality === "UAE").length;
  const ksaCount = crud.items.filter((c) => c.nationality === "KSA").length;
  const egyptCount = crud.items.filter((c) => c.nationality === "Egypt").length;
  const featuredCount = crud.items.filter((c) => c.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Creator Roster & Influencer CMS"
        description="Manage Mawthooq certified Arab content creators, talent media kits, and production collaborations."
        icon={Users}
        feedback={crud.feedback}
        onDismissFeedback={crud.clearFeedback}
        actions={
          <button
            type="button"
            onClick={() => crud.handleOpenNew()}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Creator</span>
          </button>
        }
      />

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Total Roster",
            value: crud.items.length,
            unit: "Creators",
            icon: Users,
            variant: "default",
          },
          {
            label: "UAE National Roster",
            value: uaeCount,
            unit: "🇦🇪 Talent",
            icon: Globe,
            variant: "brand",
          },
          {
            label: "KSA & Gulf Roster",
            value: ksaCount,
            unit: "🇸🇦 Talent",
            icon: Globe,
            variant: "default",
          },
          {
            label: "Featured & Certified",
            value: featuredCount,
            unit: "Verified",
            icon: ShieldCheck,
            variant: "success",
          },
        ]}
      />

      {/* Filter & Search Bar */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search creators by name, handle, role or country..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Creators", count: crud.items.length },
          { id: "UAE", label: "UAE 🇦🇪", count: uaeCount },
          { id: "KSA", label: "KSA 🇸🇦", count: ksaCount },
          { id: "Egypt", label: "Egypt 🇪🇬", count: egyptCount },
          {
            id: "MENA",
            label: "Regional / Pan-Arab",
            count: crud.items.length - (uaeCount + ksaCount + egyptCount),
          },
        ]}
      />

      {/* Creators Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">Creator Profile</th>
            <th className="py-3 px-4">Region</th>
            <th className="py-3 px-4">Reach</th>
            <th className="py-3 px-4">Social Channels</th>
            <th className="py-3 px-4">Compliance</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {filter.filteredData.length === 0 ? (
            <DataTableEmpty
              colSpan={6}
              message="No creators found matching your search or territory filter."
            />
          ) : (
            filter.pagination.paginatedItems.map((c) => (
              <DataTableRow key={c.id}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                      {c.imageUrl && (
                        <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{c.name}</span>
                      <span className="text-[11px] text-brand-lavender font-mono block">
                        {c.role || "Creator"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                    <span>{c.flag || "🌍"}</span>
                    <span>{c.nationality || "MENA"}</span>
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-white font-mono">
                  {c.totalFollowers || "1M+"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    {c.instagramHandle && (
                      <span className="flex items-center gap-1 text-[11px] hover:text-white transition-colors">
                        <AtSign size={12} className="text-brand-mauve" />
                        <span className="font-mono">{c.instagramHandle}</span>
                      </span>
                    )}
                    {c.youtubeHandle && (
                      <span className="flex items-center gap-1 text-[11px] hover:text-white transition-colors">
                        <Video size={12} className="text-red-400" />
                        <span className="font-mono">{c.youtubeHandle}</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck size={13} /> Mawthooq
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/influencers/${c.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="Public Profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenEdit(c)}
                      className="p-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/35 text-brand-mauve transition-colors cursor-pointer"
                      title="Edit Creator"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenDelete(c)}
                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer"
                      title="Delete Creator"
                    >
                      <Trash2 size={14} />
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
      <InfluencerFormModal
        isOpen={Boolean(crud.editingItem)}
        onClose={crud.handleCloseEdit}
        onSave={crud.handleSave}
        initialCreator={crud.editingItem}
        isSubmitting={crud.isSubmitting}
        error={crud.formError}
      />

      {/* Delete Confirmation Modal */}
      {crud.itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(crud.itemToDelete)}
          onClose={crud.handleCloseDelete}
          onConfirm={crud.handleConfirmDelete}
          title="Delete Creator Profile"
          message={
            crud.deleteError ||
            `Are you sure you want to permanently remove "${crud.itemToDelete.name}" from the talent directory?`
          }
          confirmLabel={crud.deleteError ? "Understood" : "Delete Profile"}
          variant={crud.deleteError ? "warning" : "danger"}
          isSubmitting={crud.isDeleting}
        />
      )}
    </div>
  );
}
