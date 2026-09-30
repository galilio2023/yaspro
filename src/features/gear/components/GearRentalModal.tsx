"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Send,
  MessageCircle,
  Camera,
  Box,
  Building,
} from "lucide-react";
import { GearItem } from "../types";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { submitGearReservation } from "@/lib/actions/equipment-gear";

const emptySubscribe = () => () => {};

interface GearRentalModalProps {
  item: GearItem | null;
  isOpen: boolean;
  onClose: () => void;
  initialDurationDays?: number;
}

export function GearRentalModal({
  item,
  isOpen,
  onClose,
  initialDurationDays = 1,
}: GearRentalModalProps) {
  const { isArabic } = useLanguage();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [durationDays, setDurationDays] = useState<number>(initialDurationDays);
  const [deliveryMethod, setDeliveryMethod] = useState<"soundstage" | "dubai_courier" | "hub_pickup">("soundstage");
  const [viewMode, setViewMode] = useState<"overview" | "form" | "confirmed">("overview");

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  // Sync initial duration
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDurationDays(initialDurationDays);
      setViewMode("overview");
      setErrorMessage(null);
      setConfirmationCode(null);
    }
  }, [isOpen, initialDurationDays]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !item) return null;

  // Pricing calculations
  const discountMultiplier = durationDays >= 7 ? 0.65 : durationDays >= 3 ? 0.8 : 1.0;
  const effectiveDailyRate = Math.round(item.dailyRate * discountMultiplier);
  const deliveryFee = deliveryMethod === "dubai_courier" ? 250 : 0;
  const subtotal = effectiveDailyRate * durationDays;
  const grandTotal = subtotal + deliveryFee;
  const deposit = item.securityDeposit || 0;

  const displayName = isArabic && item.arabicName ? item.arabicName : item.name;
  const displayDescription = isArabic && item.arabicDescription ? item.arabicDescription : item.description;

  // WhatsApp Pre-filled Link
  const waText = encodeURIComponent(
    `Hello Yas Pro Gear Team! 🎬\nI want to reserve the *${item.name}* (${item.categoryLabel}).\n- Duration: ${durationDays} Day(s)\n- Delivery: ${deliveryMethod}\n- Estimated Rental: AED ${grandTotal.toLocaleString()}\nPlease confirm availability for upcoming shoot dates.`
  );
  const whatsAppUrl = `https://wa.me/971501234567?text=${waText}`;

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      setErrorMessage(isArabic ? "يرجى ملء الاسم ورقم الهاتف والبريد الإلكتروني" : "Please fill in Name, Phone, and Email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitGearReservation({
      gearId: item.id,
      gearName: item.name,
      customerName,
      email,
      phone,
      company,
      durationDays,
      deliveryMethod,
      estimatedTotal: grandTotal,
      notes,
    });

    setIsSubmitting(false);

    if (res.success && res.data?.referenceCode) {
      setConfirmationCode(res.data.referenceCode);
      setViewMode("confirmed");
    } else {
      setErrorMessage(res.error || (isArabic ? "حدث خطأ أثناء إرسال الحجز، يرجى المحاولة لاحقاً" : "Failed to submit reservation. Please try WhatsApp."));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gear-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-up overflow-y-auto"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl my-auto rounded-3xl border border-white/15 bg-[#0b0918] shadow-2xl shadow-brand-purple/20 overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
              {item.categoryLabel} · {isArabic ? "حجز وتأجير فوري" : "Instant Gear Reservation"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {viewMode === "confirmed" ? (
            /* Confirmation Screen */
            <div className="py-8 text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white font-display">
                {isArabic ? "تم استلام طلب الحجز بنجاح!" : "Reservation Request Confirmed!"}
              </h3>
              <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
                {isArabic
                  ? "تم تسجيل طلبك في نظام التوزيع المركزي لدينا. سيتواصل معك مهندس الإنتاج خلال 15 دقيقة لتأكيد مواعيد التسليم والفحص الفني."
                  : "Your equipment hold has been logged in our dispatch system. An engineer will contact you within 15 minutes to coordinate calibration and set delivery."}
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 inline-block text-center font-mono">
                <span className="text-[11px] text-text-muted uppercase block">
                  {isArabic ? "رقم المرجع التأجيري" : "Booking Reference"}
                </span>
                <span className="text-xl font-bold text-brand-cyan tracking-wider">
                  {confirmationCode}
                </span>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle size={15} />
                  <span>{isArabic ? "متابعة فورية عبر واتساب" : "Chat with Dispatch on WhatsApp"}</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-semibold transition-all cursor-pointer"
                >
                  {isArabic ? "إغلاق النافذة" : "Close Window"}
                </button>
              </div>
            </div>
          ) : viewMode === "form" ? (
            /* Online Booking Form */
            <form onSubmit={handleSubmitReservation} className="space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white font-display">
                    {isArabic ? "تأكيد بيانات المستأجر" : "Filmmaker & Production Details"}
                  </h4>
                  <p className="text-xs text-text-muted">
                    {item.name} · {durationDays} {isArabic ? "أيام" : "Day(s)"} · Total: {formatCurrency(grandTotal)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode("overview")}
                  className="text-xs text-brand-purple-light hover:underline cursor-pointer"
                >
                  ← {isArabic ? "تعديل المدة" : "Back to Specs"}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isArabic ? "مثال: طارق المنصوري" : "e.g. John Doe"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dp@production.ae"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "جهة الإنتاج / الشركة" : "Production Company / Agency"}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={isArabic ? "اختياري" : "Optional"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  {isArabic ? "ملاحظات إضافية أو ملحقات خاصة" : "Special Requests or Call Sheet Notes"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isArabic ? "مثال: موعد استلام باكر، إضافة عدسة 50mm، توصيل لموقع صحراوي..." : "e.g. Early morning call, specific lens mount, location delivery..."}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-text-muted font-mono">
                  Total: <strong className="text-white text-sm">{formatCurrency(grandTotal)}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer flex items-center gap-2 shadow-lg shadow-brand-purple/30"
                >
                  {isSubmitting ? (
                    <span>{isArabic ? "جاري الإرسال..." : "Submitting..."}</span>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>{isArabic ? "تأكيد طلب الحجز" : "Confirm Express Hold"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Standard Quick-View Overview */
            <>
              {/* Product Visual & Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/60 border border-white/10">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 350px"
                    />
                  ) : (
                    <div className="flex items-center justify-center size-full">
                      <Camera size={44} className="text-white/20" />
                    </div>
                  )}

                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
                      {item.category.toUpperCase()}
                    </span>
                    {item.isPopular && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        ★ {isArabic ? "الأكثر طلباً" : "Popular"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-2.5">
                  <h3 id="gear-modal-title" className="text-2xl font-bold text-white font-display">
                    {displayName}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {displayDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.specs.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-brand-purple-light font-mono"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Turnkey Inclusions (if Kit) */}
              {item.isKit && item.includedInKit && item.includedInKit.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-brand-purple/20">
                  <div className="flex items-center gap-2 mb-2 text-brand-cyan text-xs font-bold font-mono">
                    <Box size={14} />
                    <span>{isArabic ? "محتويات باقة التصوير المتكاملة:" : "Turnkey Package Rig Includes:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                    {item.includedInKit.map((inc) => (
                      <div key={inc} className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-brand-purple shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Duration Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                  {isArabic ? "اختر مدة التأجير:" : "Select Rental Duration Tier:"}
                </span>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDurationDays(1)}
                    className={cn(
                      "p-3 rounded-2xl border text-center transition-all cursor-pointer",
                      durationDays === 1
                        ? "bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/20"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <div className="text-xs font-bold">{isArabic ? "يوم واحد" : "1 Day"}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{isArabic ? "السعر اليومي" : "Standard"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationDays(3)}
                    className={cn(
                      "p-3 rounded-2xl border text-center transition-all cursor-pointer relative",
                      durationDays === 3
                        ? "bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/20"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <span className="absolute -top-2 inset-x-0 mx-auto w-max px-2 py-0.2 rounded-full bg-brand-cyan text-black text-[9px] font-extrabold uppercase">
                      {isArabic ? "خصم 20%" : "20% Off"}
                    </span>
                    <div className="text-xs font-bold">{isArabic ? "عطلة نهاية الأسبوع (3 أيام)" : "3-Day Weekend"}</div>
                    <div className="text-[10px] text-brand-cyan/90 mt-0.5">{isArabic ? "ادفع يومين واحصل على الثالث" : "Weekend Deal"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDurationDays(7)}
                    className={cn(
                      "p-3 rounded-2xl border text-center transition-all cursor-pointer relative",
                      durationDays === 7
                        ? "bg-brand-purple/20 border-brand-purple text-white shadow-lg shadow-brand-purple/20"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <span className="absolute -top-2 inset-x-0 mx-auto w-max px-2 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-extrabold uppercase">
                      {isArabic ? "خصم 35%" : "35% Off"}
                    </span>
                    <div className="text-xs font-bold">{isArabic ? "أسبوعي (7 أيام)" : "Weekly Tier"}</div>
                    <div className="text-[10px] text-amber-300/90 mt-0.5">{isArabic ? "أفضل قيمة للإنتاج" : "Best Production Value"}</div>
                  </button>
                </div>
              </div>

              {/* Delivery Method Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider block">
                  {isArabic ? "طريقة الاستلام والتسليم:" : "Dispatch & Delivery Method:"}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("soundstage")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "soundstage"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Building size={13} className="text-brand-purple" />
                      <span>{isArabic ? "استوديو Yas Pro" : "Yas Soundstage"}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">{isArabic ? "مجاناً مع الحجز" : "Free On-Site"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("dubai_courier")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "dubai_courier"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Truck size={13} className="text-brand-cyan" />
                      <span>{isArabic ? "توصيل لموقع التصوير" : "Set Courier"}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{isArabic ? "+250 درهم دبي" : "+250 AED UAE Set"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("hub_pickup")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "hub_pickup"
                        ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-amber-400" />
                      <span>{isArabic ? "استلام من المقر" : "Hub Pickup"}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{isArabic ? "الخليج التجاري مجاناً" : "Business Bay Free"}</div>
                  </button>
                </div>
              </div>

              {/* Price Calculation Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-purple/10 to-brand-cyan/10 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white font-display">
                      {formatCurrency(grandTotal)}
                    </span>
                    {discountMultiplier < 1 && (
                      <span className="text-xs text-text-muted line-through font-mono">
                        {formatCurrency(item.dailyRate * durationDays + deliveryFee)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-muted block">
                    {durationDays} {isArabic ? "أيام تأجير" : "Days Rental"} · {isArabic ? "تأمين مسترد:" : "Hold Deposit:"} {formatCurrency(deposit)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <MessageCircle size={14} />
                    <span>{isArabic ? "حجز عبر واتساب" : "WhatsApp"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-lg shadow-brand-purple/25"
                  >
                    {isArabic ? "طلب حجز مباشر" : "Book Online"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
