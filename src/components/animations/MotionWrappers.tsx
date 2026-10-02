"use client";

import React, { useEffect, useRef, ElementType } from "react";
import { cn } from "@/lib/utils";

// ─── FadeUp ───────────────────────────────────────────────────────────────────
// CSS-driven: uses IntersectionObserver + CSS class toggle instead of
// framer-motion's whileInView. No JS animation loop, no layout thrash.

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}

export function FadeUp({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: FadeUpProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already within viewport on mount to prevent hydration flicker
    const rect = el.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight && rect.bottom > 0;

    if (isAlreadyInView) {
      // Element is already in view (e.g. hero/above-the-fold) — keep visible immediately
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    // Start hidden for below-the-fold elements
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    // @ts-expect-error dynamic polymorphic JSX tag
    <Tag ref={ref} className={cn("w-full", className)}>
      {children}
    </Tag>
  );
}

// ─── StaggerContainer ─────────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  as?: ElementType;
  role?: string;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
  as: Tag = "div",
  role,
}: StaggerContainerProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const isAlreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    const items = Array.from(container.children) as HTMLElement[];

    if (isAlreadyInView) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    items.forEach((item, i) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(18px)";
      item.style.transition = `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerDelay}s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerDelay}s`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            items.forEach((item) => {
              item.style.opacity = "1";
              item.style.transform = "translateY(0)";
            });
            observer.unobserve(container);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px 80px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [staggerDelay]);

  return (
    // @ts-expect-error dynamic polymorphic JSX tag
    <Tag ref={ref} role={role} className={className}>
      {children}
    </Tag>
  );
}

// ─── StaggerItem ──────────────────────────────────────────────────────────────
// No animation logic here — parent StaggerContainer handles it.

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}

export function StaggerItem({
  children,
  className,
  as: Tag = "div",
  id,
}: StaggerItemProps) {
  return (
    // @ts-expect-error dynamic polymorphic JSX tag
    <Tag id={id} className={cn("w-full h-full", className)}>
      {children}
    </Tag>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────

interface CountUpProps {
  end: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();

          let start = 0;
          const duration = 1400;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = `${Math.floor(eased * end)}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = `${end}${suffix}`;
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}

// ─── GradientBorder ───────────────────────────────────────────────────────────

export function GradientBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl p-px",
        "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600",
        className
      )}
    >
      <div className="rounded-2xl bg-secondary h-full w-full">{children}</div>
    </div>
  );
}
