"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Film, Plus, Trash2, Edit3, CheckCircle, ExternalLink, Save, X, Search, Sparkles } from "lucide-react";
import { upsertCmsProject, deleteCmsProject } from "@/lib/actions/projects";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import type { Project } from "@/db/schema";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { useCrud } from "@/hooks/useCrud";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTableEmpty } from "@/components/ui/data-table";

interface ProjectsManagerProps {
  initialProjects: Project[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const {
    dataList: projectList,
    editingItem: editingProject,
    setEditingItem: setEditingProject,
    isSubmitting,
    error,
    setError,
    feedback,
    clearFeedback,
    handleOpenNew,
    handleSave,
    handleDelete,
  } = useCrud<Project>({
    initialData: initialProjects,
    upsertAction: upsertCmsProject,
    deleteAction: deleteCmsProject,
    getId: (item) => item.id,
    getSlug: (item) => item.slug,
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
    onSuccessMessage: "Project successfully updated!",
  });

  const filteredProjects = projectList.filter((proj) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      proj.title.toLowerCase().includes(q) ||
      (proj.arabicTitle && proj.arabicTitle.toLowerCase().includes(q)) ||
      (proj.client && proj.client.toLowerCase().includes(q)) ||
      proj.slug.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "all" || proj.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pagination = usePagination(filteredProjects, 15);

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <Film className="text-amber-400" /> Projects CMS Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage commercial, national, and event films stored in Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add New Project
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Portfolio</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{projectList.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-amber-400 font-mono uppercase block">Commercial &amp; Brand</span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">{projectList.filter(p => p.category === "commercial").length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Sovereign &amp; Gov</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{projectList.filter(p => p.category === "government").length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-purple-400 font-mono uppercase block">Live Shows &amp; Events</span>
          <span className="text-xl font-bold text-purple-300 font-mono mt-1 block">{projectList.filter(p => p.category === "shows" || p.category === "event").length}</span>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search films by title, client, slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.resetPage();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Films", count: projectList.length },
            { id: "commercial", label: "Commercial", count: projectList.filter(p => p.category === "commercial").length },
            { id: "government", label: "Government", count: projectList.filter(p => p.category === "government").length },
            { id: "shows", label: "Live Shows", count: projectList.filter(p => p.category === "shows").length },
            { id: "documentary", label: "Documentary", count: projectList.filter(p => p.category === "documentary").length },
            { id: "event", label: "Events", count: projectList.filter(p => p.category === "event").length },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-amber-500 text-slate-950 font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit / Create Drawer Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingProject.id ? "Edit Portfolio Film" : "New Portfolio Film"}
              </h3>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && <FeedbackAlert type="error" message={error} className="mt-4" />}

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Title (English)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Title (Arabic - العنوان العربي)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="العنوان بالعربية"
                    value={editingProject.arabicTitle || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, arabicTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 font-arabic"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={editingProject.slug || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={editingProject.category || "commercial"}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as Project["category"],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="government">Government & National</option>
                    <option value="commercial">Commercial / Brand</option>
                    <option value="shows">Shows & Events</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Client</label>
                  <input
                    type="text"
                    value={editingProject.client || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, client: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Year</label>
                  <input
                    type="text"
                    value={editingProject.year || "2024"}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, year: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Video Stream URL or Vimeo ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1093240200 or https://vimeo.com/1093240200 or direct MP4 URL"
                  value={editingProject.videoUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, videoUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500 font-mono text-xs"
                />
              </div>

              <div>
                <AdminImageUploader
                  label="Project Cover Artwork & Stills"
                  value={editingProject.coverImageUrl || ""}
                  onUploadingChange={setIsUploadingCover}
                  onChange={(url) =>
                    setEditingProject((prev) => {
                      if (!prev) return null;
                      return { ...prev, coverImageUrl: url };
                    })
                  }
                  helperText="Upload official film key art or production stills (JPG, PNG, WEBP up to 10MB)"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingCover}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> {isUploadingCover ? "Uploading Asset..." : "Save to Neon DB"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.length === 0 ? (
                <DataTableEmpty colSpan={5} message="No projects found matching your category or search query." />
              ) : (
                pagination.paginatedItems.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800">
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
                            <span className="text-[11px] text-slate-400 font-arabic block">{proj.arabicTitle}</span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{proj.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300 font-medium capitalize">
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
                          onClick={() => {
                            setError(null);
                            clearFeedback();
                            setEditingProject(proj);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(proj.id, proj.slug)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={pagination.currentPage}
          pageCount={pagination.pageCount}
          total={pagination.total}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
        />
      </div>
    </div>
  );
}
