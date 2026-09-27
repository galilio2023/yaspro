"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Plus, Edit3, Save, X, CheckCircle, Tag } from "lucide-react";
import { upsertCmsEquipment } from "@/lib/cms-actions";
import type { Equipment } from "@/db/schema";

interface GearManagerProps {
  initialEquipment: Equipment[];
}

export function GearManager({ initialEquipment }: GearManagerProps) {
  const [gearList, setGearList] = useState<Equipment[]>(initialEquipment);
  const [editingGear, setEditingGear] = useState<Partial<Equipment> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingGear({
      name: "",
      category: "cameras",
      dailyRate: "1500.00",
      securityDeposit: "2000.00",
      description: "",
      imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
      isPopular: false,
      isKit: false,
      isAvailable: true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGear?.name || !editingGear?.dailyRate || !editingGear?.category) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await upsertCmsEquipment(
      editingGear as Partial<Equipment> & { name: string; dailyRate: string; category: string }
    );

    if (res.success) {
      setFeedback("Equipment updated in Neon DB catalog!");
      setGearList((prev) => {
        const idx = prev.findIndex((g) => g.id === editingGear.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...editingGear } as Equipment;
          return updated;
        }
        return [
          {
            ...editingGear,
            id: editingGear.id || `gear-${Date.now()}`,
            createdAt: new Date(),
          } as Equipment,
          ...prev,
        ];
      });
      setTimeout(() => {
        setEditingGear(null);
        setFeedback(null);
      }, 1200);
    } else {
      setFeedback(res.error || "Failed to update equipment.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Camera className="text-emerald-400" /> Gear & Equipment Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage cameras, lenses, lighting kits, and daily AED rental rates in Neon DB.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Edit Drawer */}
      {editingGear && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingGear.id ? "Edit Equipment Item" : "Add Equipment Item"}
              </h3>
              <button
                onClick={() => setEditingGear(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {feedback && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle size={14} /> {feedback}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Equipment Name</label>
                  <input
                    type="text"
                    required
                    value={editingGear.name || ""}
                    onChange={(e) =>
                      setEditingGear({
                        ...editingGear,
                        name: e.target.value,
                        slug: editingGear.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Slug (Unique Key)</label>
                  <input
                    type="text"
                    required
                    value={editingGear.slug || ""}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={editingGear.category || "cameras"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cameras">Cinema Cameras</option>
                    <option value="lenses">Cinema Lenses</option>
                    <option value="lighting">Studio Lighting</option>
                    <option value="audio">Wireless Audio</option>
                    <option value="bundles">Turnkey Bundles</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Daily Rate (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingGear.dailyRate || "0.00"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, dailyRate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Security Deposit (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingGear.securityDeposit || "0.00"}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, securityDeposit: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingGear.imageUrl || ""}
                  onChange={(e) =>
                    setEditingGear({ ...editingGear, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingGear.description || ""}
                  onChange={(e) =>
                    setEditingGear({ ...editingGear, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={14} /> Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Equipment Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Daily Rate</th>
                <th className="py-3 px-4">Deposit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {gearList.map((g) => (
                <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800">
                        {g.imageUrl && (
                          <Image src={g.imageUrl} alt={g.name} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{g.name}</span>
                        {g.isPopular && (
                          <span className="text-[10px] text-amber-300 flex items-center gap-1">
                            <Tag size={10} /> Popular Choice
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-emerald-300 font-medium">
                      {g.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    AED {Number(g.dailyRate).toLocaleString()} / day
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    AED {Number(g.securityDeposit || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditingGear(g)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300"
                      title="Edit Equipment"
                    >
                      <Edit3 size={14} />
                    </button>
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
