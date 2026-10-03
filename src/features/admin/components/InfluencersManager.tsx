"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Plus, Edit3, Trash2, Save, X, CheckCircle, ExternalLink, ShieldCheck, Search, Globe } from "lucide-react";
import { upsertCmsInfluencer, deleteCmsInfluencer } from "@/lib/actions/influencers";
import type { Influencer } from "@/db/schema";
import { AdminImageUploader } from "@/components/admin/AdminImageUploader";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { DataTableEmpty } from "@/components/ui/data-table";

interface InfluencersManagerProps {
  initialInfluencers: Influencer[];
}

export function InfluencersManager({ initialInfluencers }: InfluencersManagerProps) {
  const [creators, setCreators] = useState<Influencer[]>(initialInfluencers);
  const [editingCreator, setEditingCreator] = useState<Partial<Influencer> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatorToDelete, setCreatorToDelete] = useState<Influencer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(2500);

  const handleConfirmDelete = async () => {
    if (!creatorToDelete) return;
    setIsDeleting(true);
    try {
      const targetId = creatorToDelete.id || creatorToDelete.slug;
      const res = await deleteCmsInfluencer(targetId);
      if (res.success) {
        setCreators((prev) => prev.filter((c) => c.id !== creatorToDelete.id && c.slug !== creatorToDelete.slug));
        showFeedback(`Removed creator "${creatorToDelete.name}" from directory.`);
        setCreatorToDelete(null);
      } else {
        setError(res.error || "Failed to delete creator.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete creator.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCreators = creators.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.slug && c.slug.toLowerCase().includes(q)) ||
      (c.role && c.role.toLowerCase().includes(q)) ||
      (c.instagramHandle && c.instagramHandle.toLowerCase().includes(q)) ||
      (c.youtubeHandle && c.youtubeHandle.toLowerCase().includes(q));
    const matchesCountry = selectedCountry === "all" || c.nationality === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const pagination = usePagination(filteredCreators, 15);

  const handleOpenNew = () => {
    setError(null);
    clearFeedback();
    setEditingCreator({
      name: "",
      slug: "",
      role: "Creator & Influencer",
      nationality: "UAE",
      flag: "🇦🇪",
      totalFollowers: "10M",
      rawFollowers: 10,
      instagramHandle: "",
      youtubeHandle: "",
      tiktokHandle: "",
      bio: "",
      imageUrl: "/images/influencers/aboflah.jpg",
      isFeatured: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreator?.name || !editingCreator?.slug) return;

    setIsSubmitting(true);
    setError(null);
    clearFeedback();

    try {
      const res = await upsertCmsInfluencer(
        editingCreator as Partial<Influencer> & { name: string; slug: string }
      );

      if (res.success) {
        showFeedback("Creator profile updated in Neon DB!");
        setCreators((prev) => {
          const idx = prev.findIndex((c) =>
            editingCreator.id ? c.id === editingCreator.id : c.slug === editingCreator.slug
          );
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...editingCreator } as Influencer;
            return updated;
          }
          return [
            {
              ...editingCreator,
              id: editingCreator.id || `creator-${Date.now()}`,
              createdAt: new Date(),
            } as Influencer,
            ...prev,
          ];
        });
        setTimeout(() => {
          setEditingCreator(null);
        }, 1200);
      } else {
        setError(res.error || "Failed to update creator.");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update creator.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 font-display">
            <Users className="text-blue-400" /> Creators &amp; Influencers Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage Arab talent, social metrics, and Mawthooq licensing details in Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add New Creator
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Roster</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{creators.length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Featured Talent</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{creators.filter(c => c.isFeatured).length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-blue-400 font-mono uppercase block">UAE &amp; GCC</span>
          <span className="text-xl font-bold text-blue-300 font-mono mt-1 block">{creators.filter(c => c.nationality === "UAE" || c.nationality === "KSA").length}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-amber-400 font-mono uppercase block">Combined Audience</span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">120M+ MENA</span>
        </div>
      </div>

      {/* Search and Country Filter Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search creator by name, handle, role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.resetPage();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Country Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Regions", count: creators.length },
            { id: "UAE", label: "🇦🇪 UAE", count: creators.filter(c => c.nationality === "UAE").length },
            { id: "KSA", label: "🇸🇦 KSA", count: creators.filter(c => c.nationality === "KSA").length },
            { id: "Egypt", label: "🇪🇬 Egypt", count: creators.filter(c => c.nationality === "Egypt").length },
            { id: "MENA", label: "🌟 Regional MENA", count: creators.filter(c => !["UAE", "KSA", "Egypt"].includes(c.nationality || "")).length },
          ].map((cat) => {
            const isActive = selectedCountry === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCountry(cat.id);
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
                  isActive ? "bg-blue-500 text-white font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Drawer Modal */}
      {editingCreator && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingCreator.id ? "Edit Creator Profile" : "Register New Creator"}
              </h3>
              <button
                onClick={() => setEditingCreator(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && <FeedbackAlert type="error" message={error} className="mt-4" />}

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs text-blue-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingCreator.name || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    required
                    value={editingCreator.slug || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editingCreator.nationality || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, nationality: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    value={editingCreator.flag || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, flag: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Creator Role (English)</label>
                  <input
                    type="text"
                    placeholder="e.g. Cinema Director & Producer"
                    value={editingCreator.role || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, role: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role (Arabic - المسمى / الدور)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: مخرج سينمائي ومؤثر رقمي"
                    value={editingCreator.arabicRole || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, arabicRole: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Followers</label>
                  <input
                    type="text"
                    placeholder="e.g. 70M"
                    value={editingCreator.totalFollowers || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, totalFollowers: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Followers (Number for Sorting)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={editingCreator.rawFollowers || 10}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, rawFollowers: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Instagram</label>
                  <input
                    type="text"
                    value={editingCreator.instagramHandle || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, instagramHandle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">YouTube</label>
                  <input
                    type="text"
                    value={editingCreator.youtubeHandle || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, youtubeHandle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">TikTok</label>
                  <input
                    type="text"
                    value={editingCreator.tiktokHandle || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, tiktokHandle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <AdminImageUploader
                  value={editingCreator.imageUrl}
                  onChange={(url) => setEditingCreator({ ...editingCreator, imageUrl: url })}
                  label="Creator Avatar / Portrait (Cloudinary / CDN)"
                  helperText="Drag & drop creator portrait (PNG, JPG, WEBP up to 25MB)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bio / Profile (English)</label>
                  <textarea
                    rows={3}
                    value={editingCreator.bio || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, bio: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bio (Arabic - النبذة التعريفية)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    placeholder="نبذة تعريفية مختصرة عن المؤثر وخبراته ومجالات التعاون..."
                    value={editingCreator.arabicBio || ""}
                    onChange={(e) =>
                      setEditingCreator({ ...editingCreator, arabicBio: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 font-arabic"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCreator(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> Save Creator to Neon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creators Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Followers</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCreators.length === 0 ? (
                <DataTableEmpty
                  colSpan={5}
                  message="No creators found matching your search query or region filter."
                />
              ) : (
                pagination.paginatedItems.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-full overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                          {c.imageUrl && (
                            <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">{c.name}</span>
                            <ShieldCheck size={13} className="text-emerald-400" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /{c.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300">
                        {c.flag} {c.nationality || "MENA"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {c.totalFollowers || "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div className="flex items-center gap-2 text-[11px]">
                        {c.instagramHandle && <span>IG: @{c.instagramHandle}</span>}
                        {c.youtubeHandle && <span>YT: @{c.youtubeHandle}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/influencers/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                          title="View Public Profile"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => {
                            setError(null);
                            clearFeedback();
                            setEditingCreator(c);
                          }}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                          title="Edit Creator"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setError(null);
                            setCreatorToDelete(c);
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Delete Creator"
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

      {creatorToDelete && (
        <AdminConfirmModal
          isOpen={Boolean(creatorToDelete)}
          onClose={() => setCreatorToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Creator Profile"
          message={`Are you sure you want to remove "${creatorToDelete.name}" from the talent directory? This action cannot be undone.`}
          confirmLabel="Delete Creator"
          variant="danger"
          isSubmitting={isDeleting}
        />
      )}
    </div>
  );
}
