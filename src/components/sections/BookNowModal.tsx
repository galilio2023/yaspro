"use client";

import React, { useState, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, PhoneCall, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { studioSprings, tactilePress } from "@/lib/studio-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { submitInquiry } from "@/lib/actions";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VisualBookingCard {
  id: string;
  labelEn: string;
  labelAr: string;
  categoryEn: string;
  categoryAr: string;
  image: string;
  href?: string;
  actionType?: "inquiry";
  inquiryService?: "ob_van" | "outdoor_filming";
  isFeatured?: boolean;
}

const VISUAL_CARDS: VisualBookingCard[] = [
  {
    id: "offers-bundles",
    labelEn: "Offers & Bundles",
    labelAr: "العروض والباقات",
    categoryEn: "Packages",
    categoryAr: "باقات متكاملة",
    image: "/images/modal/offers-bundles-card.jpg",
    href: "/offers",
    isFeatured: true,
  },
  {
    id: "studio-booking",
    labelEn: "Studio Booking",
    labelAr: "حجز الاستوديوهات",
    categoryEn: "Soundstages",
    categoryAr: "استوديوهات رئيسية",
    image: "/images/modal/studio-booking-card.jpg",
    href: "/studio-booking",
  },
  {
    id: "podcast-booking",
    labelEn: "Podcast Booking",
    labelAr: "حجز البودكاست",
    categoryEn: "4K Multi-Cam",
    categoryAr: "استوديو بودكاست",
    image: "/images/modal/podcast-booking-card.jpg",
    href: "/podcast-booking",
  },
  {
    id: "gear-rental",
    labelEn: "Cinema Gear Rental",
    labelAr: "تأجير معدات السينما",
    categoryEn: "ARRI & RED",
    categoryAr: "كاميرات وإضاءة",
    image: "/images/gear/arri-commercial-cinema-kit.jpg",
    href: "/shop",
  },
  {
    id: "outdoor-filming",
    labelEn: "Outdoor Filming",
    labelAr: "التصوير الميداني",
    categoryEn: "On-Location",
    categoryAr: "تصوير خارجي",
    image: "/images/modal/outdoor-filming-card.jpg",
    actionType: "inquiry",
    inquiryService: "outdoor_filming",
  },
  {
    id: "ob-van-broadcast",
    labelEn: "OB VAN Live Broadcast",
    labelAr: "عربات البث المباشر",
    categoryEn: "Live 4K",
    categoryAr: "بث تلفزيوني",
    image: "/images/modal/ob-van-broadcast-card.jpg",
    actionType: "inquiry",
    inquiryService: "ob_van",
  },
  {
    id: "social-media-packages",
    labelEn: "Social Media Packages",
    labelAr: "باقات السوشيال ميديا",
    categoryEn: "Viral Reels",
    categoryAr: "صناعة المحتوى",
    image: "/images/modal/social-media-card.jpg",
    href: "/social-media-packages",
  },
];

export function BookNowModal({ isOpen, onClose }: BookNowModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { t, isArabic } = useLanguage();
  const [selectedInquiry, setSelectedInquiry] = useState<{
    id: string;
    type: "ob_van" | "outdoor_filming";
    titleEn: string;
    titleAr: string;
  } | null>(null);

  const [wasOpen, setWasOpen] = useState(isOpen);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<"ob_van" | "outdoor_filming">("ob_van");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const handleOpenInquiry = (card: VisualBookingCard) => {
    if (!card.inquiryService) return;
    setSelectedInquiry({
      id: card.id,
      type: card.inquiryService,
      titleEn: card.labelEn,
      titleAr: card.labelAr,
    });
    setInquiryType(card.inquiryService);
    setSubject(
      card.inquiryService === "ob_van"
        ? t("bookNowModal.subjectObVan")
        : t("bookNowModal.subjectOutdoor")
    );
    setSubmitError(null);
    setIsSubmitted(false);
  };

  const handleBackToGrid = () => {
    setSelectedInquiry(null);
    setSubmitError(null);
    setIsSubmitted(false);
  };

  const handleModalClose = () => {
    onClose();
  };

  useFocusTrap({ isOpen, onClose: handleModalClose, containerRef: dialogRef });

  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (!isOpen) {
      setSelectedInquiry(null);
      setName("");
      setEmail("");
      setPhone("");
      setInquiryType("ob_van");
      setIsSubmitting(false);
      setSubject("");
      setMessage("");
      setSubmitError(null);
      setIsSubmitted(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const fullMessage = subject.trim()
      ? `[Subject: ${subject.trim()}]\n\n${message.trim()}`
      : message.trim();

    if (fullMessage.length < 10) {
      setSubmitError(t("bookNowModal.errorMinChars"));
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
        setSubmitError(res.message || t("bookNowModal.errorFailed"));
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setSubmitError(t("bookNowModal.errorUnexpected"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Soft Cinematic Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleModalClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
            aria-hidden="true"
          />

          {/* Centering Scroll Wrapper */}
          <div
            className="min-h-full flex items-center justify-center p-3 sm:p-6 md:p-8"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                handleModalClose();
              }
            }}
          >
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
              className={`relative w-full transition-all duration-300 rounded-3xl bg-[#09090c] border border-white/10 p-5 sm:p-7 md:p-9 z-10 shadow-2xl my-auto ${
                selectedInquiry ? "max-w-xl" : "max-w-5xl lg:max-w-6xl"
              }`}
            >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              {selectedInquiry && (
                <button
                  type="button"
                  onClick={handleBackToGrid}
                  aria-label={t("bookNowModal.backAria")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isArabic ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                </button>
              )}
              <h2
                id={headingId}
                className={`font-bold text-white tracking-tight ${
                  selectedInquiry
                    ? "text-xl sm:text-2xl uppercase tracking-wider font-display"
                    : "text-xl sm:text-2xl font-display rtl:font-arabic"
                }`}
              >
                {selectedInquiry
                  ? t("bookNowModal.titleMessage")
                  : t("bookNowModal.titleSelect")}
              </h2>
            </div>

            {/* Seamless Close Button */}
            <button
              type="button"
              onClick={handleModalClose}
              aria-label={t("bookNowModal.closeAria")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!selectedInquiry ? (
              /* ── Grid View ── */
              <motion.div
                key="grid-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
              >
                {VISUAL_CARDS.map((card) => {
                  const isDirectInquiry = card.actionType === "inquiry";

                  const CardInner = (
                    <div className={cn(
                      "group relative flex flex-col justify-end w-full rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer shadow-lg border border-white/5 hover:border-brand-mauve/40 transition-colors",
                      card.isFeatured ? "h-36 sm:h-52 md:h-56" : "h-36 sm:h-52 md:h-56"
                    )}>
                      {/* Real Production Imagery */}
                      <Image
                        src={card.image}
                        alt={isArabic ? card.labelAr : card.labelEn}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                      />

                      {/* Film Vignette Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity group-hover:via-black/20" />

                      {/* Featured Badge */}
                      {card.isFeatured && (
                        <div className="absolute top-2 start-2 sm:top-3 sm:start-3 z-10">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide uppercase bg-brand-violet/40 text-brand-lavender border border-brand-mauve/30 backdrop-blur-md shadow-md">
                            <span>{t("bookNowModal.bestValue")}</span>
                          </span>
                        </div>
                      )}

                      {/* Pill Badge for direct contact card */}
                      {isDirectInquiry && (
                        <div className="absolute top-2 end-2 sm:top-3 sm:end-3 z-10">
                          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium tracking-wide bg-brand-violet/30 text-brand-mauve-soft border border-brand-mauve/30 backdrop-blur-md">
                            <PhoneCall size={10} className="sm:size-[11px]" />
                            <span className="hidden xs:inline">{t("bookNowModal.callback")}</span>
                            <span className="inline xs:hidden">{t("bookNowModal.call")}</span>
                          </span>
                        </div>
                      )}

                      {/* Bottom Title */}
                      <div className="relative z-10 p-3 sm:p-4">
                        <span className="text-xs sm:text-base md:text-lg font-bold text-white tracking-tight drop-shadow-md group-hover:text-brand-mauve-soft transition-colors line-clamp-2">
                          {isArabic ? card.labelAr : card.labelEn}
                        </span>
                      </div>
                    </div>
                  );

                  return (
                    <motion.div
                      key={card.id}
                      whileTap={tactilePress}
                      className={cn(
                        "w-full",
                        card.isFeatured && "col-span-2 sm:col-span-2 lg:col-span-2"
                      )}
                    >
                      {isDirectInquiry ? (
                        <button
                          type="button"
                          onClick={() => handleOpenInquiry(card)}
                          className="w-full text-start focus:outline-none"
                        >
                          {CardInner}
                        </button>
                      ) : (
                        <Link
                          href={card.href || "#"}
                          onClick={handleModalClose}
                          className="block w-full focus:outline-none"
                        >
                          {CardInner}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              /* ── SEND US A MESSAGE View (Matching 2.png) ── */
              <motion.div
                key="inquiry-form-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {isSubmitted ? (
                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-display">
                      {t("bookNowModal.submittedTitle")}
                    </h3>
                    <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                      {t("bookNowModal.submittedDesc")}
                    </p>
                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-6 py-2.5 rounded-full btn-brand text-sm cursor-pointer"
                    >
                      {t("bookNowModal.close")}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subtitle / Service tag */}
                    <p className="text-xs text-zinc-400">
                      {t("bookNowModal.formSubtitle")}
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
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          {t("bookNowModal.name")} <span className="text-brand-mauve">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t("bookNowModal.namePlaceholder")}
                          className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          {t("bookNowModal.email")} <span className="text-brand-mauve">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Inquiry Type & Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          {t("bookNowModal.inquiryType")}
                        </label>
                        <select
                          value={inquiryType}
                          onChange={(e) => {
                            const val = e.target.value as "ob_van" | "outdoor_filming";
                            setInquiryType(val);
                            setSubject(
                              val === "ob_van"
                                ? t("bookNowModal.subjectObVan")
                                : t("bookNowModal.subjectOutdoor")
                            );
                          }}
                          className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white focus:outline-none focus:border-white transition-colors cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                        >
                          <option value="ob_van">
                            {t("bookNowModal.obVanOption")}
                          </option>
                          <option value="outdoor_filming">
                            {t("bookNowModal.outdoorFilmingOption")}
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                          {t("bookNowModal.subject")}
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder={t("bookNowModal.subjectPlaceholder")}
                          className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Phone Number (Crucial for sales team to call) */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {t("bookNowModal.phone")} <span className="text-brand-mauve">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 000 0000"
                        dir="ltr"
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors text-start"
                      />
                    </div>

                    {/* Message / Details */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {t("bookNowModal.message")} <span className="text-brand-mauve">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("bookNowModal.messagePlaceholder")}
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
                      />
                    </div>

                    {/* Bottom CTA Button (Let's Talk ↗) */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full btn-brand text-base sm:text-sm min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>{t("bookNowModal.sending")}</span>
                          </>
                        ) : (
                          <>
                            <span>{t("bookNowModal.submit")}</span>
                            <span className="text-base leading-none">↗</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
