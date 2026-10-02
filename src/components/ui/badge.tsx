import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-white/12 bg-zinc-900/90 text-zinc-200 shadow-sm shadow-black/40 font-mono tracking-wider",
        secondary:
          "border border-white/8 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white",
        destructive:
          "border border-red-500/30 bg-red-500/15 text-red-300",
        outline:
          "border border-white/15 text-zinc-200 bg-transparent",
        cyan:
          "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-black/20 font-mono",
        gold:
          "border border-amber-500/35 bg-amber-500/10 text-amber-300 shadow-sm shadow-black/20 font-mono",
        purple:
          "border border-zinc-700/60 bg-zinc-900/80 text-zinc-300 font-mono",
        live:
          "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-mono",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
