"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  gap?: string;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  children,
  vertical = false,
  repeat = 4,
  gap = "1rem",
  ...props
}: MarqueeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "200px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      style={{ "--gap": gap } as React.CSSProperties}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:35s] [gap:var(--gap)] touch-pan-y",
        !isVisible && "[&_*]:![animation-play-state:paused]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 ? true : undefined}
            inert={i > 0 ? true : undefined}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)] group-focus-within:![animation:none]", {
              "group-focus-within:hidden": i > 0,
              "[animation-play-state:paused]": paused,
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
