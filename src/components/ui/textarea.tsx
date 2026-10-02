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
          "w-full px-4 py-3.5 rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder:text-zinc-500",
          "focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:bg-zinc-900 outline-none transition-all duration-200 resize-none text-sm leading-relaxed",
          "hover:border-white/20 hover:bg-zinc-900/90",
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
