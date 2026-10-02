import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/animations/MotionWrappers";

export interface SectionHeaderProps {
  headingId?: string;
  as?: "h1" | "h2" | "h3";
  badge?: React.ReactNode;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "cyan" | "gold" | "purple" | "live";
  badgeIcon?: React.ReactNode;
  title: string;
  gradientText?: string;
  titleAfter?: string;
  description?: string;
  align?: "center" | "left";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  headingId,
  as: HeadingTag = "h2",
  badge,
  badgeVariant = "default",
  badgeIcon,
  title,
  gradientText,
  titleAfter,
  description,
  align = "center",
  action,
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  return (
    <FadeUp>
      <div
        className={cn(
          "w-full mb-12 sm:mb-16 flex flex-col",
          isCenter
            ? "items-center text-center mx-auto max-w-3xl"
            : "items-start text-start",
          className
        )}
      >
        {/* Badge + optional action row */}
        <div
          className={cn(
            "w-full flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap",
            isCenter ? "justify-center" : "justify-between"
          )}
        >
          {badge && (
            <Badge
              variant={badgeVariant}
              /* tracking-widest breaks Arabic cursive — override to normal in RTL */
              className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rtl:tracking-normal gap-1.5 max-w-full"
            >
              {badgeIcon}
              <span className="font-latin rtl:font-arabic">{badge}</span>
            </Badge>
          )}

          {!isCenter && action && (
            <div className="hidden sm:block shrink-0">{action}</div>
          )}
        </div>

        {/* Heading */}
        <HeadingTag
          id={headingId}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-black text-white tracking-tight font-display leading-[1.1] rtl:leading-[1.35] mb-4 sm:mb-5 text-balance"
        >
          {title}{" "}
          {gradientText && (
            <span className="gradient-text-gold">
              {gradientText}
            </span>
          )}{" "}
          {titleAfter}
        </HeadingTag>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-sm sm:text-base md:text-[1.05rem] text-zinc-400 leading-[1.75] max-w-full sm:max-w-2xl rtl:leading-[1.9]",
              isCenter && "mx-auto"
            )}
          >
            {description}
          </p>
        )}

        {!isCenter && action && (
          <div className="sm:hidden mt-4 w-full">{action}</div>
        )}
      </div>
    </FadeUp>
  );
}
