"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSwitch } from "../shared/AdminFormFields";

export interface PodcastAddonFormData {
  id: string;
  title: string;
  desc: string;
  priceNum: number;
  priceDisplay: string;
  unit: string;
  gradient: string;
  vimeoEmbed: string;
  isActive: boolean;
}

export interface PodcastAddonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addon: PodcastAddonFormData) => Promise<boolean | void>;
  initialAddon: Partial<PodcastAddonFormData> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export function PodcastAddonFormModal(props: PodcastAddonFormModalProps) {
  if (!props.isOpen) return null;
  return <PodcastAddonFormContent key={props.initialAddon?.id || "new"} {...props} />;
}

function PodcastAddonFormContent({
  isOpen,
  onClose,
  onSave,
  initialAddon,
  isSubmitting = false,
  error,
}: PodcastAddonFormModalProps) {
  const [form, setForm] = useState<PodcastAddonFormData>(() => ({
    id: initialAddon?.id || "",
    title: initialAddon?.title || "",
    desc: initialAddon?.desc || "",
    priceNum: initialAddon?.priceNum ?? 149,
    priceDisplay: initialAddon?.priceDisplay || "",
    unit: initialAddon?.unit || "per asset",
    gradient: initialAddon?.gradient || "linear-gradient(135deg,#2a1a3a 0%,#4a3a5a 100%)",
    vimeoEmbed: initialAddon?.vimeoEmbed || "",
    isActive: initialAddon?.isActive ?? true,
  }));

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(initialAddon?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!form.id.trim()) errors.id = "Unique add-on key is required";
    if (!form.title.trim()) errors.title = "Add-on title is required";
    const price = Number(form.priceNum);
    if (isNaN(price) || price < 0) errors.priceNum = "Price must be 0 or higher";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const calculatedDisplay = form.priceDisplay.trim() || `AED ${price.toLocaleString("en-US")}`;

    await onSave({
      ...form,
      id: form.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
      title: form.title.trim(),
      priceNum: price,
      priceDisplay: calculatedDisplay,
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Add-on: ${initialAddon?.title}` : "Create New Post-Production Add-on"}
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
            label="Add-on Key / Slug"
            value={form.id}
            onChange={(e) => {
              setForm({ ...form, id: e.target.value });
              setFieldErrors((prev) => ({ ...prev, id: "" }));
            }}
            placeholder="e.g. 4k-trailer"
            disabled={isEdit}
            required
            error={fieldErrors.id}
            helper="Permanent internal identifier in booking state."
          />

          <AdminInput
            label="Service Title"
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
              setFieldErrors((prev) => ({ ...prev, title: "" }));
            }}
            placeholder="e.g. Cinematic Podcast Trailer"
            required
            error={fieldErrors.title}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminInput
            label="Price (AED)"
            type="number"
            value={form.priceNum}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 0;
              setForm({
                ...form,
                priceNum: val,
                priceDisplay: `AED ${val.toLocaleString("en-US")}`,
              });
              setFieldErrors((prev) => ({ ...prev, priceNum: "" }));
            }}
            required
            error={fieldErrors.priceNum}
          />

          <AdminInput
            label="Price Display Label"
            value={form.priceDisplay}
            onChange={(e) => setForm({ ...form, priceDisplay: e.target.value })}
            placeholder="e.g. AED 1,999"
          />

          <AdminInput
            label="Billing Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="e.g. per reel / per episode / package"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Scope & Deliverable Description
          </label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            rows={3}
            placeholder="Describe what is delivered (e.g. 3 revisions, 4K render, sound design)..."
            className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-brand-mauve focus:outline-none focus:ring-1 focus:ring-brand-mauve"
          />
        </div>

        <AdminInput
          label="Vimeo Video Embed URL (Optional Video Showcase)"
          value={form.vimeoEmbed}
          onChange={(e) => setForm({ ...form, vimeoEmbed: e.target.value })}
          placeholder="https://player.vimeo.com/video/..."
          helper="Looped sample reel preview displayed on the service card."
        />

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Active in Wizard</div>
            <div className="text-xs text-text-muted">
              Turn off to temporarily hide this add-on from the live client cart.
            </div>
          </div>
          <AdminSwitch
            label=""
            checked={form.isActive}
            onChange={(checked) => setForm({ ...form, isActive: checked })}
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
            {isSubmitting ? "Saving..." : isEdit ? "Update Add-on" : "Create Add-on"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
