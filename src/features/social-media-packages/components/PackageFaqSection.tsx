"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, MessageSquare } from "lucide-react";
import { PACKAGE_FAQS } from "../data/packages";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function PackageFaqSection() {
  const { isArabic } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="w-full mt-20 pt-16 border-t border-white/10 max-w-4xl mx-auto">
      <div className="text-center space-y-3 mb-10">
        <div className="size-11 rounded-2xl bg-brand-mauve/10 border border-brand-mauve/20 text-brand-mauve flex items-center justify-center mx-auto shadow-sm shadow-brand-violet/20">
          <HelpCircle size={22} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
          {isArabic ? "الأسئلة الشائعة حول باقات السوشيال ميديا" : "Frequently Asked Questions"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
          {isArabic
            ? "كل ما تود معرفته عن أيام التصوير، معدات السينما، آلية التسليم وسياسة الاشتراك."
            : "Everything you need to know about shoot days, cinema gear, turnaround times, and billing."}
        </p>
      </div>

      <div className="space-y-3">
        {PACKAGE_FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-[#0c1017] overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-bold text-sm sm:text-base text-zinc-100">
                  {isArabic ? faq.questionAr : faq.questionEn}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-brand-mauve" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                  {isArabic ? faq.answerAr : faq.answerEn}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions banner */}
      <div className="mt-10 p-6 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="text-sm font-bold text-white">
            {isArabic ? "هل لديك متطلبات تصوير خاصة أو حملة موسمية؟" : "Need custom filming days or high-volume reels?"}
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isArabic
              ? "فريقنا مستعد لتفصيل باقة مخصصة تجمع بين استوديوهات البودكاست وتصوير المنتجات."
              : "Our creative producers will tailor a hybrid package for your exact campaign requirements."}
          </p>
        </div>
        <a
          href="https://wa.me/971554010465?text=Hello%20Yas%20Pro!%20I%20have%20questions%20regarding%20your%20Social%20Media%20Packages."
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <MessageSquare size={14} />
          <span>{isArabic ? "استشارة مجانية عبر واتساب" : "Chat With a Producer"}</span>
        </a>
      </div>
    </div>
  );
}
