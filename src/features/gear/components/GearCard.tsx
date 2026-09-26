import Link from "next/link";
import { Camera, CheckCircle2, Box } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { GearItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { GearSelectButton } from "./GearSelectButton";

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
  actionLabel = "Reserve",
  action,
}: GearCardProps) {
  const isCompact = variant === "compact";

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 flex flex-col justify-between h-full group relative hover:border-brand-purple/40 hover:bg-white/[0.05] transition-all duration-300 shadow-xl shadow-black/20">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="secondary" className="text-xs font-normal">
              {item.categoryLabel}
            </Badge>
            {item.isKit && (
              <Badge variant="cyan" className="text-[10px] font-bold uppercase tracking-wider gap-1">
                <Box size={10} /> Kit
              </Badge>
            )}
          </div>

          {item.isPopular && (
            <Badge
              variant={isCompact ? "default" : "gold"}
              className="text-[10px] font-bold uppercase tracking-wider"
            >
              Popular
            </Badge>
          )}
        </div>

        {/* Visual Camera / Optics Graphic Header (shown in default variant) */}
        {!isCompact && (
          <div className="w-full aspect-[16/9] mb-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-brand-purple/20 transition-colors">
            <div className="size-24 rounded-full bg-brand-purple/10 blur-xl absolute pointer-events-none group-hover:bg-brand-purple/20 transition-all" />
            <Camera
              size={36}
              className="text-text-muted group-hover:text-brand-purple-light group-hover:scale-110 transition-all duration-300"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-text-ghost uppercase">
              {item.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 font-display group-hover:text-brand-purple-light transition-colors">
          {item.name}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-text-secondary text-xs leading-relaxed mb-4",
            isCompact ? "line-clamp-3" : "line-clamp-2 mb-5"
          )}
        >
          {item.description}
        </p>

        {/* Turnkey Kit Inclusions (if kit) */}
        {item.isKit && item.includedInKit && !isCompact && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-mono font-semibold text-brand-purple-light block mb-2">
              Package Includes:
            </span>
            <ul className="space-y-1.5">
              {item.includedInKit.slice(0, 3).map((inc) => (
                <li key={inc} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                  <span className="text-brand-cyan shrink-0">•</span>
                  <span className="truncate">{inc}</span>
                </li>
              ))}
              {item.includedInKit.length > 3 && (
                <li className="text-[10px] text-text-muted italic pt-0.5">
                  + {item.includedInKit.length - 3} more professional accessories
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Specs List (only in default full variant when not a kit) */}
        {!isCompact && !item.isKit && (
          <ul className="space-y-2 mb-6">
            {item.specs.map((spec) => (
              <li key={spec} className="text-xs text-text-muted flex items-center gap-2">
                <CheckCircle2 size={13} className="text-brand-purple shrink-0" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pricing & Action Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
        <div>
          <div
            className={cn(
              "font-bold bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent font-display",
              isCompact ? "text-base" : "text-xl"
            )}
          >
            {formatCurrency(item.dailyRate)}
          </div>
          <div className="text-[10px] text-text-muted font-mono flex items-center gap-1.5">
            <span>per day / AED</span>
            {item.securityDeposit && (
              <>
                <span>•</span>
                <span className="text-text-ghost">Dep. {formatCurrency(item.securityDeposit)}</span>
              </>
            )}
          </div>
        </div>

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
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-brand-purple/20 text-brand-purple-light border border-white/10 transition-all cursor-pointer"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
