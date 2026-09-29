import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-brand-purple/30 bg-brand-purple/15 text-brand-purple-light shadow-sm shadow-brand-purple/10",
        secondary:
          "border border-white/8 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white",
        destructive:
          "border border-red-500/30 bg-red-500/15 text-red-300",
        outline:
          "border border-white/15 text-foreground bg-transparent",
        cyan:
          "border border-brand-teal/35 bg-brand-teal/12 text-brand-teal-light shadow-sm shadow-brand-teal/10",
        gold:
          "border border-brand-gold/35 bg-brand-gold/12 text-brand-gold-light shadow-sm shadow-brand-gold/10",
        purple:
          "border border-brand-purple-mid/40 bg-brand-purple/20 text-brand-purple-lighter",
        live:
          "border border-brand-teal/40 bg-brand-teal/15 text-brand-teal-light shadow-sm shadow-brand-teal/10",
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
