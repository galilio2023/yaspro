"use client";

import { getPlatformSettings } from "@/lib/actions/platform-settings-operations";
import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  CreditCard,
  Lock,
  AlertCircle,
  X,
  Loader2,
  Smartphone,
  Zap,
  Receipt,
} from "lucide-react";
import { createZiinaPaymentIntent } from "@/lib/ziina";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  DEFAULT_PLATFORM_SETTINGS,
  type PlatformPaymentSettings,
} from "@/lib/types/platform-settings";

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  referenceCode: string;
  totalAmount: number;
  securityDeposit?: number;
  orderTitle?: string;
  onPaymentSuccess: (paymentStatus: "deposit_paid" | "paid", transactionId: string) => void;
  paymentSettings?: Partial<PlatformPaymentSettings>;
}

export function BookingPaymentModal({
  isOpen,
  onClose,
  bookingId,
  referenceCode,
  totalAmount,
  securityDeposit = 0,
  orderTitle,
  onPaymentSuccess,
  paymentSettings,
}: BookingPaymentModalProps) {
  const { isArabic } = useLanguage();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap({ isOpen, onClose, containerRef: dialogRef });

  const [loadedSettings, setLoadedSettings] = useState<Partial<PlatformPaymentSettings> | null>(null);
  const [settingsError, setSettingsError] = useState(false);
  useEffect(() => {
    if (!isOpen || paymentSettings) return;
    let cancelled = false;
    getPlatformSettings().then((settings) => {
      if (!cancelled) {
        setLoadedSettings(settings);
        setSettingsError(false);
      }
    }).catch(() => {
      if (!cancelled) setSettingsError(true);
    });
    return () => {
      cancelled = true;
      setLoadedSettings(null);
      setSettingsError(false);
    };
  }, [isOpen, paymentSettings]);
  const settings = paymentSettings ?? loadedSettings;
  const activeSettings = settings ? { ...DEFAULT_PLATFORM_SETTINGS, ...settings } : null;

  if (!isOpen) return null;

  const depositPercent = activeSettings?.depositPercent ?? 50;
  const depositMultiplier = depositPercent / 100;
  const depositAmount = Math.round(totalAmount * depositMultiplier);
  const chargeAmount = paymentType === "deposit" ? depositAmount : totalAmount;

  // Dynamic UAE VAT calculation breakdown
  const vatRatePercent = activeSettings?.vatRatePercent ?? 5;
  const vatRate = 1 + vatRatePercent / 100;
  const vatAmount = Math.round((chargeAmount - chargeAmount / vatRate) * 100) / 100;
  const netAmount = Math.round((chargeAmount - vatAmount) * 100) / 100;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSettings) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await createZiinaPaymentIntent(
        bookingId || "",
        chargeAmount,
        paymentType,
        referenceCode
      );

      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }

      if (res.success && res.paymentStatus && res.transactionId) {
        onPaymentSuccess(res.paymentStatus, res.transactionId);
        onClose();
        return;
      }

      setErrorMsg(res.error || (isArabic ? "تم مقاطعة عملية تفويض الدفع عبر زينا" : "Ziina payment authorization was interrupted."));
    } catch (err) {
      setErrorMsg((err as Error).message || (isArabic ? "تعذر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً." : "Unable to reach payment gateway. Please retry."));
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Secure UAE Checkout via Ziina"
        tabIndex={-1}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#090a0f] border border-white/10 shadow-2xl p-4 sm:p-8 text-start animate-fade-up max-h-[92vh] overflow-y-auto overscroll-contain"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-brand-violet/30 border border-brand-mauve/40 text-brand-mauve flex items-center justify-center">
              <Zap size={20} className="fill-brand-mauve text-brand-mauve" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg font-display">
                {isArabic ? "بوابة الدفع الآمنة (Ziina)" : "Secure UAE Checkout"}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-brand-mauve font-semibold" dir="ltr">
                  REF: {referenceCode}
                </span>
                {orderTitle && (
                  <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                    · {orderTitle}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!activeSettings ? (
          <div role={settingsError ? "alert" : "status"} aria-busy={!settingsError} className="p-4 text-sm text-slate-300">
            {settingsError
              ? (isArabic ? "تعذر تحميل إعدادات الدفع. يرجى إغلاق النافذة والمحاولة مجدداً." : "Unable to load payment settings. Please close and reopen checkout to retry.")
              : (isArabic ? "جاري تحميل إعدادات الدفع..." : "Loading payment settings...")}
          </div>
        ) : (
        <form onSubmit={handlePay} className="space-y-5 text-xs">
          {/* Order Summary & VAT Breakdown Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-semibold text-white pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5 shrink-0">
                <Receipt size={14} className="text-brand-mauve" />
                {isArabic ? "ملخص الفاتورة الضريبية" : "Tax Invoice Summary"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0 whitespace-nowrap">
                {isArabic ? `شامل ضريبة القيمة المضافة ${vatRatePercent}%` : `Includes ${vatRatePercent}% UAE VAT`}
              </span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{isArabic ? "المبلغ الصافي قبل الضريبة:" : "Net Amount before VAT:"}</span>
              <span className="font-mono text-slate-300">{formatCurrency(netAmount)}</span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{isArabic ? `ضريبة القيمة المضافة (${vatRatePercent}% VAT):` : `UAE VAT (${vatRatePercent}% FTA):`}</span>
              <span className="font-mono text-slate-300">{formatCurrency(vatAmount)}</span>
            </div>

            {securityDeposit > 0 && (
              <div className="flex flex-col gap-0.5 pt-1 border-t border-white/5 text-[11px]">
                <div className="flex justify-between text-brand-mauve-soft">
                  <span>{isArabic ? "تأمين المعدات المسترد (يُحصّل منفصلاً عند الاستلام):" : "Refundable Security Deposit (Billed Separately):"}</span>
                  <span className="font-mono font-bold">{formatCurrency(securityDeposit)}</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {isArabic
                    ? "* يُحصّل مبلغ التأمين بشكل مستقل عند الاستلام، ولا يدخل ضمن إجمالي المستحق الآن أدناه."
                    : "* Collected separately upon check-in; not included in Total Payable Now below."}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-white/10 text-white font-bold text-sm">
              <span>{isArabic ? "الإجمالي المستحق الآن:" : "Total Payable Now:"}</span>
              <span className="text-brand-mauve font-mono text-base font-extrabold">
                {formatCurrency(chargeAmount)}
              </span>
            </div>
          </div>

          {/* Option Selector: Configured Deposit vs Full */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              {isArabic ? "خطة الدفع" : "Payment Schedule"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer",
                  paymentType === "deposit"
                    ? "bg-brand-violet/30 border-brand-mauve/50 text-white shadow-md shadow-brand-violet/20"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                )}
              >
                <div className="text-[10px] font-mono uppercase text-brand-mauve">
                  {isArabic ? `عربون حجز ${depositPercent}%` : `${depositPercent}% Booking Deposit`}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(depositAmount)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isArabic ? "يثبت تاريخ وموعد الاستوديو" : "Locks in studio schedule"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer",
                  paymentType === "full"
                    ? "bg-brand-violet/30 border-brand-mauve/50 text-white shadow-md shadow-brand-violet/20"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                )}
              >
                <div className="text-[10px] font-mono uppercase text-brand-mauve">
                  {isArabic ? "المبلغ كاملاً 100%" : "Full Payment (100%)"}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {isArabic ? "تسوية فورية معتمدة" : "Complete order settlement"}
                </div>
              </button>
            </div>
          </div>

          {/* Ziina UAE Gateway Information */}
          <div className="p-4 rounded-2xl bg-brand-violet/[0.15] border border-brand-mauve/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-brand-mauve-soft font-semibold text-xs">
                <Smartphone size={15} className="shrink-0" />
                <span>{isArabic ? "مرخص من مصرف الإمارات المركزي (Ziina)" : "Central Bank of the UAE Regulated (Ziina)"}</span>
              </div>
              {/* Apple Pay & Card Badges */}
              <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
                <span className="px-2 py-0.5 rounded bg-black border border-white/20 text-white font-mono text-[9px] font-bold whitespace-nowrap">
                  Pay
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-sans text-[9px] font-bold whitespace-nowrap">
                  GPay
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white font-sans text-[9px] font-bold whitespace-nowrap">
                  Visa / MC
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold whitespace-nowrap">
                  Aani
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isArabic
                ? "ادفع بأمان وسرعة فائقة عبر منصة Ziina الإماراتية الرسمية باستخدام Apple Pay أو Google Pay أو أي بطاقة بنكية. يتم تأكيد الحجز وإشعار الإدارة والعميل فوراً."
                : "Pay instantly and securely via Ziina UAE using Apple Pay, Google Pay, or any GCC/International credit or debit card. Your booking is confirmed immediately."}
            </p>
          </div>

          {/* Security & Regulatory Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
            <Lock size={13} className="text-emerald-400 shrink-0" />
            <span>
              {isArabic
                ? "تشفير TLS 256-bit عالي الأمان عبر بوابة Ziina السيادية المعتمدة في دولة الإمارات"
                : "256-bit TLS encrypted via Ziina UAE sovereign payment rails"}
            </span>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 btn-brand font-extrabold shadow-brand-violet/30"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isArabic ? "جاري التوجيه إلى Ziina..." : "Redirecting to Ziina..."}</span>
              </>
            ) : (
              <>
                <Zap size={16} className="fill-white text-white" />
                <span>
                  {isArabic
                    ? `دفع ${formatCurrency(chargeAmount)} عبر Ziina و Apple Pay`
                    : `Pay ${formatCurrency(chargeAmount)} with Ziina · Apple Pay`}
                </span>
              </>
            )}
          </button>
        </form>
        )}
      </div>
    </div>,
    document.body
  );
}
