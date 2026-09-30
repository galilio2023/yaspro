"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Film,
  Camera,
  ArrowRight,
  Wand2,
  ShieldCheck,
  Building2,
  Layers,
  Cpu,
  AlertTriangle,
} from "lucide-react";
import type { ProductionProposalResponse } from "@/lib/ai/production-advisor";

const SAMPLE_BRIEFS = [
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

export function CopilotProposalTab() {
  const [brief, setBrief] = useState("");
  const [targetMarket, setTargetMarket] = useState("GCC / UAE / KSA");
  const [timelineDays, setTimelineDays] = useState(2);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalResult, setProposalResult] = useState<ProductionProposalResponse | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const handleGenerateProposal = async () => {
    if (!brief || brief.length < 10) {
      setProposalError("Please enter a brief of at least 10 characters.");
      return;
    }
    setProposalError(null);
    setIsGeneratingProposal(true);
    const sanitizedDays = Math.min(30, Math.max(1, Math.round(Number(timelineDays) || 2)));

    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, targetMarket, timelineDays: sanitizedDays }),
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

  return (
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
              {SAMPLE_BRIEFS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => setBrief(preset.text)}
                  className="text-[11px] min-h-[36px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/5 transition-all text-left cursor-pointer"
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
                max={30}
                step={1}
                value={timelineDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) {
                    setTimelineDays(1);
                  } else {
                    setTimelineDays(Math.min(30, Math.max(1, val)));
                  }
                }}
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
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
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
  );
}
