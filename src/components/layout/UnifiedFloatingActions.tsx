"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowUpRight, Camera, Video, Users, MessageSquare } from "lucide-react";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

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
 * Bespoke Hybrid SVG: Merges the AI Production Spark with the WhatsApp Concierge Chat Bubble
 */
function UnifiedDualIcon({ className = "size-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="yasproDualRing" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="0.48" stopColor="#6366F1" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>

        <linearGradient id="yasproAiStarGrad" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9D5FF" />
          <stop offset="0.4" stopColor="#C084FC" />
          <stop offset="1" stopColor="#818CF8" />
        </linearGradient>

        <linearGradient id="yasproWaHandsetGrad" x1="13" y1="12" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>

        <filter id="yasproDualGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Modern stylized speech bubble frame with dynamic dual-gradient stroke */}
      <path
        d="M26.2 14.5C26.2 20.6 21.2 25.5 15 25.5C13.2 25.5 11.45 25.07 9.9 24.3L4.5 26.1L6.25 21C5.35 19.35 4.8 17.5 4.8 15.5C4.8 9.4 9.8 4.5 16 4.5C22.2 4.5 26.2 8.7 26.2 14.5Z"
        fill="#0b0914"
        fillOpacity="0.9"
        stroke="url(#yasproDualRing)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left/Top AI Star Sparkle Glyph */}
      <path
        d="M12.5 7L13.8 10.7L17.5 12L13.8 13.3L12.5 17L11.2 13.3L7.5 12L11.2 10.7L12.5 7Z"
        fill="url(#yasproAiStarGrad)"
        filter="url(#yasproDualGlow)"
      />
      <circle cx="12.5" cy="12" r="1.1" fill="#FFFFFF" />

      {/* Micro-spark accent */}
      <circle cx="8" cy="7.5" r="0.9" fill="#E9D5FF" />

      {/* Right/Bottom WhatsApp Phone Handset Glyph */}
      <path
        d="M21.2 18.2C20.95 18.05 19.85 17.5 19.6 17.4C19.35 17.3 19.2 17.25 19.05 17.5C18.85 17.75 18.35 18.35 18.2 18.5C18.05 18.65 17.9 18.7 17.65 18.55C17.4 18.4 16.55 18.1 15.55 17.2C14.75 16.5 14.25 15.7 14.05 15.4C13.9 15.15 14.05 15 14.15 14.9C14.25 14.8 14.4 14.6 14.55 14.45C14.65 14.3 14.7 14.2 14.75 14C14.8 13.85 14.75 13.7 14.7 13.6C14.65 13.5 14.15 12.2 13.95 11.7C13.75 11.2 13.55 11.3 13.4 11.3H12.95C12.75 11.3 12.5 11.35 12.3 11.6C12.05 11.85 11.45 12.45 11.45 13.65C11.45 14.85 12.3 16 12.45 16.15C12.6 16.3 14.15 18.7 16.55 19.7C18.95 20.7 18.95 20.35 19.4 20.3C19.85 20.25 20.8 19.7 21 19.15C21.2 18.6 21.2 18.15 21.15 18.05C21.1 17.95 20.95 17.9 20.7 17.8"
        fill="url(#yasproWaHandsetGrad)"
      />
    </svg>
  );
}

/**
 * Bespoke WhatsApp SVG Icon
 */
function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.188 8.188 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.68.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
    </svg>
  );
}

/**
 * Bespoke AI Production Copilot SVG Icon
 */
function AiCopilotIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="aiFabGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F3E8FF" />
          <stop offset="0.5" stopColor="#C084FC" />
          <stop offset="1" stopColor="#67E8F9" />
        </linearGradient>
        <filter id="aiCoreGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Central 4-pointed radiant neural star */}
      <path
        d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
        fill="url(#aiFabGrad)"
        filter="url(#aiCoreGlow)"
      />
      {/* Precision optical lens core */}
      <circle cx="12" cy="11" r="1.8" fill="#FFFFFF" />

      {/* Secondary companion star */}
      <path
        d="M18.8 14.8L19.7 17.2L22.1 18.1L19.7 19L18.8 21.4L17.9 19L15.5 18.1L17.9 17.2L18.8 14.8Z"
        fill="#A78BFA"
      />

      {/* Subtle micro spark */}
      <circle cx="6" cy="6.2" r="1.1" fill="#F472B6" />
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
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[360px] sm:w-[380px] bg-[#0c0a18]/95 border border-emerald-500/20 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/90 backdrop-blur-2xl animate-fade-up outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="size-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <WhatsAppIcon className="size-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0a18] animate-pulse" />
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
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageSquare size={14} />
                <span>{t("concierge.customChat")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Stack Options Menu (Revealed when clicked) */}
        {isMenuOpen && (
          <div
            role="menu"
            aria-label="Yas Pro Assistant Options"
            className="absolute bottom-16 right-0 mb-2 flex flex-col items-end gap-3 animate-fade-up"
          >
            {/* Option 1: AI Production Copilot SVG Button */}
            <div className="flex items-center gap-2.5 group/ai">
              <span className="text-[11px] sm:text-xs font-semibold text-white/90 bg-[#0d0b1a]/90 backdrop-blur-xl border border-brand-purple/40 px-3 py-1.5 rounded-full shadow-lg shadow-black/50 pointer-events-none select-none transition-transform group-hover/ai:scale-105 whitespace-nowrap">
                {t("concierge.aiCopilot")}
              </span>
              <button
                type="button"
                onClick={handleSelectAi}
                className="relative size-12 sm:size-13 rounded-2xl bg-gradient-to-tr from-brand-purple via-indigo-600 to-purple-500 p-[1.5px] shadow-xl shadow-brand-purple/40 hover:shadow-brand-purple/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                aria-label={t("concierge.aiCopilot")}
                title={t("concierge.aiCopilot")}
              >
                <div className="size-full bg-[#0d0b1a] rounded-[14px] flex items-center justify-center">
                  <AiCopilotIcon className="size-6 text-brand-purple-light" />
                </div>
              </button>
            </div>

            {/* Option 2: WhatsApp Concierge SVG Button */}
            <div className="flex items-center gap-2.5 group/wa">
              <span className="text-[11px] sm:text-xs font-semibold text-white/90 bg-[#0d0b1a]/90 backdrop-blur-xl border border-emerald-500/40 px-3 py-1.5 rounded-full shadow-lg shadow-black/50 pointer-events-none select-none transition-transform group-hover/wa:scale-105 whitespace-nowrap">
                {t("concierge.whatsApp")}
              </span>
              <button
                type="button"
                onClick={handleSelectWhatsApp}
                className="relative size-12 sm:size-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-[1.5px] shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                aria-label={t("concierge.whatsApp")}
                title={t("concierge.whatsApp")}
              >
                <div className="size-full bg-[#0a1811] rounded-[14px] flex items-center justify-center text-emerald-400">
                  <WhatsAppIcon className="size-6" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Master Floating Trigger Button: Housing the Combined Dual SVG */}
        <div className="relative group">
          {/* Ambient Glow Aura */}
          <div
            className={`absolute -inset-1.5 rounded-full bg-gradient-to-r from-brand-purple via-indigo-600 to-emerald-500 blur-md transition-opacity duration-300 ${
              isMenuOpen ? "opacity-100 scale-105" : "opacity-70 group-hover:opacity-100"
            }`}
          />

          {/* Trigger Button */}
          <button
            ref={triggerRef}
            type="button"
            onClick={handleToggleMenu}
            className={`relative size-13 sm:size-14 rounded-full bg-gradient-to-tr from-brand-purple via-indigo-600 to-emerald-500 p-[2px] shadow-2xl shadow-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple`}
            aria-label={isMenuOpen ? "Close Assistant Options" : "Open Yas Pro Assistant (AI & WhatsApp)"}
            aria-expanded={isMenuOpen}
          >
            <div className="size-full bg-[#090714] rounded-full flex items-center justify-center transition-colors group-hover:bg-[#0c091d]">
              {isMenuOpen ? (
                <X className="size-6 text-white transition-transform duration-300 rotate-90" />
              ) : (
                <UnifiedDualIcon className="size-8 transition-transform duration-300 group-hover:scale-110" />
              )}
            </div>
          </button>
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
