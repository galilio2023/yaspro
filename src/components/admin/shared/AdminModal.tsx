"use client";

import React from "react";
import { Dialog, DialogProps } from "@/components/ui/dialog";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  maxWidth?: DialogProps["maxWidth"];
  className?: string;
  hideFooter?: boolean;
  closeOnBackdropClick?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  maxWidth = "2xl",
  className,
  hideFooter = false,
  closeOnBackdropClick,
  initialFocusRef,
}: AdminModalProps) {
  const content = (
    <div className="flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="pb-5 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold font-display text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="py-6 overflow-y-auto overscroll-contain space-y-5 pr-1 text-xs sm:text-sm">
        {children}
      </div>

      {/* Footer */}
      {!hideFooter && (
        <div className="pt-5 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>

          {onSubmit && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{submitLabel}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      maxWidth={maxWidth}
      className={cn("p-6 sm:p-7", className)}
      hideCloseButton={isSubmitting}
      closeOnBackdropClick={closeOnBackdropClick ?? (onSubmit ? false : true)}
      initialFocusRef={initialFocusRef}
    >
      {onSubmit ? (
        <form onSubmit={onSubmit} noValidate className="contents">
          {content}
        </form>
      ) : (
        content
      )}
    </Dialog>
  );
}
