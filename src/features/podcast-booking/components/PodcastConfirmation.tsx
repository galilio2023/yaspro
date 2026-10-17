"use client";

import { CheckCircle2, AlertCircle, MessageCircle, ArrowRight } from "lucide-react";
import { PodcastBookingResult } from "../actions";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PodcastConfirmationProps {
  result: PodcastBookingResult;
  onBookAnother: () => void;
}

export function PodcastConfirmation({ result, onBookAnother }: PodcastConfirmationProps) {
  const { t, isArabic } = useLanguage();
  const paymentFailed = result.paymentFailed === true;
  const reference = result.referenceCode || "POD-CONFIRMED";
  const whatsappUrl = `https://wa.me/971501234567?text=${encodeURIComponent(
    t("podcastBooking.confirmation.whatsappText", { reference })
  )}`;

  return (
    <div className="w-full max-w-2xl mx-auto p-5 sm:p-10 lg:p-12 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-300">
      <div className={`size-16 sm:size-20 rounded-full border mx-auto flex items-center justify-center ${paymentFailed ? "bg-brand-mauve/15 border-brand-mauve/30 text-brand-mauve shadow-[0_0_30px_rgba(84,37,104,0.35)]" : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"}`}>
        {paymentFailed ? <AlertCircle className="size-8 sm:size-10" /> : <CheckCircle2 className="size-8 sm:size-10" />}
      </div>

      <div className="space-y-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${paymentFailed ? "text-brand-mauve" : "text-emerald-400"}`}>
          {paymentFailed ? t("podcastBooking.confirmation.unpaidBadge") : t("podcastBooking.confirmation.confirmedBadge")}
        </span>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white">
          {paymentFailed ? t("podcastBooking.confirmation.unpaidTitle") : t("podcastBooking.confirmation.confirmedTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
          {paymentFailed
            ? t("podcastBooking.confirmation.unpaidDesc")
            : t("podcastBooking.confirmation.confirmedDesc")}
        </p>
      </div>

      {paymentFailed && (
        <p role="alert" className="text-xs sm:text-sm text-brand-lavender bg-brand-mauve/10 border border-brand-mauve/20 rounded-xl p-3 max-w-md mx-auto">{result.message}</p>
      )}

      {/* Booking Reference Pill */}
      <div className="p-4 rounded-2xl bg-brand-violet/10 border border-brand-mauve/30 max-w-sm mx-auto shadow-sm shadow-brand-violet/20">
        <span className="text-[11px] uppercase tracking-wider text-text-muted block font-semibold mb-1">
          {t("podcastBooking.confirmation.bookingRef")}
        </span>
        <span className="text-xl font-mono font-extrabold text-brand-mauve tracking-wider">
          {reference}
        </span>
      </div>

      {/* Instructions & Next steps */}
      <div className="text-start p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs text-text-muted">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
          {t("podcastBooking.confirmation.arrivalChecklist")}
        </h4>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <strong className="text-white">{t("podcastBooking.confirmation.locTitle")}</strong> {t("podcastBooking.confirmation.locVal")}
          </li>
          <li>
            <strong className="text-white">{t("podcastBooking.confirmation.arrTitle")}</strong> {t("podcastBooking.confirmation.arrVal")}
          </li>
          <li>
            <strong className="text-white">{t("podcastBooking.confirmation.storageTitle")}</strong> {t("podcastBooking.confirmation.storageVal")}
          </li>
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
        >
          <MessageCircle size={15} />
          {t("podcastBooking.confirmation.chatConcierge")}
        </a>

        <button
          type="button"
          onClick={onBookAnother}
          className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
        >
          {t("podcastBooking.confirmation.bookAnother")}
          <ArrowRight size={14} className={isArabic ? "rotate-180" : ""} />
        </button>
      </div>
    </div>
  );
}
