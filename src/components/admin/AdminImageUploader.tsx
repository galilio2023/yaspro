"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface AdminImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  label?: string;
  helperText?: string;
  accept?: string;
}

export function AdminImageUploader({
  value,
  onChange,
  onUploadingChange,
  label = "Cover Image / Media Asset",
  helperText = "Drag & drop or click to upload PNG, JPG, WEBP, or MP4 (up to 25MB)",
  accept = "image/png,image/jpeg,image/webp,image/avif,image/gif,video/mp4",
}: AdminImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setUploadingState = (uploading: boolean) => {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  };

  const handleUploadFile = async (file: File) => {
    setError(null);
    setUploadingState(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "File upload failed.");
      }

      onChange(data.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingState(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-medium text-xs sm:text-sm">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> Clear Asset
          </button>
        )}
      </div>

      {value ? (
        <div className="relative rounded-xl border border-white/15 bg-white/5 overflow-hidden p-3 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-slate-900 flex items-center justify-center">
            {/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(value) || value.includes("/video/upload/") ? (
              <video
                src={value}
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={value}
                alt="Media Preview"
                fill
                className="object-cover"
                unoptimized={value.startsWith("/uploads/") || value.startsWith("http")}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
              <CheckCircle2 size={13} /> Asset Uploaded & Linked
            </div>
            <p className="text-xs text-slate-300 truncate font-mono bg-black/40 px-2 py-1 rounded border border-white/5">
              {value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload media file"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
            dragActive
              ? "border-amber-500 bg-amber-500/10"
              : "border-white/15 hover:border-white/30 bg-white/[0.02]"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            </div>
            <p className="text-xs sm:text-sm font-medium text-white">
              {isUploading ? "Uploading media file..." : "Click or drag asset to upload"}
            </p>
            <p className="text-[11px] text-slate-400">{helperText}</p>
          </div>
        </div>
      )}

      {/* Direct manual URL input fallback */}
      <div className="flex items-center gap-2 pt-1">
        <ImageIcon size={14} className="text-slate-500 shrink-0" />
        <input
          type="text"
          value={value || ""}
          placeholder="Or paste external CDN / image URL..."
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
