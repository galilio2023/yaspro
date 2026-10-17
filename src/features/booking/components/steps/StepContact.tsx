"use client";

import React, { useState } from "react";
import type { WizardStepProps, StudioItem, SessionTypeItem } from "../../types";
import { SESSION_TYPES, type BookingPricingBreakdown } from "../../constants";
import { Lock, UserRound, ReceiptText, CreditCard, Loader2, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Field, Panel, StepIntro, fieldClass, formatAED, studioSprings } from "../ui/BookingKit";
import { QuoteBreakdown } from "../StudioQuoteRail";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface StepContactProps extends WizardStepProps {
  studio?: StudioItem;
  sessionType?: SessionTypeItem;
  breakdown: BookingPricingBreakdown;
  selectedCrewItems: Array<{ id: string; title: string; titleAr?: string; price: number; priceType: string }>;
  selectedPropItems: Array<{ id: string; title: string; titleAr?: string; price: number; priceType: string }>;
  selectedAddonItems: Array<{ id: string; title: string; titleAr?: string; price: number; priceType: string }>;
  onRemoveCrewItem: (id: string) => void;
  onRemovePropItem: (id: string) => void;
  onRemoveAddonItem: (id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepContact({
  state,
  update,
  sessionType,
  breakdown,
  selectedCrewItems,
  selectedPropItems,
  selectedAddonItems,
  onRemoveCrewItem,
  onRemovePropItem,
  onRemoveAddonItem,
  onSubmit,
  isSubmitting,
}: StepContactProps) {
  const { t } = useLanguage();
  const [promoDraft, setPromoDraft] = useState(state.promoCode || "");
  const sessionItem = sessionType || SESSION_TYPES.find((s) => s.id === state.sessionType) || SESSION_TYPES[0];

  return (
    <div>
      <StepIntro
        index={7}
        total={7}
        title={t("studioBooking.step7.title")}
        description={t("studioBooking.step7.description")}
      />

      <div className="space-y-4 sm:space-y-5">
        {/* Contact */}
        <Panel icon={UserRound} title={t("studioBooking.step7.contactTitle")} description={t("studioBooking.step7.contactDesc")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t("studioBooking.step7.firstNameLabel")} required>
              <input
                type="text"
                required
                autoComplete="given-name"
                value={state.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                placeholder={t("studioBooking.step7.firstNamePlaceholder")}
                className={fieldClass}
              />
            </Field>
            <Field label={t("studioBooking.step7.lastNameLabel")} required>
              <input
                type="text"
                required
                autoComplete="family-name"
                value={state.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                placeholder={t("studioBooking.step7.lastNamePlaceholder")}
                className={fieldClass}
              />
            </Field>
            <Field label={t("studioBooking.step7.emailLabel")} required>
              <input
                type="email"
                required
                autoComplete="email"
                value={state.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder={t("studioBooking.step7.emailPlaceholder")}
                className={fieldClass}
              />
            </Field>
            <Field label={t("studioBooking.step7.phoneLabel")} required>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={state.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder={t("studioBooking.step7.phonePlaceholder")}
                className={fieldClass}
                dir="ltr"
              />
            </Field>
            <Field label={t("studioBooking.step7.companyLabel")} className="sm:col-span-2">
              <input
                type="text"
                autoComplete="organization"
                value={state.company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder={t("studioBooking.step7.companyPlaceholder")}
                className={fieldClass}
              />
            </Field>
            <Field label={t("studioBooking.step7.specialRequestsLabel")} className="sm:col-span-2">
              <textarea
                rows={3}
                value={state.specialRequests}
                onChange={(e) => update({ specialRequests: e.target.value })}
                placeholder={t("studioBooking.step7.specialRequestsPlaceholder")}
                className={`${fieldClass} resize-none`}
              />
            </Field>
          </div>
        </Panel>

        {/* Promo Code */}
        <Panel icon={Tag} title={t("studioBooking.step7.promoTitle")} description={t("studioBooking.step7.promoDesc")}>
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={promoDraft}
              onChange={(e) => setPromoDraft(e.target.value.toUpperCase())}
              placeholder={t("studioBooking.step7.promoPlaceholder")}
              className={`${fieldClass} font-mono uppercase`}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => update({ promoCode: promoDraft.trim().toUpperCase() })}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-brand-violet text-white transition cursor-pointer shrink-0"
            >
              {t("studioBooking.step7.applyBtn")}
            </button>
            {state.promoCode && (
              <button
                type="button"
                onClick={() => {
                  setPromoDraft("");
                  update({ promoCode: "" });
                }}
                className="px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
              >
                {t("studioBooking.step7.clearBtn")}
              </button>
            )}
          </div>
          {breakdown.discount > 0 && state.promoCode && (
            <p className="text-xs text-emerald-400 font-medium mt-2">
              {t("studioBooking.step7.promoApplied", {
                code: state.promoCode,
                amount: formatAED(breakdown.discount),
              })}
            </p>
          )}
        </Panel>

        {/* Summary — desktop shows this in the side rail */}
        <Panel icon={ReceiptText} title={t("studioBooking.step7.summaryTitle")} className="lg:hidden">
          <QuoteBreakdown
            state={state}
            sessionType={sessionItem}
            breakdown={breakdown}
            selectedCrewItems={selectedCrewItems}
            selectedPropItems={selectedPropItems}
            selectedAddonItems={selectedAddonItems}
            onRemoveCrewItem={onRemoveCrewItem}
            onRemovePropItem={onRemovePropItem}
            onRemoveAddonItem={onRemoveAddonItem}
          />
        </Panel>

        {/* Payment */}
        <Panel icon={CreditCard} title={t("studioBooking.step7.paymentTitle")} description={t("studioBooking.step7.paymentDesc")}>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {t("studioBooking.step7.paymentInfo")}
          </p>
          <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
            {["Visa / Mastercard", "Apple Pay", "Google Pay"].map((m) => (
              <span
                key={m}
                className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-zinc-300 shrink-0 whitespace-nowrap"
              >
                {m}
              </span>
            ))}
          </div>
        </Panel>

        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          whileHover={isSubmitting ? undefined : { y: -1 }}
          whileTap={isSubmitting ? undefined : { scale: 0.98 }}
          transition={studioSprings.snappy}
          className="w-full h-10 sm:h-12 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl btn-brand text-xs sm:text-sm flex items-center justify-between gap-2 disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2 min-w-0">
            {isSubmitting ? <Loader2 size={15} className="animate-spin shrink-0" /> : <Lock size={14} className="shrink-0" />}
            <span className="truncate">
              {isSubmitting ? t("studioBooking.step7.submittingBtn") : t("studioBooking.step7.submitBtn")}
            </span>
          </span>
          <span className="font-mono text-xs sm:text-sm font-extrabold tabular-nums px-2.5 py-1 rounded-lg bg-black/25 text-white border border-white/10 shrink-0 whitespace-nowrap" dir="ltr">
            {formatAED(breakdown.total, 2)}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
