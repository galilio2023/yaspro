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
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-6 z-40 transition-all duration-300 [[data-has-bottom-cart=true]_&]:bottom-28 sm:[[data-has-bottom-cart=true]_&]:bottom-8 pb-[env(safe-area-inset-bottom,0px)]"
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative size-13 sm:size-14 rounded-2xl flex items-center justify-center text-amber-400 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/10"
          aria-label="Open Yas Pro Production Dispatch"
          title="Production Dispatch & Copilot"
        >
          {/* Subtle amber ambient aura */}
          <div className="absolute -inset-0.5 rounded-2xl bg-amber-500/20 blur-sm group-hover:bg-amber-500/35 transition-all" />

          {/* Button Surface: Studio Hardware */}
          <div className="relative size-full rounded-2xl bg-[#121118] border border-amber-500/30 p-[1px] shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-amber-500/60 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-black/40 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Bot size={22} className="text-amber-400" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-2 ring-[#121118]" />
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
