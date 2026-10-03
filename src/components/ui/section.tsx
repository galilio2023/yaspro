"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  ariaLabelledby?: string;
  ariaLabel?: string;
  background?: React.ReactNode;
  animateIn?: boolean;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(function Section(
  { id, ariaLabelledby, ariaLabel, background, className, children, animateIn = false, ...props },
  forwardedRef
) {
  const innerRef = React.useRef<HTMLElement>(null);

  const setRefs = React.useCallback(
    (node: HTMLElement | null) => {
      (innerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef && typeof forwardedRef === "object") {
        (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    // Only run container-level fade if explicitly requested (animateIn === true)
    // and never on the hero section to protect LCP, scroll restoration, and prevent layout shifts.
    if (!animateIn || id === "hero") return;

    const el = innerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (isAlreadyInView) {
      el.style.opacity = "1";
      return;
    }

    el.style.opacity = "0";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
            el.style.opacity = "1";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -5% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animateIn, id]);

  return (
    <section
      ref={setRefs}
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
});

Section.displayName = "Section";
