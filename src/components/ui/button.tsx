import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-neutral-100 active:scale-[0.97] shadow-sm",
        brand:
          "relative bg-gradient-brand text-white font-bold shadow-lg shadow-brand-purple/30 hover:shadow-brand-purple/50 hover:opacity-93 active:scale-[0.97] overflow-hidden before:absolute before:inset-0 before:bg-white/0 hover:before:bg-white/5 before:transition-colors",
        "brand-gold":
          "relative bg-gradient-gold text-white font-bold shadow-lg shadow-brand-gold/30 hover:shadow-brand-gold/50 hover:opacity-93 active:scale-[0.97]",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-500 shadow-md shadow-red-500/20 active:scale-[0.97]",
        outline:
          "border border-brand-purple/25 bg-brand-purple/5 hover:bg-brand-purple/10 hover:border-brand-purple/50 text-white backdrop-blur-sm active:scale-[0.97]",
        secondary:
          "bg-card-alt text-foreground hover:bg-card border border-border-subtle hover:border-brand-purple/20 active:scale-[0.97]",
        ghost:
          "text-text-secondary hover:text-white hover:bg-white/6 active:scale-[0.97]",
        link:
          "text-brand-purple-mid underline-offset-4 hover:underline hover:text-brand-purple-light p-0 h-auto",
        glow:
          "relative bg-brand-purple/15 text-white border border-brand-purple/35 hover:bg-brand-purple/25 hover:border-brand-purple/65 hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] active:scale-[0.97] transition-shadow",
        "glow-gold":
          "relative bg-brand-gold/10 text-brand-gold-light border border-brand-gold/30 hover:bg-brand-gold/20 hover:border-brand-gold/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.4)] active:scale-[0.97]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-13 rounded-2xl px-8 text-base font-bold",
        xl: "h-15 rounded-2xl px-10 text-lg font-bold",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
