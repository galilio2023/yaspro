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
            : "items-start text-left",
          className
        )}
      >
        {/* Badge + optional action row */}
        <div
          className={cn(
            "w-full flex items-center gap-3 mb-5",
            isCenter ? "justify-center" : "justify-between"
          )}
        >
          {badge && (
            <Badge
              variant={badgeVariant}
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest gap-1.5"
            >
              {badgeIcon}
              <span>{badge}</span>
            </Badge>
          )}

          {!isCenter && action && (
            <div className="hidden sm:block shrink-0">{action}</div>
          )}
        </div>

        {/* Heading */}
        <HeadingTag
          id={headingId}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight font-display leading-[1.12] mb-5"
        >
          {title}{" "}
          {gradientText && (
            <span className="gradient-text">
              {gradientText}
            </span>
          )}{" "}
          {titleAfter}
        </HeadingTag>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl",
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
