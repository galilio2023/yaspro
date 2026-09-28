import Link from "next/link";
import { IyasProIcon } from "@/components/ui/IyasProIcon";
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
    <div className={cn("inline-flex items-center gap-2 group shrink-0 select-none", className)}>
      {/* Unified Luxury Candle Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center">
          {/* Glowing Candle "i" with Interactive Shimmer & Pulse */}
          <div className="relative flex items-center justify-center mr-1">
            {/* Ambient Warm Halo Behind the Candle Flame */}
            <div className="absolute -top-1 size-6 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/25 to-cyan-500/20 blur-md pointer-events-none opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300" />

            <IyasProIcon
              size={isLarge ? 26 : 22}
              idPrefix="brand-candle"
              className="relative z-10 filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.55)] group-hover:scale-110 group-hover:drop-shadow-[0_2px_14px_rgba(56,189,248,0.7)] transition-all duration-300 -translate-y-0.5"
            />
          </div>

          {/* Clean Typography */}
          <span className={cn("text-white font-extrabold tracking-tight font-display", isLarge ? "text-2xl" : "text-xl")}>
            YAS
          </span>
          <span className={cn("font-extrabold tracking-tight font-display bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent ml-0.5", isLarge ? "text-2xl" : "text-xl")}>
            PRO
          </span>
        </div>

        {/* Subtitle */}
        <span className="text-[9.5px] sm:text-[10px] text-text-muted uppercase tracking-[0.22em] font-mono leading-tight mt-0.5">
          AI MEDIA HUB • DUBAI
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
