"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Timer, Users, X, ShieldCheck, Sparkles, Tag } from "lucide-react";
import type { PodcastSessionItem, PodcastStudio, PodcastService, PodcastAddon } from "../types";
import { PODCAST_ADDONS } from "../data";
import { formatAED, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { useState } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface PodcastQuoteRailProps {
  addons?: PodcastAddon[];
  session: PodcastSessionItem;
  studio: PodcastStudio;
  service: PodcastService;
  allSessions: PodcastSessionItem[];
  activeSessionIndex: number;
  onSelectSessionIndex: (index: number) => void;
  subtotal: number;
  promoDiscount: number;
  appliedPromo: string | null;
  grandTotal: number;
  onRemoveAddon: (addonKey: string) => void;
  onApplyPromo?: (code: string) => void;
  onRemovePromo?: () => void;
  promoError?: string | null;
}

export function PodcastQuoteRail({
  addons = PODCAST_ADDONS,
  session,
  studio,
  service,
  allSessions,
  activeSessionIndex,
  onSelectSessionIndex,
  subtotal,
  promoDiscount,
  appliedPromo,
  grandTotal,
  onRemoveAddon,
  onApplyPromo,
  onRemovePromo,
  promoError,
}: PodcastQuoteRailProps) {
  const { t, isArabic } = useLanguage();
  const [promoInput, setPromoInput] = useState("");
  const [showPromoInput, setShowPromoInput] = useState(false);

  const duration = Math.max(1, session.durationHours || 1);
  const serviceCost = (service?.price || 0) * duration;

  const activeAddonsList = Object.entries(session.addons || {})
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const addon = addons.find((a) => a.key === key);
      return {
        key,
        title: (isArabic && addon?.titleAr) ? addon.titleAr : (addon?.title || key),
        qty,
        unit: (isArabic && addon?.unitAr) ? addon.unitAr : (addon?.unit || "unit"),
        cost: (addon?.priceNum || 0) * qty,
      };
    });

  const formattedDate = session.date
    ? new Date(`${session.date}T00:00:00`).toLocaleDateString(isArabic ? "ar-AE" : "en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : t("podcastBooking.quoteRail.notSelected");

  const facts = [
    { icon: CalendarDays, label: t("podcastBooking.quoteRail.date"), value: formattedDate, muted: !session.date },
    { icon: Clock, label: t("podcastBooking.quoteRail.startTime"), value: session.timeSlot || "—", muted: !session.timeSlot },
    { icon: Timer, label: t("podcastBooking.quoteRail.duration"), value: t("podcastBooking.quoteRail.durationHours", { hours: duration }), muted: false },
    {
      icon: Users,
      label: t("podcastBooking.quoteRail.guestsMics"),
      value: t("podcastBooking.quoteRail.guestsMicsVal", {
        count: session.headcount,
        seats: session.headcount === 1 ? t("podcastBooking.step2.seatSingle") : t("podcastBooking.step2.seatPlural"),
      }),
      muted: false,
    },
  ];

  return (
    <aside
      aria-label="Podcast session quote"
      className="rounded-3xl border border-white/[0.08] bg-[#0c0c10] overflow-hidden shadow-2xl"
    >
      {/* Multi-session selector (if more than 1 session) */}
      {allSessions.length > 1 && (
        <div className="p-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider shrink-0 px-1">
            {t("podcastBooking.sessions.viewing")}
          </span>
          {allSessions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSessionIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition shrink-0 cursor-pointer ${
                idx === activeSessionIndex
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-sm shadow-brand-violet/40"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white"
              }`}
            >
              {t("podcastBooking.sessions.session", { number: idx + 1 })}
            </button>
          ))}
        </div>
      )}

      {/* Studio Header Image & Title */}
      <div className="relative h-32 bg-zinc-900 overflow-hidden">
        {studio.image && (
          <Image
            src={studio.image}
            alt={studio.name}
            fill
            sizes="360px"
            className="object-cover opacity-65 transition-transform duration-700 hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c10] via-[#0c0c10]/50 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono uppercase tracking-wider text-brand-mauve font-semibold flex items-center gap-1 whitespace-nowrap shrink-0">
            <Sparkles size={10} className="text-brand-mauve" />
            {t("podcastBooking.quoteRail.seatsMax", { count: studio.seats })}
          </span>
          <span className="text-[10px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 whitespace-nowrap shrink-0">
            {t("podcastBooking.quoteRail.level18")}
          </span>
        </div>

        <div className="absolute bottom-3 left-4 right-4">
          <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-brand-mauve/90 font-bold">
            {t("podcastBooking.quoteRail.studioSetup")}
          </span>
          <span className="block text-white font-bold text-base truncate">
            {isArabic && studio.arabicName ? studio.arabicName : studio.name}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Facts 2x2 Grid */}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-3">
          {facts.map(({ icon: Icon, label, value, muted }) => (
            <div key={label} className="min-w-0">
              <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-zinc-500">
                <Icon size={11} className="text-zinc-500" />
                {label}
              </dt>
              <dd
                className={`text-xs font-semibold truncate mt-0.5 ${
                  muted ? "text-zinc-500" : "text-zinc-100"
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="h-px bg-white/[0.06]" />

        {/* Live Line Items Breakdown */}
        <div className="space-y-3">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500 font-bold">
            {t("podcastBooking.quoteRail.pricingBreakdown")}
          </div>

          {/* Service Line */}
          <div className="flex items-start justify-between gap-2 text-xs">
            <div className="min-w-0">
              <span className="text-zinc-200 font-medium block truncate">
                {(isArabic && service?.titleAr) ? service.titleAr : (service?.title || t("podcastBooking.quoteRail.productionService"))}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">
                {t("podcastBooking.quoteRail.serviceCalc", { duration, rate: formatAED(service?.price || 0) })}
              </span>
            </div>
            <span className="text-white font-bold tabular-nums shrink-0">
              {formatAED(serviceCost)}
            </span>
          </div>

          {/* Add-ons Lines */}
          {activeAddonsList.length > 0 && (
            <div className="pt-2 border-t border-white/[0.04] space-y-2">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-brand-mauve font-semibold block">
                {t("podcastBooking.quoteRail.selectedAddons", { count: activeAddonsList.length })}
              </span>
              <AnimatePresence initial={false}>
                {activeAddonsList.map((item) => (
                  <motion.div
                    key={item.key}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={studioSprings.snappy}
                    className="flex items-center justify-between gap-2 text-xs group"
                  >
                    <span className="text-zinc-300 truncate text-[11px]">
                      {item.title} {item.qty > 1 && <span className="text-zinc-500 font-mono">×{item.qty}</span>}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-white font-medium tabular-nums text-[11px]">
                        {formatAED(item.cost)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveAddon(item.key)}
                        aria-label={t("podcastBooking.quoteRail.removeAddon", { title: item.title })}
                        className="size-4 rounded flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                        title={t("podcastBooking.quoteRail.removeAddonTitle")}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Promo code drawer inside quote rail */}
          {onApplyPromo && onRemovePromo && (
            <div className="pt-2 border-t border-white/[0.04]">
              {appliedPromo ? (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-1.5 truncate">
                    <Tag size={12} />
                    <span className="font-mono text-[11px]">{appliedPromo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">−{formatAED(promoDiscount)}</span>
                    <button
                      type="button"
                      onClick={onRemovePromo}
                      className="text-zinc-400 hover:text-rose-400 transition"
                      title={t("podcastBooking.quoteRail.removeCode")}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ) : showPromoInput ? (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder={t("podcastBooking.quoteRail.promoPlaceholder")}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs font-mono uppercase placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onApplyPromo(promoInput);
                        setPromoInput("");
                      }}
                      className="px-2.5 py-1.5 rounded-lg btn-brand text-xs font-bold cursor-pointer"
                    >
                      {t("podcastBooking.quoteRail.apply")}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-[10px] text-rose-400 font-mono">{promoError}</p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPromoInput(true)}
                  className="text-[11px] text-zinc-400 hover:text-brand-mauve transition flex items-center gap-1 font-mono cursor-pointer"
                >
                  <Tag size={11} /> {t("podcastBooking.quoteRail.havePromo")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Totals Section */}
        <div className="pt-3 border-t border-white/[0.08] space-y-1.5 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>
              {allSessions.length > 1
                ? t("podcastBooking.quoteRail.subtotalSessions", { count: allSessions.length })
                : t("podcastBooking.quoteRail.subtotal")}
            </span>
            <span className="tabular-nums text-zinc-200">{formatAED(subtotal)}</span>
          </div>

          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>{t("podcastBooking.quoteRail.promoDiscount")}</span>
              <span className="tabular-nums">−{formatAED(promoDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between text-zinc-400">
            <span>{t("podcastBooking.quoteRail.vatZero")}</span>
            <span className="tabular-nums text-zinc-500">AED 0</span>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-baseline justify-between">
            <span className="text-sm font-bold text-white tracking-tight">
              {t("podcastBooking.quoteRail.totalAmount")}
            </span>
            <motion.span
              key={grandTotal}
              initial={{ scale: 0.94, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={studioSprings.snappy}
              className="text-2xl font-black tracking-tight text-brand-mauve tabular-nums"
            >
              {formatAED(grandTotal)}
            </motion.span>
          </div>
        </div>

        {/* Security & Studio Guarantee */}
        <div className="space-y-1.5 pt-1 text-[11px] text-zinc-400 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>{t("podcastBooking.quoteRail.guaranteeTitle")}</span>
          </div>
          <p className="text-[10px] text-zinc-500 ps-5">
            {t("podcastBooking.quoteRail.guaranteeSub")}
          </p>
        </div>
      </div>
    </aside>
  );
}
