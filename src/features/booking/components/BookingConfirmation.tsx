import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, ShieldCheck } from "lucide-react";
import { BookingPaymentModal } from "./BookingPaymentModal";

interface BookingConfirmationProps {
  referenceCode: string;
  email: string;
  bookingId?: string;
  totalAmount?: number;
}

export function BookingConfirmation({
  referenceCode,
  email,
  bookingId,
  totalAmount = 1600,
}: BookingConfirmationProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "deposit_paid" | "paid">("unpaid");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const handlePaymentSuccess = (status: "deposit_paid" | "paid", txnId: string) => {
    setPaymentStatus(status);
    setTransactionRef(txnId);
  };

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 sm:p-14 text-center max-w-xl mx-auto shadow-2xl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle className="mx-auto text-green-400 mb-6" size={68} />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-2 font-display">
          Booking Confirmed!
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          Your studio session has been secured in our production calendar.
        </p>
        <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/10 px-6 py-4 mb-4 inline-block">
          <p className="text-brand-purple-light font-mono font-extrabold text-xl tracking-wider">
            {referenceCode}
          </p>
          <p className="text-text-muted text-xs mt-1">
            Booking Confirmation Reference
          </p>
        </div>

        {/* Payment Status Pill */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              paymentStatus === "deposit_paid" || paymentStatus === "paid"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/20 text-amber-300 border-amber-500/40"
            }`}
          >
            {paymentStatus === "deposit_paid"
              ? "50% DEPOSIT PAID ONLINE"
              : paymentStatus === "paid"
              ? "PAID IN FULL"
              : "PAYMENT: PENDING (50% DEPOSIT DUE)"}
          </span>
          {transactionRef && (
            <span className="text-[10px] font-mono text-slate-400">
              TXN: {transactionRef}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          {paymentStatus === "unpaid" ? (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <CreditCard size={15} />
              <span>Pay 50% Deposit Online</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={16} />
              <span>Payment Reconciled</span>
            </div>
          )}

          <a
            href={`https://wa.me/971554010465?text=${encodeURIComponent(
              `Hello Yas Pro Coordinator, my booking reference code is ${referenceCode}. Email: ${email || "provided"}. I would like to confirm production crew arrival and equipment specifications.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>WhatsApp Stage Coordinator</span>
          </a>

          <a
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            <span>Client Portal &rarr;</span>
          </a>
        </div>

        <p className="text-text-muted text-xs leading-relaxed">
          A confirmation with access details and calendar invite has been sent to{" "}
          <span className="text-white font-medium">{email || "your email"}</span>.
        </p>
      </div>

      <BookingPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bookingId={bookingId}
        referenceCode={referenceCode}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
