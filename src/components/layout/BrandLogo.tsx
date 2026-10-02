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
      {/* Luminous Studio Lens Mount */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient backlight glow */}
        <span className="absolute -inset-1 rounded-2xl bg-amber-500/25 blur-md pointer-events-none opacity-60 group-hover:opacity-100 group-hover:scale-115 transition-all duration-300" />
        
        {/* Frosted luminous mount capsule */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-2xl border border-white/25 bg-white/[0.08] group-hover:bg-white/[0.14] group-hover:border-amber-400/60 backdrop-blur-xl shadow-lg shadow-black/40 group-hover:shadow-[0_0_22px_rgba(245,158,11,0.35)] transition-all duration-300",
            isLarge ? "size-11 p-1.5" : "size-9 p-1"
          )}
        >
          <YasproEmblem
            size={isLarge ? 32 : 26}
            idPrefix={`brand-emblem-${emblemId}`}
            className="filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Clean Studio Typography */}
      <div className="flex flex-col items-start" dir="ltr" style={{ direction: "ltr" }}>
        <div className="flex flex-row items-baseline leading-none" dir="ltr" style={{ direction: "ltr" }}>
          <span className={cn("text-white font-black tracking-tight font-display font-latin leading-none drop-shadow-sm", isLarge ? "text-2xl" : "text-xl")}>
            YAS
          </span>
          <span className={cn("font-black tracking-tight font-display font-latin text-amber-400 ml-0.5 leading-none drop-shadow-sm", isLarge ? "text-2xl" : "text-xl")}>
            PRO
          </span>
        </div>

        {/* Subtitle */}
        <span className="text-[9.5px] sm:text-[10px] text-zinc-300 uppercase tracking-[0.22em] font-mono font-latin leading-tight mt-0.5 whitespace-nowrap" dir="ltr" style={{ direction: "ltr" }}>
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
        className="inline-flex flex-row items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
