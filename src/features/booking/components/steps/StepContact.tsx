"use client";

import React from "react";
import type { WizardStepProps, StudioItem } from "../../types";
import { SESSION_TYPES, STUDIOS } from "../../constants";
import { Lock, X } from "lucide-react";

interface StepContactProps extends WizardStepProps {
  studio?: StudioItem;
  breakdown: {
    sessionCost: number;
    subtotal: number;
    tax: number;
    total: number;
  };
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
  studio,
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
  const duration = state.durationHours || 1;
  const currentStudio = studio || STUDIOS[0];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Complete Your Booking</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Enter your contact details, then pay securely via Ziina
        </p>
      </div>

      {/* 1. Contact Information Form */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-zinc-300">Contact Information</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={state.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              placeholder="John"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={state.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              placeholder="Doe"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              value={state.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-300">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              required
              value={state.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="+971 50 000 0000"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-300">Company</label>
          <input
            type="text"
            value={state.company}
            onChange={(e) => update({ company: e.target.value })}
            placeholder="Your company (optional)"
            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-medium text-zinc-300">Special Requests</label>
          <textarea
            rows={3}
            value={state.specialRequests}
            onChange={(e) => update({ specialRequests: e.target.value })}
            placeholder="Any special requirements..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d111a] border border-white/10 text-white text-base sm:text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
          />
        </div>
      </div>

      {/* 2. Booking Summary Box */}
      <div className="bg-[#0b0e17] rounded-2xl border border-white/10 p-4 sm:p-5 space-y-4">
        <div className="text-xs font-semibold text-zinc-300">Booking Summary</div>

        <div className="space-y-2.5 text-xs">
          {/* Base Session */}
          <div className="flex items-center justify-between text-zinc-300">
            <span>
              {sessionItem?.title || "Session"} ({duration}h)
            </span>
            <span className="font-semibold text-white">
              AED {(sessionItem ? sessionItem.price * duration : 0).toFixed(2)}
            </span>
          </div>

          {/* Studio */}
          <div className="flex items-center justify-between text-zinc-300">
            <span>{currentStudio?.name || "Studio"}</span>
            <span className="text-zinc-400">Included</span>
          </div>

          {/* Post Production Services */}
          {selectedAddonItems.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="text-[11px] font-bold text-[#8b5cf6]">Post Production Services:</div>
              {selectedAddonItems.map((item) => {
                const itemCost = item.priceType === "hourly" ? item.price * duration : item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between text-zinc-300 pl-2">
                    <span>{item.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">AED {itemCost.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveAddonItem(item.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5 rounded"
                        title="Remove"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Crew & Equipment */}
          {selectedCrewItems.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="text-[11px] font-bold text-[#8b5cf6]">Crew &amp; Equipment:</div>
              {selectedCrewItems.map((item) => {
                const itemCost = item.priceType === "hourly" ? item.price * duration : item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between text-zinc-300 pl-2">
                    <span>{item.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">AED {itemCost.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveCrewItem(item.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5 rounded"
                        title="Remove"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Props & Set Design */}
          {selectedPropItems.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="text-[11px] font-bold text-[#8b5cf6]">Props &amp; Set Design:</div>
              {selectedPropItems.map((item) => {
                const itemCost = item.priceType === "hourly" ? item.price * duration : item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between text-zinc-300 pl-2">
                    <span>{item.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">AED {itemCost.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => onRemovePropItem(item.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5 rounded"
                        title="Remove"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tax */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-zinc-400">
            <span>Tax</span>
            <span>AED {breakdown.tax.toFixed(2)}</span>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="font-bold text-white text-sm">Total</span>
            <span className="font-extrabold text-[#8b5cf6] text-base">
              AED {breakdown.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Payment Box (Ziina branding) */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-zinc-300">Payment</div>

        <div className="bg-[#0b0e17] rounded-2xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Lock size={13} className="text-[#8b5cf6]" />
            <span>
              Secure payment powered by{" "}
              <span className="text-[#8b5cf6] font-bold">Ziina</span>
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            After clicking the button below, a secure payment window will open on this page. You can pay by credit/debit card, Apple Pay, or Google Pay.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400 font-medium">
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
              💳 Card
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
              Apple Pay
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
              Google Pay
            </span>
          </div>
        </div>
      </div>

      {/* Submit CTA */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer active:scale-[0.99]"
      >
        <Lock size={14} />
        <span>{isSubmitting ? "Creating Booking..." : "Complete Booking & Pay"}</span>
      </button>
    </div>
  );
}
