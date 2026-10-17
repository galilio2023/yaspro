"use client";

import { createPortal } from "react-dom";
import React, { useState, useRef, useEffect } from "react";
import {
  Lock,
  AlertCircle,
  X,
  Loader2,
  Smartphone,
  Zap,
  Receipt,
} from "lucide-react";
import { createZiinaPaymentIntent, getBookingPaymentQuote, type BookingPaymentQuote } from "@/lib/ziina";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { formatCurrency, cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { PlatformPaymentSettings } from "@/lib/types/platform-settings";

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
  securityDeposit = 0,
  orderTitle,
  onPaymentSuccess,
}: BookingPaymentModalProps) {
  const { isArabic, t, direction } = useLanguage();
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap({ isOpen, onClose, containerRef: dialogRef });

  const [loadedQuote, setLoadedQuote] = useState<{
    bookingId?: string;
    referenceCode: string;
    quote: BookingPaymentQuote;
  } | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getBookingPaymentQuote(bookingId || "", referenceCode).then((result) => {
      if (cancelled) return;
      if (result.quote) {
        setLoadedQuote({ bookingId, referenceCode, quote: result.quote });
        setQuoteError(null);
      } else {
        setQuoteError(result.error || "Unable to load booking payment.");
      }
    }).catch(() => {
      if (!cancelled) setQuoteError("Unable to load booking payment.");
    });
    return () => {
      cancelled = true;
      setLoadedQuote(null);
      setQuoteError(null);
    };
  }, [isOpen, bookingId, referenceCode]);
  const quote = loadedQuote && loadedQuote.bookingId === bookingId && loadedQuote?.referenceCode === referenceCode
    ? loadedQuote.quote : null;

  if (!isOpen) return null;

  const selectedOption = quote?.options.find((option) => option.type === paymentType) ?? quote?.options[0];
  const chargeAmount = selectedOption?.amountAed ?? 0;
  const depositPercent = quote?.depositPercent ?? 50;
  const isBalancePayment = quote?.paymentStatus === "deposit_paid";

  // Dynamic UAE VAT calculation breakdown
  const vatRatePercent = quote?.vatRatePercent ?? 5;
  const vatRate = 1 + vatRatePercent / 100;
  const vatAmount = Math.round((chargeAmount - chargeAmount / vatRate) * 100) / 100;
  const netAmount = Math.round((chargeAmount - vatAmount) * 100) / 100;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !selectedOption || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await createZiinaPaymentIntent(
        bookingId || "",
        { paymentStatus: quote.paymentStatus, amountAed: chargeAmount },
        selectedOption.type,
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

      if (res.quote) {
        setLoadedQuote({ bookingId, referenceCode, quote: res.quote });
      }
      setErrorMsg(res.error || t("studioBooking.paymentModal.authInterrupted"));
    } catch (err) {
      setErrorMsg((err as Error).message || t("studioBooking.paymentModal.gatewayUnreachable"));
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain">
      <div
        ref={dialogRef}
        dir={direction}
        role="dialog"
        aria-modal="true"
        aria-label={t("studioBooking.paymentModal.dialogAria")}
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
                {t("studioBooking.paymentModal.title")}
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
            aria-label={t("studioBooking.paymentModal.closeAria")}
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

        {!quote ? (
          <div role={quoteError ? "alert" : "status"} aria-busy={!quoteError} className="p-4 text-sm text-slate-300">
            {quoteError
              ? (isArabic ? t("studioBooking.paymentModal.loadError") : quoteError)
              : t("studioBooking.paymentModal.loadingDetails")}
          </div>
        ) : (
        <form onSubmit={handlePay} className="space-y-5 text-xs">
          {/* Order Summary & VAT Breakdown Card */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs font-semibold text-white pb-2 border-b border-white/5">
              <span className="flex items-center gap-1.5 shrink-0">
                <Receipt size={14} className="text-brand-mauve" />
                {t("studioBooking.paymentModal.taxInvoiceSummary")}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0 whitespace-nowrap">
                {t("studioBooking.paymentModal.includesVat", { rate: vatRatePercent })}
              </span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{t("studioBooking.paymentModal.netAmountBeforeVat")}</span>
              <span className="font-mono text-slate-300">{formatCurrency(netAmount)}</span>
            </div>

            <div className="flex justify-between text-text-muted text-[11px]">
              <span>{t("studioBooking.paymentModal.uaeVatLabel", { rate: vatRatePercent })}</span>
              <span className="font-mono text-slate-300">{formatCurrency(vatAmount)}</span>
            </div>

            {securityDeposit > 0 && (
              <div className="flex flex-col gap-0.5 pt-1 border-t border-white/5 text-[11px]">
                <div className="flex justify-between text-brand-mauve-soft">
                  <span>{t("studioBooking.paymentModal.securityDepositLabel")}</span>
                  <span className="font-mono font-bold">{formatCurrency(securityDeposit)}</span>
                </div>
                <span className="text-[10px] text-text-muted">
                  {t("studioBooking.paymentModal.securityDepositNote")}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-white/10 text-white font-bold text-sm">
              <span>{t("studioBooking.paymentModal.totalPayableNow")}</span>
              <span className="text-brand-mauve font-mono text-base font-extrabold">
                {formatCurrency(chargeAmount)}
              </span>
            </div>
          </div>

          {/* Option Selector: Configured Deposit vs Full */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              {t("studioBooking.paymentModal.paymentSchedule")}
            </label>
            <div className={cn("grid gap-3", quote.options.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {quote.options.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  disabled={isProcessing}
                  aria-pressed={selectedOption?.type === option.type}
                  onClick={() => setPaymentType(option.type)}
                  className={cn(
                    "p-3 rounded-2xl border text-start transition-all cursor-pointer",
                    selectedOption?.type === option.type
                      ? "bg-brand-violet/30 border-brand-mauve/50 text-white shadow-md shadow-brand-violet/20"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                  )}
                >
                  <div className="text-[10px] font-mono uppercase text-brand-mauve">
                    {option.type === "deposit"
                      ? t("studioBooking.paymentModal.bookingDeposit", { percent: depositPercent })
                      : isBalancePayment
                        ? t("studioBooking.paymentModal.remainingBalance")
                        : t("studioBooking.paymentModal.fullPayment")}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {formatCurrency(option.amountAed)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {option.type === "deposit"
                      ? t("studioBooking.paymentModal.locksSchedule")
                      : t("studioBooking.paymentModal.completeSettlement")}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ziina UAE Gateway Information */}
          <div className="p-4 rounded-2xl bg-brand-violet/[0.15] border border-brand-mauve/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-brand-mauve-soft font-semibold text-xs">
                <Smartphone size={15} className="shrink-0" />
                <span>{t("studioBooking.paymentModal.regulatedBadge")}</span>
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
              {t("studioBooking.paymentModal.gatewayDescription")}
            </p>
          </div>

          {/* Security & Regulatory Notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
            <Lock size={13} className="text-emerald-400 shrink-0" />
            <span>{t("studioBooking.paymentModal.securityNotice")}</span>
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
                <span>{t("studioBooking.paymentModal.redirecting")}</span>
              </>
            ) : (
              <>
                <Zap size={16} className="fill-white text-white" />
                <span>
                  {t("studioBooking.paymentModal.payButton", { amount: formatCurrency(chargeAmount) })}
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
