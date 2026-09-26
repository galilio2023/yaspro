import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  /** When true, renders as a Slot (passes all props to its child element).
   *  Use this when the parent is a Next.js <Link>:
   *  <ShimmerButton asChild><Link href="...">Label</Link></ShimmerButton>
   */
  asChild?: boolean;
}

const SHIMMER_INTERNALS = (
  <>
    {/* spark container */}
    <span
      aria-hidden="true"
      className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]"
    >
      <span className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
        <span className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
      </span>
    </span>
    {/* Backdrop */}
    <span
      aria-hidden="true"
      className="insert-0 absolute size-full rounded-[var(--radius)] px-4 py-1.5 text-sm font-medium transform-gpu transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_rgba(255,255,255,0.2)] group-active:shadow-[inset_0_-10px_10px_rgba(255,255,255,0.4)]"
    />
  </>
);

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      shimmerColor = "var(--foreground)",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "linear-gradient(90deg, var(--brand-purple) 0%, var(--brand-purple-dark) 100%)",
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const sharedStyle = {
      "--spread": "90deg",
      "--shimmer-color": shimmerColor,
      "--radius": borderRadius,
      "--speed": shimmerDuration,
      "--cut": shimmerSize,
      "--bg": background,
    } as React.CSSProperties;

    const sharedClassName = cn(
      "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/15 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(var(--brand-purple-rgb),0.4)] active:scale-[0.98]",
      className
    );

    if (asChild) {
      // Slot merges sharedStyle + sharedClassName onto the child element (e.g. Next.js <Link>).
      // The shimmer decorations are rendered as aria-hidden siblings inside the Slot child.
      // This produces a valid <a> element with shimmer effects — no nested <button> inside <a>.
      return (
        <Slot style={sharedStyle} className={sharedClassName} {...props}>
          {React.isValidElement<{ children?: React.ReactNode }>(children)
            ? React.cloneElement(children, {
                children: (
                  <>
                    {SHIMMER_INTERNALS}
                    {children.props.children}
                  </>
                ),
              })
            : children}
        </Slot>
      );
    }

    return (
      <button
        style={sharedStyle}
        className={sharedClassName}
        ref={ref}
        {...props}
      >
        {SHIMMER_INTERNALS}
        {children}
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
