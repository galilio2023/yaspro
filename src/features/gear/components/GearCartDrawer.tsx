"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Building2,
  Calendar,
  X,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GearItem, RentalDateRange, DeliveryMethod } from "../types";
import { Badge } from "@/components/ui/badge";

const emptySubscribe = () => () => {};

interface GearCartDrawerProps {
  items: GearItem[];
  dateRange: RentalDateRange;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  checkoutHref?: string;
}

export function GearCartDrawer({
  items,
  dateRange,
  onRemoveItem,
  checkoutHref = "/contact",
}: GearCartDrawerProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("studio_delivery");

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Automatically close breakdown modal when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && isOpen) {
      setIsOpen(false);
    }
  }, [items.length, isOpen]);

  // Lock body scroll and manage focus trap & escape key when breakdown modal is open
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (!panelRef.current) return;
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow || "";
      triggerButtonRef.current?.focus();
    };
  }, [isOpen, items.length]);

  // Signal to global floating widgets (e.g. WhatsApp concierge) that bottom cart bar is active
  useEffect(() => {
    if (items.length > 0) {
      document.body.dataset.hasBottomCart = "true";
    } else {
      delete document.body.dataset.hasBottomCart;
    }
    return () => {
      delete document.body.dataset.hasBottomCart;
    };
  }, [items.length]);

  if (items.length === 0) return null;

  // Calculation
  const baseDayRate = items.reduce((acc, curr) => acc + curr.dailyRate, 0);
  const rentalSubtotal = baseDayRate * dateRange.billingMultiplier;
  const deliveryFee = deliveryMethod === "courier_dubai" ? 250 : 0;
  const grandTotal = rentalSubtotal + deliveryFee;
  const totalDeposit = items.reduce((acc, curr) => acc + (curr.securityDeposit || curr.dailyRate * 1.5), 0);

  return (
    <>
      {/* Floating Bottom Bar: Centered on desktop, elevated on mobile */}
      <aside
        aria-label="Rental selection summary"
        className="fixed bottom-4 inset-x-3 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[640px] max-w-2xl z-40 animate-fade-up"
      >
        <div className="rounded-2xl border border-brand-purple/40 bg-black/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl shadow-brand-purple/20 flex items-center justify-between gap-4">
          <button
            ref={triggerButtonRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl"
            aria-expanded={isOpen}
          >
            <div className="size-11 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light group-hover:scale-105 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <span>{items.length} {items.length === 1 ? "Item Selected" : "Items Selected"}</span>
                <span className="text-[11px] text-brand-purple-light font-normal hover:underline">
                  {isOpen ? "Close details" : "Review Kit"}
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{dateRange.totalDays} Days ({dateRange.billingMultiplier} billed)</span>
                <span>•</span>
                <span className="text-brand-purple-light font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary bg-white/5 hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            >
              {isOpen ? "Hide" : "Details"}
            </button>

            <Link
              href={`${checkoutHref}?service=gear-rental&items=${items.map((i) => i.id).join(",")}&days=${dateRange.totalDays}`}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center gap-2 shadow-lg shadow-brand-purple/25 whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            >
              <span>Reserve Gear</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Expanded Breakdown Modal / Sheet (Portaled to document.body) */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-up select-none"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-cart-title"
            tabIndex={-1}
            className="w-full max-w-xl max-h-[85vh] bg-card border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden select-text outline-none"
            onClick={(e) => e.stopPropagation()}
            aria-hidden="false"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple-light">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h3 id="rental-cart-title" className="text-white font-bold text-base font-display">
                    Rental Package Breakdown
                  </h3>
                  <p className="text-xs text-text-muted">
                    Dubai Production Hub • Instant Quote Estimate
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                aria-label="Close cart breakdown"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Selected Equipment ({items.length})
              </p>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-purple/30 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.image && (
                      <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">
                          {item.name}
                        </span>
                        {item.isKit && (
                          <Badge variant="cyan" className="text-[9px] px-1.5 py-0 shrink-0">
                            Kit
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {formatCurrency(item.dailyRate)} / day
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono text-white">
                      {formatCurrency(item.dailyRate * dateRange.billingMultiplier)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-text-muted hover:text-red-400 transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery Method Options */}
              <div className="pt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  Delivery &amp; Fulfillment in UAE
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("studio_delivery")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      deliveryMethod === "studio_delivery"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Building2 size={16} className="text-brand-purple mb-1.5" />
                    <div className="text-xs font-bold">To Yas Studio</div>
                    <div className="text-[10px] text-text-muted">Free with Soundstage</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("courier_dubai")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      deliveryMethod === "courier_dubai"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Truck size={16} className="text-brand-cyan mb-1.5" />
                    <div className="text-xs font-bold">Dubai Courier</div>
                    <div className="text-[10px] text-text-muted">+250 AED Delivery</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup_hub")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      deliveryMethod === "pickup_hub"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <ShieldCheck size={16} className="text-amber-400 mb-1.5" />
                    <div className="text-xs font-bold">Hub Pickup</div>
                    <div className="text-[10px] text-text-muted">Business Bay Free</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-text-muted" />
                  <span>
                    {dateRange.pickupDate} to {dateRange.returnDate} ({dateRange.totalDays} Days)
                  </span>
                </span>
                <span className="text-brand-purple-light font-medium">
                  {dateRange.discountPercentage > 0
                    ? `${dateRange.discountPercentage}% Discount Applied`
                    : "Standard Tier"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Refundable Deposit (Hold):</span>
                <span className="text-text-muted font-mono">{formatCurrency(totalDeposit)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="text-xs text-text-muted block">Total Rental Fee:</span>
                  <span className="text-xl font-extrabold text-white font-display">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <Link
                  href={`${checkoutHref}?service=gear-rental&items=${items.map((i) => i.id).join(",")}&days=${dateRange.totalDays}&delivery=${deliveryMethod}`}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center gap-2 shadow-lg shadow-brand-purple/30 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                >
                  <span>Submit Reservation</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
