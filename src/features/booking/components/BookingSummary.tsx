"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, Camera, ShieldCheck, Box, Sparkles, CreditCard, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { BookingState, SessionTypeItem, StudioItem } from "../types";
import { STUDIO_GEAR_PACKAGES } from "../constants";

interface BookingSummaryProps {
  state: BookingState;
  studio: StudioItem;
  sessionTypeObj?: SessionTypeItem;
  total: number;
}

export function BookingSummary({
  state,
  studio,
  sessionTypeObj,
  total,
}: BookingSummaryProps) {
  const { isArabic } = useLanguage();
  const [currency, setCurrency] = useState<"AED" | "USD">("AED");
  const exchangeRate = currency === "USD" ? 0.272 : 1;
  const displayTotal = total * exchangeRate;

  const selectedGear = STUDIO_GEAR_PACKAGES.find(
    (g) => g.id === state.selectedGearPackage
  );

  return (
    <aside
      aria-label={isArabic ? "ملخص حجز الاستوديو" : "Session summary quote"}
      className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-28 pb-4 sm:pb-0 mb-4 lg:mb-0"
    >
      <div className="rounded-3xl border border-amber-500/20 bg-[#070709]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h4 className="text-text-primary font-bold text-sm uppercase tracking-wider font-display">
              {isArabic ? "تفاصيل الجلسة" : "Session Breakdown"}
            </h4>
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setCurrency("AED")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currency === "AED" ? "bg-amber-500 text-zinc-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                AED
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  currency === "USD" ? "bg-amber-500 text-zinc-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                USD
              </button>
            </div>
          </div>
          <Badge variant="live" className="text-[10px]">
            <Zap size={10} /> {isArabic ? "تسعير فوري" : "Live Quote"}
          </Badge>
        </div>

        {/* Studio */}
        <div className="mb-5 pb-5 border-b border-white/10 rounded-xl bg-white/[0.03] p-3.5 -mx-1">
          <span className="text-[10px] text-text-ghost uppercase tracking-widest font-mono block mb-1">
            {isArabic ? "الاستوديو المحدد" : "Reserved Stage"}
          </span>
          <p className="text-base font-bold text-text-primary font-display">
            {studio.name}
          </p>
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mt-1.5">
            <span>{formatCurrency(studio.rate)} {isArabic ? "/ ساعة" : "/ hour"}</span>
            <span className="font-mono text-text-primary">
              {formatCurrency(studio.rate * state.durationHours)}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-3 mb-5 pb-5 border-b border-white/10 text-xs">
          {[
            {
              icon: Calendar,
              label: isArabic ? "التاريخ" : "Date",
              value: state.date || (isArabic ? "لم يحدد بعد" : "Not selected yet"),
              color: "text-amber-400",
            },
            {
              icon: Clock,
              label: isArabic ? "المدة" : "Duration",
              value: `${state.durationHours} ${isArabic ? "ساعات" : "Hours"}`,
              color: "text-amber-400",
            },
            {
              icon: Users,
              label: isArabic ? "طاقم العمل" : "Cast & Crew",
              value: `${state.headcount} ${isArabic ? "أشخاص" : "People"}`,
              color: "text-emerald-400",
            },
            {
              icon: Camera,
              label: isArabic ? "نوع الإنتاج" : "Type",
              value: sessionTypeObj?.label || "—",
              color: "text-emerald-400",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Icon size={13} className={color} /> {label}:
              </span>
              <span className="text-text-primary font-semibold capitalize">{value}</span>
            </div>
          ))}

          {selectedGear && selectedGear.id !== "none" && (
            <div className="flex justify-between items-center pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-text-secondary truncate pr-2">
                <Box size={13} className="text-emerald-400 shrink-0" />
                <span className="truncate text-text-primary font-medium">{selectedGear.name}</span>
              </span>
              <span className="text-emerald-400 font-bold shrink-0">+{formatCurrency(selectedGear.rate)}</span>
            </div>
          )}

          {state.needsCrew && (
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">{isArabic ? "طاقم استوديو مخصص:" : "Dedicated Studio Crew:"}</span>
              <span className="text-emerald-400 font-bold">+500 AED</span>
            </div>
          )}

          {state.needsAiAutoCut && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <Sparkles size={12} className="text-amber-400" />
                <span>{isArabic ? "مونتاج ذكاء اصطناعي وترجمة:" : "AI Auto-Cut & Subtitles:"}</span>
              </span>
              <span className="text-amber-400 font-bold">+450 AED</span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-xs text-text-muted block">
              {isArabic ? "المجموع التقديري" : "Estimated Total"}
            </span>
            <span className="text-[10px] text-text-ghost">
              {isArabic ? "شامل 5% ضريبة القيمة المضافة" : "Inclusive of 5% UAE VAT"}
            </span>
          </div>
          <div className="text-right">
            <motion.div
              key={`${displayTotal}-${currency}`}
              initial={{ scale: 0.94, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="text-3xl font-extrabold font-display tracking-tight"
              style={{
                background: "linear-gradient(135deg,#f59e0b,#fcd34d,#d97706)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {formatCurrency(Math.round(displayTotal), currency)}
            </motion.div>
          </div>
        </div>

        {/* WhatsApp Fast Dispatch CTA */}
        <a
          href={`https://wa.me/971554010465?text=${encodeURIComponent(
            `Hello Yas Pro Dubai Studio Team,\n\nI am requesting a studio booking hold:\n• Studio: ${studio.name}\n• Date: ${state.date || "To be confirmed"}\n• Duration: ${state.durationHours} Hours\n• Type: ${sessionTypeObj?.label || "Production"}\n• Estimated Total: ${formatCurrency(total)}\n\nPlease confirm availability and lock the calendar hold for us.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mb-4 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:opacity-95 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="size-2 rounded-full bg-white"></span>
          {isArabic ? "تأكيد سريع عبر واتساب" : "Instant WhatsApp Booking Hold"}
        </a>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-text-primary font-semibold text-[11px] pb-2 border-b border-white/10">
            <span className="flex items-center gap-1.5">
              <CreditCard size={13} className="text-amber-400" />
              <span>{isArabic ? "طرق الدفع المعتمدة" : "Accepted Payment Methods"}</span>
            </span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-400 inline-block" /> {isArabic ? "حجز فوري" : "Instant Hold"}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Apple Pay</strong>,{" "}
            <strong className="text-text-primary">Ziina</strong>, Visa / Mastercard,
            {isArabic
              ? " أو أمر شراء مؤسسي للهيئات والشركات في دولة الإمارات."
              : " or Corporate PO for UAE government and broadcast entities."}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-text-ghost pt-0.5">
            <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
            <span>
              {isArabic
                ? "إلغاء مجاني حتى 48 ساعة قبل موعد الجلسة."
                : "Free cancellation up to 48 hours prior to session."}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
