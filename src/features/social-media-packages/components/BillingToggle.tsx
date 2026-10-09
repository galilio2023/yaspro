"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface BillingToggleProps {
  billingInterval: "monthly" | "yearly";
  onChange: (interval: "monthly" | "yearly") => void;
}

export function BillingToggle({ billingInterval, onChange }: BillingToggleProps) {
  const { isArabic } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Outer Obsidian Pill Container */}
      <div
        role="group"
        aria-label={isArabic ? "اختر نوع الفوترة" : "Choose billing frequency"}
        className="relative inline-flex items-center p-1 rounded-full bg-[#0a0d14] border border-white/15 backdrop-blur-2xl shadow-2xl"
      >
        {/* Yearly Button */}
        <button
          type="button"
          onClick={() => onChange("yearly")}
          className={`relative z-10 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer flex items-center gap-2 ${
            billingInterval === "yearly"
              ? "text-slate-950"
              : "text-zinc-400 hover:text-white"
          }`}
          aria-pressed={billingInterval === "yearly"}
        >
          {billingInterval === "yearly" && (
            <motion.div
              layoutId="billing-pill-active"
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="absolute inset-0 bg-brand-mauve rounded-full shadow-lg shadow-brand-violet/40"
            />
          )}
          <span className="relative z-10 font-black tracking-tight">
            {isArabic ? "الاشتراك السنوي" : "Yearly Billing"}
          </span>
          <span
            className={`relative z-10 text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
              billingInterval === "yearly"
                ? "bg-slate-950 text-brand-lavender"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            -20%
          </span>
        </button>

        {/* Monthly Button */}
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={`relative z-10 px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
            billingInterval === "monthly"
              ? "text-white"
              : "text-zinc-400 hover:text-white"
          }`}
          aria-pressed={billingInterval === "monthly"}
        >
          {billingInterval === "monthly" && (
            <motion.div
              layoutId="billing-pill-active"
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="absolute inset-0 bg-white/[0.12] border border-white/20 rounded-full shadow-lg backdrop-blur-md"
            />
          )}
          <span className="relative z-10 font-black tracking-tight">
            {isArabic ? "الاشتراك الشهري" : "Monthly Billing"}
          </span>
        </button>
      </div>

      {/* Savings Callout */}
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        key={billingInterval}
        className="text-[11px] sm:text-xs text-brand-mauve font-mono tracking-wide flex items-center gap-2"
      >
        <span className="inline-block size-1.5 rounded-full bg-brand-mauve animate-pulse" />
        {billingInterval === "yearly"
          ? isArabic
            ? "خصم 20% ساري · تثبيت أسعار الاستوديو طوال العام وتوفير يصل إلى 25,200 درهم"
            : "20% SAVINGS ACTIVE · GUARANTEED SOUNDSTAGE PRIORITY ALL YEAR"
          : isArabic
            ? "الاشتراك الشهري المرن · يمكنك الترقية إلى السنوي في أي وقت والحصول على خصم 20%"
            : "FLEXIBLE MONTHLY CADENCE · UPGRADE TO YEARLY ANYTIME FOR 20% SAVINGS"}
      </motion.p>
    </div>
  );
}
