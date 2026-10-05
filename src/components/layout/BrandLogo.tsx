"use client";

import Image from "next/image";
import Link from "next/link";
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
  const isLarge = size === "large";

  const content = (
    <div
      dir="ltr"
      style={{ direction: "ltr", unicodeBidi: "isolate" }}
      className={cn("inline-flex flex-row items-center gap-3 group shrink-0 select-none", className)}
    >
      {/* Official Yas Pro Media Group Logo Image with Studio Backlight */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Subtle ambient backlight glow */}
        <span className="absolute -inset-1.5 rounded-2xl bg-brand-violet/25 blur-md pointer-events-none opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />

        <Image
          src="/images/group/yas-pro-media-group.png"
          alt="YAS PRO Media Group"
          width={isLarge ? 160 : 130}
          height={isLarge ? 58 : 46}
          priority
          className={cn(
            "relative z-10 w-auto object-contain filter brightness-100 group-hover:brightness-110 group-hover:scale-[1.03] transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]",
            isLarge ? "h-10 sm:h-12" : "h-7 sm:h-8"
          )}
        />
      </div>

      {/* Subtitle strictly LTR as per AGENTS.md */}
      <span
        className={cn(
          "text-zinc-300 uppercase tracking-[0.2em] font-mono font-latin leading-tight whitespace-nowrap border-l border-white/15 pl-2.5 sm:pl-3 hidden sm:inline-block",
          isLarge ? "text-[10px] sm:text-[11px]" : "text-[8.5px] sm:text-[9.5px]"
        )}
        dir="ltr"
        style={{ direction: "ltr" }}
      >
        AI MEDIA HUB • DUBAI
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        dir="ltr"
        style={{ direction: "ltr" }}
        className="inline-flex flex-row items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mauve/40 rounded-xl"
      >
        {content}
      </Link>
    );
  }

  return content;
}
