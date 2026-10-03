"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowUpRight, Camera, Video, Users, MessageSquare } from "lucide-react";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { studioSprings } from "@/lib/studio-motion";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971554010465";

const QUICK_INQUIRIES = [
  {
    icon: Video,
    titleEn: "Book Studio Soundstage",
    titleAr: "حجز استوديو تصوير",
    subtitleEn: "Check today's soundstage & podcast suite availability",
    subtitleAr: "التحقق من توفر استوديوهات التصوير والبودكاست اليوم",
    textEn: "Hello Yas Pro Dubai team, I would like to check availability and book a studio session at your Dubai facility.",
    textAr: "مرحباً فريق Yas Pro دبي، أود الاستفسار عن توفر وحجز جلسة تصوير في استوديوهاتكم بدبي.",
  },
  {
    icon: Camera,
    titleEn: "Urgent Gear Rental Dispatch",
    titleAr: "طلب عاجل لتأجير معدات",
    subtitleEn: "Same-day camera, lens & lighting delivery across UAE",
    subtitleAr: "توصيل فوري للكاميرات والعدسات والإضاءة في أنحاء الإمارات",
    textEn: "Hello Yas Pro dispatch, I have an urgent equipment rental request in Dubai/UAE.",
    textAr: "مرحباً قسم تأجير المعدات في Yas Pro، لدي طلب تأجير عاجل للمعدات في دبي/الإمارات.",
  },
  {
    icon: Users,
    titleEn: "Influencer Campaign Booking",
    titleAr: "حملة مع صناع المحتوى",
    subtitleEn: "Produce a branded show or podcast with our creator roster",
    subtitleAr: "إنتاج برنامج أو بودكاست برعاية علامة تجارية مع نخبة المبدعين",
    textEn: "Hello Yas Pro talent team, I would like to discuss an influencer production campaign with your creator network.",
    textAr: "مرحباً فريق إدارة المواهب في Yas Pro، أود مناقشة حملة إنتاج مع شبكة صناع المحتوى لديكم.",
  },
];

/**
 * Smart Enhanced WhatsApp SVG Icon
 * Featuring emerald depth gradients, optical white handset, and smart live signal beacon
 */
function SmartWhatsAppIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waSmartGrad" x1="4" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.55" stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id="waSmartGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Modern stylized speech bubble frame */}
      <path
        d="M14 3.5C8.2 3.5 3.5 8.2 3.5 14C3.5 15.85 4 17.58 4.88 19.08L3.5 24.5L9.08 23.14C10.54 23.99 12.22 24.5 14 24.5C19.8 24.5 24.5 19.8 24.5 14C24.5 8.2 19.8 3.5 14 3.5Z"
        fill="url(#waSmartGrad)"
        filter="url(#waSmartGlow)"
      />

      {/* Crisp Optical Handset */}
      <path
        d="M18.8 16.9C18.55 16.77 17.35 16.18 17.12 16.1C16.9 16.02 16.73 15.98 16.57 16.23C16.4 16.48 15.93 17.04 15.79 17.2C15.65 17.37 15.5 17.39 15.25 17.26C15 17.13 14.19 16.87 13.22 16.01C12.47 15.34 11.96 14.51 11.81 14.26C11.66 14.01 11.8 13.88 11.92 13.75C12.03 13.64 12.18 13.46 12.3 13.32C12.42 13.17 12.46 13.07 12.54 12.9C12.62 12.73 12.58 12.59 12.52 12.46C12.46 12.33 11.96 11.1 11.75 10.6C11.55 10.11 11.34 10.18 11.19 10.17H10.71C10.54 10.17 10.27 10.23 10.04 10.48C9.81 10.73 9.16 11.34 9.16 12.58C9.16 13.82 10.06 15.02 10.19 15.19C10.32 15.36 11.97 17.9 14.49 18.99C17.02 20.08 17.02 19.72 17.48 19.67C17.94 19.63 18.95 19.07 19.16 18.49C19.37 17.91 19.37 17.42 19.31 17.31C19.25 17.2 19.05 17.03 18.8 16.9Z"
        fill="#FFFFFF"
      />

      {/* Smart Live Signal Pulse Ring */}
      <circle cx="21" cy="7" r="2.4" fill="#10B981" stroke="#06110c" strokeWidth="1" />
      <circle cx="21" cy="7" r="1.3" fill="#E6FFFA" />
    </svg>
  );
}

/**
 * Smart Enhanced AI Production Copilot SVG Icon
 * Featuring neural radiant aperture, concentric optical core, and satellite nodes in tungsten amber
 */
function SmartAiIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="smartAiNeuralGrad" x1="3" y1="3" x2="25" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef3c7" />
          <stop offset="0.4" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="smartAiCoreGrad" x1="10" y1="10" x2="18" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <filter id="smartAiGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer 4-Pointed Neural Cinema Star */}
      <path
        d="M14 2L16.8 9.8C17.2 10.9 18.1 11.8 19.2 12.2L27 15L19.2 17.8C18.1 18.2 17.2 19.1 16.8 20.2L14 28L11.2 20.2C10.8 19.1 9.9 18.2 8.8 17.8L1 15L8.8 12.2C9.9 11.8 10.8 10.9 11.2 9.8L14 2Z"
        fill="url(#smartAiNeuralGrad)"
        filter="url(#smartAiGlow)"
      />

      {/* Optical Lens Iris Pupil */}
      <circle cx="14" cy="15" r="3.2" fill="#0d0b12" stroke="url(#smartAiCoreGrad)" strokeWidth="1.2" />
      <circle cx="14" cy="15" r="1.6" fill="url(#smartAiCoreGrad)" />

      {/* Intelligent Node Constellation Sparks */}
      <circle cx="21.5" cy="8.5" r="1.6" fill="#fde68a" />
      <circle cx="6.5" cy="21.5" r="1.2" fill="#fbbf24" />
    </svg>
  );
}

export function UnifiedFloatingActions() {
  const { t, isArabic } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside click & Escape key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setIsWhatsAppOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isWhatsAppOpen) {
          setIsWhatsAppOpen(false);
        } else if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, isWhatsAppOpen]);

  // Handle focus when WhatsApp flyout opens
  useEffect(() => {
    if (isWhatsAppOpen) {
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isWhatsAppOpen]);

  const openWhatsApp = (prefilledText: string) => {
    const encoded = encodeURIComponent(prefilledText);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsWhatsAppOpen(false);
    setIsMenuOpen(false);
  };

  const handleToggleMenu = () => {
    if (isWhatsAppOpen) {
      setIsWhatsAppOpen(false);
    }
    setIsMenuOpen((prev) => !prev);
  };

  const handleSelectAi = () => {
    setIsMenuOpen(false);
    setIsWhatsAppOpen(false);
    setIsCopilotOpen(true);
  };

  const handleSelectWhatsApp = () => {
    setIsMenuOpen(false);
    setIsWhatsAppOpen(true);
  };

  return (
    <>
      <aside
        ref={containerRef}
        aria-label="Yas Pro Assistant Launcher"
        dir="ltr"
        style={{ direction: "ltr" }}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-40 transition-all duration-300 [[data-has-bottom-cart=true]_&]:bottom-28 sm:[[data-has-bottom-cart=true]_&]:bottom-8 pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* WhatsApp Concierge Flyout */}
        {isWhatsAppOpen && (
          <div
            ref={flyoutRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unified-concierge-heading"
            tabIndex={-1}
            dir={isArabic ? "rtl" : "ltr"}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[360px] sm:w-[380px] bg-[#0c0a18]/95 border border-emerald-500/20 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-2xl animate-fade-up outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="size-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <SmartWhatsAppIcon className="size-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0a18]" />
                </div>
                <div className="text-start">
                  <h3 id="unified-concierge-heading" className="text-sm font-bold text-white font-display">
                    {t("concierge.title")}
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    {t("concierge.status")}
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="size-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[36px] min-w-[36px]"
                aria-label="Close concierge flyout"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Routing Options */}
            <div className="mt-3.5 space-y-2">
              <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider text-start">
                {t("concierge.selectTopic")}
              </p>
              {QUICK_INQUIRIES.map((q, idx) => {
                const Icon = q.icon;
                const title = isArabic ? q.titleAr : q.titleEn;
                const subtitle = isArabic ? q.subtitleAr : q.subtitleEn;
                const text = isArabic ? q.textAr : q.textEn;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openWhatsApp(text)}
                    className="w-full text-start p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-emerald-500/20 transition-all group cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div className="text-start">
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {title}
                        </div>
                        <div className="text-[10.5px] text-text-muted line-clamp-1">
                          {subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-text-muted group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 rtl:group-hover:-translate-x-0.5 rtl:rotate-90"
                    />
                  </button>
                );
              })}
            </div>

            {/* Custom WhatsApp CTA */}
            <div className="pt-3.5 mt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  openWhatsApp(
                    isArabic
                      ? "مرحباً فريق Yas Pro دبي، لدي استفسار بخصوص خدمات الإنتاج."
                      : "Hello Yas Pro Dubai team, I have a general production inquiry."
                  )
                }
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageSquare size={14} />
                <span>{t("concierge.customChat")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Stack Options Menu (Revealed when clicked) */}
        {/* Tooltip-free clean circular buttons with smart SVGs */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={studioSprings.snappy}
              role="menu"
              aria-label="Yas Pro Assistant Options"
              dir="ltr"
              style={{ direction: "ltr" }}
              className="absolute bottom-16 right-0 mb-2 flex flex-col items-center gap-3 w-13 sm:w-14"
            >
              {/* Option 1: AI Production Copilot with Smart AI SVG */}
              <motion.button
                type="button"
                onClick={handleSelectAi}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={studioSprings.tactile}
                className="relative size-12 sm:size-13 rounded-full bg-gradient-to-b from-[#181410] to-[#0c0a08] border border-amber-500/50 shadow-xl shadow-amber-500/20 hover:border-amber-400 hover:shadow-amber-500/40 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 group"
                aria-label={t("concierge.aiCopilot")}
                title={t("concierge.aiCopilot")}
              >
                <SmartAiIcon className="size-6 text-amber-400 group-hover:scale-105 transition-transform" />
              </motion.button>

              {/* Option 2: WhatsApp Concierge with Smart WhatsApp SVG */}
              <motion.button
                type="button"
                onClick={handleSelectWhatsApp}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                transition={studioSprings.tactile}
                className="relative size-12 sm:size-13 rounded-full bg-gradient-to-b from-[#0e1d16] to-[#06110c] border border-emerald-500/50 shadow-xl shadow-emerald-600/30 hover:border-emerald-400 hover:shadow-emerald-600/50 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 group"
                aria-label={t("concierge.whatsApp")}
                title={t("concierge.whatsApp")}
              >
                <SmartWhatsAppIcon className="size-6 group-hover:scale-105 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Floating Trigger Button: Housing the Official Brand Logo SVG */}
        <div className="relative group">
          {/* Ambient Glow Aura */}
          <div
            className={`absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 blur-md transition-opacity duration-300 ${
              isMenuOpen ? "opacity-90 scale-105" : "opacity-50 group-hover:opacity-100"
            }`}
          />

          {/* Trigger Button with Tactile Physics */}
          <motion.button
            ref={triggerRef}
            type="button"
            onClick={handleToggleMenu}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={studioSprings.snappy}
            className="relative size-13 sm:size-14 rounded-full bg-[#0b0a0f] border border-amber-500/50 p-[2px] shadow-2xl shadow-black/80 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            aria-label={isMenuOpen ? "Close Assistant Options" : "Open Yas Pro Assistant (AI & WhatsApp)"}
            aria-expanded={isMenuOpen}
          >
            <div className="size-full bg-[#0b0a0f] rounded-full flex items-center justify-center transition-colors group-hover:bg-[#121118]">
              {isMenuOpen ? (
                <X className="size-6 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <YasproEmblem
                  size={30}
                  idPrefix="fab-master-emblem"
                  className="filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.45)] transition-transform duration-300 group-hover:scale-108"
                />
              )}
            </div>
          </motion.button>
        </div>
      </aside>

      {/* Production Copilot Modal */}
      <ProductionCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </>
  );
}
