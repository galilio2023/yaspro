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
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center justify-center transition-colors group-focus-within:text-white">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-white/10 text-white placeholder:text-zinc-500",
            "focus:border-white/30 focus:ring-1 focus:ring-white/20 focus:bg-zinc-900 outline-none transition-all duration-200 text-sm",
            "hover:border-white/20 hover:bg-zinc-900/90",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            error && "border-red-500/50 focus:border-red-400 focus:ring-red-500/20",
            leftIcon && "pl-11",
            rightIcon && "pr-11",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none flex items-center justify-center transition-colors group-focus-within:text-white">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
