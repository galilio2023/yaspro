import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-white/12 active:scale-[0.97] shadow-sm",
        brand:
          "btn-brand active:scale-[0.97] shadow-lg shadow-purple-950/40",
        "brand-gold":
          "bg-gradient-to-r from-brand-violet to-brand-purple text-white font-bold hover:opacity-95 active:scale-[0.97] shadow-lg shadow-purple-950/40 border border-brand-mauve/30",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-500 shadow-md shadow-red-500/20 active:scale-[0.97]",
        outline:
          "border border-white/15 bg-zinc-900/60 hover:bg-zinc-800 hover:border-white/30 text-white backdrop-blur-sm active:scale-[0.97]",
        secondary:
          "bg-zinc-900 text-zinc-200 hover:bg-zinc-800 border border-white/10 hover:border-white/20 active:scale-[0.97]",
        ghost:
          "text-zinc-400 hover:text-white hover:bg-white/5 active:scale-[0.97]",
        link:
          "text-brand-mauve-soft underline-offset-4 hover:underline hover:text-white p-0 h-auto",
        glow:
          "bg-zinc-900 text-white border border-white/20 hover:bg-zinc-800 hover:border-white/40 shadow-lg shadow-black/60 active:scale-[0.97]",
        "glow-gold":
          "bg-brand-violet/20 text-brand-lavender border border-brand-mauve/40 hover:bg-brand-violet/30 hover:border-brand-mauve/60 active:scale-[0.97]",
        violet:
          "btn-violet active:scale-[0.97] shadow-lg shadow-purple-950/40",
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
