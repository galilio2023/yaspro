"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Plus, Edit3, Save, X, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { upsertCmsInfluencer } from "@/lib/cms-actions";
import type { Influencer } from "@/db/schema";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";

interface InfluencersManagerProps {
  initialInfluencers: Influencer[];
}

export function InfluencersManager({ initialInfluencers }: InfluencersManagerProps) {
  const [creators, setCreators] = useState<Influencer[]>(initialInfluencers);
  const [editingCreator, setEditingCreator] = useState<Partial<Influencer> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { feedback, showFeedback } = useFeedbackAlert(1200);

  const handleOpenNew = () => {
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

    const res = await upsertCmsInfluencer(
      editingCreator as Partial<Influencer> & { name: string; slug: string }
    );

    if (res.success) {
      showFeedback("Creator profile updated in Neon DB!");
      setCreators((prev) => {
        const idx = prev.findIndex((c) => c.slug === editingCreator.slug);
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
      showFeedback(res.error || "Failed to update creator.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="text-blue-400" /> Creators & Influencers Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage Arab talent, social metrics, and Mawthooq licensing details in Neon PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus size={16} /> Add New Creator
        </button>
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
              {creators.map((c) => (
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
                        onClick={() => setEditingCreator(c)}
                        className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                        title="Edit Creator"
                      >
                        <Edit3 size={14} />
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
