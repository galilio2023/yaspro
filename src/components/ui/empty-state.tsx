import * as React from "react";
import { cn } from "@/lib/utils";
import { FolderSearch } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full py-16 px-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted mb-4 shadow-inner">
        {icon || <FolderSearch size={28} className="text-amber-400" />}
      </div>
      <h3 className="text-lg font-bold text-white font-display mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
