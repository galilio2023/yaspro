"use client";

import React from "react";
import { FeedbackAlert } from "@/components/ui/feedback-alert";
import { cn } from "@/lib/utils";

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  feedback?: string | null;
  onDismissFeedback?: () => void;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  feedback,
  onDismissFeedback,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {badge && <div className="mb-2">{badge}</div>}
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            {Icon && <Icon size={24} className="text-brand-mauve shrink-0" />}
            <span>{title}</span>
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {feedback && onDismissFeedback && (
            <FeedbackAlert
              type="success"
              message={feedback}
              onDismiss={onDismissFeedback}
            />
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
