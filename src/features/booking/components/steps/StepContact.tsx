"use client";

import React from "react";
import type { WizardStepProps, StudioItem } from "../../types";
import { SESSION_TYPES, type BookingPricingBreakdown } from "../../constants";
import { Lock, UserRound, ReceiptText, CreditCard, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Field, Panel, StepIntro, fieldClass, formatAED, studioSprings } from "../ui/BookingKit";
import { QuoteBreakdown } from "../StudioQuoteRail";

interface StepContactProps extends WizardStepProps {
  studio?: StudioItem;
  breakdown: BookingPricingBreakdown;
  selectedCrewItems: Array<{ id: string; title: string; price: number; priceType: string }>;
  selectedPropItems: Array<{ id: string; title: string; price: number; priceType: string }>;
  selectedAddonItems: Array<{ id: string; title: string; price: number; priceType: string }>;
  onRemoveCrewItem: (id: string) => void;
  onRemovePropItem: (id: string) => void;
  onRemoveAddonItem: (id: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepContact({
  state,
  update,
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
  const sessionItem = SESSION_TYPES.find((s) => s.id === state.sessionType) || SESSION_TYPES[0];

  return (
    <div>
      <StepIntro
        index={7}
        total={7}
        title="Confirm & Pay"
        description="Add your contact details, review the quote, then pay securely via Ziina."
      />

      <div className="space-y-4 sm:space-y-5">
        {/* Contact */}
        <Panel icon={UserRound} title="Contact details" description="We'll send your confirmation and call sheet here">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="First name" required>
              <input
                type="text"
                required
                autoComplete="given-name"
                value={state.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
                placeholder="John"
                className={fieldClass}
              />
            </Field>
            <Field label="Last name" required>
              <input
                type="text"
                required
                autoComplete="family-name"
                value={state.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
                placeholder="Doe"
                className={fieldClass}
              />
            </Field>
            <Field label="Email" required>
              <input
                type="email"
                required
                autoComplete="email"
                value={state.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="john@example.com"
                className={fieldClass}
              />
            </Field>
            <Field label="Phone / WhatsApp" required>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={state.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+971 50 000 0000"
                className={fieldClass}
              />
            </Field>
            <Field label="Company" className="sm:col-span-2">
              <input
                type="text"
                autoComplete="organization"
                value={state.company}
                onChange={(e) => update({ company: e.target.value })}
                placeholder="Your company (optional)"
                className={fieldClass}
              />
            </Field>
            <Field label="Special requests" className="sm:col-span-2">
              <textarea
                rows={3}
                value={state.specialRequests}
                onChange={(e) => update({ specialRequests: e.target.value })}
                placeholder="Shot list, references, accessibility needs…"
                className={`${fieldClass} resize-none`}
              />
            </Field>
          </div>
        </Panel>

        {/* Summary — desktop shows this in the side rail */}
        <Panel icon={ReceiptText} title="Booking summary" className="lg:hidden">
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
        <Panel icon={CreditCard} title="Payment" description="Secure payment powered by Ziina">
          <p className="text-xs text-zinc-400 leading-relaxed">
            A secure payment window opens on this page after you continue. Pay by credit/debit card, Apple Pay, or Google Pay.
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {["Visa / Mastercard", "Apple Pay", "Google Pay"].map((m) => (
              <span
                key={m}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-[10px] tracking-wider uppercase text-zinc-300"
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
          whileHover={isSubmitting ? undefined : { y: -2 }}
          whileTap={isSubmitting ? undefined : { scale: 0.98 }}
          transition={studioSprings.snappy}
          className="w-full min-h-[54px] px-6 rounded-2xl bg-brand-mauve hover:bg-brand-mauve-soft text-zinc-950 font-bold text-sm flex items-center justify-between gap-3 shadow-[0_18px_40px_-16px_rgba(152,123,165,0.7)] disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
            {isSubmitting ? "Creating booking…" : "Complete booking & pay"}
          </span>
          <span className="font-mono tabular-nums px-2.5 py-1 rounded-lg bg-black/10">{formatAED(breakdown.total, 2)}</span>
        </motion.button>
      </div>
    </div>
  );
}
