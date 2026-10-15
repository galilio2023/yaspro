"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSwitch } from "../shared/AdminFormFields";

export interface PodcastSetFormData {
  id: string;
  name: string;
  seats: number;
  location: string;
  image: string;
  gradient: string;
  description: string;
  isAvailable: boolean;
}

export interface PodcastSetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (set: PodcastSetFormData) => Promise<boolean | void>;
  initialSet: Partial<PodcastSetFormData> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PodcastSetFormModal(props: PodcastSetFormModalProps) {
  if (!props.isOpen) return null;
  return <PodcastSetFormContent key={props.initialSet?.id || "new"} {...props} />;
}

function PodcastSetFormContent({
  isOpen,
  onClose,
  onSave,
  initialSet,
  isSubmitting = false,
  error,
}: PodcastSetFormModalProps) {
  const [form, setForm] = useState<PodcastSetFormData>(() => ({
    id: initialSet?.id || "",
    name: initialSet?.name || "",
    seats: initialSet?.seats ?? 2,
    location: initialSet?.location || "Iris Bay - Business Bay, Dubai",
    image: initialSet?.image || "/images/studios/nature-grid.jpg",
    gradient: initialSet?.gradient || "linear-gradient(135deg,#3a2a1a 0%,#5a4a3a 100%)",
    description: initialSet?.description || "",
    isAvailable: initialSet?.isAvailable ?? true,
  }));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(initialSet?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!form.id.trim()) errors.id = "Unique set key is required";
    if (!form.name.trim()) errors.name = "Set name is required";
    const seatsNum = Number(form.seats);
    if (isNaN(seatsNum) || seatsNum < 1) errors.seats = "Must be at least 1 seat";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await onSave({
      ...form,
      id: form.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      name: form.name.trim(),
      seats: seatsNum,
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Set: ${initialSet?.name}` : "Create New Podcast Set"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Unique Set Key / Slug"
            value={form.id}
            onChange={(e) => {
              setForm({ ...form, id: e.target.value });
              setFieldErrors((prev) => ({ ...prev, id: "" }));
            }}
            placeholder="e.g. nature-grid"
            disabled={isEdit}
            required
            error={fieldErrors.id}
            helper="Permanent slug used in booking URL and checkout."
          />

          <AdminInput
            label="Set Name"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="e.g. Nature Grid"
            required
            error={fieldErrors.name}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Headcount / Guest Seats"
            type="number"
            value={form.seats}
            onChange={(e) => {
              setForm({ ...form, seats: parseInt(e.target.value, 10) || 1 });
              setFieldErrors((prev) => ({ ...prev, seats: "" }));
            }}
            required
            error={fieldErrors.seats}
            helper="Number of mic stations and cinema camera angles."
          />

          <AdminInput
            label="Studio Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Iris Bay - Business Bay, Dubai"
          />
        </div>

        <AdminInput
          label="Preview Image Path or URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          placeholder="/images/studios/nature-grid.jpg"
          helper="High-res cover thumbnail for studio picker."
        />

        <AdminInput
          label="CSS Ambient Gradient"
          value={form.gradient}
          onChange={(e) => setForm({ ...form, gradient: e.target.value })}
          placeholder="linear-gradient(135deg,#3a2a1a 0%,#5a4a3a 100%)"
          helper="Backdrop lighting accent behind studio card."
        />

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Description & Acoustic Architecture
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Describe acoustic battens, lighting setup, or ideal format..."
            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-brand-mauve focus:outline-none focus:ring-1 focus:ring-brand-mauve"
          />
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Live Booking Status</div>
            <div className="text-xs text-text-muted">
              Enable to allow clients to select this set in the live booking wizard.
            </div>
          </div>
          <AdminSwitch
            label=""
            checked={form.isAvailable}
            onChange={(checked) => setForm({ ...form, isAvailable: checked })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Set" : "Create Set"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
