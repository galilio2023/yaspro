"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  Camera,
  Languages,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Wand2,
  ShieldCheck,
  Building2,
  Layers,
  Cpu,
} from "lucide-react";
import { ProductionProposalResponse } from "@/lib/ai/production-advisor";
import { DialectTransmutationResult } from "@/lib/ai/dialect-engine";
import { GEAR_DATA } from "@/features/gear/data";
import { analyzeGearSelection } from "@/features/gear/lib/compatibility";

interface AiProductionCopilotProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiProductionCopilot({ isOpen, onClose }: AiProductionCopilotProps) {
  const [activeTab, setActiveTab] = useState<"proposal" | "dialect" | "gear">("proposal");

  // --- Proposal State ---
  const [brief, setBrief] = useState("");
  const [targetMarket, setTargetMarket] = useState("GCC / UAE / KSA");
  const [timelineDays, setTimelineDays] = useState(2);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState<ProductionProposalResponse | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  // --- Dialect State ---
  const [scriptText, setScriptText] = useState("نحن متحمسون جداً لإطلاق هذا المنتج الجديد هنا بمواصفات عالية.");
  const [selectedDialect, setSelectedDialect] = useState("najdi");
  const [scriptTone, setScriptTone] = useState("Prestige");
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [dialectResult, setDialectResult] = useState<DialectTransmutationResult | null>(null);
  const [dialectError, setDialectError] = useState<string | null>(null);

  // --- Gear Compatibility State ---
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([
    "arri-alexa-mini-lf",
  ]);

  if (!isOpen) return null;

  const sampleBriefs = [
    {
      title: "Riyadh Luxury EV Launch",
      text: "Cinematic commercial for a flagship luxury electric SUV in Riyadh dunes and modern skyline, featuring dynamic night lighting and high-speed tracking.",
    },
    {
      title: "Dubai Fintech Lifestyle",
      text: "Vibrant high-tempo digital campaign for a mobile banking app targeting Gen-Z youth across the UAE and Saudi Arabia.",
    },
    {
      title: "GCC Culinary Showcase",
      text: "Prestige food docuseries celebrating modern Gulf cuisine, requiring warm studio lighting and high-fidelity food macro shots.",
    },
  ];

  const handleGenerateProposal = async () => {
    if (!brief || brief.length < 10) {
      setProposalError("Please enter a brief of at least 10 characters.");
      return;
    }
    setProposalError(null);
    setIsGeneratingProposal(true);

    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, targetMarket, timelineDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate proposal");
      setProposalResult(data.proposal);
    } catch (err: unknown) {
      setProposalError(err instanceof Error ? err.message : "Error generating proposal");
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleTransmuteDialect = async () => {
    if (!scriptText.trim()) return;
    setDialectError(null);
    setIsTransmuting(true);

    try {
      const res = await fetch("/api/ai/dialect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scriptText,
          dialectId: selectedDialect,
          tone: scriptTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transmute script");
      setDialectResult(data.result);
    } catch (err: unknown) {
      setDialectError(err instanceof Error ? err.message : "Error transmuting dialect");
    } finally {
      setIsTransmuting(false);
    }
  };

  const compatibilityReport = analyzeGearSelection(selectedGearIds);

  const toggleGearItem = (id: string) => {
    setSelectedGearIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[90vw] sm:max-w-5xl flex flex-col bg-background/95 border-0 sm:border sm:border-white/10 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 sm:size-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light shadow-inner shrink-0">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h3 className="text-sm sm:text-lg font-bold text-white font-display truncate">
                  Yas Pro Autonomous Production Copilot
                </h3>
                <span className="hidden xs:inline-flex px-2 py-0.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider font-semibold rounded-full bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 shrink-0">
                  Google Gemini
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary truncate sm:whitespace-normal">
                Turn briefs into shot lists, matching soundstages, inventory, and Khaleeji dialects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2.5 sm:p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 w-full border-b border-white/10 bg-white/[0.01] px-2 sm:px-6 gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab("proposal")}
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] ${
              activeTab === "proposal"
                ? "border-brand-purple text-brand-purple-light"
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
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] ${
              activeTab === "dialect"
                ? "border-brand-purple text-brand-purple-light"
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
            className={`flex items-center justify-center gap-1.5 py-3 px-1 sm:px-4 text-center text-xs font-semibold border-b-2 transition-all duration-200 min-h-[44px] ${
              activeTab === "gear"
                ? "border-brand-purple text-brand-purple-light"
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

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: PRODUCTION PROPOSAL */}
          {activeTab === "proposal" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Input */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Campaign Brief / Concept
                    </label>
                    <textarea
                      rows={4}
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="Describe your vision, product, location, or script idea..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-base sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-purple transition-colors resize-none"
                    />
                  </div>

                  {/* Preset Quick Briefs */}
                  <div>
                    <span className="text-[11px] font-medium text-text-muted mb-1.5 block">
                      Quick Inspiration Prompts:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sampleBriefs.map((preset) => (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => setBrief(preset.text)}
                          className="text-[11px] min-h-[36px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 transition-all text-left"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                        Target Market
                      </label>
                      <select
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
                      >
                        <option value="GCC / UAE / KSA" className="bg-neutral-900">GCC & Pan-Arab</option>
                        <option value="Saudi Arabia (Riyadh & Jeddah)" className="bg-neutral-900">Saudi Arabia (KSA)</option>
                        <option value="United Arab Emirates (Dubai)" className="bg-neutral-900">United Arab Emirates</option>
                        <option value="Kuwait & Gulf Coast" className="bg-neutral-900">Kuwait & Gulf</option>
                        <option value="Egypt (Cairo)" className="bg-neutral-900">Egypt & Levant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                        Estimated Shoot Days
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={timelineDays}
                        onChange={(e) => setTimelineDays(Number(e.target.value))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
                      />
                    </div>
                  </div>

                  {proposalError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle size={14} />
                      <span>{proposalError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateProposal}
                    disabled={isGeneratingProposal}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 transition-all shadow-lg disabled:opacity-50"
                  >
                    {isGeneratingProposal ? (
                      <>
                        <Cpu size={16} className="animate-spin" />
                        <span>Synthesizing Production Blueprint...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        <span>Generate Intelligent Blueprint</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-5 min-h-[380px] flex flex-col justify-between">
                  {proposalResult ? (
                    <div className="space-y-5">
                      {/* Concept & Badge */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-bold">
                              {proposalResult.creativeTone}
                            </span>
                            {proposalResult.isAiGenerated && (
                              <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-brand-purple/20 text-brand-purple-light border border-brand-purple/30">
                                Neural Synthesized
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white">
                            {proposalResult.campaignConcept}
                          </h4>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[10px] text-text-muted uppercase">Estimated Budget</div>
                          <div className="text-base font-bold text-brand-gold">
                            {proposalResult.estimatedTotalAed.toLocaleString()} AED
                          </div>
                        </div>
                      </div>

                      {/* Visual Shot List */}
                      <div>
                        <h5 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Layers size={13} className="text-brand-purple" />
                          <span>Generated Shot List & Storyboard</span>
                        </h5>
                        <div className="space-y-2">
                          {proposalResult.visualShotList.map((shot) => (
                            <div
                              key={shot.shotNumber}
                              className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between text-white font-medium">
                                <span>Shot #{shot.shotNumber}: {shot.cameraAngle}</span>
                                <span className="text-[10px] font-mono text-brand-cyan">{shot.lightingStyle}</span>
                              </div>
                              <p className="text-[11px] text-text-secondary leading-snug">
                                {shot.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Studio & Gear Matching */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-purple font-semibold">
                            <Building2 size={13} />
                            <span>Recommended Soundstage</span>
                          </div>
                          <div className="text-white font-medium">{proposalResult.recommendedStudio.name}</div>
                          <p className="text-[11px] text-text-muted">{proposalResult.recommendedStudio.reason}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                          <div className="flex items-center gap-1.5 text-brand-cyan font-semibold">
                            <Camera size={13} />
                            <span>Matched Gear Manifest</span>
                          </div>
                          <ul className="text-[11px] text-text-secondary space-y-1">
                            {proposalResult.recommendedGear.map((g) => (
                              <li key={g.id} className="truncate">
                                • <span className="text-white font-medium">{g.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Compliance & Pre-fill CTA */}
                      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                          <ShieldCheck size={16} />
                          <span>Mawthooq Certified & Sovereign GCC Cloud Compliant</span>
                        </div>

                        {(() => {
                          let gearPkg = "none";
                          if (proposalResult.recommendedGear.some((g) => g.id.includes("arri"))) {
                            gearPkg = "arri-commercial";
                          } else if (proposalResult.recommendedGear.some((g) => g.id.includes("sony") || g.id.includes("fx6"))) {
                            gearPkg = "sony-multicam";
                          } else if (proposalResult.recommendedGear.some((g) => g.id.includes("mic") || g.id.includes("sennheiser"))) {
                            gearPkg = "podcast-mics";
                          }

                          let sessionType = "commercial";
                          if (proposalResult.recommendedStudio.id === "studio-xr") {
                            sessionType = "virtual_production";
                          } else if (proposalResult.recommendedStudio.id === "studio-b") {
                            sessionType = "podcast";
                          } else if (proposalResult.recommendedStudio.id === "studio-c") {
                            sessionType = "photography";
                          }

                          return (
                            <Link
                              href={`/studio-booking?studio=${proposalResult.recommendedStudio.id}&gear=${gearPkg}&sessionType=${sessionType}&shootDays=${timelineDays}&aiConfigured=true`}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-colors shrink-0"
                            >
                              <span>Lock Stage & Book Package</span>
                              <ArrowRight size={13} className="rtl:rotate-180" />
                            </Link>
                          );
                        })()}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                      <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple">
                        <Film size={26} />
                      </div>
                      <h4 className="text-sm font-semibold text-white">No Blueprint Synthesized Yet</h4>
                      <p className="text-xs text-text-muted max-w-sm">
                        Enter your concept on the left and click Generate to see autonomous shot lists, inventory matching, and transparent AED budget calculations.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KHALEEJI DIALECT TRANSMUTER */}
          {activeTab === "dialect" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Script / Ad Copy (Arabic or English)
                  </label>
                  <textarea
                    rows={4}
                    value={scriptText}
                    onChange={(e) => setScriptText(e.target.value)}
                    placeholder="Enter script text to localize into authentic Gulf dialect..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-base sm:text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-purple transition-colors resize-none"
                    dir="auto"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                      Target Dialect
                    </label>
                    <select
                      value={selectedDialect}
                      onChange={(e) => setSelectedDialect(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
                    >
                      <option value="najdi" className="bg-neutral-900">🇸🇦 Najdi (Riyadh)</option>
                      <option value="emirati" className="bg-neutral-900">🇦🇪 Emirati (Dubai / Abu Dhabi)</option>
                      <option value="hijazi" className="bg-neutral-900">🇸🇦 Hijazi (Jeddah)</option>
                      <option value="kuwaiti" className="bg-neutral-900">🇰🇼 Kuwaiti</option>
                      <option value="egyptian" className="bg-neutral-900">🇪🇬 Egyptian (Cairo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                      Tone
                    </label>
                    <select
                      value={scriptTone}
                      onChange={(e) => setScriptTone(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-2.5 text-base sm:text-xs text-white focus:outline-none focus:border-brand-purple min-h-[44px] sm:min-h-0"
                    >
                      <option value="Prestige" className="bg-neutral-900">Prestige & Luxury</option>
                      <option value="Warm Hospitality" className="bg-neutral-900">Warm Hospitality</option>
                      <option value="Youth Commercial" className="bg-neutral-900">Youth Commercial</option>
                      <option value="Authoritative" className="bg-neutral-900">Authoritative</option>
                    </select>
                  </div>
                </div>

                {dialectError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle size={14} />
                    <span>{dialectError}</span>
                  </div>
                )}

                <button
                  onClick={handleTransmuteDialect}
                  disabled={isTransmuting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 transition-all shadow-lg disabled:opacity-50 min-h-[44px]"
                >
                  {isTransmuting ? (
                    <>
                      <Cpu size={16} className="animate-spin" />
                      <span>Calibrating Regional Nuance...</span>
                    </>
                  ) : (
                    <>
                      <Languages size={16} />
                      <span>Localize Script with Gemini</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output */}
              <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-5 min-h-[380px] flex flex-col justify-between">
                {dialectResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{dialectResult.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{dialectResult.dialectName}</div>
                          <div className="text-[10px] text-text-muted">{dialectResult.recommendedTone} Tone</div>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                        {dialectResult.resonanceScore}% Resonance
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20">
                      <div className="text-[10px] uppercase tracking-wider font-mono text-brand-purple-light mb-1.5">
                        Transmuted Regional Script (V/O Ready)
                      </div>
                      <p className="text-base text-white font-medium leading-relaxed font-arabic" dir="rtl">
                        {dialectResult.transmutedArabic}
                      </p>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-text-secondary uppercase mb-1">
                        Cultural & Linguistic Commentary
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {dialectResult.englishExplanation}
                      </p>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-text-secondary uppercase mb-1.5">
                        Injected Prestige Honorifics
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {dialectResult.honorificsUsed.map((h) => (
                          <span
                            key={h}
                            className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-brand-gold text-xs font-arabic"
                            dir="rtl"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-purple">
                      <Languages size={26} />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Dialect Engine Idle</h4>
                    <p className="text-xs text-text-muted max-w-sm">
                      Select your target Gulf dialect and brand tone to adapt script copy with regional honorifics and regulatory compliance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SMART GEAR COMPATIBILITY */}
          {activeTab === "gear" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 xl:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Select Equipment to Test Compatibility
                  </h4>
                  <span className="text-[11px] text-text-muted">
                    {selectedGearIds.length} items chosen
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {GEAR_DATA.map((gear) => {
                    const isSelected = selectedGearIds.includes(gear.id);
                    return (
                      <div
                        key={gear.id}
                        onClick={() => toggleGearItem(gear.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between min-h-[44px] ${
                          isSelected
                            ? "bg-brand-purple/15 border-brand-purple/50 text-white"
                            : "bg-white/[0.02] border-white/5 text-text-secondary hover:border-white/20"
                        }`}
                      >
                        <div className="min-w-0 mr-2">
                          <div className="font-semibold text-white truncate">{gear.name}</div>
                          <div className="text-[11px] text-text-muted truncate">
                            {gear.categoryLabel} • {gear.dailyRate} AED/day
                          </div>
                        </div>
                        <div
                          className={`size-5 rounded-md border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-brand-purple border-brand-purple text-white"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={13} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compatibility Inspection Report */}
              <div className="lg:col-span-12 xl:col-span-6 bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu size={14} className="text-brand-cyan" />
                      <span>Optical & Power Compatibility Analysis</span>
                    </h5>
                    {compatibilityReport.isCompatible ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        Rig Ready
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        Accessories Required
                      </span>
                    )}
                  </div>

                  {compatibilityReport.warnings.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Identified Gaps:
                      </div>
                      {compatibilityReport.warnings.map((w, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2"
                        >
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {compatibilityReport.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-brand-cyan uppercase tracking-wider">
                        Recommended Companion Items:
                      </div>
                      {compatibilityReport.suggestions.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-white">{s.item.name}</div>
                            <div className="text-[11px] text-text-muted">{s.reason}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleGearItem(s.item.id)}
                            className="px-2.5 py-1 rounded-lg bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple-light border border-brand-purple/30 text-[11px] font-semibold transition-all shrink-0 min-h-[36px]"
                          >
                            + Add to Rig
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {compatibilityReport.warnings.length === 0 && compatibilityReport.suggestions.length === 0 && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      Selected kit is fully self-contained and ready for commercial set deployment.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-text-muted">
                    Total Daily Gear:{" "}
                    <span className="text-white font-bold">
                      {GEAR_DATA.filter((g) => selectedGearIds.includes(g.id))
                        .reduce((sum, g) => sum + g.dailyRate, 0)
                        .toLocaleString()}{" "}
                      AED
                    </span>
                  </div>
                  <Link
                    href={`/shop?preselect=${selectedGearIds.join(",")}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all min-h-[44px] sm:min-h-0"
                  >
                    <span>Proceed to Gear Rental</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
