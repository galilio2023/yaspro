import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full px-4 py-3.5 rounded-2xl bg-card/60 border border-border-subtle text-text-primary placeholder:text-text-ghost",
          "focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/20 focus:bg-card outline-none transition-all duration-200 resize-none text-sm leading-relaxed",
          "hover:border-brand-purple/30 hover:bg-card",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          error && "border-red-500/50 focus:border-red-400 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
