"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";

export function FloatingCopilotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Yas Pro AI Production Copilot"
        className="fixed bottom-6 right-24 z-40 transition-all duration-300 [[data-has-bottom-cart=true]_&]:bottom-24 sm:[[data-has-bottom-cart=true]_&]:bottom-6"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative size-14 rounded-2xl flex items-center justify-center text-white cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-brand-purple/20"
          aria-label="Open Yas Pro AI Production Copilot"
          title="Yas Pro AI Copilot"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand-purple via-indigo-600 to-brand-cyan blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

          {/* Button Surface */}
          <div className="relative size-full rounded-2xl bg-gradient-to-br from-brand-purple via-slate-900 to-brand-cyan p-[1px] shadow-2xl flex items-center justify-center overflow-hidden border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Bot size={22} className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
              <Sparkles size={11} className="absolute -top-1.5 -right-2 text-brand-gold animate-pulse" />
            </div>
          </div>
        </button>
      </aside>

      {/* Production Copilot Modal */}
      <ProductionCopilotModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
