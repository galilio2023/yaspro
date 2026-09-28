"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Film, Plus, Trash2, Edit3, CheckCircle, ExternalLink, Save, X } from "lucide-react";
import { upsertCmsProject, deleteCmsProject } from "@/lib/cms-actions";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import type { Project } from "@/db/schema";

interface ProjectsManagerProps {
  initialProjects: Project[];
}

export function ProjectsManager({ initialProjects }: ProjectsManagerProps) {
  const [projectList, setProjectList] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingProject({
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
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.slug) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await upsertCmsProject(
      editingProject as Partial<Project> & { title: string; slug: string }
    );

    if (res.success) {
      setFeedback("Project successfully updated!");
      // Update local state
      setProjectList((prev) => {
        const idx = prev.findIndex((p) => p.slug === editingProject.slug);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...editingProject } as Project;
          return updated;
        }
        return [
          {
            ...editingProject,
            id: editingProject.id || `proj-${Date.now()}`,
            createdAt: new Date(),
            publishedAt: new Date(),
          } as Project,
          ...prev,
        ];
      });
      setTimeout(() => {
        setEditingProject(null);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback(res.error || "Failed to update project.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Are you sure you want to delete project: ${slug}?`)) return;
    const res = await deleteCmsProject(id);
    if (res.success) {
      setProjectList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Film className="text-purple-400" /> Projects CMS Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage commercial, national, and event films stored in Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus size={16} /> Add New Project
        </button>
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

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title || ""}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <AdminImageUploader
                  label="Project Cover Artwork & Stills"
                  value={editingProject.coverImageUrl || ""}
                  onChange={(url) =>
                    setEditingProject({ ...editingProject, coverImageUrl: url })
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
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> Save to Neon DB
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
              {projectList.map((proj) => (
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
                        <span className="text-[11px] text-slate-400 font-mono">
                          /{proj.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300 font-medium">
                      {proj.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{proj.client || "—"}</td>
                  <td className="py-3 px-4 text-slate-400">{proj.year || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/projects/${proj.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                        title="View Public Page"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => setEditingProject(proj)}
                        className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300"
                        title="Edit Project"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id, proj.slug)}
                        className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
