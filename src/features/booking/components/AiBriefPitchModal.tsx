"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BriefRecommendation {
  recommendedStudio: string;
  recommendedGear: string;
  estimatedHours: number;
  crewRoleRecommendation: string;
  rationale: string;
}

export function AiBriefPitchModal({
  isOpen,
  onClose,
  onApplyPreset,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (studioId: string, gearPackageId: string, hours: number) => void;
}) {
  const [briefPrompt, setBriefPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<BriefRecommendation | null>(null);
  const [appliedIds, setAppliedIds] = useState<{ studioId: string; gearId: string; hours: number } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestIdRef = useRef<number>(0);

  // Focus trap, Escape key handling, and restore focus to trigger
  useEffect(() => {
    if (!isOpen) return;

    triggerElementRef.current = document.activeElement as HTMLElement | null;

    // Focus first focusable element or dialog
    const focusTimer = setTimeout(() => {
      if (dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handlePromptChange = (val: string) => {
    setBriefPrompt(val);
    activeRequestIdRef.current += 1;
    // Invalidate pending generation and clear existing recommendations
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsGenerating(false);
    setRecommendation(null);
    setAppliedIds(null);
  };

  const handleGeneratePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefPrompt.trim()) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const currentReqId = ++activeRequestIdRef.current;
    setIsGenerating(true);
    setRecommendation(null);
    setAppliedIds(null);

    try {
      const res = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: briefPrompt, timelineDays: 1 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (currentReqId !== activeRequestIdRef.current) return;
        const p = data.proposal;
        if (p) {
          let gearPkg = "sony-multicam";
          if (p.recommendedGear.some((g: { id: string }) => g.id.includes("arri"))) {
            gearPkg = "arri-commercial";
          } else if (p.recommendedGear.some((g: { id: string }) => g.id.includes("mic") || g.id.includes("sennheiser"))) {
            gearPkg = "podcast-mics";
          }

          const hours = 6;
          setAppliedIds({
            studioId: p.recommendedStudio.id || "studio-a",
            gearId: gearPkg,
            hours,
          });

          setRecommendation({
            recommendedStudio: p.recommendedStudio.name,
            recommendedGear: p.recommendedGear.map((g: { name: string }) => g.name).join(" + "),
            estimatedHours: hours,
            crewRoleRecommendation: "Lead Director + Unreal Engine / Studio Operator + Sound Recordist",
            rationale: `${p.campaignConcept} ${p.recommendedStudio.reason}`,
          });
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // Fall through to heuristic
    }

    // Client-side heuristic fallback
    const lower = briefPrompt.toLowerCase();
    let res: BriefRecommendation;
    let studioId = "studio-a";
    let gearId = "sony-multicam";
    const hours = 4;

    const isXr =
      lower.includes("xr") ||
      lower.includes("unreal") ||
      lower.includes("virtual") ||
      lower.includes("cgi") ||
      lower.includes("scifi") ||
      lower.includes("led volume");

    const isPodcast =
      lower.includes("podcast") ||
      lower.includes("interview") ||
      lower.includes("talk") ||
      lower.includes("dialogue");

    if (isXr && isPodcast) {
      studioId = "studio-xr";
      gearId = "arri-commercial";
      res = {
        recommendedStudio: "Studio XR — Virtual Production Stage",
        recommendedGear: "ARRI Alexa Mini LF + 4-Person Podcast Mic Suite",
        estimatedHours: 6,
        crewRoleRecommendation: "VP Unreal Operator + Lead Audio Engineer",
        rationale: "Hybrid virtual production with multi-guest broadcast podcast acoustics and dynamic virtual sets.",
      };
    } else if (isXr) {
      studioId = "studio-xr";
      gearId = "arri-commercial";
      res = {
        recommendedStudio: "Studio XR — Virtual Production Stage",
        recommendedGear: "ARRI Alexa Mini LF Cinema Package",
        estimatedHours: 8,
        crewRoleRecommendation: "VP Unreal Operator + Optical Genlock Camera Tech",
        rationale: "Requires 270° Micro-LED volume, Unreal 5.4 LiveSync tracking, and large format cinema primes.",
      };
    } else if (isPodcast) {
      studioId = "studio-b";
      gearId = "podcast-mics";
      res = {
        recommendedStudio: "Studio B — Podcast Suite",
        recommendedGear: "4-Person Shure SM7B Acoustic Mic Suite",
        estimatedHours: 3,
        crewRoleRecommendation: "Audio Engineer & Live Cam Switcher Operator",
        rationale: "Optimized for broadcast vocal acoustics, 4K multi-cam cuts, and rapid turnaround dailies.",
      };
    } else {
      res = {
        recommendedStudio: "Studio A — Main Stage",
        recommendedGear: "Sony FX6 3-Cam 4K Studio Package",
        estimatedHours: 4,
        crewRoleRecommendation: "Gaffer & Studio Camera Operator",
        rationale: "Versatile 200 sqm soundstage with motorized lighting grid, perfect for commercial shoots and high-end video campaigns.",
      };
    }

    if (currentReqId !== activeRequestIdRef.current) return;

    setAppliedIds({ studioId, gearId, hours });
    setRecommendation(res);
    setIsGenerating(false);
  };

  const handleApply = () => {
    if (!recommendation) return;
    const targetStudio = appliedIds?.studioId || "studio-a";
    const targetGear = appliedIds?.gearId || "sony-multicam";
    const targetHours = appliedIds?.hours || recommendation.estimatedHours || 4;

    onApplyPreset(targetStudio, targetGear, targetHours);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-pitch-assistant-title"
        tabIndex={-1}
        className="fixed inset-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-[90vw] sm:max-w-2xl rounded-none sm:rounded-3xl bg-slate-900 border border-white/10 shadow-2xl text-white outline-none overflow-y-auto p-4 sm:p-6 lg:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="ai-pitch-assistant-title" className="text-base font-bold font-display">
                  AI Production Pitch Assistant
                </h3>
                <Badge variant="cyan" className="text-[9px] uppercase tracking-wider">
                  BETA
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">
                Describe your project, and AI will configure the ideal soundstage and cinema package.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close AI Pitch Assistant"
            className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Input prompt */}
        <form onSubmit={handleGeneratePitch} className="space-y-4 mb-5">
          <div className="space-y-1.5">
            <label htmlFor="ai-brief-textarea" className="text-xs font-medium text-slate-300">
              Project Vision or Campaign Summary
            </label>
            <textarea
              id="ai-brief-textarea"
              rows={3}
              value={briefPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="e.g. Shooting a 4-episode tech founder podcast with 3 hosts in Dubai, or a luxury automotive commercial with an Unreal virtual desert backdrop..."
              className="w-full p-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-slate-500 text-xs leading-relaxed focus:outline-none focus:border-brand-purple"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !briefPrompt.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-purple/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                <span>Analyzing Production Requirements...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Generate Production Blueprint</span>
              </>
            )}
          </button>
        </form>

        {/* AI Pitch Output */}
        {recommendation && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-brand-purple/30 space-y-3 animate-fade-in">
            <div className="flex items-center gap-1.5 text-brand-purple-light text-xs font-bold font-mono">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Recommended Production Setup</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-text-muted font-mono uppercase block mb-1">
                  Soundstage
                </span>
                <span className="font-bold text-white block truncate">
                  {recommendation.recommendedStudio}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-text-muted font-mono uppercase block mb-1">
                  Camera / Rig
                </span>
                <span className="font-bold text-brand-cyan block truncate">
                  {recommendation.recommendedGear}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs">
              <span className="text-[10px] text-text-muted font-mono uppercase block mb-1">
                Estimated Duration &amp; Crew
              </span>
              <span className="text-slate-200">
                {recommendation.estimatedHours} Hours Session • Recommended: {recommendation.crewRoleRecommendation}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed italic">
              &quot;{recommendation.rationale}&quot;
            </p>

            <button
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-light text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
            >
              <span>Apply to Booking Form</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
