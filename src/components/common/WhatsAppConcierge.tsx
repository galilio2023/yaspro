"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, ArrowUpRight, Camera, Video, Users } from "lucide-react";

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

export function WhatsAppConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Close when clicking outside or pressing Escape, manage focus trap and restoration
  useEffect(() => {
    if (!isOpen) return;

    // Focus the close button when opened
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
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
    const triggerBtn = triggerButtonRef.current;

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      triggerBtn?.focus();
    };
  }, [isOpen]);


  const openWhatsApp = (prefilledText: string) => {
    const encoded = encodeURIComponent(prefilledText);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <aside
      ref={containerRef}
      aria-label="Direct Dubai WhatsApp Concierge"
      className="fixed bottom-6 right-6 z-40 transition-all duration-300 [[data-has-bottom-cart=true]_&]:bottom-24 sm:[[data-has-bottom-cart=true]_&]:bottom-6"
    >
      {/* Floating Flyout Window */}
      {isOpen && (
        <div
          ref={flyoutRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="concierge-heading"
          tabIndex={-1}
          className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] bg-secondary border border-white/15 rounded-3xl p-5 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-fade-up outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="size-9 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                  <MessageSquare size={18} />
                </div>
                <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-green-500 border-2 border-black" />
              </div>
              <div>
                <h3 id="concierge-heading" className="text-sm font-bold text-white font-display">
                  Dubai Studio Concierge
                </h3>
                <p className="text-[11px] text-green-400 font-medium flex items-center gap-1">
                  <span>●</span> <span>Production Dispatch Online</span>
                </p>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              className="size-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              aria-label="Close concierge"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-text-secondary py-3 leading-relaxed">
            Connect directly with our Dubai studio coordinators for instant availability, equipment delivery, or creator booking:
          </p>

          {/* Quick Inquiry Options */}
          <div className="space-y-2">
            {QUICK_INQUIRIES.map((opt) => (
              <button
                key={opt.title}
                type="button"
                onClick={() => openWhatsApp(opt.text)}
                className="w-full text-left p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all duration-200 flex items-center justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
              >
                <div className="flex items-center gap-3 pr-2">
                  <div className="size-8 rounded-lg bg-brand-purple/15 text-brand-purple-light flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <opt.icon size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-brand-purple-light transition-colors">
                      {opt.title}
                    </span>
                    <span className="text-[10px] text-text-muted block line-clamp-1">
                      {opt.subtitle}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-text-muted group-hover:text-white shrink-0 transition-colors" />
              </button>
            ))}
          </div>

          {/* Direct Custom Chat Button */}
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

      {/* Floating Trigger Button */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-14 rounded-2xl flex items-center justify-center text-white cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Open Dubai WhatsApp Concierge"
      >
        {/* Ambient Glow Aura matching app theme */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand-purple via-brand-purple-light to-brand-teal blur-md opacity-75 group-hover:opacity-100 transition-opacity" />

        {/* Button Surface: Cosmic Violet to Aurora Cyan gradient with subtle glass border */}
        <div className="relative size-full rounded-2xl bg-gradient-to-br from-brand-purple via-[#6d28d9] to-brand-teal p-[1px] shadow-2xl shadow-brand-purple/40 flex items-center justify-center overflow-hidden border border-white/20">
          {/* Subtle inner gloss highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/30 pointer-events-none" />

          {isOpen ? (
            <X size={24} className="relative z-10 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <MessageSquare size={24} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" />
            </div>
          )}
        </div>

        {/* Online Status Live Pip */}
        <span className="absolute -top-0.5 -right-0.5 z-20 flex size-3">
          <span className="size-3 rounded-full bg-emerald-500 border-2 border-black" />
        </span>
      </button>
    </aside>
  );
}
