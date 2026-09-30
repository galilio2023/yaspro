"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedbackAlertProps {
  type?: "success" | "warning" | "error" | "info";
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const TYPE_STYLES = {
  success: {
    container: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    icon: CheckCircle2,
  },
  warning: {
    container: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    icon: AlertTriangle,
  },
  error: {
    container: "bg-rose-500/10 border-rose-500/30 text-rose-400",
    icon: XCircle,
  },
  info: {
    container: "bg-sky-500/10 border-sky-500/30 text-sky-400",
    icon: Info,
  },
};

export function FeedbackAlert({
  type = "success",
  message,
  onDismiss,
  className,
}: FeedbackAlertProps) {
  const { container, icon: Icon } = TYPE_STYLES[type];

  return (
    <div
      role="alert"
      className={cn(
        "px-3.5 py-2 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition-all animate-in fade-in duration-200",
        container,
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon size={15} className="shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer"
          aria-label="Dismiss feedback"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
