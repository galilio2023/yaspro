"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Tag,
  AlertCircle,
  Clock,
  Calendar,
  Lock,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { OfferBundleItem, OffersBookingContact, OffersPricingBreakdown } from "../types";
import {
  formatAED,
  Panel,
  Field,
  StepIntro,
  fieldClass,
  studioSprings,
} from "@/features/booking/components/ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Step3CheckoutProps {
  offer: OfferBundleItem;
  date: string;
  timeSlot: string;
  contact: OffersBookingContact;
  onUpdateContact: (updates: Partial<OffersBookingContact>) => void;
  breakdown: OffersPricingBreakdown;
  promoInput: string;
  onPromoInputChange: (val: string) => void;
  appliedPromo: string | null;
  promoError: string | null;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (withZiinaPayment: boolean) => void;
}

export function Step3Checkout({
  offer,
  date,
  timeSlot,
  contact,
  onUpdateContact,
  breakdown,
  promoInput,
  onPromoInputChange,
  appliedPromo,
  promoError,
  onApplyPromo,
  onRemovePromo,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Step3CheckoutProps) {
  const { isArabic } = useLanguage();
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <StepIntro
        index={3}
        total={3}
        title={isArabic ? "إتمام الحجز والدفع" : "Complete Your Booking"}
        description={
          isArabic
            ? "أدخل بيانات التواصل الخاصة بك وراجع ملخص الباقة، ثم أكمل الحجز بشكل آمن."
            : "Enter your contact details and review the summary before confirming your reservation."
        }
      />

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contact Details Form */}
        <div className="lg:col-span-7 space-y-5">
          <Panel
            icon={User}
            title={isArabic ? "معلومات الاتصال والتواصل" : "Contact Information"}
            description={
              isArabic
                ? "سنرسل تفاصيل أمر العمل وجدول التصوير إلى هذا البريد الإلكتروني"
                : "We will send your booking confirmation and production call sheet here"
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Field label={isArabic ? "الاسم الأول" : "First Name"} required>
                <input
                  type="text"
                  required
                  autoComplete="given-name"
                  value={contact.firstName}
                  onChange={(e) => onUpdateContact({ firstName: e.target.value })}
                  placeholder="John"
                  className={fieldClass}
                />
              </Field>

              <Field label={isArabic ? "اسم العائلة" : "Last Name"} required>
                <input
                  type="text"
                  required
                  autoComplete="family-name"
                  value={contact.lastName}
                  onChange={(e) => onUpdateContact({ lastName: e.target.value })}
                  placeholder="Doe"
                  className={fieldClass}
                />
              </Field>

              <Field label={isArabic ? "البريد الإلكتروني" : "Email Address"} required>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) => onUpdateContact({ email: e.target.value })}
                  placeholder="name@company.com"
                  className={fieldClass}
                />
              </Field>

              <Field label={isArabic ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"} required>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  value={contact.phone}
                  onChange={(e) => onUpdateContact({ phone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className={fieldClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label={isArabic ? "اسم الشركة / الجهة (اختياري)" : "Company / Organization"}>
                  <input
                    type="text"
                    autoComplete="organization"
                    value={contact.company}
                    onChange={(e) => onUpdateContact({ company: e.target.value })}
                    placeholder={isArabic ? "مثال: شركة الإنتاج الإبداعي" : "e.g. Media Agency LLC"}
                    className={fieldClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label={isArabic ? "طلبات خاصة أو ملاحظات فنية" : "Special Requests / Technical Notes"}>
                  <textarea
                    rows={3}
                    value={contact.specialRequests}
                    onChange={(e) => onUpdateContact({ specialRequests: e.target.value })}
                    placeholder={
                      isArabic
                        ? "أي متطلبات محددة، معدات إضافية، أو تفاصيل حول طاقم عملك..."
                        : "Describe any specific set requirements, additional gear, or crew needs..."
                    }
                    className={cn(fieldClass, "resize-none py-2.5")}
                  />
                </Field>
              </div>
            </div>
          </Panel>

          {/* Promo Code Box */}
          <Panel
            icon={Tag}
            title={isArabic ? "كوبون الخصم أو الرمز الترويجي" : "Promotional Code"}
            description={
              isArabic
                ? "أدخل رمز القسيمة إن وجد لتطبيقه مباشرة على إجمالي الفاتورة"
                : "Enter any active promotion or partner code for an instant price reduction"
            }
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => onPromoInputChange(e.target.value)}
                placeholder={isArabic ? "أدخل الرمز الترويجي..." : "ENTER PROMO CODE (e.g. YAS10)"}
                className={cn(fieldClass, "font-mono uppercase")}
                disabled={Boolean(appliedPromo)}
              />
              {appliedPromo ? (
                <button
                  type="button"
                  onClick={onRemovePromo}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {isArabic ? "إلغاء الكود" : "Remove"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onApplyPromo(promoInput)}
                  className="px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/20 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
                >
                  {isArabic ? "تطبيق" : "Apply"}
                </button>
              )}
            </div>

            {appliedPromo && (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={13} />
                <span>
                  {isArabic
                    ? `تم تطبيق الكود ${appliedPromo} بنجاح (وفّر ${formatAED(breakdown.discount)})`
                    : `Code ${appliedPromo} applied successfully (Saved ${formatAED(breakdown.discount)})`}
                </span>
              </div>
            )}

            {promoError && (
              <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle size={13} />
                <span>{promoError}</span>
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column: Booking Summary & Payment Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl sm:rounded-3xl bg-[#0e0e13] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-5">
            <h4 className="font-bold text-white text-base font-display pb-3 border-b border-white/[0.06]">
              {isArabic ? "ملخص الحجز والإنتاج" : "Booking Summary"}
            </h4>

            {/* Selected Package Banner */}
            <div className="flex gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="relative size-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                <Image
                  src={offer.image}
                  alt={isArabic ? offer.nameAr : offer.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <h5 className="text-sm font-bold text-white truncate font-display">
                  {isArabic ? offer.nameAr : offer.name}
                </h5>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-brand-mauve" />
                    {offer.hours} {isArabic ? "ساعات" : "Hrs"}
                  </span>
                  <span>•</span>
                  <span>{isArabic ? "استوديو دبي" : "Iris Bay DXB"}</span>
                </div>
                <div className="text-[11px] text-brand-lavender font-medium">
                  {formattedDate} @ {timeSlot}
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs border-b border-white/[0.06] pb-4">
              <div className="flex items-center justify-between text-zinc-400">
                <span>{isArabic ? "سعر الباقة الأساسي" : "Package Base Rate"}</span>
                <span className="font-mono text-zinc-200">{formatAED(breakdown.basePrice)}</span>
              </div>

              {breakdown.discount > 0 && (
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span>{isArabic ? "خصم الكوبون" : "Promo Discount"}</span>
                  <span className="font-mono">-{formatAED(breakdown.discount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-zinc-400">
                <span>{isArabic ? "ضريبة القيمة المضافة (5% UAE VAT)" : "Tax (5% UAE VAT)"}</span>
                <span className="font-mono text-zinc-200">{formatAED(breakdown.vatAmount, 2)}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {isArabic ? "المبلغ الإجمالي المستحق" : "Total Amount Due"}
                </span>
                <span className="text-xs text-zinc-400">
                  {isArabic ? "شامل جميع الضرائب والمعدات" : "Inclusive of all taxes & facilities"}
                </span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-brand-mauve font-display">
                {formatAED(breakdown.grandTotal, 2)}
              </span>
            </div>

            {/* Ziina Payment Badge Notice */}
            <div className="p-3 rounded-xl bg-[#09090d] border border-white/[0.08] flex items-center gap-2.5 text-[11px] text-zinc-300">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <span>
                {isArabic
                  ? "دفع إلكتروني آمن معتمد عبر Ziina — يقبل البطاقات البنكية، Apple Pay و Google Pay."
                  : "Secure payment powered by Ziina — Card, Apple Pay & Google Pay accepted."}
              </span>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 text-xs text-zinc-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-brand-mauve focus:ring-brand-mauve/40"
              />
              <span className="leading-tight">
                {isArabic
                  ? "أوافق على الشروط والأحكام وسياسة حجز وإلغاء الاستوديوهات في ياس برو."
                  : "I agree to the Studio Terms of Service and Cancellation Policy."}
              </span>
            </label>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting || !agreedToTerms}
                onClick={() => onSubmit(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-brand-mauve hover:bg-brand-mauve-soft text-slate-950 transition-all shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-slate-950" />
                    <span>{isArabic ? "جاري التجهيز..." : "Preparing Checkout..."}</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>
                      {isArabic
                        ? `دفع آمن الآن (${formatAED(breakdown.grandTotal, 2)})`
                        : `Complete & Pay ${formatAED(breakdown.grandTotal, 2)}`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting || !agreedToTerms}
                onClick={() => onSubmit(false)}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center cursor-pointer disabled:opacity-50"
              >
                {isArabic ? "تأكيد الحجز والدفع لاحقاً في الاستوديو" : "Reserve Now & Pay at Studio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
