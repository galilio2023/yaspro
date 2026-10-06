"use client";

import { CheckCircle2, MessageCircle, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PodcastBookingResult } from "../actions";

interface PodcastConfirmationProps {
  result: PodcastBookingResult;
  onBookAnother: () => void;
}

export function PodcastConfirmation({ result, onBookAnother }: PodcastConfirmationProps) {
  const reference = result.referenceCode || "POD-CONFIRMED";
  const whatsappUrl = `https://wa.me/971501234567?text=${encodeURIComponent(
    `Hello Yas Pro Concierge, I just booked podcast session ${reference}. Could you confirm the details?`
  )}`;

  return (
    <div className="w-full max-w-2xl mx-auto p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-8 animate-in zoom-in-95 duration-300">
      <div className="size-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
        <CheckCircle2 size={42} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Booking Confirmed
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Your Podcast Session is Booked!
        </h2>
        <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto">
          We have reserved the studio stage at Iris Bay, Business Bay, Dubai. A confirmation summary has been dispatched.
        </p>
      </div>

      {/* Booking Reference Pill */}
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 max-w-sm mx-auto">
        <span className="text-[11px] uppercase tracking-wider text-text-muted block font-semibold mb-1">
          Booking Reference
        </span>
        <span className="text-xl font-mono font-extrabold text-amber-400 tracking-wider">
          {reference}
        </span>
      </div>

      {/* Instructions & Next steps */}
      <div className="text-left p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 text-xs text-text-muted">
        <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
          Session Arrival Checklist:
        </h4>
        <ul className="space-y-2 list-disc list-inside">
          <li>
            <strong className="text-white">Location:</strong> Iris Bay Tower, Business Bay, Dubai (Level 18).
          </li>
          <li>
            <strong className="text-white">Arrival:</strong> Please arrive 15 minutes before your scheduled start time.
          </li>
          <li>
            <strong className="text-white">Storage:</strong> If not ordering Yas Pro full episode edit, remember your SSD drive.
          </li>
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
        >
          <MessageCircle size={16} />
          Chat with Studio Concierge
        </a>

        <button
          type="button"
          onClick={onBookAnother}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
        >
          Book Another Session
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
