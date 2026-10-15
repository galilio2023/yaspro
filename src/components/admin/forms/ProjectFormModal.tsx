"use client";

import React, { useState } from "react";
import type { Project } from "@/db/schema";
import { AdminModal } from "../shared/AdminModal";
import {
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminSwitch,
  AdminTagsInput,
} from "../shared/AdminFormFields";
import { AdminImageUploader } from "../AdminImageUploader";

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<boolean | void>;
  initialProject: Partial<Project> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

const PROJECT_CATEGORIES = [
  { value: "commercial", label: "Commercial Campaign" },
  { value: "government", label: "Government & National Day" },
  { value: "documentary", label: "Documentary Film" },
  { value: "event", label: "Live Event & Broadcast" },
];

export function ProjectFormModal(props: ProjectFormModalProps) {
  if (!props.isOpen) return null;

  return (
    <ProjectFormContent
      key={props.initialProject?.id || props.initialProject?.slug || "new"}
      {...props}
    />
  );
}

function ProjectFormContent({
  isOpen,
  onClose,
  onSave,
  initialProject,
  isSubmitting = false,
  error,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState<Partial<Project>>(() => ({
    ...initialProject,
    category: initialProject?.category || "commercial",
    year: initialProject?.year || new Date().getFullYear().toString(),
    tag: initialProject?.tag || "Campaign",
    views: initialProject?.views || "1M+ Views",
    coverImageUrl: initialProject?.coverImageUrl || "/images/projects/flag-day.jpg",
    isFeatured: initialProject?.isFeatured ?? true,
    tags: Array.isArray(initialProject?.tags) ? initialProject.tags : [],
  }));
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) return;

    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    await onSave({
      ...formData,
      slug,
      coverImageUrl: formData.coverImageUrl || "/images/projects/flag-day.jpg",
    });
  };

  const isEdit = Boolean(formData.id);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting || isUploadingCover}
      title={isEdit ? "Edit Film Project" : "Add New Film Project"}
      description="Update project key art, client attribution, video streaming URL, and showcase status."
      submitLabel={isUploadingCover ? "Uploading Media..." : isEdit ? "Update Project" : "Publish Project"}
      maxWidth="lg"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Project Title (English)"
          required
          placeholder="e.g. Flag Day National Campaign"
          value={formData.title || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        />
        <AdminInput
          label="Project Title (Arabic - عنوان المشروع)"
          placeholder="مثال: الحملة الوطنية ليوم العلم"
          dir="rtl"
          value={formData.arabicTitle || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, arabicTitle: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Slug (URL Path)"
          placeholder="flag-day-national"
          value={formData.slug || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
        />
        <AdminSelect
          label="Category"
          required
          options={PROJECT_CATEGORIES}
          value={formData.category || "commercial"}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value as Project["category"] }))
          }
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <AdminInput
          label="Client / Brand"
          placeholder="e.g. Government Media Office"
          value={formData.client || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
        />
        <AdminInput
          label="Campaign Tag"
          placeholder="e.g. TVC Campaign"
          value={formData.tag || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
        />
        <AdminInput
          label="Year"
          placeholder="2025"
          value={formData.year || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Total Impressions / Views"
          placeholder="e.g. 15M+ Views"
          value={formData.views || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, views: e.target.value }))}
        />
        <AdminInput
          label="Video Stream URL or Vimeo ID"
          placeholder="e.g. 1093240200 or https://vimeo.com/..."
          value={formData.videoUrl || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
        />
      </div>

      <div>
        <AdminImageUploader
          label="Project Cover Artwork & Stills"
          value={formData.coverImageUrl}
          onUploadingChange={setIsUploadingCover}
          onChange={(url) => setFormData((prev) => ({ ...prev, coverImageUrl: url }))}
          helperText="Upload official film key art or production stills (JPG, PNG, WEBP up to 15MB)"
        />
      </div>

      <AdminTextarea
        label="Project Synopsis / Description"
        rows={3}
        placeholder="Brief narrative of production challenges, technical approach, and results..."
        value={formData.description || ""}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
      />

      <AdminTagsInput
        label="Deliverables & Keywords"
        placeholder="Add tag (e.g. 4K Master, DCI-P3, HDR, 60s TVC)..."
        tags={(formData.tags as string[]) || []}
        onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
      />

      <AdminSwitch
        label="Featured Project"
        description="Showcase prominently on the homepage hero and portfolio reels."
        checked={formData.isFeatured ?? true}
        onChange={(val) => setFormData((prev) => ({ ...prev, isFeatured: val }))}
      />
    </AdminModal>
  );
}
