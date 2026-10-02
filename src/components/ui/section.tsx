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
  { id, ariaLabelledby, ariaLabel, background, className, children, animateIn, ...props },
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
    // Only animate sections if explicitly requested or if below hero and not prefers-reduced-motion
    if (animateIn === false || id === "hero") return;

    const el = innerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (isAlreadyInView) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translate3d(0, 44px, 0) scale3d(0.975, 0.975, 1)";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("studio-scroll-reveal");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
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
