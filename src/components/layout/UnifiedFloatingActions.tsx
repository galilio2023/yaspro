"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, ArrowUpRight, Camera, Video, Users, Bot, Sparkles } from "lucide-react";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971554010465";

const QUICK_INQUIRIES = [
  {
    icon: Video,
    title: "Book Studio Soundstage",
    subtitle: "Check today's soundstage & podcast suite availability",
    text: "Hello Yas Pro Dubai team, I would like to check availability and book a studio session at your Dubai facility.",
  },
  {
    icon: Camera,
    title: "Urgent Gear Rental Dispatch",
    subtitle: "Same-day camera, lens & lighting delivery across UAE",
    text: "Hello Yas Pro dispatch, I have an urgent equipment rental request in Dubai/UAE.",
  },
  {
    icon: Users,
    title: "Influencer Campaign Booking",
    subtitle: "Produce a branded show or podcast with our creator roster",
    text: "Hello Yas Pro talent team, I would like to discuss an influencer production campaign with your creator network.",
  },
];

export function UnifiedFloatingActions() {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const whatsAppTriggerRef = useRef<HTMLButtonElement>(null);

  // Focus trap, outside click, and Escape key for WhatsApp flyout
  useEffect(() => {
    if (!isWhatsAppOpen) return;

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsWhatsAppOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsWhatsAppOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (!flyoutRef.current) return;
        const focusable = flyoutRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    const triggerBtn = whatsAppTriggerRef.current;

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      triggerBtn?.focus();
    };
  }, [isWhatsAppOpen]);

  const openWhatsApp = (prefilledText: string) => {
    const encoded = encodeURIComponent(prefilledText);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsWhatsAppOpen(false);
  };

  return (
    <>
      <aside
        ref={containerRef}
        aria-label="Yas Pro Production Assistant and WhatsApp Concierge"
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
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] max-w-[360px] sm:w-[380px] bg-secondary border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-fade-up outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="size-9 rounded-xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center text-brand-teal">
                    <MessageSquare size={18} />
                  </div>
                </div>
                <div>
                  <h3 id="unified-concierge-heading" className="text-sm font-bold text-white font-display">
                    Dubai Studio Concierge
                  </h3>
                  <p className="text-[11px] text-brand-teal-light font-medium">
                    Production Dispatch Online
                  </p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsWhatsAppOpen(false)}
                className="size-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple min-h-[36px] min-w-[36px]"
                aria-label="Close concierge flyout"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Routing Options */}
            <div className="mt-3.5 space-y-2">
              <p className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
                Select Inquiry Topic:
              </p>
              {QUICK_INQUIRIES.map((q, idx) => {
                const Icon = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => openWhatsApp(q.text)}
                    className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all group cursor-pointer flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-brand-purple/20 text-brand-purple-light flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-brand-purple-light transition-colors">
                          {q.title}
                        </div>
                        <div className="text-[10.5px] text-text-muted line-clamp-1">
                          {q.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="text-text-muted group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0"
                    />
                  </button>
                );
              })}
            </div>

            {/* Custom WhatsApp CTA */}
            <div className="pt-3.5 mt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => openWhatsApp("Hello Yas Pro Dubai team, I have a general production inquiry.")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-purple via-brand-purple-mid to-brand-teal hover:opacity-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              >
                <MessageSquare size={14} />
                <span>Start Custom WhatsApp Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* Unified Floating Button: One Pill Housing Both Buttons */}
        <div className="relative group">
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-purple via-indigo-600 to-brand-teal blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Unified Container Surface */}
          <div className="relative rounded-2xl bg-gradient-to-r from-brand-purple/40 via-purple-900/40 to-brand-teal/40 p-[1px] shadow-2xl shadow-brand-purple/30 backdrop-blur-2xl border border-white/20">
            <div className="flex items-center gap-1 bg-[#0d0b1a]/95 rounded-2xl p-1">
              {/* Button 1: AI Copilot */}
              <button
                type="button"
                onClick={() => {
                  setIsWhatsAppOpen(false);
                  setIsCopilotOpen(true);
                }}
                className="relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 cursor-pointer hover:bg-brand-purple/25 active:scale-95 group/copilot focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
                aria-label="Open Yas Pro AI Production Copilot"
                title="AI Production Copilot"
              >
                <div className="relative flex items-center justify-center">
                  <Bot size={17} className="text-brand-purple-light group-hover/copilot:text-white transition-colors" />
                  <Sparkles size={10} className="absolute -top-1 -right-1.5 text-brand-gold animate-pulse" />
                </div>
                <span className="font-display tracking-wide text-[11px] sm:text-xs">AI Copilot</span>
              </button>

              {/* Clean Divider */}
              <div className="h-5 w-px bg-white/15 mx-0.5" />

              {/* Button 2: WhatsApp Concierge */}
              <button
                ref={whatsAppTriggerRef}
                type="button"
                onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
                className={`relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-bold text-white transition-all duration-200 cursor-pointer active:scale-95 group/wa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal ${
                  isWhatsAppOpen ? "bg-brand-teal/30 text-brand-teal-light" : "hover:bg-brand-teal/20"
                }`}
                aria-label="Open Dubai WhatsApp Concierge"
                aria-expanded={isWhatsAppOpen}
                title="WhatsApp Concierge"
              >
                {isWhatsAppOpen ? (
                  <X size={17} className="text-brand-teal transition-transform group-hover/wa:rotate-90 duration-200" />
                ) : (
                  <MessageSquare size={17} className="text-brand-teal group-hover/wa:scale-110 transition-transform duration-200" />
                )}
                <span className="font-display tracking-wide text-[11px] sm:text-xs">WhatsApp</span>
              </button>
            </div>
          </div>
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
