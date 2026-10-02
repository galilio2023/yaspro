"use client";

import { createPortal } from "react-dom";
import React, { useState, useRef } from "react";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  X,
  Loader2,
  Smartphone,
  Zap,
  Building2,
  Copy,
  Check,
  Receipt,
} from "lucide-react";
import { processBookingOnlinePayment, markBookingBankTransferPending } from "@/lib/payment-actions";
import { createZiinaPaymentIntent } from "@/lib/ziina";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  referenceCode: string;
  totalAmount: number;
  securityDeposit?: number;
  orderTitle?: string;
  onPaymentSuccess: (paymentStatus: "deposit_paid" | "paid", transactionId: string) => void;
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
}: BookingPaymentModalProps) {
  const { isArabic } = useLanguage();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [paymentMethod, setPaymentMethod] = useState<"ziina" | "card" | "bank">("ziina");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("•••");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [bankConfirmed, setBankConfirmed] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap({ isOpen, onClose, containerRef: dialogRef });

  if (!isOpen) return null;

  const depositAmount = Math.round(totalAmount * 0.5);
  const chargeAmount = paymentType === "deposit" ? depositAmount : totalAmount;

  // 5% UAE VAT calculation breakdown
  const vatAmount = Math.round((chargeAmount - chargeAmount / 1.05) * 100) / 100;
  const netAmount = Math.round((chargeAmount - vatAmount) * 100) / 100;

  const handleCopyIban = async () => {
    try {
      await navigator.clipboard.writeText("AE240260001023456789001");
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    } catch (e) {
      console.error("Failed to copy IBAN:", e);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "bank") {
      setIsProcessing(true);
      setErrorMsg(null);
      try {
        const res = await markBookingBankTransferPending(
          bookingId || "",
          referenceCode
        );
        if (res.success) {
          setBankConfirmed(true);
        } else {
          setErrorMsg(res.error || (isArabic ? "فشل تسجيل طلب التحويل البنكي" : "Failed to record wire transfer request."));
        }
      } catch (err) {
        setErrorMsg((err as Error).message || "An unexpected error occurred.");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (paymentMethod === "ziina") {
        const res = await createZiinaPaymentIntent(
          bookingId || "",
          chargeAmount,
          paymentType,
          referenceCode
        );

        if (res.paymentUrl) {
          // eslint-disable-next-line react-hooks/immutability
          window.location.href = res.paymentUrl;
          return;
        }

        if (res.success && res.paymentStatus && res.transactionId) {
          onPaymentSuccess(res.paymentStatus, res.transactionId);
          onClose();
          return;
        }

        setErrorMsg(res.error || (isArabic ? "تم مقاطعة عملية تفويض الدفع عبر زينا" : "Ziina payment authorization was interrupted."));
      } else {
        const res = await processBookingOnlinePayment(
          bookingId || "",
          chargeAmount,
          paymentType,
          referenceCode
        );

        if (res.success && res.paymentStatus && res.transactionId) {
          onPaymentSuccess(res.paymentStatus, res.transactionId);
          onClose();
          return;
        }

        setErrorMsg(
          res.error ||
            (isArabic
              ? "فشلت عملية الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مجدداً."
              : "Payment failed. Please verify your payment details and retry.")
        );
      }
    } catch (err) {
      setErrorMsg((err as Error).message || (isArabic ? "تعذر الاتصال ببوابة الدفع. يرجى المحاولة لاحقاً." : "Unable to reach payment gateway. Please retry."));
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Secure UAE Checkout"
        tabIndex={-1}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-[#090a0f] border border-white/10 shadow-2xl p-6 sm:p-8 text-start animate-fade-up max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg font-display">
                {isArabic ? "بوابة الدفع الآمنة في الإمارات" : "Secure UAE Checkout"}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-amber-400 font-semibold" dir="ltr">
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

        <form onSubmit={handlePay} className="space-y-5 text-xs">
          {/* Order Summary & VAT Breakdown Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5">
                <Receipt size={14} className="text-amber-400" />
                {isArabic ? "ملخص الفاتورة الضريبية" : "Tax Invoice Summary"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {isArabic ? "شامل ضريبة القيمة المضافة 5%" : "Includes 5% UAE VAT"}
              </span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{isArabic ? "المبلغ الصافي قبل الضريبة:" : "Net Amount before VAT:"}</span>
              <span className="font-mono text-slate-300">{formatCurrency(netAmount)}</span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{isArabic ? "ضريبة القيمة المضافة (5% VAT):" : "UAE VAT (5% FTA):"}</span>
              <span className="font-mono text-slate-300">{formatCurrency(vatAmount)}</span>
            </div>

            {securityDeposit > 0 && (
              <div className="flex flex-col gap-0.5 pt-1 border-t border-white/5 text-[11px]">
                <div className="flex justify-between text-amber-300">
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
              <span className="text-amber-400 font-mono text-base font-extrabold">
                {formatCurrency(chargeAmount)}
              </span>
            </div>
          </div>

          {/* Payment Rail Selector: Ziina vs Direct Card vs Bank Transfer */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2.5">
              {isArabic ? "طريقة السداد المفضلة" : "Select Payment Method"}
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Ziina / Apple Pay */}
              <button
                type="button"
                onClick={() => setPaymentMethod("ziina")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between relative",
                  paymentMethod === "ziina"
                    ? "bg-amber-500/15 border-amber-400/60 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1 font-display">
                    <Zap size={13} className="text-amber-400 fill-amber-400 shrink-0" />
                    <span>Ziina</span>
                  </span>
                  <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold">
                    Fast
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-2 leading-tight">
                  {isArabic ? "Apple Pay وبطاقات الإمارات" : "Apple Pay & UAE Cards"}
                </div>
              </button>

              {/* Direct Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between",
                  paymentMethod === "card"
                    ? "bg-amber-500/20 border-amber-500/50 text-white ring-1 ring-amber-400/30"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <CreditCard size={13} className="text-amber-400 shrink-0" />
                    <span>Card</span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                  Visa &bull; Mastercard &bull; AMEX
                </div>
              </button>

              {/* Bank Wire */}
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={cn(
                  "p-3 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between",
                  paymentMethod === "bank"
                    ? "bg-amber-500/20 border-amber-500/50 text-white ring-1 ring-amber-400/30"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Building2 size={13} className="text-amber-400 shrink-0" />
                    <span>Bank</span>
                  </span>
                  <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-white/10 text-text-muted">
                    B2B
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                  {isArabic ? "تحويل بنكي رسمي" : "Corporate Wire Transfer"}
                </div>
              </button>
            </div>
          </div>

          {/* Option Selector: 50% Deposit vs Full */}
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
                    ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                )}
              >
                <div className="text-[10px] font-mono uppercase text-amber-400">
                  {isArabic ? "عربون حجز 50%" : "50% Booking Deposit"}
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
                    ? "bg-amber-500/20 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                )}
              >
                <div className="text-[10px] font-mono uppercase text-amber-400">
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

          {/* Payment Method Details */}
          {paymentMethod === "ziina" ? (
            <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <Smartphone size={15} />
                  <span>{isArabic ? "مرخص من مصرف الإمارات المركزي (Ziina)" : "Central Bank of the UAE Regulated"}</span>
                </div>
                {/* Apple Pay & Aani Badges */}
                <div className="flex items-center gap-1.5" dir="ltr">
                  <span className="px-2 py-0.5 rounded bg-black border border-white/20 text-white font-mono text-[9px] font-bold">
                    Pay
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white text-black font-sans text-[9px] font-bold">
                    GPay
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                    Aani
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isArabic
                  ? "ادفع بأمان وسرعة فائقة باستخدام Apple Pay أو بطاقات الائتمان المحلية والدولية. يتم إصدار أمر الحجز وتأكيد الطاقم الفني فوراً."
                  : "Pay instantly using Apple Pay, Google Pay, or any GCC/International card. Your production call sheet is confirmed immediately."}
              </p>
            </div>
          ) : paymentMethod === "card" ? (
            /* Direct Card Form */
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {isArabic ? "رقم البطاقة" : "Card Number"}
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3" dir="ltr">
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-xs">
                    {isArabic ? "تاريخ الانتهاء" : "Expires"}
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1 text-xs">CVC</label>
                  <input
                    type="password"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Corporate Bank Transfer (UAE Direct Wire) */
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {isArabic ? "تفاصيل الحساب البنكي الرسمي" : "Official UAE Corporate Account"}
                </span>
                <span className="text-[10px] font-mono text-text-muted">Emirates NBD</span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono" dir="ltr">
                <div className="flex justify-between text-slate-400">
                  <span>Beneficiary:</span>
                  <span className="text-white font-bold">YAS PRO MEDIA PRODUCTION LLC</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bank:</span>
                  <span className="text-white">Emirates NBD — Business Bay, Dubai</span>
                </div>
                <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5">
                  <span className="text-amber-300 font-bold truncate">AE24 0260 0010 2345 6789 001</span>
                  <button
                    type="button"
                    onClick={handleCopyIban}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-sans hover:bg-amber-500/30 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    {copiedIban ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedIban ? "Copied" : "Copy IBAN"}</span>
                  </button>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SWIFT / BIC:</span>
                  <span className="text-white font-bold">EBILAEADXXX</span>
                </div>
              </div>

              <p className="text-[10.5px] text-text-muted leading-relaxed">
                {isArabic
                  ? "يرجى ذكر الرمز المرجعي في تفاصيل التحويل. سيقوم فريق الحسابات بتأكيد الحجز فور وصول الإشعار البنكي."
                  : "Include your reference code in the transfer narration. Accounts team reconciles within 2 hours of receipt."}
              </p>
            </div>
          )}

          {/* Security & Regulatory Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
            <Lock size={13} className="text-emerald-400 shrink-0" />
            <span>
              {isArabic
                ? "تشفير TLS عالي الأمان عبر قنوات الدفع السيادية المعتمدة في الإمارات"
                : "256-bit TLS encrypted via sovereign UAE payment rails"}
            </span>
          </div>

          {/* Pay Button / Bank Confirmation */}
          {bankConfirmed ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 space-y-3 text-start">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
                <Check size={18} className="shrink-0" />
                <span>
                  {isArabic
                    ? "تم تسجيل طلب التحويل البنكي — الحجز قيد التأكيد"
                    : "Wire Transfer Logged — Awaiting Bank Settlement"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isArabic
                  ? "تم حفظ حجز الاستوديو بانتظار استلام الحوالة البنكية وفق التفاصيل الموضحة أعلاه. الحجز غير مدفوع بعد، وسيتم تأكيده فور مطابقة الإشعار البنكي."
                  : "Your studio reservation is on hold awaiting receipt of the bank transfer as outlined above. This booking remains unpaid until bank reconciliation."}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-colors cursor-pointer"
              >
                {isArabic ? "إغلاق والتأكيد" : "Close & Acknowledge"}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                "w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50",
                paymentMethod === "ziina"
                  ? "bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-amber-500/25"
                  : paymentMethod === "card"
                  ? "btn-brand text-black"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{isArabic ? "جاري معالجة التفويض..." : "Processing Authorization..."}</span>
                </>
              ) : paymentMethod === "ziina" ? (
                <>
                  <Zap size={16} className="fill-black" />
                  <span>
                    {isArabic
                      ? `دفع ${formatCurrency(chargeAmount)} عبر Ziina و Apple Pay`
                      : `Pay ${formatCurrency(chargeAmount)} with Ziina · Apple Pay`}
                  </span>
                </>
              ) : paymentMethod === "card" ? (
                <>
                  <ShieldCheck size={16} />
                  <span>
                    {isArabic
                      ? `سداد ${formatCurrency(chargeAmount)} بأمان`
                      : `Pay ${formatCurrency(chargeAmount)} Securely`}
                  </span>
                </>
              ) : (
                <>
                  <Building2 size={16} />
                  <span>
                    {isArabic ? "تأكيد طلب التحويل البنكي" : "Acknowledge Wire Transfer Instructions"}
                  </span>
                </>
              )}
            </button>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
