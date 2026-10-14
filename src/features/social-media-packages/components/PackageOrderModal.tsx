"use client";

import React, { useId, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Send, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import { SocialMediaPackage } from "../data/packages";
import { submitInquiry } from "@/lib/actions";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface PackageOrderModalProps {
  pkg: SocialMediaPackage | null;
  billingInterval: "monthly" | "yearly";
  isOpen: boolean;
  onClose: () => void;
}

export function PackageOrderModal({
  pkg,
  billingInterval,
  isOpen,
  onClose,
}: PackageOrderModalProps) {
  const { isArabic } = useLanguage();
  const formId = useId();
  const headingId = `${formId}-heading`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setNotes("");
    onClose();
  };

  useFocusTrap({
    isOpen: isOpen && !!pkg,
    onClose: handleResetAndClose,
    containerRef: dialogRef,
  });

  if (!isOpen || !pkg) return null;

  const currentPrice =
    billingInterval === "yearly" ? pkg.yearlyPricePerMonth : pkg.monthlyPrice;

  const whatsappMessage = encodeURIComponent(
    `Hello Yas Pro Team! I am interested in subscribing to the [${pkg.nameEn}] Social Media Package (${
      billingInterval === "yearly" ? "Annual -20% Plan" : "Monthly Plan"
    }${currentPrice ? ` @ AED ${currentPrice}/mo` : ""}). Please guide me on onboarding and filming scheduling.`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const priceText = currentPrice
      ? `AED ${currentPrice.toLocaleString()} / month (${billingInterval.toUpperCase()} cadence)`
      : "Custom Enterprise Quote";

    const inquiryMessage = [
      `[Social Media Package Subscription Request]`,
      `• Selected Plan: ${pkg.nameEn} (${pkg.nameAr})`,
      `• Billing Cadence: ${billingInterval === "yearly" ? "Yearly (-20% Discount)" : "Monthly"}`,
      `• Price: ${priceText}`,
      `• Brand / Handle / Company: ${company || "Not provided"}`,
      `• Client Notes: ${notes || "No special requirements specified"}`,
      `\nPlease contact the client to finalize onboarding and schedule initial production session.`,
    ].join("\n");

    try {
      const res = await submitInquiry({
        name,
        email,
        phone,
        company,
        inquiryType: "general",
        message: inquiryMessage,
      });

      if (res && !res.success) {
        setErrorMessage(res.message || "Failed to submit request. Please verify your information.");
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage("Network issue. Please try again or reach out directly via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-labelledby={headingId}
          tabIndex={-1}
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#090d15] border border-white/15 shadow-2xl p-6 sm:p-8 z-10 text-white max-h-[92vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="size-16 rounded-full bg-brand-mauve/15 border border-brand-mauve/30 text-brand-lavender flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 id={headingId} className="text-2xl font-bold tracking-tight font-display">
                {isArabic ? "تم استلام طلب الاشتراك بنجاح!" : "Subscription Request Received!"}
              </h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                {isArabic
                  ? `شكراً لك! سيتواصل معك مدير الإنتاج في استوديوهات Yas Pro خلال ساعات لتأكيد باقة ${pkg.nameAr} وتحديد موعد أول يوم تصوير.`
                  : `Thank you! A Yas Pro creative producer will contact you within a few hours to confirm your ${pkg.nameEn} package onboarding and schedule your initial filming session.`}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/971554010465?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl btn-brand text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-violet/40"
                >
                  <MessageSquare size={16} />
                  <span>{isArabic ? "محادثة فورية عبر واتساب" : "Chat Now via WhatsApp"}</span>
                </a>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  {isArabic ? "إغلاق النافذة" : "Close Window"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-mauve/15 border border-brand-mauve/30 text-brand-lavender text-xs font-mono uppercase tracking-wider mb-3">
                  <Sparkles size={12} />
                  <span>
                    {isArabic ? "تفعيل اشتراك إنتاج المحتوى" : "PRODUCTION ONBOARDING"}
                  </span>
                </div>
                <h3 id={headingId} className="text-2xl font-bold tracking-tight font-display">
                  {isArabic ? `طلب اشتراك: ${pkg.nameAr}` : `Subscribe: ${pkg.nameEn} Plan`}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {isArabic ? pkg.taglineAr : pkg.taglineEn}
                </p>

                {/* Plan Highlights Box */}
                <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      {isArabic ? "نوع الفوترة المحدد" : "SELECTED CADENCE"}
                    </span>
                    <span className="text-sm font-bold text-white capitalize mt-0.5">
                      {billingInterval === "yearly"
                        ? isArabic
                          ? "سنوي (خصم 20%)"
                          : "Yearly (-20% Discount)"
                        : isArabic
                          ? "شهري"
                          : "Monthly"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      {isArabic ? "التسعير" : "PRICE"}
                    </span>
                    <span className="text-base font-black text-brand-mauve font-display">
                      {currentPrice ? `AED ${currentPrice.toLocaleString()}/mo` : "Custom"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${formId}-name`} className="block text-xs font-medium text-zinc-300 mb-1.5">
                      {isArabic ? "الاسم الكامل *" : "Full Name *"}
                    </label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isArabic ? "سعيد المنصوري" : "Alex Morgan"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-email`} className="block text-xs font-medium text-zinc-300 mb-1.5">
                      {isArabic ? "البريد الإلكتروني *" : "Work Email *"}
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@brand.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${formId}-phone`} className="block text-xs font-medium text-zinc-300 mb-1.5">
                      {isArabic ? "رقم الهاتف / واتساب *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-company`} className="block text-xs font-medium text-zinc-300 mb-1.5">
                      {isArabic ? "اسم الشركة أو حساب السوشيال" : "Company or Social Handle"}
                    </label>
                    <input
                      id={`${formId}-company`}
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="@yourbrand"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-notes`} className="block text-xs font-medium text-zinc-300 mb-1.5">
                    {isArabic ? "ملاحظات إضافية أو أهداف الحملة" : "Campaign Notes or Goals"}
                  </label>
                  <textarea
                    id={`${formId}-notes`}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isArabic
                        ? "نود التركيز على تصوير بودكاست وريلز لمنتجاتنا الجديدة..."
                        : "We want to focus on high-energy founder reels and product demos..."
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-brand-mauve transition-colors resize-none"
                  />
                </div>

                {/* Submission Buttons */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl btn-brand text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-brand-violet/40"
                  >
                    {isSubmitting ? (
                      <span>{isArabic ? "جاري الإرسال..." : "Submitting..."}</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{isArabic ? "إرسال طلب الاشتراك" : "Submit Subscription Request"}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/971554010465?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-6 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    <span>{isArabic ? "أو تواصل فوراً عبر واتساب كونسيرج" : "Or Connect Instantly via WhatsApp"}</span>
                  </a>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
