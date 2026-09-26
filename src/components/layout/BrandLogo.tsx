import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  showIndicator?: boolean;
  className?: string;
  href?: string;
  size?: "default" | "large";
}

export function BrandLogo({
  showIndicator = true,
  className,
  href = "/",
  size = "default",
}: BrandLogoProps) {
  const isLarge = size === "large";

  const content = (
    <div className={cn("flex items-center gap-3 group shrink-0 select-none", className)}>
      {/* Hexagonal Aperture & Y-Prism Emblem */}
      <div className="relative">
        <div
          className={cn(
            "relative rounded-2xl bg-gradient-to-br from-brand-purple/25 via-brand-purple-dark/40 to-brand-cyan/20 border border-brand-purple/40 flex items-center justify-center shadow-lg shadow-brand-purple/30 group-hover:border-brand-purple-light/60 group-hover:shadow-brand-purple/50 group-hover:scale-105 transition-all duration-300 backdrop-blur-md",
            isLarge ? "size-12 sm:size-14" : "size-10 sm:size-11"
          )}
        >
          {/* Vivid Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-purple-light/50 to-brand-cyan blur-md opacity-40 group-hover:opacity-75 transition-opacity" />

          {/* SVG Geometric Prism Mark */}
          <svg
            viewBox="0 0 32 32"
            className={cn("relative z-10 fill-none drop-shadow-[0_2px_8px_rgba(var(--brand-purple-rgb),0.7)]", isLarge ? "size-7 sm:size-8" : "size-6")}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logo-emblem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--brand-purple-light)" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="var(--brand-cyan)" />
              </linearGradient>
            </defs>
            <path
              d="M7 8 L16 17 L25 8"
              stroke="url(#logo-emblem-grad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17 L16 26"
              stroke="url(#logo-emblem-grad)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <circle cx="16" cy="17" r="2.4" fill="#ffffff" />
            <circle cx="25" cy="7" r="1.5" fill="var(--brand-cyan)" />
            <circle cx="7" cy="25" r="1.5" fill="var(--brand-gold)" />
          </svg>
        </div>

        {showIndicator && (
          <div
            className="absolute -top-1 -right-1 size-2.5 rounded-full bg-brand-cyan border-2 border-black animate-pulse"
            title="Online Dubai Media Hub"
          />
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <span className="text-white font-extrabold text-lg sm:text-xl tracking-tight font-display">
            YAS
          </span>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight font-display bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent ml-0.5">
            PRO
          </span>
        </div>
        <span className="text-[9.5px] sm:text-[10px] text-text-muted uppercase tracking-[0.2em] font-mono leading-tight">
          AI MEDIA HUB • DUBAI
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
