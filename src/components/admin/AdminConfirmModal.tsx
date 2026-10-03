"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { AlertTriangle, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isSubmitting?: boolean;
}

export function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isSubmitting = false,
}: AdminConfirmModalProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth="md"
      className="p-6"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`size-12 rounded-2xl flex items-center justify-center mb-4 border ${
            isDanger
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : variant === "warning"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}
        >
          {isDanger ? (
            <Trash2 size={22} />
          ) : variant === "warning" ? (
            <AlertTriangle size={22} />
          ) : (
            <CheckCircle2 size={22} />
          )}
        </div>

        <h3 className="text-lg font-bold text-white font-display mb-1">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-center gap-3 w-full">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              await onConfirm();
            }}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20"
                : variant === "warning"
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                : "btn-brand"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Processing...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
