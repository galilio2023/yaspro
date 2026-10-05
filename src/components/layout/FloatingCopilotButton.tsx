"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";

export function FloatingCopilotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Yas Pro AI Production Copilot"
        dir="ltr"
        style={{ direction: "ltr" }}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-40 transition-all duration-300 [[data-has-bottom-cart=true]_&]:bottom-28 sm:[[data-has-bottom-cart=true]_&]:bottom-8 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative size-13 sm:size-14 rounded-2xl flex items-center justify-center text-brand-mauve-soft cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-purple-950/20"
          aria-label="Open Yas Pro Production Dispatch"
          title="Production Dispatch & Copilot"
        >
          {/* Subtle violet ambient aura */}
          <div className="absolute -inset-0.5 rounded-2xl bg-brand-violet/25 blur-sm group-hover:bg-brand-violet/40 transition-all" />

          {/* Button Surface: Studio Hardware */}
          <div className="relative size-full rounded-2xl bg-[#121118] border border-brand-mauve/30 p-[1px] shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-brand-mauve/60 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-violet/15 via-transparent to-black/40 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Bot size={22} className="text-brand-mauve-soft group-hover:text-brand-lavender transition-colors" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-brand-mauve ring-2 ring-[#121118]" />
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
