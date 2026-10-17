"use client";

import Link from "next/link";
import Image from "next/image";
import { Camera, CheckCircle2, Box } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { GearItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { GearSelectButton } from "./GearSelectButton";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface GearCardProps {
  item: GearItem;
  variant?: "default" | "compact";
  inCart?: boolean;
  onToggle?: (id: string) => void;
  actionHref?: string;
  actionLabel?: string;
  action?: React.ReactNode;
}

export function GearCard({
  item,
  variant = "default",
  inCart = false,
  onToggle,
  actionHref,
  actionLabel,
  action,
}: GearCardProps) {
  const { t, isArabic } = useLanguage();
  const isCompact = variant === "compact";

  const displayName = isArabic && item.arabicName ? item.arabicName : item.name;
  const displayDescription = isArabic && item.arabicDescription ? item.arabicDescription : item.description;
  const displayCategoryLabel = isArabic && item.categoryLabelAr ? item.categoryLabelAr : item.categoryLabel;
  const activeSpecs = isArabic && item.arabicSpecs && item.arabicSpecs.length > 0 ? item.arabicSpecs : item.specs;

  const resolvedActionLabel = actionLabel || t("shop.card.reserve");

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between h-full group relative hover:border-brand-mauve/40 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-brand-violet/25 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden text-start">
      <div>
        {/* Product Visual Stage */}
        <div className="relative w-full aspect-[16/9] mb-4 sm:mb-5 rounded-2xl overflow-hidden bg-black/50 border border-white/10 group-hover:border-brand-mauve/30 transition-all duration-300">
          {item.image ? (
            <Image
              src={item.image}
              alt={displayName}
              fill
              sizes={
                isCompact
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="flex items-center justify-center size-full bg-gradient-to-br from-white/5 to-white/0">
              <Camera
                size={36}
                className="text-text-muted group-hover:text-brand-mauve transition-colors"
              />
            </div>
          )}

          {/* Depth vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Top Badges over image */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
            <Badge
              variant="secondary"
              className="text-[10px] font-normal backdrop-blur-md bg-black/70 border-white/15 text-white/90 shrink-0"
            >
              {displayCategoryLabel}
            </Badge>

            {item.isPopular && (
              <Badge
                variant="gold"
                className="text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md shrink-0"
              >
                {t("shop.card.popular")}
              </Badge>
            )}
          </div>

          {/* Bottom Badges over image */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2 pointer-events-none z-10">
            {item.isKit ? (
              <Badge
                variant="gold"
                className="text-[9.5px] font-bold uppercase tracking-wider gap-1 backdrop-blur-md bg-black/70 border-brand-mauve/40 text-brand-mauve shrink-0"
              >
                <Box size={10} />
                <span>{t("shop.card.turnkeyKit")}</span>
              </Badge>
            ) : <div />}

            <span className="text-[9px] font-mono text-white/70 uppercase px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 shrink-0">
              {item.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white mb-2 font-display group-hover:text-brand-mauve transition-colors line-clamp-1 rtl:leading-normal">
          {displayName}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-text-secondary text-xs leading-relaxed mb-4 rtl:leading-normal",
            isCompact ? "line-clamp-2" : "line-clamp-2 mb-5"
          )}
        >
          {displayDescription}
        </p>

        {/* Turnkey Kit Inclusions (if kit) */}
        {item.isKit && item.includedInKit && !isCompact && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-mono font-semibold text-brand-mauve block mb-2">
              {t("shop.card.packageIncludes")}
            </span>
            <ul className="space-y-1.5">
              {item.includedInKit.slice(0, 3).map((inc) => (
                <li key={inc} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                  <span className="text-brand-mauve shrink-0">•</span>
                  <span className="truncate">{inc}</span>
                </li>
              ))}
              {item.includedInKit.length > 3 && (
                <li className="text-[10px] text-text-muted italic pt-0.5">
                  {t("shop.card.moreAccessories", { count: item.includedInKit.length - 3 })}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Specs List (only in default full variant when not a kit) */}
        {!isCompact && !item.isKit && (
          <ul className="space-y-2 mb-6">
            {activeSpecs.map((spec) => (
              <li key={spec} className="text-xs text-text-muted flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-mauve shrink-0" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pricing & Action Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-auto">
        <div className="text-start">
          <div
            className={cn(
              "font-bold text-brand-mauve font-display font-latin text-start",
              isCompact ? "text-base sm:text-lg" : "text-xl"
            )}
          >
            {formatCurrency(item.dailyRate)}
          </div>
          <div className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
            <span>{t("shop.card.perDay")}</span>
            {item.securityDeposit && (
              <>
                <span>•</span>
                <span className="text-text-ghost">
                  {t("shop.card.deposit", { amount: formatCurrency(item.securityDeposit) })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {action ? (
            action
          ) : onToggle ? (
            <GearSelectButton
              itemId={item.id}
              inCart={inCart}
              onToggle={onToggle}
            />
          ) : actionHref ? (
            <Link
              href={actionHref}
              className="px-3.5 py-2.5 sm:py-3 rounded-xl text-xs font-semibold bg-white/5 hover:bg-brand-violet/20 text-brand-mauve border border-white/10 hover:border-brand-mauve/40 transition-all cursor-pointer inline-flex items-center justify-center whitespace-nowrap"
            >
              {resolvedActionLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
