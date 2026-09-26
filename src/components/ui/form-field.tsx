import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {label}
          {required && (
            <span className="ml-1 text-brand-gold" aria-hidden="true">*</span>
          )}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-text-ghost leading-snug">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-400 leading-snug flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
