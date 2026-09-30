"use client";

import { useId } from "react";
import Link from "next/link";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  showIndicator?: boolean;
  className?: string;
  href?: string;
  size?: "default" | "large";
}

export function BrandLogo({
  className,
  href = "/",
  size = "default",
}: BrandLogoProps) {
  const emblemId = useId();
  const isLarge = size === "large";

  const content = (
    <div
      dir="ltr"
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
      className={cn("inline-flex flex-row items-center gap-2.5 group shrink-0 select-none", className)}
    >
      {/* 3D Cinema Lens Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-purple/20 via-brand-cyan/20 to-brand-purple/20 blur-md pointer-events-none opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />
        <YasproEmblem
          size={isLarge ? 34 : 28}
          idPrefix={`brand-emblem-${emblemId}`}
          className="relative z-10 filter drop-shadow-[0_2px_12px_rgba(6,182,212,0.4)] group-hover:scale-105 group-hover:drop-shadow-[0_2px_16px_rgba(168,85,247,0.65)] transition-all duration-300"
        />
      </div>

      {/* Clean Typography */}
      <div className="flex flex-col items-start" dir="ltr" style={{ direction: "ltr" }}>
        <div className="flex flex-row items-baseline leading-none" dir="ltr" style={{ direction: "ltr" }}>
          <span className={cn("text-white font-black tracking-tight font-display font-latin leading-none", isLarge ? "text-2xl" : "text-xl")}>
            YAS
          </span>
          <span className={cn("font-black tracking-tight font-display font-latin bg-gradient-to-r from-brand-purple-light via-brand-purple to-brand-cyan bg-clip-text text-transparent ml-0.5 leading-none", isLarge ? "text-2xl" : "text-xl")}>
            PRO
          </span>
        </div>

        {/* Subtitle */}
        <span className="text-[9.5px] sm:text-[10px] text-text-muted uppercase tracking-[0.22em] font-mono font-latin leading-tight mt-0.5 whitespace-nowrap" dir="ltr" style={{ direction: "ltr" }}>
          AI MEDIA HUB • DUBAI
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        dir="ltr"
        style={{ direction: "ltr" }}
        className="inline-flex flex-row items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
