"use client";

import React, { useState, useRef } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  Sparkles,
  Bot,
  Send,
  X,
  CheckCircle2,
  Calendar,
  Camera,
  Users,
  Building,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { ProductionProposalResponse } from "@/lib/ai/production-advisor";
import { formatCurrency } from "@/lib/utils";

interface ProductionCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToRfp?: (proposal: ProductionProposalResponse) => void;
}

export function ProductionCopilotModal({
  isOpen,
  onClose,
  onApplyToRfp,
}: ProductionCopilotModalProps) {
  const [briefInput, setBriefInput] = useState("");
  const [timelineDays, setTimelineDays] = useState(2);
  const [isThinking, setIsThinking] = useState(false);
  const [proposal, setProposal] = useState<ProductionProposalResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    isOpen,
    onClose,
    containerRef: dialogRef,
  });

  if (!isOpen) return null;

  const handleGenerate = async (presetText?: string) => {
    const textToRun = presetText || briefInput;
    if (!textToRun.trim()) return;
    setIsThinking(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: textToRun,
          timelineDays,
        }),
      });
      const data = await res.json();
      if (res.ok && data.proposal) {
        setProposal(data.proposal);
      } else {
        setErrorMsg(data.error || "Unable to generate proposal. Please try again.");
      }
    } catch {
      setErrorMsg("Network error contacting AI production engine.");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-dialog-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/30 bg-[#0b0a0f] shadow-2xl overflow-hidden text-white outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#121118]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="copilot-dialog-title" className="font-display font-bold text-lg text-white">
                  Autonomous Production &amp; RFP Copilot
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                  Telemetry Active
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Turn your campaign vision into an itemized gear, studio, and talent blueprint
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close autonomous copilot"
            className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Brief Input Card */}
          <div className="p-4 rounded-2xl bg-[#121118] border border-white/10 space-y-3">
            <label className="text-xs font-mono font-bold text-text-muted uppercase flex items-center gap-2">
              <Sparkles size={13} className="text-amber-400" />
              <span>Describe Your Production Brief &amp; Deliverables:</span>
            </label>
            <textarea
              rows={3}
              value={briefInput}
              onChange={(e) => setBriefInput(e.target.value)}
              placeholder="e.g. 3-day high-end electric car commercial shoot in Riyadh with night desert tracking shots, overhead cooking scenes, and two certified Mawthooq tech reviewers."
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-amber-500/60 resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Shoot Duration:</span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTimelineDays(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        timelineDays === d
                          ? "bg-amber-500 text-black font-extrabold shadow-sm"
                          : "bg-white/5 text-text-muted hover:text-white"
                      }`}
                    >
                      {d} {d === 1 ? "Day" : "Days"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isThinking || !briefInput.trim()}
                className="px-5 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isThinking ? (
                  <span className="animate-pulse">Synthesizing Proposal...</span>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Generate AI Proposal</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-text-muted">Or try template:</span>
              <button
                type="button"
                onClick={() => {
                  const text = "Saudi Vision 2030 luxury automotive TVC in Riyadh desert";
                  setBriefInput(text);
                  handleGenerate(text);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-white/5 cursor-pointer"
              >
                🇸🇦 Riyadh Automotive TVC
              </button>
              <button
                type="button"
                onClick={() => {
                  const text = "Multi-cam tech podcast marathon with top Arab gaming creators";
                  setBriefInput(text);
                  handleGenerate(text);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 border border-white/5 cursor-pointer"
              >
                🎙️ Gaming Podcast Stream
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* AI Result View */}
          {proposal && (
            <div className="space-y-5 animate-fade-up">
              {/* Proposal Header & Budget Summary */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Optimized Package Blueprint
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {proposal.campaignConcept}
                  </h4>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-text-muted font-mono uppercase">Estimated Turnkey Cost</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {formatCurrency(proposal.estimatedTotalAed)}
                  </div>
                </div>
              </div>

              {/* Matched Studio & Gear Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Studio Card */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-text-muted font-bold">
                    <Building size={14} className="text-amber-400" />
                    <span>Allocated Studio Stage</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {proposal.recommendedStudio.name}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {proposal.recommendedStudio.reason}
                  </p>
                  <div className="text-[11px] font-mono text-amber-300 pt-1">
                    Rate: {formatCurrency(proposal.recommendedStudio.dailyRate)} / day
                  </div>
                </div>

                {/* Mawthooq Creator Card */}
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-text-muted font-bold">
                    <Users size={14} className="text-amber-400" />
                    <span>Certified Mawthooq Talent</span>
                  </div>
                  {proposal.recommendedInfluencers.map((inf) => (
                    <div key={inf.id} className="pt-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <span>{inf.flag}</span>
                        <span>{inf.name}</span>
                        <span className="text-xs text-text-muted font-normal">({inf.followers})</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                        {inf.resonanceReason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Gear Package */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-text-muted font-bold">
                  <Camera size={14} className="text-amber-400" />
                  <span>Cinematography &amp; Audio Kit Recommended ({proposal.recommendedGear.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {proposal.recommendedGear.map((gear) => (
                    <div
                      key={gear.id}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white line-clamp-1">
                          {gear.name}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          {gear.fitReason}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-amber-400 font-bold mt-2">
                        {formatCurrency(gear.dailyRate)} / day
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Phases */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-text-muted font-bold">
                  <Calendar size={14} className="text-amber-400" />
                  <span>Milestone Production Pipeline</span>
                </div>
                <div className="space-y-2">
                  {proposal.productionTimeline.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{item.phase}</span>
                          <span className="text-[10px] font-mono text-amber-300">({item.duration})</span>
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {item.deliverables.join(" • ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* GCC Sovereign & Compliance Note */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <ShieldAlert size={16} className="text-amber-400 shrink-0" />
                <p className="text-[11px] text-amber-300">
                  Fully compliant with Saudi GCAM Mawthooq advertising licensing and GCC Sovereign Cloud data residency.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {proposal && (
          <div className="p-4 border-t border-white/10 bg-[#121118] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setProposal(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white transition-colors cursor-pointer"
            >
              Reset Brief
            </button>
            {onApplyToRfp && (
              <button
                type="button"
                onClick={() => {
                  onApplyToRfp(proposal);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl btn-brand text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Export to Enterprise RFP</span>
                <ArrowRight size={14} className="rtl:rotate-180" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
