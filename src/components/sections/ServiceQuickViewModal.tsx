"use client";

import React, { useState, useId, useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, MessageSquare, Calendar, Sparkles, ArrowRight, ArrowLeft, PhoneCall } from "lucide-react";
import { ServiceItem } from "./services.data";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";
import { SendMessageModal } from "./SendMessageModal";
import { WHATSAPP_PHONE } from "@/lib/constants";

interface ServiceQuickViewModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceQuickViewModal({
  service,
  isOpen,
  onClose,
}: ServiceQuickViewModalProps) {
  const { isArabic } = useLanguage();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryType, setInquiryType] = useState<"ob_van" | "outdoor_filming">("ob_van");

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useFocusTrap({ isOpen: isOpen && service !== null, onClose, containerRef: dialogRef });

  const isDirectInquiryService = service?.id === "ob-van-broadcast" || service?.id === "outdoor-filming";

  const title = isArabic ? service?.arabicTitle : service?.title;
  const subtitle = isArabic ? service?.arabicSubtitle : service?.subtitle;
  const description = isArabic ? service?.arabicDescription : service?.description;
  const badge = isArabic ? service?.arabicBadge : service?.badge;
  const specs = isArabic ? service?.arabicSpecs : service?.specs;
  const features = isArabic ? service?.arabicIncludedFeatures : service?.includedFeatures;

  const whatsappMessage = encodeURIComponent(
    isArabic
      ? `مرحباً Yas Pro، أود الاستفسار وحجز خدمة: ${service?.arabicTitle}`
      : `Hello Yas Pro, I would like to inquire about and book: ${service?.title}`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsappMessage}`;

  return (
    <>
      <AnimatePresence>
        {isOpen && service && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/12 bg-zinc-950/95 shadow-2xl shadow-brand-violet/20 z-10"
          dir={isArabic ? "rtl" : "ltr"}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? "إغلاق النافذة" : "Close modal"}
            className="absolute top-4 right-4 z-20 rounded-full border border-white/10 bg-zinc-900/80 p-2 text-zinc-400 hover:text-white hover:border-white/25 transition-all"
          >
            <X size={18} />
          </button>

          {/* Media Header Banner */}
          <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black">
            <Image
              src={service.image}
              alt={title ?? ""}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            {/* Badge overlay */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-lavender/30 bg-brand-violet/40 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-lavender backdrop-blur-md">
                <Sparkles size={12} />
                {badge}
              </span>
            </div>

            {/* Title inside banner bottom */}
            <div className="absolute bottom-4 left-6 right-6 z-10">
              <h3 id={headingId} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                {title}
              </h3>
              <p className="text-sm font-medium text-brand-lavender/90">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Description */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              {description}
            </p>

            {/* Tech Specs Badges */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                {isArabic ? "المواصفات التقنية" : "Key Specifications"}
              </h4>
              <div className="flex flex-wrap gap-2">
                {specs?.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-lg border border-white/8 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Turnkey Inclusions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                {isArabic ? "ما تشمله الخدمة" : "What's Included"}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {features?.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5"
                  >
                    <CheckCircle2 size={16} className="text-brand-lavender shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 border-t border-white/8 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="text-xs text-zinc-400">
                {isArabic
                  ? "فريق الدعم والإنتاج متاح على مدار الساعة في دبي"
                  : "Production Concierge available 24/7 in Dubai"}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                >
                  <MessageSquare size={16} />
                  {isArabic ? "استفسار واتساب فوري" : "WhatsApp Concierge"}
                </a>

                  {isDirectInquiryService ? (
                    <button
                      type="button"
                      onClick={() => {
                        setInquiryType(service.id === "outdoor-filming" ? "outdoor_filming" : "ob_van");
                        setIsInquiryOpen(true);
                        onClose();
                      }}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      <PhoneCall size={15} />
                      {isArabic ? "طلب استشارة وعرض سعر" : "Request Callback & Quote"}
                      <span className="text-base leading-none">↗</span>
                    </button>
                  ) : service.id.includes("studio") || service.id.includes("podcast") ? (
                    <Link
                      href={service.id === "podcast-booking" ? "/podcast-booking" : "/studio-booking"}
                      onClick={onClose}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-brand-violet px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-brand-violet/30 hover:bg-brand-mauve transition-all"
                    >
                      <Calendar size={16} />
                      {isArabic
                        ? (service.id === "podcast-booking" ? "حجز البودكاست" : "حجز الاستوديو")
                        : (service.id === "podcast-booking" ? "Book Podcast" : "Book Studio")}
                      {isArabic ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-zinc-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all"
                    >
                      {isArabic ? "إغلاق" : "Close"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>

      {isInquiryOpen && (
        <SendMessageModal
          isOpen={true}
          onClose={() => setIsInquiryOpen(false)}
          initialService={inquiryType}
        />
      )}
    </>
  );
}
