"use client";

import React, { useState } from "react";
import type { Equipment } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminSwitch,
  AdminTagsInput,
} from "../shared/AdminFormFields";
import { AdminImageUploader } from "../AdminImageUploader";

export interface GearFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gear: Partial<Equipment>) => Promise<boolean | void>;
  initialGear: Partial<Equipment> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

const CATEGORY_OPTIONS = [
  { value: "cameras", label: "Cinema Cameras" },
  { value: "lenses", label: "Cinema Lenses" },
  { value: "lighting", label: "Studio Lighting" },
  { value: "accessories", label: "Camera Accessories & Rigging" },
  { value: "audio", label: "Wireless Audio & Microphones" },
  { value: "bundles", label: "Turnkey Production Bundles" },
  { value: "grip", label: "Grip & Support" },
  { value: "drones", label: "Drones & Aerial Gimbal" },
];

export function GearFormModal(props: GearFormModalProps) {
  if (!props.isOpen) return null;

  return (
    <GearFormContent
      key={props.initialGear?.id || props.initialGear?.slug || "new"}
      {...props}
    />
  );
}

function GearFormContent({
  isOpen,
  onClose,
  onSave,
  initialGear,
  isSubmitting = false,
  error,
}: GearFormModalProps) {
  const [formData, setFormData] = useState<Partial<Equipment>>(() => ({
    ...initialGear,
    category: initialGear?.category || "cameras",
    dailyRate: initialGear?.dailyRate || "1500.00",
    securityDeposit: initialGear?.securityDeposit || "2000.00",
    imageUrl: initialGear?.imageUrl || "/images/gear/arri-alexa-mini-lf.jpg",
    isAvailable: initialGear?.isAvailable ?? true,
    isPopular: initialGear?.isPopular ?? false,
    isKit: initialGear?.isKit ?? false,
    totalQuantity: initialGear?.totalQuantity ?? 1,
    includedInKit: Array.isArray(initialGear?.includedInKit) ? initialGear.includedInKit : [],
    specs: Array.isArray(initialGear?.specs) ? initialGear.specs : [],
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Equipment name is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.dailyRate || Number(formData.dailyRate) <= 0) {
      newErrors.dailyRate = "Valid daily rental rate is required";
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
      imageUrl: formData.imageUrl || "/images/gear/arri-alexa-mini-lf.jpg",
    });
  };

  const isEdit = Boolean(formData.id);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting || isUploadingMedia}
      title={isEdit ? "Edit Fleet Equipment" : "Add Equipment Item"}
      description="Configure rental pricing, category specs, deposit requirement, and rental availability."
      submitLabel={isUploadingMedia ? "Uploading Media..." : isEdit ? "Update Equipment" : "Add to Fleet"}
      maxWidth="lg"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Equipment Name (English)"
          required
          placeholder="e.g. ARRI Alexa 35 Cinema Package"
          value={formData.name || ""}
          error={fieldErrors.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        <AdminInput
          label="Equipment Name (Arabic - اسم المعدات)"
          placeholder="مثال: باقة سينمائية أري أليكسا 35"
          dir="rtl"
          value={formData.arabicName || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicName: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminSelect
          label="Category"
          required
          options={CATEGORY_OPTIONS}
          value={formData.category || "cameras"}
          error={fieldErrors.category}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, category: e.target.value }));
            if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: "" }));
          }}
        />
        <AdminInput
          label="Slug (Unique Identifier)"
          placeholder="arri-alexa-35"
          value={formData.slug || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminInput
          label="Daily Rental Rate"
          type="number"
          step="0.01"
          required
          suffixNode="AED/day"
          value={formData.dailyRate || ""}
          error={fieldErrors.dailyRate}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, dailyRate: e.target.value }));
            if (fieldErrors.dailyRate) setFieldErrors((prev) => ({ ...prev, dailyRate: "" }));
          }}
        />
        <AdminInput
          label="Security Deposit"
          type="number"
          step="0.01"
          suffixNode="AED"
          value={formData.securityDeposit || "0.00"}
          onChange={(e) => setFormData((prev) => ({ ...prev, securityDeposit: e.target.value }))}
        />
        <AdminInput
          label="Total Fleet Units"
          type="number"
          min={1}
          step={1}
          suffixNode="Units"
          value={String(formData.totalQuantity ?? 1)}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              totalQuantity: Math.max(1, Number(e.target.value) || 1),
            }))
          }
        />
      </div>

      <div>
        <AdminImageUploader
          value={formData.imageUrl}
          onUploadingChange={setIsUploadingMedia}
          onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          label="Equipment Media Photo (Cloudinary / CDN)"
          helperText="Upload equipment asset photo (PNG, JPG, WEBP up to 25MB)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminTextarea
          label="Description (English)"
          rows={3}
          placeholder="Key features, sensor specs, mounts, power..."
          value={formData.description || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />
        <AdminTextarea
          label="Description (Arabic - الوصف بالعربي)"
          dir="rtl"
          rows={3}
          placeholder="وصف تفصيلي للمعدة والمواصفات الفنية..."
          value={formData.arabicDescription || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicDescription: e.target.value }))}
        />
      </div>

      <AdminTagsInput
        label="Technical Specs & Features"
        placeholder="Add spec (e.g. 4.6K Super 35, 120fps, PL Mount)..."
        tags={(formData.specs as string[]) || []}
        onChange={(specs) => setFormData((prev) => ({ ...prev, specs }))}
      />

      {formData.isKit && (
        <AdminTagsInput
          label="Included Kit Items (Slugs or Asset Names)"
          placeholder="Add kit component (e.g. arri-signature-primes, v-mount-battery-kit)..."
          tags={(formData.includedInKit as string[]) || []}
          onChange={(includedInKit) => setFormData((prev) => ({ ...prev, includedInKit }))}
        />
      )}

      <div className="space-y-2 pt-1">
        <AdminSwitch
          label="Inventory Available"
          description="Item is present in fleet and eligible for reservation."
          checked={formData.isAvailable ?? true}
          onChange={(val) => setFormData((prev) => ({ ...prev, isAvailable: val }))}
        />
        <AdminSwitch
          label="Featured / Popular Choice"
          description="Highlight this item with a badge in catalog views."
          checked={formData.isPopular ?? false}
          onChange={(val) => setFormData((prev) => ({ ...prev, isPopular: val }))}
        />
        <AdminSwitch
          label="Turnkey Production Kit"
          description="This item is packaged as a ready-to-shoot bundle."
          checked={formData.isKit ?? false}
          onChange={(val) => setFormData((prev) => ({ ...prev, isKit: val }))}
        />
      </div>
    </AdminModal>
  );
}
