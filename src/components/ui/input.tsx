import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, type = "text", ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center transition-colors group-focus-within:text-brand-purple-mid">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full px-4 py-3 rounded-2xl bg-card/60 border border-border-subtle text-text-primary placeholder:text-text-ghost",
            "focus:border-brand-purple/60 focus:ring-2 focus:ring-brand-purple/20 focus:bg-card outline-none transition-all duration-200 text-sm",
            "hover:border-brand-purple/30 hover:bg-card",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-500/50 focus:border-red-400 focus:ring-red-500/20",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center justify-center transition-colors group-focus-within:text-brand-purple-mid">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
