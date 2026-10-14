"use client";

import { CheckCircle2, MessageCircle, Copy, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatAED, studioSprings } from "@/features/booking/components/ui/BookingKit";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";
import { WHATSAPP_PHONE } from "@/lib/constants";

interface OffersConfirmationProps {
  referenceCode?: string;
  email: string;
  bookingId?: string;
  paymentFailed?: boolean;
  totalAmount?: number;
  offerName: string;
  date: string;
  timeSlot: string;
}

export function OffersConfirmation({
  referenceCode = "YAS-OFR-PENDING",
  paymentFailed = false,
  totalAmount,
  offerName,
  date,
  timeSlot,
}: OffersConfirmationProps) {
  const { isArabic } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Yas Pro Operations, I have submitted a booking request for the offer "${offerName}" (Ref: ${referenceCode}) for ${date} at ${timeSlot}.`
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={studioSprings.cinematic}
      className="w-full max-w-xl mx-auto rounded-3xl bg-[#0e0e13] border border-white/[0.08] p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-violet/25 blur-3xl pointer-events-none rounded-full" />

      {/* Success Badge */}
      <div className="relative size-16 sm:size-20 rounded-full bg-brand-mauve/15 border border-brand-mauve/40 flex items-center justify-center mx-auto text-brand-lavender shadow-[0_0_40px_rgba(152,123,165,0.4)]">
        <CheckCircle2 size={36} className="text-brand-mauve" />
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-brand-mauve font-semibold">
          {isArabic ? "طلب الحجز قيد التأكيد" : "Booking Pending Confirmation"}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
          {isArabic ? "تم استلام طلب الحجز" : "Your Booking Request is Received"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          {isArabic
            ? `تم استلام طلب حجز "${offerName}" وهو بانتظار تأكيد فريق الاستوديو.`
            : `Your booking request for "${offerName}" is pending confirmation by the studio team.`}
        </p>
      </div>

      {paymentFailed && (
        <p role="alert" className="text-sm text-brand-lavender bg-brand-violet/15 border border-brand-mauve/30 rounded-xl p-4">
          <AlertCircle size={16} className="inline-block me-2" />
          {isArabic
            ? "تم استلام طلب الحجز، لكن تعذّر بدء الدفع الإلكتروني. لم يتم تأكيد الدفع. يمكنك الدفع في الاستوديو أو التواصل معنا لإعادة المحاولة."
            : "Your booking request was received, but online payment could not start. Payment is not confirmed. You can pay at the studio or contact us to retry."}
        </p>
      )}

      {/* Reference Code Card */}
      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="text-start">
          <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            {isArabic ? "رمز الحجز المرجعي" : "Booking Reference Code"}
          </span>
          <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider break-all">
            {referenceCode}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
          title="Copy reference code"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span>{copied ? (isArabic ? "تم النسخ" : "Copied") : isArabic ? "نسخ" : "Copy"}</span>
        </button>
      </div>

      {/* Booking Details Strip */}
      <div className="grid grid-cols-2 gap-2 text-start p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs max-w-md mx-auto">
        <div>
          <span className="text-zinc-500 block font-mono text-[10px] uppercase">
            {isArabic ? "التاريخ والوقت" : "Date & Time"}
          </span>
          <span className="text-zinc-200 font-medium">
            {date} • {timeSlot}
          </span>
        </div>
        <div>
          <span className="text-zinc-500 block font-mono text-[10px] uppercase">
            {isArabic ? "الموقع" : "Location"}
          </span>
          <span className="text-zinc-200 font-medium">Iris Bay Dubai · Level 18</span>
        </div>
        {totalAmount && (
          <div className="col-span-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-zinc-500 font-mono text-[10px] uppercase">
              {isArabic ? "المبلغ الإجمالي" : "Total Amount"}
            </span>
            <span className="text-brand-mauve font-bold font-mono text-sm">
              {formatAED(totalAmount, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Concierge Actions */}
      <div className="space-y-2.5 max-w-md mx-auto pt-2">
        <a
          href={`https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle size={15} className="text-emerald-400" />
          <span>{isArabic ? "تواصل فوراً مع مخرج العمليات عبر واتساب" : "Chat with Operations on WhatsApp"}</span>
        </a>

        <Link
          href="/"
          className="w-full py-2.5 px-4 rounded-xl text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors block text-center font-medium"
        >
          {isArabic ? "العودة إلى الصفحة الرئيسية" : "Return to Yas Pro Homepage"}
        </Link>
      </div>
    </motion.div>
  );
}
