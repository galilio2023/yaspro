"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Building2,
  CreditCard,
  Sparkles,
  Loader2,
  ArrowRight,
  Camera,
  Lock,
} from "lucide-react";
import type { GearItem, RentalDateRange, DeliveryMethod } from "../types";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSession } from "@/lib/auth-client";
import { createGearBookingOrder } from "@/lib/actions/equipment-gear";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { BookingPaymentModal } from "@/features/booking/components/BookingPaymentModal";

interface GearCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GearItem[];
  dateRange: RentalDateRange;
  deliveryMethod: DeliveryMethod;
  grandTotal: number;
  totalDeposit: number;
  onOrderCompleted: () => void;
}

export function GearCheckoutModal({
  isOpen,
  onClose,
  items,
  dateRange,
  deliveryMethod,
  grandTotal,
  totalDeposit,
  onOrderCompleted,
}: GearCheckoutModalProps) {
  const { isArabic } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();

  // Form inputs
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-booking state
  const [createdBooking, setCreatedBooking] = useState<{
    bookingId: string;
    referenceCode: string;
    totalAmount: number;
  } | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Pre-fill from active user session
  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (session.user.name && !customerName) setCustomerName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session, customerName, email]);

  const handleClose = () => {
    setIsPaymentModalOpen(false);
    if (createdBooking) onOrderCompleted();
    setCreatedBooking(null);
    onClose();
  };

  useFocusTrap({ isOpen, onClose: handleClose, containerRef: dialogRef });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      setErrorMessage(
        isArabic
          ? "يرجى إدخال الاسم ورقم الهاتف والبريد الإلكتروني"
          : "Please provide your Name, Email, and Phone Number."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await createGearBookingOrder({
        gearIds: items.map((i) => i.id),
        customerName,
        email,
        phone,
        company: company || undefined,
        durationDays: dateRange.totalDays,
        deliveryMethod,
        notes: notes || undefined,
        startDate: dateRange.pickupDate,
      });

      if (res.success && res.data) {
        setCreatedBooking({
          bookingId: res.data.bookingId,
          referenceCode: res.data.referenceCode,
          totalAmount: res.data.totalAmount,
        });
        // Automatically open the Ziina payment modal
        setIsPaymentModalOpen(true);
      } else {
        setErrorMessage(
          res.error ||
            (isArabic
              ? "حدث خطأ أثناء معالجة حجز المعدات، يرجى المحاولة مرة أخرى."
              : "Failed to process equipment reservation. Please retry.")
        );
      }
    } catch {
      setErrorMessage(
        isArabic
          ? "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً."
          : "Network error contacting server. Please retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    router.push("/portal/bookings");
  };

  return (
    <>
      {createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-up overflow-y-auto"
        >
          <div className="fixed inset-0" onClick={handleClose} aria-hidden="true" />

          <div
            ref={dialogRef}
            tabIndex={-1}
            className="relative w-full max-w-4xl my-auto rounded-3xl border border-white/10 bg-[#070709] shadow-2xl shadow-black/80 overflow-hidden z-10 flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>
                    {isArabic
                      ? "إتمام حجز وتأجير معدات التصوير"
                      : "Complete Cinema Gear Rental"}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {isArabic
                    ? "تسجيل الحجز في نظام الإنتاج مع ربط حسابك وخيارات الدفع الفوري"
                    : "Official dispatch order linked to your client profile with instant online payment"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="size-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto">
              {createdBooking ? (
                /* Success View */
                <div className="py-8 text-center space-y-5">
                  <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-white font-display">
                    {isArabic
                      ? "تم تأكيد طلب حجز المعدات بنجاح!"
                      : "Equipment Rental Confirmed!"}
                  </h3>
                  <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
                    {isArabic
                      ? "تم تسجيل حجزك رسميًا في لوحة تحكم حسابك وربطه بمركز التوزيع الرئيسي. يمكنك إتمام الدفع الإلكتروني الآن أو المتابعة من لوحة تحكمك."
                      : "Your rental reservation has been officially recorded and linked to your Client Portal. You can complete your deposit/full payment online via Ziina."}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 inline-block text-center font-mono">
                    <span className="text-xs text-text-muted block">
                      {isArabic ? "كود الحجز المرجعي:" : "Booking Reference Code:"}
                    </span>
                    <span className="text-xl font-bold text-amber-400 tracking-wider">
                      {createdBooking.referenceCode}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard size={15} />
                      <span>
                        {isArabic
                          ? "الدفع الإلكتروني عبر Ziina (بطاقة / Apple Pay)"
                          : "Pay Online via Ziina (Apple Pay / Card)"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        router.push("/portal/bookings");
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      {isArabic
                        ? "عرض الحجز في لوحة التحكم"
                        : "View in Client Portal"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form & Order Summary */
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Contact & Production Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-2">
                      <Building2 size={16} className="text-amber-400" />
                      <span>
                        {isArabic
                          ? "بيانات المستأجر والإنتاج"
                          : "Production & Client Information"}
                      </span>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          {isArabic ? "الاسم الكامل *" : "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="e.g. John Doe / طارق الشمري"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          {isArabic ? "البريد الإلكتروني *" : "Email Address *"}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@production.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          {isArabic ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-text-secondary mb-1">
                          {isArabic ? "الشركة / جهة الإنتاج" : "Company / Production House"}
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Red Sea Films / مستقل"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-text-secondary mb-1">
                        {isArabic ? "ملاحظات إضافية أو ملحقات خاصة" : "Special Requests or Calibration Notes"}
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                          isArabic
                            ? "مثال: يرجى توفير محول بطاريات إضافي وعدسة 50mm معايرة..."
                            : "e.g. Lens mount preference (PL/LPL), wireless transmitter pairing..."
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-amber-500 focus:outline-none text-white text-xs resize-none"
                      />
                    </div>

                    {session?.user && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-200">
                        <Lock size={14} className="text-amber-400 shrink-0" />
                        <span>
                          {isArabic
                            ? "سيتم ربط هذا الحجز تلقائيًا بحسابك المسجل."
                            : "This booking will be automatically linked to your signed-in account."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Order Summary */}
                  <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          {isArabic ? "ملخص باقة المعدات" : "Kit Summary"} ({items.length})
                        </span>
                        <span className="text-xs text-amber-400 font-mono">
                          {dateRange.totalDays} {isArabic ? "أيام" : "Days"}
                        </span>
                      </div>

                      {/* Items scroll */}
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 mb-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5"
                          >
                            <div className="relative size-10 rounded-lg overflow-hidden bg-black/60 shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center size-full text-text-muted">
                                  <Camera size={14} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-start">
                              <p className="text-xs font-bold text-white truncate">
                                {isArabic && item.arabicName ? item.arabicName : item.name}
                              </p>
                              <p className="text-[10px] text-text-muted font-mono">
                                {formatCurrency(item.dailyRate)} / day
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Specs */}
                      <div className="space-y-1.5 text-xs border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between text-text-muted">
                          <span>{isArabic ? "مدة التأجير:" : "Shoot Dates:"}</span>
                          <span className="font-mono text-white">
                            {dateRange.pickupDate} → {dateRange.returnDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-text-muted">
                          <span>{isArabic ? "طريقة التسليم:" : "Dispatch Method:"}</span>
                          <span className="text-white capitalize">
                            {deliveryMethod.replace(/_/g, " ")}
                          </span>
                        </div>

                        {totalDeposit > 0 && (
                          <div className="flex items-center justify-between text-text-muted">
                            <span>{isArabic ? "مبلغ التأمين المسترد:" : "Security Deposit:"}</span>
                            <span className="font-mono text-amber-300">
                              {formatCurrency(totalDeposit)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-sm font-bold">
                          <span className="text-white">{isArabic ? "إجمالي الحجز:" : "Grand Total:"}</span>
                          <span className="text-amber-400 font-mono text-base">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>
                              {isArabic
                                ? "جاري تسجيل الحجز وتجهيز الدفع..."
                                : "Booking equipment..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {isArabic
                                ? "تأكيد الحجز والانتقال للدفع"
                                : "Confirm & Proceed to Payment"}
                            </span>
                            <ArrowRight size={14} className="rtl:rotate-180" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Ziina Online Payment Gateway Modal */}
      {createdBooking && (
        <BookingPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClose}
          bookingId={createdBooking.bookingId}
          referenceCode={createdBooking.referenceCode}
          totalAmount={createdBooking.totalAmount}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
