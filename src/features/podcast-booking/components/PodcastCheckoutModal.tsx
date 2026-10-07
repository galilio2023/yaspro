"use client";

import { useState } from "react";
import { X, ShieldCheck, CreditCard, AlertCircle, Tag } from "lucide-react";
import { PodcastSessionItem, PodcastBookingContact } from "../types";
import { PODCAST_STUDIOS, PODCAST_SERVICES, PODCAST_ADDONS } from "../data";

interface PodcastCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export function PodcastCheckoutModal({
  isOpen,
  onClose,
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
}: PodcastCheckoutModalProps) {
  const [promoInput, setPromoInput] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div
        className="relative w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Final Step
            </span>
            <h3 className="text-xl font-bold text-white">
              Review details & complete booking
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Booking Summary Box */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
              Booking details ({sessions.length} {sessions.length === 1 ? "Session" : "Sessions"})
            </h4>

            {sessions.map((sess, idx) => {
              const std = PODCAST_STUDIOS.find((s) => s.key === sess.studioKey);
              const svc = PODCAST_SERVICES.find((s) => s.key === sess.serviceKey);

              const selectedAddons = Object.entries(sess.addons || {})
                .filter(([, qty]) => qty > 0)
                .map(([k, qty]) => {
                  const ad = PODCAST_ADDONS.find((a) => a.key === k);
                  return `${ad?.title || k} (x${qty})`;
                });

              return (
                <div key={sess.id} className="text-xs space-y-1.5 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex justify-between font-bold text-white text-sm">
                    <span>Session {idx + 1}</span>
                    <span className="text-amber-400">
                      AED {((svc?.price || 0) * sess.durationHours).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-muted">
                    <div>
                      <span className="text-white/40 block">Studio:</span>
                      <span className="text-white font-medium">{std?.name} ({sess.headcount} seats)</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Service:</span>
                      <span className="text-white font-medium">{svc?.title}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/40 block">Date & Time:</span>
                      <span className="text-white font-medium">
                        {sess.date} • {sess.timeSlot} ({sess.durationHours}h duration)
                      </span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="col-span-2 pt-1">
                        <span className="text-white/40 block">Add-ons:</span>
                        <span className="text-amber-300/80">{selectedAddons.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes & Special Requests */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-white/80">
              💬 Any special requests or note? (Optional)
            </label>
            <textarea
              rows={2}
              value={contact.specialRequests || ""}
              onChange={(e) => onUpdateContact({ specialRequests: e.target.value })}
              placeholder="Please share anything you'd like our studio engineer to prepare..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Promo Code Box */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
                <Tag size={13} className="text-amber-400" />
                Promo code
              </label>
              {appliedPromo && (
                <button
                  type="button"
                  onClick={onRemovePromo}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Remove ({appliedPromo})
                </button>
              )}
            </div>

            {appliedPromo ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between font-semibold">
                <span>Code {appliedPromo} applied!</span>
                <span>−AED {promoDiscount}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Try YAS10 or PODCAST20"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 uppercase focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => onApplyPromo(promoInput)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-amber-500 hover:text-black text-white transition"
                >
                  Use code
                </button>
              </div>
            )}
            {promoError && (
              <p className="text-[11px] text-rose-400">{promoError}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/70">
              Personal Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-white/60 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={contact.fullName}
                  onChange={(e) => onUpdateContact({ fullName: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => onUpdateContact({ email: e.target.value })}
                    placeholder="sarah@agency.ae"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={contact.phone}
                    onChange={(e) => onUpdateContact({ phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Storage notice from live WordPress site */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Important Storage Notice:</strong> If you are not using our post-production editing services, please bring your own high-speed external hard drive (SSD) to collect your raw 4K footage and multi-track audio immediately after the session.
            </p>
          </div>

          {/* Pricing Total Summary */}
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-white/70">
              <span>Total Services:</span>
              <span>AED {subtotal.toLocaleString()}</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Discount ({appliedPromo}):</span>
                <span>−AED {promoDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-white/70">
              <span>VAT (0%):</span>
              <span>AED 0</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-base font-extrabold text-white">
              <span>Total Amount:</span>
              <span className="text-2xl text-amber-400">
                AED {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isAgreedToTerms}
              onChange={(e) => onToggleTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-xs text-text-muted leading-relaxed group-hover:text-white transition">
              I agree to the Yas Pro Studio Terms & Conditions, studio cancellation policy, and file transfer guidelines.
            </span>
          </label>

          {/* Ziina Checkout Button */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting || !isAgreedToTerms}
              onClick={() => onSubmit(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-black font-extrabold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Processing Reservation...</>
              ) : (
                <>
                  <CreditCard size={18} />
                  Pay Now AED {grandTotal.toLocaleString()} (Ziina • Apple Pay / Card)
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting || !isAgreedToTerms}
              onClick={() => onSubmit(false)}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold transition disabled:opacity-50"
            >
              Reserve Session & Pay at Studio
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-white/40 pt-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Direct encrypted checkout via Ziina • UAE Central Bank regulated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
