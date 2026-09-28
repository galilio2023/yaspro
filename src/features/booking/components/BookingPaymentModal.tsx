"use client";

import React, { useState } from "react";
import { CreditCard, ShieldCheck, Lock, AlertCircle, X, Loader2 } from "lucide-react";
import { processBookingOnlinePayment } from "@/lib/payment-actions";
import { formatCurrency } from "@/lib/utils";

interface BookingPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  referenceCode: string;
  totalAmount: number;
  onPaymentSuccess: (paymentStatus: "deposit_paid" | "paid", transactionId: string) => void;
}

export function BookingPaymentModal({
  isOpen,
  onClose,
  bookingId,
  referenceCode,
  totalAmount,
  onPaymentSuccess,
}: BookingPaymentModalProps) {
  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("•••");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const depositAmount = Math.round(totalAmount * 0.5);
  const chargeAmount = paymentType === "deposit" ? depositAmount : totalAmount;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await processBookingOnlinePayment(
        bookingId || "",
        chargeAmount,
        paymentType,
        referenceCode
      );

      if (res.success && res.paymentStatus && res.transactionId) {
        onPaymentSuccess(res.paymentStatus, res.transactionId);
        onClose();
      } else {
        setErrorMsg(res.error || "Payment failed. Please verify your payment details and retry.");
      }
    } catch (err) {
      setErrorMsg((err as Error).message || "Unable to reach payment gateway. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/10 shadow-2xl p-6 sm:p-8 text-left animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-display">Secure Online Checkout</h3>
              <span className="text-[10px] font-mono text-purple-400">REF: {referenceCode}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4 text-xs">
          {/* Option Selector: 50% Deposit vs Full */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Payment Option</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("deposit")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentType === "deposit"
                    ? "bg-purple-600/20 border-purple-500/50 text-white"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-purple-300">50% Deposit</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatCurrency(depositAmount)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Holds your stage date</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("full")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  paymentType === "full"
                    ? "bg-purple-600/20 border-purple-500/50 text-white"
                    : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="text-[10px] font-mono uppercase text-purple-300">Full Amount</div>
                <div className="text-sm font-bold text-white mt-0.5">{formatCurrency(totalAmount)}</div>
                <div className="text-[10px] text-slate-400 mt-1">Instant reconciliation</div>
              </button>
            </div>
          </div>

          {/* Mock Card Form */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Expires</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">CVC</label>
                <input
                  type="password"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
            <Lock size={13} className="text-emerald-400" />
            <span>256-bit TLS encrypted via sovereign UAE payment rails</span>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Processing Authorization...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Pay {formatCurrency(chargeAmount)} Securely</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
