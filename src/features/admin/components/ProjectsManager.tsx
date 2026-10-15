"use client";

import React from "react";
import Image from "next/image";
import {
  Film,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Award,
  Video,
} from "lucide-react";
import { upsertCmsProject, deleteCmsProject } from "@/lib/actions/projects";
import type { Project } from "@/db/schema";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminConfirmModal,
  ProjectFormModal,
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

interface ProjectsManagerProps {
  initialProjects: Project[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const crud = useAdminCrud<Project>({
    initialData: initialProjects,
    upsertAction: upsertCmsProject,
    deleteAction: deleteCmsProject,
    getItemId: (p) => p.id,
    getItemSlug: (p) => p.slug,
    getItemName: (p) => p.title,
    defaultNewItem: {
      title: "",
      slug: "",
      arabicTitle: "",
      client: "",
      category: "commercial",
      tag: "Campaign",
      views: "1M+ Views",
      year: new Date().getFullYear().toString(),
      description: "",
      coverImageUrl: "/images/projects/flag-day.jpg",
      videoUrl: "",
      isFeatured: true,
    },
  });

  const filter = useAdminFilter<Project, string>({
    data: crud.items,
    initialFilter: "all",
    pageSize: 15,
    predicate: (proj, q, category) => {
      const matchesSearch =
        !q ||
        proj.title.toLowerCase().includes(q) ||
        (proj.arabicTitle && proj.arabicTitle.toLowerCase().includes(q)) ||
        (proj.client && proj.client.toLowerCase().includes(q)) ||
        proj.slug.toLowerCase().includes(q);

      const matchesCategory = category === "all" || proj.category === category;
      return Boolean(matchesSearch && matchesCategory);
    },
  });

  const totalCommercial = crud.items.filter((p) => p.category === "commercial").length;
  const totalGovernment = crud.items.filter((p) => p.category === "government").length;
  const totalFeatured = crud.items.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Projects CMS Management"
        description="Manage commercial, national, and event films stored in Neon PostgreSQL."
        icon={Film}
        feedback={crud.feedback}
        onDismissFeedback={crud.clearFeedback}
        actions={
          <button
            type="button"
            onClick={() => crud.handleOpenNew()}
            className="px-4 py-2.5 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        }
      />

      {/* KPI Stats Grid */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Total Portfolio",
            value: crud.items.length,
            unit: "Films",
            icon: Film,
            variant: "default",
          },
          {
            label: "Commercials",
            value: totalCommercial,
            unit: "Campaigns",
            icon: Video,
            variant: "brand",
          },
          {
            label: "Government & National",
            value: totalGovernment,
            unit: "Projects",
            icon: Award,
            variant: "default",
          },
          {
            label: "Featured Reels",
            value: totalFeatured,
            unit: "Highlighted",
            icon: Sparkles,
            variant: "success",
          },
        ]}
      />

      {/* Filter & Search Bar */}
      <AdminFilterBar
        searchQuery={filter.searchQuery}
        onSearchChange={filter.setSearchQuery}
        searchPlaceholder="Search films by title, client, or slug..."
        filterValue={filter.filterValue}
        onFilterChange={filter.setFilterValue}
        filterOptions={[
          { id: "all", label: "All Works", count: crud.items.length },
          { id: "commercial", label: "Commercial", count: totalCommercial },
          { id: "government", label: "National / Govt", count: totalGovernment },
          {
            id: "documentary",
            label: "Documentary",
            count: crud.items.filter((p) => p.category === "documentary").length,
          },
          {
            id: "event",
            label: "Live Event",
            count: crud.items.filter((p) => p.category === "event").length,
          },
        ]}
      />

      {/* Projects Table */}
      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">Project</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Client</th>
            <th className="py-3 px-4">Year</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {filter.filteredData.length === 0 ? (
            <DataTableEmpty
              colSpan={5}
              message="No projects found matching your category or search query."
            />
          ) : (
            filter.pagination.paginatedItems.map((proj) => (
              <DataTableRow key={proj.id}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                      {proj.coverImageUrl && (
                        <Image
                          src={proj.coverImageUrl}
                          alt={proj.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">{proj.title}</span>
                      {proj.arabicTitle && (
                        <span className="text-[11px] text-slate-400 font-arabic block">
                          {proj.arabicTitle}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        /{proj.slug}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-lavender font-mono text-[11px] capitalize">
                    {proj.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">{proj.client || "—"}</td>
                <td className="py-3 px-4 text-slate-400 font-mono">{proj.year || "—"}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/projects/${proj.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title="View Public Page"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/35 text-brand-mauve transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => crud.handleOpenDelete(proj)}
                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer"
                      title="Delete Project"
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
      <ProjectFormModal
        isOpen={Boolean(crud.editingItem)}
        onClose={crud.handleCloseEdit}
        onSave={crud.handleSave}
        initialProject={crud.editingItem}
        isSubmitting={crud.isSubmitting}
        error={crud.formError}
      />

      {/* Delete Confirmation Modal */}
      {crud.itemToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(crud.itemToDelete)}
          onClose={crud.handleCloseDelete}
          onConfirm={crud.handleConfirmDelete}
          title="Delete Film Project"
          message={
            crud.deleteError ||
            `Are you sure you want to permanently delete "${crud.itemToDelete.title}"? This cannot be undone.`
          }
          confirmLabel={crud.deleteError ? "Understood" : "Delete Project"}
          variant={crud.deleteError ? "warning" : "danger"}
          isSubmitting={crud.isDeleting}
        />
      )}
    </div>
  );
}
