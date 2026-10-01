"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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
  Sparkles,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { GearItem, RentalDateRange } from "../types";
import { Badge } from "@/components/ui/badge";
import { getGearRecommendations } from "../lib/gear-rules";
import { calculateGearCartTotals } from "../lib/cart-pricing";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCart } from "@/components/providers/CartProvider";
import { GearCheckoutModal } from "./GearCheckoutModal";

const emptySubscribe = () => () => {};

interface GearCartDrawerProps {
  items?: GearItem[];
  dateRange?: RentalDateRange;
  onRemoveItem?: (id: string) => void;
  onAddItem?: (item: GearItem) => void;
  onClearCart?: () => void;
  checkoutHref?: string;
}

export function GearCartDrawer({
  items,
  dateRange,
  onRemoveItem,
  onAddItem,
  onClearCart,
}: GearCartDrawerProps) {
  const { isArabic } = useLanguage();
  const cartContext = useCart();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const effectiveItems = items ?? cartContext.items;
  const effectiveDateRange = dateRange ?? cartContext.dateRange;
  const effectiveDeliveryMethod = cartContext.deliveryMethod;
  const setEffectiveDeliveryMethod = cartContext.setDeliveryMethod;
  const handleRemove = onRemoveItem ?? cartContext.removeItem;
  const handleAdd = onAddItem ?? cartContext.addItem;
  const handleClear = onClearCart ?? cartContext.clearCart;

  const [localOpen, setLocalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isOpen = localOpen || cartContext.isCartOpen;

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Automatically close breakdown modal when cart becomes empty
  const [prevItemsCount, setPrevItemsCount] = useState(effectiveItems.length);
  if (effectiveItems.length !== prevItemsCount) {
    setPrevItemsCount(effectiveItems.length);
    if (effectiveItems.length === 0 && isOpen) {
      setLocalOpen(false);
      cartContext.closeCart();
    }
  }

  const handleClose = useCallback(() => {
    setLocalOpen(false);
    cartContext.closeCart();
  }, [cartContext]);

  useFocusTrap({
    isOpen: isOpen && effectiveItems.length > 0,
    onClose: handleClose,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
  });

  // Lock body scroll when breakdown modal is open
  useEffect(() => {
    if (!isOpen || effectiveItems.length === 0) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isOpen, effectiveItems.length]);

  // Signal to global floating widgets (e.g. WhatsApp concierge) that bottom cart bar is active
  useEffect(() => {
    if (effectiveItems.length > 0) {
      document.body.dataset.hasBottomCart = "true";
    } else {
      delete document.body.dataset.hasBottomCart;
    }
    return () => {
      delete document.body.dataset.hasBottomCart;
    };
  }, [effectiveItems.length]);

  if (effectiveItems.length === 0) return null;

  // Calculation — only destructure what is rendered in the UI
  const { grandTotal, totalDeposit } =
    calculateGearCartTotals(effectiveItems, effectiveDateRange, effectiveDeliveryMethod);

  const smartRecommendations = getGearRecommendations(effectiveItems.map((i) => i.id));

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
            onClick={() => {
              if (isOpen) handleClose();
              else setLocalOpen(true);
            }}
            className="flex items-center gap-3 text-start group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-xl"
            aria-expanded={isOpen}
          >
            <div className="size-11 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light group-hover:scale-105 transition-transform shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <span>
                  {effectiveItems.length}{" "}
                  {isArabic
                    ? effectiveItems.length === 1
                      ? "معدة محددة"
                      : "معدات محددة"
                    : effectiveItems.length === 1
                    ? "Item Selected"
                    : "Items Selected"}
                </span>
                <span className="text-[11px] text-brand-purple-light font-normal hover:underline">
                  {isOpen
                    ? isArabic
                      ? "إغلاق التفاصيل"
                      : "Close details"
                    : isArabic
                    ? "مراجعة الباقة"
                    : "Review Kit"}
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>
                  {effectiveDateRange.totalDays} {isArabic ? "أيام" : "Days"} (
                  {isArabic
                    ? `${effectiveDateRange.billingMultiplier} أيام فوترة`
                    : `${effectiveDateRange.billingMultiplier} billed`}
                  )
                </span>
                <span>•</span>
                <span className="text-brand-purple-light font-bold">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (isOpen) handleClose();
                else setLocalOpen(true);
              }}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-semibold text-text-secondary bg-white/5 hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            >
              {isOpen ? (isArabic ? "إخفاء" : "Hide") : isArabic ? "التفاصيل" : "Details"}
            </button>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center gap-2 shadow-lg shadow-brand-purple/25 whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
            >
              <span>{isArabic ? "حجز المعدات" : "Reserve Gear"}</span>
              <ArrowRight size={14} className="rtl:rotate-180" />
            </button>
          </div>
        </div>
      </aside>

      {/* Expanded Breakdown Modal / Sheet (Portaled to document.body) */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-fade-up select-none"
          onClick={handleClose}
          aria-hidden="true"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rental-cart-title"
            tabIndex={-1}
            className="w-full sm:max-w-sm max-h-[85vh] bg-card border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col overflow-hidden select-text outline-none"
            onClick={(e) => e.stopPropagation()}
            aria-hidden="false"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple-light shrink-0">
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <h3 id="rental-cart-title" className="text-white font-bold text-base font-display">
                    {isArabic ? "تفاصيل باقة استئجار المعدات" : "Rental Package Breakdown"}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {isArabic ? "مركز إنتاج دبي • تقدير فوري للتكلفة" : "Dubai Production Hub • Instant Quote Estimate"}
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={handleClose}
                className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple shrink-0"
                aria-label={isArabic ? "إغلاق التفاصيل" : "Close cart breakdown"}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {isArabic
                  ? `المعدات المحددة (${effectiveItems.length})`
                  : `Selected Equipment (${effectiveItems.length})`}
              </p>

              {effectiveItems.map((item) => {
                const itemName = isArabic && item.arabicName ? item.arabicName : item.name;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-purple/30 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.image && (
                        <div className="relative size-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                          <Image
                            src={item.image}
                            alt={itemName}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {itemName}
                          </span>
                          {item.isKit && (
                            <Badge variant="cyan" className="text-[9px] px-1.5 py-0 shrink-0">
                              {isArabic ? "باقة" : "Kit"}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted">
                          {formatCurrency(item.dailyRate)} {isArabic ? "/ يوم" : "/ day"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold font-mono text-white">
                        {formatCurrency(item.dailyRate * effectiveDateRange.billingMultiplier)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-text-muted hover:text-red-400 transition-colors p-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg"
                        aria-label={`Remove ${itemName}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Smart Production Assistant Recommendations */}
              {smartRecommendations.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-purple/15 to-brand-cyan/10 border border-brand-purple/30 my-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-brand-gold animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-white font-display">
                      {isArabic ? "المساعد الذكي: معدات موصى بها مع باقتك" : "Smart Production Assistant: Recommended Essentials"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {smartRecommendations.map((rec) => {
                      const recName = isArabic && rec.recommendedItem.arabicName ? rec.recommendedItem.arabicName : rec.recommendedItem.name;
                      return (
                        <div
                          key={rec.recommendedItem.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/60 border border-white/10 gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {recName}
                              </span>
                              <Badge variant={rec.badge === "Essential" ? "purple" : "cyan"} className="text-[8px] px-1.5 py-0 shrink-0">
                                {isArabic
                                  ? rec.badge === "Essential"
                                    ? "ضروري"
                                    : "موصى به"
                                  : rec.badge}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">
                              {rec.reason}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-mono text-brand-purple-light font-bold">
                              +{formatCurrency(rec.recommendedItem.dailyRate)}{isArabic ? "/يوم" : "/d"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAdd(rec.recommendedItem)}
                              className="px-2.5 py-1 rounded-lg bg-brand-purple hover:bg-brand-purple-light text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                            >
                              <Plus size={11} />
                              <span>{isArabic ? "إضافة" : "Add"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Method Options */}
              <div className="pt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                  {isArabic ? "طريقة الاستلام والتوصيل في الإمارات" : "Delivery & Fulfillment in UAE"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEffectiveDeliveryMethod("studio_delivery")}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      effectiveDeliveryMethod === "studio_delivery"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Building2 size={16} className="text-brand-purple mb-1.5" />
                    <div className="text-xs font-bold">{isArabic ? "إلى استوديو Yas" : "To Yas Studio"}</div>
                    <div className="text-[10px] text-text-muted">{isArabic ? "مجاناً مع حجز الاستوديو" : "Free with Soundstage"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEffectiveDeliveryMethod("courier_dubai")}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      effectiveDeliveryMethod === "courier_dubai"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <Truck size={16} className="text-brand-cyan mb-1.5" />
                    <div className="text-xs font-bold">{isArabic ? "توصيل دبي" : "Dubai Courier"}</div>
                    <div className="text-[10px] text-text-muted">{isArabic ? "+250 درهم توصيل" : "+250 AED Delivery"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEffectiveDeliveryMethod("pickup_hub")}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple ${
                      effectiveDeliveryMethod === "pickup_hub"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    }`}
                  >
                    <ShieldCheck size={16} className="text-amber-400 mb-1.5" />
                    <div className="text-xs font-bold">{isArabic ? "استلام من المقر" : "Hub Pickup"}</div>
                    <div className="text-[10px] text-text-muted">{isArabic ? "الخليج التجاري مجاناً" : "Business Bay Free"}</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Summary */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-text-muted shrink-0" />
                  <span>
                    {effectiveDateRange.pickupDate} {isArabic ? "إلى" : "to"} {effectiveDateRange.returnDate} ({effectiveDateRange.totalDays} {isArabic ? "أيام" : "Days"})
                  </span>
                </span>
                <span className="text-brand-purple-light font-medium">
                  {effectiveDateRange.discountPercentage > 0
                    ? isArabic
                      ? `تم تطبيق خصم ${effectiveDateRange.discountPercentage}%`
                      : `${effectiveDateRange.discountPercentage}% Discount Applied`
                    : isArabic
                    ? "السعر اليومي القياسي"
                    : "Standard Tier"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{isArabic ? "مبلغ التأمين المسترد (معلق):" : "Refundable Deposit (Hold):"}</span>
                <span className="text-text-muted font-mono">{formatCurrency(totalDeposit)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div>
                  <span className="text-xs text-text-muted block">{isArabic ? "إجمالي رسوم الإيجار:" : "Total Rental Fee:"}</span>
                  <span className="text-xl font-extrabold text-white font-display">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setIsCheckoutOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center gap-2 shadow-lg shadow-brand-purple/30 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple shrink-0 cursor-pointer"
                >
                  <span>{isArabic ? "تأكيد طلب الحجز" : "Submit Reservation"}</span>
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Multi-Item Gear Checkout Modal */}
      <GearCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={effectiveItems}
        dateRange={effectiveDateRange}
        deliveryMethod={effectiveDeliveryMethod}
        grandTotal={grandTotal}
        totalDeposit={totalDeposit}
        onOrderCompleted={() => {
          handleClear();
          setIsCheckoutOpen(false);
          handleClose();
        }}
      />
    </>
  );
}
