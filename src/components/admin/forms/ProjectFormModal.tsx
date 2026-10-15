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
  { value: "influencer", label: "Creator & Influencer Campaign" },
  { value: "shows", label: "Original Shows & Series" },
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
    deliverables: Array.isArray(initialProject?.deliverables) ? initialProject.deliverables : [],
    techStack: Array.isArray(initialProject?.techStack) ? initialProject.techStack : [],
  }));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      newErrors.title = "Project title is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }
    setFieldErrors({});

    const slug =
      formData.slug ||
      formData.title!
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
          error={fieldErrors.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
          }}
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
          error={fieldErrors.category}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, category: e.target.value as Project["category"] }));
            if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: "" }));
          }}
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
        label="Key Deliverables (Public Checkmarks)"
        placeholder="Add deliverable (e.g. Official 4K Broadcast Film, Social Multi-Platform Cutdowns, Color Master Package)..."
        tags={(formData.deliverables as string[]) || []}
        onChange={(deliverables) => setFormData((prev) => ({ ...prev, deliverables }))}
      />

      <AdminTagsInput
        label="Production Tech Stack (Equipment & Software)"
        placeholder="Add tech stack item (e.g. ARRI Alexa 35, Mo-Sys StarTracker, Unreal Engine 5.4, DaVinci Resolve)..."
        tags={(formData.techStack as string[]) || []}
        onChange={(techStack) => setFormData((prev) => ({ ...prev, techStack }))}
      />

      <AdminTagsInput
        label="Metadata Tags & Keywords"
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
