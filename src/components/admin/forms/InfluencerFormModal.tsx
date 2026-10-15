"use client";

import React, { useState } from "react";
import type { Influencer } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminSwitch,
  AdminTagsInput,
} from "../shared/AdminFormFields";
import { AdminImageUploader } from "../AdminImageUploader";

export interface InfluencerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creator: Partial<Influencer>) => Promise<boolean | void>;
  initialCreator: Partial<Influencer> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

const COUNTRY_OPTIONS = [
  { value: "UAE", label: "United Arab Emirates 🇦🇪" },
  { value: "KSA", label: "Saudi Arabia 🇸🇦" },
  { value: "Egypt", label: "Egypt 🇪🇬" },
  { value: "Kuwait", label: "Kuwait 🇰🇼" },
  { value: "Qatar", label: "Qatar 🇶🇦" },
  { value: "MENA", label: "Regional / Pan-Arab 🌍" },
];

const FLAG_MAP: Record<string, string> = {
  UAE: "🇦🇪",
  KSA: "🇸🇦",
  Egypt: "🇪🇬",
  Kuwait: "🇰🇼",
  Qatar: "🇶🇦",
  MENA: "🌍",
};

export function InfluencerFormModal(props: InfluencerFormModalProps) {
  if (!props.isOpen) return null;

  return (
    <InfluencerFormContent
      key={props.initialCreator?.id || props.initialCreator?.slug || "new"}
      {...props}
    />
  );
}

function InfluencerFormContent({
  isOpen,
  onClose,
  onSave,
  initialCreator,
  isSubmitting = false,
  error,
}: InfluencerFormModalProps) {
  const [formData, setFormData] = useState<Partial<Influencer>>(() => ({
    ...initialCreator,
    role: initialCreator?.role || "Creator & Influencer",
    nationality: initialCreator?.nationality || "UAE",
    flag: initialCreator?.flag || "🇦🇪",
    totalFollowers: initialCreator?.totalFollowers || "10M",
    rawFollowers: initialCreator?.rawFollowers || 10,
    imageUrl: initialCreator?.imageUrl || "/images/influencers/creator-1.jpg",
    isFeatured: initialCreator?.isFeatured ?? true,
    collaborations: Array.isArray(initialCreator?.collaborations) ? initialCreator.collaborations : [],
    signatureProductions: Array.isArray(initialCreator?.signatureProductions) ? initialCreator.signatureProductions : [],
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleNationalityChange = (nat: string) => {
    setFormData((prev) => ({
      ...prev,
      nationality: nat,
      flag: FLAG_MAP[nat] || prev.flag || "🇦🇪",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = "Creator full name is required";
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
      imageUrl: formData.imageUrl || "/images/influencers/creator-1.jpg",
    });
  };

  const isEdit = Boolean(formData.id);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting || isUploadingMedia}
      title={isEdit ? "Edit Creator Profile" : "Register Mawthooq Creator"}
      description="Configure influencer demographics, social handles, verified status, and audience metrics."
      submitLabel={isUploadingMedia ? "Uploading Media..." : isEdit ? "Update Profile" : "Add to Roster"}
      maxWidth="lg"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Creator Full Name (English)"
          required
          placeholder="e.g. Sultan Al-Qasimi"
          value={formData.name || ""}
          error={fieldErrors.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: e.target.value }));
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
          }}
        />
        <AdminInput
          label="Slug (Unique Identifier)"
          placeholder="sultan-al-qasimi"
          value={formData.slug || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminSelect
          label="Nationality"
          options={COUNTRY_OPTIONS}
          value={formData.nationality || "UAE"}
          onChange={(e) => handleNationalityChange(e.target.value)}
        />
        <AdminInput
          label="Country Flag"
          value={formData.flag || "🇦🇪"}
          onChange={(e) => setFormData((prev) => ({ ...prev, flag: e.target.value }))}
        />
        <AdminInput
          label="Total Audience"
          placeholder="e.g. 25M+"
          value={formData.totalFollowers || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, totalFollowers: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Role / Title (English)"
          placeholder="e.g. Cinema Director & Producer"
          value={formData.role || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
        />
        <AdminInput
          label="Role (Arabic - المسمى / الدور)"
          dir="rtl"
          placeholder="مثال: مخرج سينمائي ومؤثر رقمي"
          value={formData.arabicRole || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicRole: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminInput
          label="Instagram Handle"
          placeholder="@creator"
          value={formData.instagramHandle || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, instagramHandle: e.target.value }))}
        />
        <AdminInput
          label="YouTube Handle"
          placeholder="@creator"
          value={formData.youtubeHandle || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, youtubeHandle: e.target.value }))}
        />
        <AdminInput
          label="TikTok Handle"
          placeholder="@creator"
          value={formData.tiktokHandle || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, tiktokHandle: e.target.value }))}
        />
      </div>

      <div>
        <AdminImageUploader
          label="Creator Portrait (Cloudinary / CDN)"
          value={formData.imageUrl}
          onUploadingChange={setIsUploadingMedia}
          onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
          helperText="Upload creator press portrait (PNG, JPG, WEBP up to 15MB)"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminTextarea
          label="Biography / Media Kit (English)"
          rows={3}
          placeholder="Creator's focus, top campaigns, and collaboration genres..."
          value={formData.bio || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
        />
        <AdminTextarea
          label="Biography (Arabic - النبذة التعريفية)"
          dir="rtl"
          rows={3}
          placeholder="نبذة تعريفية مختصرة عن المؤثر وخبراته ومجالات التعاون..."
          value={formData.arabicBio || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicBio: e.target.value }))}
        />
      </div>

      <AdminTagsInput
        label="Notable Brand Collaborations"
        placeholder="Add brand collaboration (e.g. Emirates, Dubai Tourism, Red Bull, Apple)..."
        tags={(formData.collaborations as string[]) || []}
        onChange={(collaborations) => setFormData((prev) => ({ ...prev, collaborations }))}
      />

      <AdminTagsInput
        label="Signature Productions & Media Campaigns"
        placeholder="Add production title (e.g. Saudi National Day TVC, Expo 2020 Hero Film)..."
        tags={(formData.signatureProductions as string[]) || []}
        onChange={(signatureProductions) => setFormData((prev) => ({ ...prev, signatureProductions }))}
      />

      <AdminSwitch
        label="Featured Creator"
        description="Showcase on the agency talent roster and homepage featured reel."
        checked={formData.isFeatured ?? true}
        onChange={(val) => setFormData((prev) => ({ ...prev, isFeatured: val }))}
      />
    </AdminModal>
  );
}
