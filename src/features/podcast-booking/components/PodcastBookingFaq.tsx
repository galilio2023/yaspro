"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { HelpCircle } from "lucide-react";

export function PodcastBookingFaq() {
  const { t } = useLanguage();

  const faqs = [
    {
      q: t("podcastBooking.faq.q1"),
      a: t("podcastBooking.faq.a1"),
    },
    {
      q: t("podcastBooking.faq.q2"),
      a: t("podcastBooking.faq.a2"),
    },
    {
      q: t("podcastBooking.faq.q3"),
      a: t("podcastBooking.faq.a3"),
    },
    {
      q: t("podcastBooking.faq.q4"),
      a: t("podcastBooking.faq.a4"),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-20 pt-16 border-t border-white/10 space-y-8">
      <div className="text-center space-y-2">
        <div className="size-10 rounded-2xl bg-brand-mauve/10 border border-brand-mauve/20 text-brand-mauve flex items-center justify-center mx-auto shadow-sm shadow-brand-violet/20">
          <HelpCircle size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {t("podcastBooking.faq.title")}
        </h2>
        <p className="text-xs text-zinc-400">
          {t("podcastBooking.faq.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2"
          >
            <h3 className="font-bold text-white text-sm">{faq.q}</h3>
            <p className="text-zinc-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
