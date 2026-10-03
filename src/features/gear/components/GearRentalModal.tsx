"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
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
  CreditCard,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { calculateGearCartTotals, calculateRentalMultiplier } from "../lib/cart-pricing";
import { GearItem, DeliveryMethod } from "../types";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { createGearBookingOrder } from "@/lib/actions/equipment-gear";
import { useSession } from "@/lib/auth-client";
import { BookingPaymentModal } from "@/features/booking/components/BookingPaymentModal";
import Link from "next/link";

import { addCalendarDays, getLocalCalendarDate, normalizeRentalDateRange } from "../lib/rental-schedule";

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
  const { data: session } = useSession();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const todayStr = getLocalCalendarDate();
  const [pickupDate, setPickupDate] = useState(getLocalCalendarDate);
  const [returnDate, setReturnDate] = useState(() => addCalendarDays(getLocalCalendarDate(), initialDurationDays || 1));
  const [durationDays, setDurationDays] = useState(initialDurationDays || 1);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("studio_delivery");
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
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [createdAmount, setCreatedAmount] = useState<number>(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const hasItem = Boolean(item);

  useEffect(() => {
    if (isOpen) {
      const today = getLocalCalendarDate();
      setPickupDate(today);
      setReturnDate(addCalendarDays(today, initialDurationDays || 1));
      setDurationDays(initialDurationDays || 1);
      setViewMode("overview");
      setErrorMessage(null);
      setConfirmationCode(null);
      setCreatedBookingId(null);
      setCreatedAmount(0);
      setIsPaymentOpen(false);
      if (session?.user) {
        setCustomerName((prev) => prev || session.user.name || "");
        setEmail((prev) => prev || session.user.email || "");
      }
    }
  }, [isOpen, initialDurationDays, session]);

  const handleDateChange = (pickup: string, returnStr: string) => {
    const range = normalizeRentalDateRange(pickup, returnStr);
    if (!range) return;
    setPickupDate(range.pickupDate);
    setReturnDate(range.returnDate);
    setDurationDays(range.totalDays);
  };

  const handleTierSelect = (days: number) => {
    setDurationDays(days);
    setReturnDate(addCalendarDays(pickupDate, days));
  };

  useFocusTrap({ isOpen: mounted && isOpen && hasItem, onClose, containerRef: dialogRef });

  // Switching views can remove the focused control.
  useEffect(() => {
    const card = dialogRef.current;
    if (!isPaymentOpen && card && !card.contains(document.activeElement)) card.focus();
  }, [viewMode, isPaymentOpen]);

  if (!mounted || !isOpen || !item) return null;

  // Pricing calculations
  const { multiplier } = calculateRentalMultiplier(durationDays);
  const discountMultiplier = multiplier / durationDays;
  const { grandTotal, deliveryFee } = calculateGearCartTotals([item], { totalDays: durationDays }, deliveryMethod);
  const deposit = item.securityDeposit || 0;

  const displayName = isArabic && item.arabicName ? item.arabicName : item.name;
  const displayDescription = isArabic && item.arabicDescription ? item.arabicDescription : item.description;

  // WhatsApp Pre-filled Link
  const waText = encodeURIComponent(
    `Hello Yas Pro Gear Team! 🎬\nI want to reserve the *${item.name}* (${item.categoryLabel}).\n- Shoot Schedule: ${pickupDate} to ${returnDate} (${durationDays} Day${durationDays > 1 ? "s" : ""})\n- Delivery: ${deliveryMethod}\n- Estimated Rental: AED ${grandTotal.toLocaleString()}\nPlease confirm gear availability for our shoot dates.`
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

    try {
      const res = await createGearBookingOrder({
        gearIds: [item.id],
        customerName,
        email,
        phone,
        company,
        durationDays,
        deliveryMethod,
        notes,
        startDate: pickupDate,
        returnDate,
      });

      if (res.success && res.data?.referenceCode) {
        setConfirmationCode(res.data.referenceCode);
        setCreatedBookingId(res.data.bookingId);
        setCreatedAmount(res.data.totalAmount);
        setViewMode("confirmed");
        setIsPaymentOpen(true);
      } else {
        setErrorMessage(res.error || (isArabic ? "حدث خطأ أثناء إرسال الحجز، يرجى المحاولة لاحقاً" : "Failed to submit reservation. Please try WhatsApp."));
      }
    } catch {
      setErrorMessage(isArabic ? "حدث خطأ أثناء إرسال الحجز، يرجى المحاولة لاحقاً" : "Failed to submit reservation. Please try WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {createPortal(
        <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gear-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-up overflow-y-auto overscroll-contain"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Dialog Card */}
      <div ref={dialogRef} tabIndex={-1} className="relative w-full max-w-3xl my-auto rounded-3xl border border-white/10 bg-[#070709] shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col max-h-[92vh] overscroll-contain">
        {/* Header Bar */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 id="gear-modal-title" className="text-lg font-bold text-white font-display">{displayName}</h2>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted">
                {item.categoryLabel} · {isArabic ? "حجز وتأجير فوري" : "Instant Gear Reservation"}
              </span>
            </div>
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
                  ? "تم تسجيل حجزك رسميًا في لوحة تحكم حسابك وربطه بمركز التوزيع الرئيسي. يمكنك إتمام الدفع الإلكتروني الآن أو المتابعة من لوحة تحكمك."
                  : "Your equipment reservation has been booked and linked to your Client Portal. You can pay online via Ziina or follow up with dispatch."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 inline-block text-center font-mono">
                  <span className="text-[11px] text-text-muted uppercase block">
                    {isArabic ? "رقم المرجع التأجيري" : "Booking Reference"}
                  </span>
                  <span className="text-xl font-bold text-amber-400 tracking-wider">
                    {confirmationCode}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 inline-block text-center font-mono">
                  <span className="text-[11px] text-text-muted uppercase block">
                    {isArabic ? "فترة التصوير المحجوزة" : "Reserved Shoot Window"}
                  </span>
                  <span className="text-sm font-bold text-white tracking-wide">
                    {pickupDate} → {returnDate}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="px-6 py-2.5 rounded-full btn-brand text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard size={15} />
                  <span>{isArabic ? "الدفع الإلكتروني عبر Ziina" : "Pay Online via Ziina"}</span>
                </button>

                <Link
                  href="/portal/bookings"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full border border-white/20 text-white hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isArabic ? "عرض في لوحة التحكم" : "View in Client Portal"}</span>
                  <ArrowRight size={13} className="rtl:rotate-180" />
                </Link>

                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <MessageCircle size={15} />
                  <span>{isArabic ? "متابعة عبر واتساب" : "Chat on WhatsApp"}</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-text-muted hover:text-white text-xs transition-all cursor-pointer"
                >
                  {isArabic ? "إغلاق" : "Close"}
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
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
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
                  <label htmlFor="gear-customerName" className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    id="gear-customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={isArabic ? "مثال: طارق المنصوري" : "e.g. John Doe"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="gear-phone" className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    required
                    id="gear-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gear-email" className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    id="gear-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dp@production.ae"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="gear-company" className="text-xs font-medium text-text-secondary block mb-1">
                    {isArabic ? "جهة الإنتاج / الشركة" : "Production Company / Agency"}
                  </label>
                  <input
                    type="text"
                    id="gear-company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={isArabic ? "اختياري" : "Optional"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gear-notes" className="text-xs font-medium text-text-secondary block mb-1">
                  {isArabic ? "ملاحظات إضافية أو ملحقات خاصة" : "Special Requests or Call Sheet Notes"}
                </label>
                <textarea
                  rows={2}
                  id="gear-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isArabic ? "مثال: موعد استلام باكر، إضافة عدسة 50mm، توصيل لموقع صحراوي..." : "e.g. Early morning call, specific lens mount, location delivery..."}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-text-muted font-mono">
                  Total: <strong className="text-white text-sm">{formatCurrency(grandTotal)}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs btn-brand disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
                  <h3 className="text-2xl font-bold text-white font-display">
                    {displayName}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {displayDescription}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.specs.map((spec) => (
                      <span
                        key={spec}
                        className="text-[10.5px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-amber-300 font-mono"
                      >
                        ✓ {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Turnkey Inclusions (if Kit) */}
              {item.isKit && item.includedInKit && item.includedInKit.length > 0 && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold font-mono">
                    <Box size={14} />
                    <span>{isArabic ? "محتويات باقة التصوير المتكاملة:" : "Turnkey Package Rig Includes:"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary">
                    {item.includedInKit.map((inc) => (
                      <div key={inc} className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Duration & Shoot Date Selector */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={13} className="text-amber-400" />
                    <span>{isArabic ? "جدول التصوير والمدة:" : "Shoot Dates & Rental Tier:"}</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {durationDays} {durationDays === 1 ? (isArabic ? "يوم" : "Day") : (isArabic ? "أيام" : "Days")}
                    {multiplier !== durationDays && (
                      <span className="text-zinc-400 font-normal ms-1">
                        ({isArabic ? `احتساب ${multiplier} أيام` : `billed as ${multiplier}d`})
                      </span>
                    )}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTierSelect(1)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                      durationDays === 1
                        ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <div className="text-xs font-bold">{isArabic ? "يوم واحد" : "1 Day"}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">{isArabic ? "السعر اليومي" : "Standard"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierSelect(3)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all cursor-pointer relative",
                      durationDays === 3
                        ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <span className="absolute -top-2 inset-x-0 mx-auto w-max px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-extrabold uppercase">
                      {isArabic ? `خصم ${calculateRentalMultiplier(3).discountPct}%` : `${calculateRentalMultiplier(3).discountPct}% Off`}
                    </span>
                    <div className="text-xs font-bold">{isArabic ? "عطلة أسبوع" : "3-Day Weekend"}</div>
                    <div className="text-[10px] text-amber-400/90 mt-0.5">{isArabic ? "عرض خاص" : "Weekend Deal"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTierSelect(7)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all cursor-pointer relative",
                      durationDays === 7
                        ? "bg-amber-500/15 border-amber-500/60 text-white shadow-lg shadow-amber-500/10"
                        : "bg-white/[0.03] border-white/10 text-text-secondary hover:border-white/20"
                    )}
                  >
                    <span className="absolute -top-2 inset-x-0 mx-auto w-max px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[8px] font-extrabold uppercase">
                      {isArabic ? `خصم ${calculateRentalMultiplier(7).discountPct}%` : `${calculateRentalMultiplier(7).discountPct}% Off`}
                    </span>
                    <div className="text-xs font-bold">{isArabic ? "أسبوعي" : "Weekly (7d)"}</div>
                    <div className="text-[10px] text-amber-300/90 mt-0.5">{isArabic ? "أفضل قيمة" : "Best Value"}</div>
                  </button>
                </div>

                {/* Calendar Date Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                      {isArabic ? "تاريخ الاستلام والتجهيز" : "Pickup / Prep Date"}
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => handleDateChange(e.target.value, returnDate)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-text-muted mb-1">
                      {isArabic ? "تاريخ الإرجاع والتسليم" : "Return / Wrap Date"}
                    </label>
                    <input
                      type="date"
                      min={addCalendarDays(pickupDate, 1)}
                      value={returnDate}
                      onChange={(e) => handleDateChange(pickupDate, e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
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
                    onClick={() => setDeliveryMethod("studio_delivery")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "studio_delivery"
                        ? "bg-amber-500/15 border-amber-500/60 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Building size={13} className="text-amber-400" />
                      <span>{isArabic ? "استوديو Yas Pro" : "Yas Soundstage"}</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">{isArabic ? "مجاناً مع الحجز" : "Free On-Site"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("courier_dubai")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "courier_dubai"
                        ? "bg-amber-500/15 border-amber-500/50 text-white"
                        : "bg-white/[0.02] border-white/10 text-text-secondary hover:text-white"
                    )}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Truck size={13} className="text-amber-400" />
                      <span>{isArabic ? "توصيل لموقع التصوير" : "Set Courier"}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{isArabic ? "+250 درهم دبي" : "+250 AED UAE Set"}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup_hub")}
                    className={cn(
                      "p-2.5 rounded-xl border text-start transition-all cursor-pointer text-xs",
                      deliveryMethod === "pickup_hub"
                        ? "bg-amber-500/15 border-amber-500/50 text-white"
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
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex flex-wrap items-center justify-between gap-3">
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
                    className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold cursor-pointer"
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
  )}

  {createdBookingId && confirmationCode && (
    <BookingPaymentModal
      isOpen={isPaymentOpen}
      onClose={() => setIsPaymentOpen(false)}
      bookingId={createdBookingId}
      referenceCode={confirmationCode}
      totalAmount={createdAmount || grandTotal}
      securityDeposit={deposit}
      orderTitle={displayName}
      onPaymentSuccess={() => {
        setIsPaymentOpen(false);
      }}
    />
  )}
  </>
  );
}
