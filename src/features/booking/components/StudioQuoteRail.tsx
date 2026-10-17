"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Timer, Users, X, ShieldCheck } from "lucide-react";
import type { BookingState, StudioItem, SessionTypeItem } from "../types";
import type { BookingPricingBreakdown } from "../constants";
import { formatAED, studioSprings } from "./ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { formatTimeSlot } from "@/lib/utils";

type LineItem = { id: string; title: string; titleAr?: string; price: number; priceType: string };

export interface QuoteBreakdownProps {
  state: BookingState;
  sessionType?: SessionTypeItem;
  breakdown: BookingPricingBreakdown;
  selectedCrewItems: LineItem[];
  selectedPropItems: LineItem[];
  selectedAddonItems: LineItem[];
  onRemoveCrewItem?: (id: string) => void;
  onRemovePropItem?: (id: string) => void;
  onRemoveAddonItem?: (id: string) => void;
}

function LineGroup({
  label,
  items,
  duration,
  onRemove,
  isArabic,
  removeAriaFn,
}: {
  label: string;
  items: LineItem[];
  duration: number;
  onRemove?: (id: string) => void;
  isArabic: boolean;
  removeAriaFn: (title: string) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500">{label}</div>
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const cost = item.priceType === "hourly" ? item.price * duration : item.price;
          const displayTitle = isArabic && item.titleAr ? item.titleAr : item.title;
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={studioSprings.snappy}
              className="group flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-zinc-300 truncate">{displayTitle}</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="text-white font-medium tabular-nums">{formatAED(cost)}</span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={removeAriaFn(displayTitle)}
                    className="size-5 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function QuoteBreakdown({
  state,
  sessionType,
  breakdown,
  selectedCrewItems,
  selectedPropItems,
  selectedAddonItems,
  onRemoveCrewItem,
  onRemovePropItem,
  onRemoveAddonItem,
}: QuoteBreakdownProps) {
  const { t, isArabic } = useLanguage();
  const duration = state.durationHours || 1;
  const sessionTitle =
    (isArabic && (sessionType?.titleAr || sessionType?.labelAr)) ||
    sessionType?.title ||
    t("studioBooking.quote.sessionFallback");
  const removeAriaFn = (title: string) => t("studioBooking.quote.removeAria", { title });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-zinc-300">
          {sessionTitle} <span className="text-zinc-500">× {duration}h</span>
        </span>
        <span className="text-white font-medium tabular-nums">{formatAED(breakdown.sessionCost)}</span>
      </div>

      <LineGroup
        label={t("studioBooking.quote.crewAndEquipment")}
        items={selectedCrewItems}
        duration={duration}
        onRemove={onRemoveCrewItem}
        isArabic={isArabic}
        removeAriaFn={removeAriaFn}
      />
      <LineGroup
        label={t("studioBooking.quote.propsAndSet")}
        items={selectedPropItems}
        duration={duration}
        onRemove={onRemovePropItem}
        isArabic={isArabic}
        removeAriaFn={removeAriaFn}
      />
      <LineGroup
        label={t("studioBooking.quote.postProduction")}
        items={selectedAddonItems}
        duration={duration}
        onRemove={onRemoveAddonItem}
        isArabic={isArabic}
        removeAriaFn={removeAriaFn}
      />

      <div className="pt-3 border-t border-white/[0.06] space-y-1.5 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>{t("studioBooking.quote.subtotal")}</span>
          <span className="tabular-nums">{formatAED(breakdown.subtotal, 2)}</span>
        </div>
        {breakdown.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>{t("studioBooking.quote.discount")}</span>
            <span className="tabular-nums">−{formatAED(breakdown.discount, 2)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-400">
          <span>{t("studioBooking.quote.tax")}</span>
          <span className="tabular-nums">{formatAED(breakdown.tax, 2)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.08] flex items-end justify-between">
        <span className="text-sm font-semibold text-white">{t("studioBooking.quote.total")}</span>
        <motion.span
          key={breakdown.total}
          initial={{ scale: 0.94, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={studioSprings.snappy}
          className="text-2xl font-bold tracking-tight text-brand-mauve tabular-nums"
        >
          {formatAED(breakdown.total, 2)}
        </motion.span>
      </div>
    </div>
  );
}

export function StudioQuoteRail({
  studio,
  ...props
}: QuoteBreakdownProps & { studio?: StudioItem }) {
  const { t, isArabic } = useLanguage();
  const { state } = props;
  const imageSrc = studio?.imageUrl || studio?.image;
  const studioName = (isArabic && studio?.arabicName) || studio?.name || t("studioBooking.quote.selectStudio");
  const dateLabel = state.date
    ? new Date(`${state.date}T00:00:00`).toLocaleDateString(isArabic ? "ar-AE" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : t("studioBooking.quote.notSelected");

  const facts = [
    { icon: CalendarDays, label: t("studioBooking.quote.date"), value: dateLabel, muted: !state.date },
    {
      icon: Clock,
      label: t("studioBooking.quote.callTime"),
      value: state.time ? formatTimeSlot(state.time, isArabic ? "ar" : "en") : "—",
    },
    { icon: Timer, label: t("studioBooking.quote.length"), value: `${state.durationHours || 1}h` },
    {
      icon: Users,
      label: t("studioBooking.quote.onSet"),
      value: t("studioBooking.quote.peopleCount", { count: state.headcount >= 5 ? "5+" : state.headcount }),
    },
  ];

  return (
    <aside aria-label={t("studioBooking.quote.ariaLabel")} className="rounded-3xl border border-white/[0.08] bg-[#0c0c10] overflow-hidden">
      {/* Stage header */}
      <div className="relative h-28 bg-zinc-900">
        {imageSrc && (
          <Image src={imageSrc} alt={studioName} fill unoptimized sizes="340px" className="object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-brand-mauve/90">
            {t("studioBooking.quote.reservedStage")}
          </span>
          <span className="block text-white font-semibold truncate">{studioName}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
          {facts.map(({ icon: Icon, label, value, muted }) => (
            <div key={label} className="min-w-0">
              <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-zinc-500">
                <Icon size={11} className="text-zinc-500" />
                {label}
              </dt>
              <dd className={`text-xs font-medium truncate mt-0.5 ${muted ? "text-zinc-500" : "text-zinc-100"}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="h-px bg-white/[0.06]" />

        <QuoteBreakdown {...props} />

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck size={13} className="text-emerald-400/80 shrink-0" />
          <span>{t("studioBooking.quote.secureCheckoutBadge")}</span>
        </div>
      </div>
    </aside>
  );
}
