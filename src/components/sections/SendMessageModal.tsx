"use client";

import React, { useState, useId, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { studioSprings } from "@/lib/studio-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { submitInquiry } from "@/lib/actions";

export interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: "ob_van" | "outdoor_filming" | "studio_booking" | "technical_support" | "general";
  defaultSubject?: string;
}

export function SendMessageModal({
  isOpen,
  onClose,
  initialService = "ob_van",
  defaultSubject = "",
}: SendMessageModalProps) {
  const { isArabic } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<"ob_van" | "outdoor_filming">(
    initialService === "outdoor_filming" ? "outdoor_filming" : "ob_van"
  );
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const fieldId = useId();

  useFocusTrap({ isOpen, onClose, containerRef: dialogRef });

  useEffect(() => {
    if (isOpen) {
      const type = initialService === "outdoor_filming" ? "outdoor_filming" : "ob_van";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInquiryType(type);
      if (!defaultSubject) {
        setSubject(
          type === "ob_van"
            ? (isArabic ? "طلب استشارة وحجز عربة بث مباشر (OB VAN)" : "OB VAN Live Broadcast Consultation & Quote")
            : (isArabic ? "طلب استشارة وتصوير ميداني (Outdoor Filming)" : "Outdoor Filming Consultation & Quote")
        );
      } else {
        setSubject(defaultSubject);
      }
      setSubmitError(null);
      setIsSubmitted(false);
    }
  }, [isOpen, initialService, defaultSubject, isArabic]);

  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setSubmitError(null);
      setIsSubmitted(false);
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const fullMessage = subject.trim()
      ? `[Subject: ${subject.trim()}]\n\n${message.trim()}`
      : message.trim();

    if (fullMessage.length < 10) {
      setSubmitError(
        isArabic
          ? "يرجى كتابة تفاصيل متطلباتك بحد أدنى 10 أحرف."
          : "Please describe your project requirements in at least 10 characters."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await submitInquiry({
        name,
        email,
        phone,
        inquiryType,
        message: fullMessage,
      });

      if (res && !res.success) {
        setSubmitError(res.message || (isArabic ? "تعذر إرسال الطلب، يرجى المحاولة ثانية." : "Failed to send inquiry. Please try again."));
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setSubmitError(
        isArabic
          ? "حدث خطأ أثناء الإرسال. يرجى المحاولة ثانية أو الاتصال بنا مباشرة."
          : "An unexpected error occurred. Please try again or reach out to our concierge directly."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Soft Cinematic Dimmer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleModalClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
        />

        {/* Modal Sheet */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={studioSprings.cinematic}
          dir={isArabic ? "rtl" : "ltr"}
          className="relative my-auto w-full max-w-xl rounded-3xl bg-[#09090c] border border-white/10 p-6 sm:p-8 md:p-10 z-10 shadow-2xl"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-white/5 pb-4">
            <h2
              id={headingId}
              className="font-bold text-white tracking-wider text-xl sm:text-2xl uppercase font-display"
            >
              {isArabic ? "أرسل لنا رسالة" : "SEND US A MESSAGE"}
            </h2>

            {/* Seamless Close Button */}
            <button
              type="button"
              onClick={handleModalClose}
              aria-label={isArabic ? "إغلاق" : "Close"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {isSubmitted ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                {isArabic ? "تم استلام طلبك بنجاح" : "Message Received Successfully"}
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                {isArabic
                  ? "سيتواصل معك فريق الإنتاج التنفيذي في ياس برو هاتفياً في أقرب وقت لمناقشة التفاصيل وتقديم العرض المناسب."
                  : "Our executive production team at Yas Pro will review your requirements and call you shortly to discuss full details and pricing."}
              </p>
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-zinc-400">
                {isArabic
                  ? "سجل بياناتك وسيطلبك فريق المبيعات والإنتاج لتحديد التجهيزات والمواعيد المناسبة."
                  : "Submit your requirements below and our sales & production team will call you to arrange complete specifications and dates."}
              </p>

              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor={`${fieldId}-name`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {isArabic ? "الاسم" : "Name"} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id={`${fieldId}-name`}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isArabic ? "اسمك الكريم" : "Your full name"}
                    className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor={`${fieldId}-email`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {isArabic ? "البريد الإلكتروني" : "Email"} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id={`${fieldId}-email`}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Inquiry Type & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor={`${fieldId}-inquiryType`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {isArabic ? "نوع الطلب" : "Inquiry Type"}
                  </label>
                  <select
                    id={`${fieldId}-inquiryType`}
                    value={inquiryType}
                    onChange={(e) => {
                      const val = e.target.value as "ob_van" | "outdoor_filming";
                      setInquiryType(val);
                      setSubject(
                        val === "ob_van"
                          ? (isArabic ? "طلب استشارة وحجز عربة بث مباشر (OB VAN)" : "OB VAN Live Broadcast Consultation & Quote")
                          : (isArabic ? "طلب استشارة وتصوير ميداني (Outdoor Filming)" : "Outdoor Filming Consultation & Quote")
                      );
                    }}
                    className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white focus:outline-none focus:border-white transition-colors cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                  >
                    <option value="ob_van">
                      {isArabic ? "عربات البث المباشر (OB VAN)" : "OB VAN Live Broadcast"}
                    </option>
                    <option value="outdoor_filming">
                      {isArabic ? "التصوير الميداني (Outdoor Filming)" : "Outdoor Filming"}
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor={`${fieldId}-subject`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                    {isArabic ? "الموضوع" : "Subject"}
                  </label>
                  <input
                    id={`${fieldId}-subject`}
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={isArabic ? "موضوع الطلب" : "Subject of inquiry"}
                    className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor={`${fieldId}-phone`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {isArabic ? "رقم الهاتف للاتصال" : "Phone Number (for Callback)"} <span className="text-amber-400">*</span>
                </label>
                <input
                  id={`${fieldId}-phone`}
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                  dir="ltr"
                  className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors text-start"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor={`${fieldId}-message`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                  {isArabic ? "تفاصيل الطلب والاحتياجات" : "Message / What you need"} <span className="text-amber-400">*</span>
                </label>
                <textarea
                  id={`${fieldId}-message`}
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isArabic
                      ? "اكتب تفاصيل التغطية أو التصوير، التاريخ المقترح، موقع العمل، وأي متطلبات فنية خاصة..."
                      : "Provide details on production dates, location, multi-camera needs, or any specific broadcast requirements..."
                  }
                  className="w-full bg-transparent border-b border-zinc-700 pb-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isArabic ? "جارٍ الإرسال..." : "Sending..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{isArabic ? "تواصل معنا" : "Let's Talk"}</span>
                      <span className="text-base leading-none">↗</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
