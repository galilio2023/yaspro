import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  ariaLabelledby?: string;
  ariaLabel?: string;
  background?: React.ReactNode;
}

export function Section({
  id,
  ariaLabelledby,
  ariaLabel,
  background,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn("relative w-full max-w-full py-12 sm:py-16 md:py-24 overflow-hidden flex flex-col items-center justify-center", className)}
      {...props}
    >
      {background && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {background}
        </div>
      )}
      {children}
    </section>
  );
}
