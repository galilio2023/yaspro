import * as React from "react";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/animations/MotionWrappers";

export interface SectionHeaderProps {
  headingId?: string;
  as?: "h1" | "h2" | "h3";
  title: string;
  gradientText?: string;
  gradientVariant?: "gold" | "mauve" | "violet" | "yellow";
  titleAfter?: string;
  description?: string;
  align?: "center" | "left";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  headingId,
  as: HeadingTag = "h2",
  title,
  gradientText,
  gradientVariant = "mauve",
  titleAfter,
  description,
  align = "center",
  action,
  className,
}: SectionHeaderProps) {
  const isCenter = align === "center";

  const gradientClass =
    gradientVariant === "yellow"
      ? "gradient-text-mauve"
      : gradientVariant === "violet"
      ? "gradient-text-violet"
      : "gradient-text-mauve";

  return (
    <FadeUp>
      <div
        className={cn(
          "w-full mb-8 sm:mb-12 flex flex-col",
          isCenter
            ? "items-center text-center mx-auto max-w-3xl"
            : "items-start text-start",
          className
        )}
      >
        {/* Optional action row (if non-centered with action, desktop only) */}
        {!isCenter && action && (
          <div className="hidden sm:flex w-full items-center justify-end mb-5">
            <div className="shrink-0">{action}</div>
          </div>
        )}

        {/* Heading */}
        <HeadingTag
          id={headingId}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-extrabold text-white tracking-tight font-display leading-[1.15] rtl:leading-[1.35] mb-3 sm:mb-4 text-balance"
        >
          {title}{" "}
          {gradientText && (
            <span className={gradientClass}>
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
