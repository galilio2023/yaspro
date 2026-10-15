"use client";

import React, { useState } from "react";
import type { Studio } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSwitch,
  AdminTagsInput,
} from "../shared/AdminFormFields";
import { AdminImageUploader } from "../AdminImageUploader";

export interface StudioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studio: Partial<Studio>) => Promise<boolean | void>;
  initialStudio: Partial<Studio> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export function StudioFormModal(props: StudioFormModalProps) {
  if (!props.isOpen) return null;

  return (
    <StudioFormContent
      key={props.initialStudio?.id || props.initialStudio?.slug || "new"}
      {...props}
    />
  );
}

function StudioFormContent({
  isOpen,
  onClose,
  onSave,
  initialStudio,
  isSubmitting = false,
  error,
}: StudioFormModalProps) {
  const [formData, setFormData] = useState<Partial<Studio>>(() => ({
    ...initialStudio,
    amenities: Array.isArray(initialStudio?.amenities)
      ? initialStudio.amenities
      : ["10Gbps Symmetrical Fiber", "Green Room", "Sound Isolated"],
    isActive: initialStudio?.isActive ?? true,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.hourlyRate) return;

    const slug =
      formData.slug ||
      formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    await onSave({
      ...formData,
      slug,
      capacity: formData.capacity || 20,
      imageUrl: formData.imageUrl || "/images/projects/dmx.jpg",
    });
  };

  const isEdit = Boolean(formData.id);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEdit ? "Edit Soundstage Specifications" : "Provision New Soundstage"}
      description="Configure soundstage pricing, maximum headcount, amenities, and availability for the booking wizard."
      submitLabel={isEdit ? "Update Soundstage" : "Create Soundstage"}
      maxWidth="lg"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Stage Name (English)"
          required
          placeholder="e.g. Studio C — Green Cyc Stage"
          value={formData.name || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <AdminInput
          label="Stage Name (Arabic - اسم الاستوديو)"
          placeholder="مثال: استوديو ج — استوديو الكروما الخضراء"
          dir="rtl"
          value={formData.arabicName || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicName: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Hourly Rate"
          type="number"
          step="0.01"
          required
          placeholder="800.00"
          suffixNode="AED/hr"
          value={formData.hourlyRate || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
        />
        <AdminInput
          label="Max Headcount (Capacity)"
          type="number"
          required
          placeholder="25"
          suffixNode="People"
          value={formData.capacity || 20}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, capacity: parseInt(e.target.value) || 10 }))
          }
        />
      </div>

      <div>
        <AdminImageUploader
          value={formData.imageUrl}
          onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          label="Studio Soundstage Cover Photo (Cloudinary / CDN)"
          helperText="Upload stage photo (PNG, JPG, WEBP up to 25MB)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminTextarea
          label="Description (English)"
          rows={3}
          placeholder="Describe lighting grid, dimensions, and acoustic isolation..."
          value={formData.description || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
        <AdminTextarea
          label="Description (Arabic - الوصف بالعربي)"
          dir="rtl"
          rows={3}
          placeholder="وصف شبكة الإضاءة، الأبعاد، والعزل الصوتي..."
          value={formData.arabicDescription || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicDescription: e.target.value }))}
        />
      </div>

      <AdminTagsInput
        label="Stage Amenities"
        placeholder="Add amenity (e.g. Green Room, 10Gbps Fiber)..."
        tags={(formData.amenities as string[]) || []}
        onChange={(newTags) => setFormData((prev) => ({ ...prev, amenities: newTags }))}
      />

      <AdminSwitch
        label="Instant Booking Status"
        description="When enabled, this stage appears as active and bookable in the public wizard."
        checked={formData.isActive ?? true}
        onChange={(active) => setFormData((prev) => ({ ...prev, isActive: active }))}
      />
    </AdminModal>
  );
}
