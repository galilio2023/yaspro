import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, CreditCard, ShieldCheck } from "lucide-react";
import { BookingPaymentModal } from "./BookingPaymentModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
  const { t, isArabic, direction } = useLanguage();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "deposit_paid" | "paid">("unpaid");
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  const handlePaymentSuccess = (status: "deposit_paid" | "paid", txnId: string) => {
    setPaymentStatus(status);
    setTransactionRef(txnId);
  };

  const whatsappText = t("studioBooking.confirmation.whatsappPrefill", {
    referenceCode,
    email: email || t("studioBooking.confirmation.emailFallback"),
  });

  return (
    <>
      <div
        dir={direction}
        className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-10 lg:p-14 text-center max-w-xl mx-auto shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle className="mx-auto text-emerald-400 mb-6" size={68} />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-white mb-2 font-display">
          {t("studioBooking.confirmation.title")}
        </h2>
        <p className="text-text-secondary text-sm mb-6">
          {t("studioBooking.confirmation.subtitle")}
        </p>
        <div className="rounded-2xl border border-brand-mauve/40 bg-brand-violet/20 px-6 py-4 mb-4 inline-block shadow-lg shadow-brand-violet/20">
          <p className="text-brand-mauve font-mono font-extrabold text-xl tracking-wider" dir="ltr">
            {referenceCode}
          </p>
          <p className="text-text-muted text-xs mt-1">
            {t("studioBooking.confirmation.referenceLabel")}
          </p>
        </div>

        {/* Payment Status Pill */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
          <span
            className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border text-center ${
              paymentStatus === "deposit_paid" || paymentStatus === "paid"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-brand-mauve/15 text-brand-mauve border-brand-mauve/30"
            }`}
          >
            {paymentStatus === "deposit_paid"
              ? t("studioBooking.confirmation.statusDepositPaid")
              : paymentStatus === "paid"
              ? t("studioBooking.confirmation.statusPaidFull")
              : t("studioBooking.confirmation.statusPending")}
          </span>
          {transactionRef && (
            <span className="text-[10px] font-mono text-slate-400" dir="ltr">
              TXN: {transactionRef}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 mb-6">
          {paymentStatus === "unpaid" ? (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl btn-brand text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <CreditCard size={15} />
              <span>{t("studioBooking.confirmation.proceedPaymentBtn")}</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={16} />
              <span>{t("studioBooking.confirmation.paymentReconciled")}</span>
            </div>
          )}

          <a
            href={`https://wa.me/971554010465?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xl shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{t("studioBooking.confirmation.whatsappCoordinatorBtn")}</span>
          </a>

          <a
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors"
          >
            <span>
              {t("studioBooking.confirmation.myAccountBtn")} {isArabic ? "←" : "→"}
            </span>
          </a>
        </div>

        <p className="text-text-muted text-xs leading-relaxed">
          {t("studioBooking.confirmation.emailNoticePrefix")}{" "}
          <span className="text-white font-medium">{email || t("studioBooking.confirmation.yourEmail")}</span>.
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
