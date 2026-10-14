"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Tag,
  AlertCircle,
  Edit3,
  Calendar,
  Clock,
  Mic2,
  User,
  Sparkles,
  Lock,
  Building2,
  Loader2,
} from "lucide-react";
import type { PodcastSessionItem, PodcastBookingContact } from "../types";
import { PODCAST_STUDIOS, PODCAST_SERVICES, PODCAST_ADDONS } from "../data";
import {
  formatAED,
  MetaTag,
  Panel,
  StepIntro,
  studioSprings,
} from "@/features/booking/components/ui/BookingKit";
import { motion } from "framer-motion";

export interface Step5ReviewCheckoutProps {
  sessions: PodcastSessionItem[];
  contact: PodcastBookingContact;
  onUpdateContact: (updates: Partial<PodcastBookingContact>) => void;
  appliedPromo: string | null;
  promoDiscount: number;
  promoError: string | null;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
  subtotal: number;
  grandTotal: number;
  isAgreedToTerms: boolean;
  onToggleTerms: (val: boolean) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (withZiinaPayment: boolean) => void;
  onEditSession: (index: number) => void;
}

export function Step5ReviewCheckout({
  sessions,
  contact,
  onUpdateContact,
  appliedPromo,
  promoDiscount,
  promoError,
  onApplyPromo,
  onRemovePromo,
  subtotal,
  grandTotal,
  isAgreedToTerms,
  onToggleTerms,
  isSubmitting,
  errorMessage,
  onSubmit,
  onEditSession,
}: Step5ReviewCheckoutProps) {
  const [promoInput, setPromoInput] = useState("");

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <StepIntro
        index={5}
        total={5}
        title="Review & Complete Booking"
        description="Verify your session specifications, enter client contact details, and secure your studio reservation."
        aside={<MetaTag tone="mauve">{sessions.length} {sessions.length === 1 ? "Session" : "Sessions"}</MetaTag>}
      />

      {errorMessage && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Session Breakdown Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs tracking-[0.18em] uppercase text-zinc-400 font-bold">
            Studio Reservations
          </h3>
          <span className="text-xs text-zinc-500 font-mono">
            Iris Bay Dubai · Level 18
          </span>
        </div>

        <div className="space-y-3">
          {sessions.map((sess, idx) => {
            const studio = PODCAST_STUDIOS.find((s) => s.key === sess.studioKey) || PODCAST_STUDIOS[0];
            const service = PODCAST_SERVICES.find((s) => s.key === sess.serviceKey) || PODCAST_SERVICES[0];
            const sessionCost = service.price * sess.durationHours;

            const selectedAddons = Object.entries(sess.addons || {})
              .filter(([, qty]) => qty > 0)
              .map(([k, qty]) => {
                const ad = PODCAST_ADDONS.find((a) => a.key === k);
                return {
                  key: k,
                  title: ad?.title || k,
                  qty,
                  cost: (ad?.priceNum || 0) * qty,
                };
              });

            const formattedDate = sess.date
              ? new Date(`${sess.date}T00:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "Date pending";

            return (
              <div
                key={sess.id}
                className="rounded-2xl border border-white/[0.08] bg-[#0e0e13] p-4 sm:p-5 overflow-hidden transition-all duration-200 hover:border-white/15"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                      {studio.image && (
                        <Image
                          src={studio.image}
                          alt={studio.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-mauve uppercase tracking-wider">
                          Session {idx + 1}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {studio.name}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {service.title} ({sess.durationHours}h)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm sm:text-base font-bold text-brand-mauve tabular-nums">
                      {formatAED(sessionCost)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditSession(idx)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 size={11} /> Edit
                    </button>
                  </div>
                </div>

                {/* Specs chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-brand-mauve shrink-0" />
                    <span className="truncate">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-mauve shrink-0" />
                    <span className="truncate">{sess.timeSlot} ({sess.durationHours}h)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mic2 size={13} className="text-brand-mauve shrink-0" />
                    <span className="truncate">{sess.headcount} Guests / Mics</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
                    <Sparkles size={13} className="text-brand-mauve shrink-0" />
                    <span className="truncate">Iris Bay L18</span>
                  </div>
                </div>

                {/* Add-ons attached */}
                {selectedAddons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
                      Add-ons:
                    </span>
                    {selectedAddons.map((addon) => (
                      <span
                        key={addon.key}
                        className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-brand-lavender text-[11px] font-medium leading-relaxed"
                      >
                        {addon.title} {addon.qty > 1 && `(x${addon.qty})`} · {formatAED(addon.cost)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Client Information Form */}
      <Panel
        icon={User}
        title="Primary Contact Information"
        description="We will send your studio booking confirmation, calendar invite, and master video links here."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Full Name or Production Lead *
            </label>
            <input
              type="text"
              required
              value={contact.fullName}
              onChange={(e) => onUpdateContact({ fullName: e.target.value })}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={contact.email}
                onChange={(e) => onUpdateContact({ email: e.target.value })}
                placeholder="sarah@agency.ae"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Phone / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                value={contact.phone}
                onChange={(e) => onUpdateContact({ phone: e.target.value })}
                placeholder="+971 50 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Special Requests or Studio Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={contact.specialRequests || ""}
              onChange={(e) => onUpdateContact({ specialRequests: e.target.value })}
              placeholder="Tell our studio sound engineer about remote guests (Zoom/Riverside), backdrop preferences, or branding requirements..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve transition-colors resize-none"
            />
          </div>
        </div>
      </Panel>

      {/* 3. Promo Code Section */}
      <Panel
        icon={Tag}
        title="Voucher or Promo Code"
        description="Have a partner or promotional voucher code? Apply it to your total below."
      >
        {appliedPromo ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <Tag size={14} />
              <span>Promo code {appliedPromo} applied!</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">−{formatAED(promoDiscount)}</span>
              <button
                type="button"
                onClick={onRemovePromo}
                className="text-xs text-rose-400 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2.5 max-w-md">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Try YAS10 or PODCAST20"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs font-mono uppercase placeholder:text-zinc-600 focus:outline-none focus:border-brand-mauve"
              />
              <button
                type="button"
                onClick={() => {
                  onApplyPromo(promoInput);
                  setPromoInput("");
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-brand-violet hover:text-white text-white transition cursor-pointer shrink-0"
              >
                Apply Code
              </button>
            </div>
            {promoError && (
              <p className="text-xs text-rose-400 font-mono">{promoError}</p>
            )}
          </div>
        )}
      </Panel>

      {/* 4. Important Storage Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-brand-violet/15 border border-brand-mauve/30 text-xs text-brand-lavender leading-relaxed flex items-start gap-3">
        <AlertCircle size={18} className="text-brand-mauve shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold text-white text-xs">
            Important Raw Footage Transfer Notice
          </h5>
          <p className="text-zinc-300">
            If you are not choosing our full Master Episode editing package, please remember to bring a high-speed external hard drive (USB-C SSD) to transfer your raw 4K camera files and multi-track Shure audio stems immediately after wrapping.
          </p>
        </div>
      </div>

      {/* 5. Terms Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            checked={isAgreedToTerms}
            onChange={(e) => onToggleTerms(e.target.checked)}
            className="mt-1 size-4 rounded border-white/20 bg-white/5 text-brand-mauve focus:ring-brand-mauve cursor-pointer"
          />
          <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition">
            I agree to the Yas Pro Studio Terms & Conditions, studio cancellation policy, and file transfer guidelines. I understand session times are dedicated and require prompt arrival.
          </span>
        </label>
      </div>

      {/* 6. Checkout CTA Actions */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e13] border border-white/[0.08] space-y-3.5 shadow-xl">
        <div className="space-y-2 pb-3.5 border-b border-white/[0.08]">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Subtotal ({sessions.length} {sessions.length === 1 ? "Session" : "Sessions"}):</span>
            <span className="tabular-nums text-zinc-200">{formatAED(subtotal)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400 font-medium">
              <span>Promo Discount ({appliedPromo}):</span>
              <span className="tabular-nums">−{formatAED(promoDiscount)}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500 font-bold block">
                Total Due
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-brand-mauve tracking-tight tabular-nums">
                  {formatAED(grandTotal)}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  VAT 0% included
                </span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Apple Pay · Card · Studio Desk</span>
            </span>
          </div>
        </div>

        {/* Compact, Single-Line Checkout Buttons (Side-by-Side on desktop, compact on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Primary CTA: Online Instant Pay */}
          <motion.button
            type="button"
            disabled={isSubmitting || !isAgreedToTerms}
            onClick={() => onSubmit(true)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={studioSprings.snappy}
            className="h-10 sm:h-12 px-3 sm:px-4 rounded-xl btn-brand text-xs sm:text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer min-w-0"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 size={15} className="animate-spin shrink-0" />
                <span>Processing...</span>
              </span>
            ) : (
              <>
                <CreditCard size={15} className="shrink-0" />
                <span className="truncate">Pay Online · {formatAED(grandTotal)}</span>
              </>
            )}
          </motion.button>

          {/* Secondary CTA: Pay at Studio Desk */}
          <button
            type="button"
            disabled={isSubmitting || !isAgreedToTerms}
            onClick={() => onSubmit(false)}
            className="h-10 sm:h-12 px-3 sm:px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm transition border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer min-w-0"
          >
            <Building2 size={15} className="text-zinc-400 shrink-0" />
            <span className="truncate">Pay at Studio Desk</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-0.5">
          <Lock size={12} className="text-emerald-400 shrink-0" />
          <span>Encrypted checkout via Ziina • UAE Central Bank regulated</span>
        </div>
      </div>
    </div>
  );
}
