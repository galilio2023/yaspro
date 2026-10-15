"use client";

import React, { useState } from "react";
import type { Studio } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Stage name is required";
    }
    if (!formData.hourlyRate || Number(formData.hourlyRate) <= 0) {
      newErrors.hourlyRate = "Valid hourly rate is required";
    }
    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "Headcount capacity must be at least 1";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});

    const slug =
      formData.slug ||
      formData.name!
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
      isSubmitting={isSubmitting || isUploadingMedia}
      title={isEdit ? "Edit Soundstage Specifications" : "Provision New Soundstage"}
      description="Configure soundstage pricing, maximum headcount, amenities, and availability for the booking wizard."
      submitLabel={isUploadingMedia ? "Uploading Media..." : isEdit ? "Update Soundstage" : "Create Soundstage"}
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
          error={fieldErrors.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
          }}
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
          error={fieldErrors.hourlyRate}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }));
            if (fieldErrors.hourlyRate) setFieldErrors((prev) => ({ ...prev, hourlyRate: "" }));
          }}
        />
        <AdminInput
          label="Max Headcount (Capacity)"
          type="number"
          required
          placeholder="25"
          suffixNode="People"
          value={formData.capacity ?? ""}
          error={fieldErrors.capacity}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              capacity: e.target.value === "" ? undefined : parseInt(e.target.value, 10),
            }));
            if (fieldErrors.capacity) setFieldErrors((prev) => ({ ...prev, capacity: "" }));
          }}
        />
      </div>

      <div>
        <AdminImageUploader
          value={formData.imageUrl}
          onUploadingChange={setIsUploadingMedia}
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

      <fieldset className="space-y-3.5 rounded-2xl border border-white/10 p-4">
        <legend className="px-2 text-xs font-semibold text-brand-lavender tracking-wide">
          Technical Specs &amp; Day Rates
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <AdminInput
            label="Half-Day Rate"
            type="number"
            step="0.01"
            suffixNode="AED"
            value={formData.halfDayRate ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, halfDayRate: e.target.value }))}
          />
          <AdminInput
            label="Full-Day Rate"
            type="number"
            step="0.01"
            suffixNode="AED"
            value={formData.fullDayRate ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullDayRate: e.target.value }))}
          />
          <AdminInput
            label="Area"
            type="number"
            min={1}
            suffixNode="m²"
            value={formData.areaSqm ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, areaSqm: e.target.value === "" ? null : parseInt(e.target.value, 10) }))
            }
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AdminInput
            label="Dimensions"
            placeholder="18m x 15m x 5.5m"
            value={formData.dimensions ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
          />
          <AdminInput
            label="Ceiling Height"
            placeholder="5.5m Clear Height"
            value={formData.ceilingHeight ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, ceilingHeight: e.target.value }))}
          />
          <AdminInput
            label="Power"
            placeholder="3-Phase 125A Clean Cam-Lok"
            value={formData.power ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, power: e.target.value }))}
          />
          <AdminInput
            label="Sound Isolation"
            placeholder="STC 65 Floating Box-in-Box"
            value={formData.soundIsolation ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, soundIsolation: e.target.value }))}
          />
          <AdminSelect
            label="Category"
            value={formData.category ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            options={[
              { value: "", label: "Uncategorized" },
              { value: "virtual-production", label: "Virtual Production (XR)" },
              { value: "podcast-broadcast", label: "Podcast & Broadcast" },
              { value: "music-recording", label: "Music & Live Bands" },
              { value: "photo-cyclorama", label: "Photo & Cyclorama" },
              { value: "voiceover", label: "Voiceover & Dubbing" },
            ]}
          />
          <AdminInput
            label="Badge"
            placeholder="270° Micro-LED Volume"
            value={formData.badge ?? ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
          />
        </div>
        <AdminTagsInput
          label="Gallery Image URLs"
          placeholder="Paste an image URL (e.g. /images/studios/xr-2.jpg) and press Enter..."
          tags={(formData.gallery as string[]) || []}
          onChange={(urls) => setFormData((prev) => ({ ...prev, gallery: urls }))}
        />
      </fieldset>

      <AdminTagsInput
        label="Soundstage Specifications & Amenities"
        placeholder="Add spec or amenity (e.g. STC 65 Sound Isolation, 3-Phase 125A Power, 5.5m Clear Height, VIP Green Room)..."
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
