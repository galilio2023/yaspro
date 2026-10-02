"use client";

import React, { useState, useRef } from "react";
import { Sparkles, Film, Camera, Languages, X } from "lucide-react";
import { CopilotProposalTab } from "./CopilotProposalTab";
import { CopilotDialectTab } from "./CopilotDialectTab";
import { CopilotGearTab } from "./CopilotGearTab";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface AiProductionCopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiProductionCopilot({ isOpen, onClose }: AiProductionCopilotProps) {
  const [activeTab, setActiveTab] = useState<"proposal" | "dialect" | "gear">("proposal");
  const containerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    isOpen,
    onClose,
    containerRef,
    initialFocusRef: closeButtonRef,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Yas Pro Autonomous Production Copilot"
        tabIndex={-1}
        className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[90vw] sm:max-w-5xl flex flex-col bg-background/95 border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h3 className="text-sm sm:text-lg font-bold text-white font-display truncate">
                  Yas Pro Autonomous Production Copilot
                </h3>
                <span className="hidden xs:inline-flex px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  Google Gemini
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary truncate sm:whitespace-normal">
                Turn briefs into shot lists, matching soundstages, inventory, and Khaleeji dialects
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2.5 sm:p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 w-full border-b border-white/10 bg-white/[0.01] px-2 sm:px-6 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] cursor-pointer ${
              activeTab === "proposal"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            <Film size={15} className="shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Creative Brief &amp; Blueprint</span>
              <span className="sm:hidden">Brief</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("dialect")}
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] cursor-pointer ${
              activeTab === "dialect"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            <Languages size={15} className="shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Khaleeji Dialect Transmuter</span>
              <span className="sm:hidden">Dialect</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab("gear")}
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] cursor-pointer ${
              activeTab === "gear"
                ? "border-amber-500 text-amber-400 font-bold"
                : "border-transparent text-text-secondary hover:text-white"
            }`}
          >
            <Camera size={15} className="shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Smart Gear Compatibility</span>
              <span className="sm:hidden">Gear</span>
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "proposal" && <CopilotProposalTab />}
          {activeTab === "dialect" && <CopilotDialectTab />}
          {activeTab === "gear" && <CopilotGearTab />}
        </div>
      </div>
    </div>
  );
}
