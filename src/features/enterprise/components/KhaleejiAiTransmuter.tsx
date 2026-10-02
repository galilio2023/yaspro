"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Languages,
  ArrowRight,
  Sliders,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { LipSyncMeshVisualizer } from "./portal/LipSyncMeshVisualizer";
import { DIALECT_PRESETS, type DialectPreset } from "../dialects.data";
import { useDialectSpeechPlayer } from "../hooks/useDialectSpeechPlayer";

interface KhaleejiAiTransmuterProps {
  onSelectDialectForRfp?: (dialect: string) => void;
}

export function KhaleejiAiTransmuter({ onSelectDialectForRfp }: KhaleejiAiTransmuterProps) {
  const [selectedDialect, setSelectedDialect] = useState<DialectPreset>(DIALECT_PRESETS[0]);
  const [selectedTone, setSelectedTone] = useState(selectedDialect.preferredTones[0]);
  
  // Custom Live Script Transmuter States
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [customScriptInput, setCustomScriptInput] = useState("");
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [transmutedOutput, setTransmutedOutput] = useState<string | null>(null);
  const [culturalExplanation, setCulturalExplanation] = useState<string | null>(null);

  const activeScript = transmutedOutput || selectedDialect.spokenSample;
  const words = activeScript.split(" ");

  const {
    isPlayingAudio,
    playbackProgress,
    activeWordIndex,
    toggleAudio,
    stopAudio,
  } = useDialectSpeechPlayer();

  const handleToggleAudio = () => {
    toggleAudio({
      activeScript,
      langCode: selectedDialect.langCode,
      selectedTone,
      words,
    });
  };

  const handleSelectDialect = (preset: DialectPreset) => {
    stopAudio();
    setSelectedDialect(preset);
    setSelectedTone(preset.preferredTones[0]);
    setTransmutedOutput(null);
    setCulturalExplanation(null);
  };

  const selectedDialectRef = useRef(selectedDialect.id);
  useEffect(() => {
    selectedDialectRef.current = selectedDialect.id;
  }, [selectedDialect.id]);

  const handleTransmuteCustomScript = async () => {
    if (!customScriptInput.trim() || isTransmuting) return;
    const dialectAtRequest = selectedDialect.id;
    setIsTransmuting(true);
    stopAudio();
    try {
      const res = await fetch("/api/ai/dialect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: customScriptInput,
          dialectId: dialectAtRequest,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.result && dialectAtRequest === selectedDialectRef.current) {
        setTransmutedOutput(data.result.transmutedArabic);
        setCulturalExplanation(data.result.englishExplanation);
      }
    } catch {
      // Keep existing output on error
    } finally {
      setIsTransmuting(false);
    }
  };

  return (
    <section id="khaleeji-ai" className="py-16 sm:py-20 bg-slate-950 border-b border-white/10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="Khaleeji-AI™ Neural Transmutation"
          badgeVariant="gold"
          badgeIcon={<Languages size={13} className="text-amber-400" />}
          title="Autonomous Multi-Dialect"
          gradientText="Arabic Voice & Lip-Sync Studio"
          description="Shoot your commercial once in Dubai or Cairo. Deploy across Saudi Arabia, UAE, Kuwait, and Egypt with authentic regional Arabic dialect transmutation and sub-millimeter lip re-targeting."
          className="mb-6 sm:mb-8 text-center"
        />

        {/* ─── Mode Tabs: Preset Showcase vs Custom Live Transmuter ─── */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab("preset");
                setTransmutedOutput(null);
                setCulturalExplanation(null);
                stopAudio();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preset"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                  : "text-text-muted hover:text-white"
              }`}
            >
              Standard Dialect Presets
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("custom");
                stopAudio();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "custom"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Live Script AI Transmuter</span>
            </button>
          </div>
        </div>

        {/* ─── Live Custom Script Input Deck ─── */}
        {activeTab === "custom" && (
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 mb-8 backdrop-blur-md">
            <label className="block text-xs font-mono font-bold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                <span>Enter English or Arabic Brand Copy to Localize:</span>
              </span>
              <span className="text-[10px] text-amber-400">Neural Adapter Ready</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customScriptInput}
                onChange={(e) => setCustomScriptInput(e.target.value)}
                placeholder="e.g. 'Our new energy drink gives you wings and power for your workout here in Riyadh!'"
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-amber-500"
                onKeyDown={(e) => e.key === "Enter" && handleTransmuteCustomScript()}
              />
              <button
                type="button"
                onClick={handleTransmuteCustomScript}
                disabled={isTransmuting || !customScriptInput.trim()}
                className="px-6 py-3 rounded-xl btn-brand text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isTransmuting ? (
                  <span className="animate-pulse">Transmuting Dialect...</span>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Transmute into {selectedDialect.name.split(" ")[0]}</span>
                  </>
                )}
              </button>
            </div>
            {customScriptInput.trim() === "" && (
              <div className="mt-2 text-[11px] text-text-muted">
                Try quick sample:{" "}
                <button
                  type="button"
                  onClick={() => setCustomScriptInput("الإنتاج هنا ممتاز جداً ونريد تصوير الإعلان الآن بدون قلق")}
                  className="text-amber-400 hover:underline font-arabic text-xs"
                >
                  &ldquo;الإنتاج هنا ممتاز جداً ونريد تصوير الإعلان الآن بدون قلق&rdquo;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── 1. Dialect Selector Tabs: Premium Responsive Grid Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-8">
          {DIALECT_PRESETS.map((preset) => {
            const isSelected = selectedDialect.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectDialect(preset)}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-500/80 bg-gradient-to-b from-card via-card to-amber-950/20 ring-1 ring-amber-500/30 shadow-xl shadow-black/40"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                }`}
              >
                {/* Top Row: Flag & Region Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl sm:text-2xl">{preset.flag}</span>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      isSelected
                        ? "text-amber-300 bg-amber-500/20 border-amber-500/40 font-bold"
                        : "text-text-muted bg-white/5 border-white/10"
                    }`}
                  >
                    {preset.region.split(" ")[0]}
                  </span>
                </div>

                {/* Dialect Name & Arabic Script */}
                <div>
                  <div
                    className={`text-xs sm:text-sm font-bold transition-colors line-clamp-1 ${
                      isSelected ? "text-white" : "text-white/80 group-hover:text-white"
                    }`}
                  >
                    {preset.name.split("(")[0].trim()}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-arabic text-text-secondary mt-0.5 line-clamp-1">
                    {preset.arabicName}
                  </div>
                </div>

                {/* Active Indicator Bar */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold truncate">
                    {preset.lipSyncAccuracy.split(" ")[0]} Sync
                  </span>
                  <div
                    className={`size-2 rounded-full transition-all ${
                      isSelected
                        ? "bg-amber-400 shadow-sm shadow-amber-500 animate-pulse"
                        : "bg-white/20"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── 2. Main Dialect Inspection Card ─── */}
        <div className="p-5 sm:p-8 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-2xl mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedDialect.flag}</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                  {selectedDialect.name}
                </h3>
              </div>
              <div className="text-xs sm:text-sm font-arabic text-amber-400 font-medium">
                {selectedDialect.arabicName}
              </div>
              <div className="text-xs text-text-muted mt-1">
                Target Market: {selectedDialect.targetMarket}
              </div>
            </div>

            {/* Tone Selector & Telemetry Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
                <Sliders size={12} className="text-amber-400 ml-1.5 shrink-0" />
                <span className="text-[10px] font-mono text-text-muted uppercase px-1 hidden xs:inline">Tone:</span>
                {selectedDialect.preferredTones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedTone === tone
                        ? "bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                        : "text-text-secondary hover:text-white"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-black/50 p-2.5 sm:p-3 rounded-xl border border-white/5 divide-x divide-white/10">
                <div className="text-left pr-2">
                  <div className="text-[9px] text-text-muted font-mono uppercase">Lip Precision</div>
                  <div className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span className="truncate">{selectedDialect.lipSyncAccuracy.split(" ")[0]}</span>
                  </div>
                </div>

                <div className="text-left pl-3">
                  <div className="text-[9px] text-text-muted font-mono uppercase">Alignment</div>
                  <div className="text-xs font-black text-amber-400 font-mono mt-0.5">0.4ms Jitter</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 3. Grid: Speech Visualizer + Neural Viseme Tracker ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-6">
            {/* Left 8 Cols: Dynamic Arabic Script with Real-Time Word Highlighting */}
            <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Mic size={13} className="text-amber-400 shrink-0" />
                    <span>Culturally Localized Script:</span>
                  </span>

                  {/* Audio Playback Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`w-full xs:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isPlayingAudio
                        ? "btn-brand ring-2 ring-amber-500/50 animate-pulse"
                        : "btn-brand text-zinc-950 hover:brightness-110"
                    }`}
                  >
                    {isPlayingAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{isPlayingAudio ? "Stop Audio Sample" : "Play Dialect Sample"}</span>
                  </button>
                </div>

                {/* Arabic Script Display with Interactive Word Highlight */}
                <div className="text-lg sm:text-2xl font-arabic font-bold text-white leading-loose text-right dir-rtl mb-4 selection:bg-amber-500 selection:text-black">
                  {words.map((word, idx) => {
                    const isSpoken = idx === activeWordIndex;
                    return (
                      <span
                        key={idx}
                        className={`transition-all duration-150 inline-block px-1 rounded ${
                          isSpoken
                            ? "bg-amber-500 text-zinc-950 font-bold scale-105 shadow-sm shadow-amber-500"
                            : "text-white/90"
                        }`}
                      >
                        {word}{" "}
                      </span>
                    );
                  })}
                </div>

                {/* English Literal Translation for preset sample */}
                {!transmutedOutput && (
                  <p className="text-xs text-text-secondary italic mb-4">
                    Literal: &ldquo;{selectedDialect.englishTranslation}&rdquo;
                  </p>
                )}
              </div>

              {/* Waveform Visualization Bars */}
              <div className="flex items-center gap-0.5 sm:gap-1 h-8 px-2 py-1 bg-slate-950/80 rounded-xl border border-white/5 overflow-hidden">
                {Array.from({ length: 40 }).map((_, idx) => {
                  const isActive = (idx / 40) * 100 <= playbackProgress;
                  const randomHeight = isPlayingAudio
                    ? 20 + Math.sin(idx * 0.4 + playbackProgress * 0.2) * 50 + (idx % 3) * 10
                    : 25 + (idx % 4) * 8;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-full transition-all duration-100 ${
                        isActive
                          ? "bg-gradient-to-t from-amber-500 to-amber-300"
                          : "bg-white/10"
                      }`}
                      style={{ height: `${Math.min(100, Math.max(15, randomHeight))}%` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right 4 Cols: Live Neural Viseme Tracker Mesh */}
            <div className="lg:col-span-4">
              <LipSyncMeshVisualizer
                isPlaying={isPlayingAudio}
                progress={playbackProgress}
                accuracy={selectedDialect.lipSyncAccuracy}
              />
            </div>
          </div>

          {/* Cultural Slang Nuance Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white font-display">
                  Linguistic &amp; Cultural Calibration:
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {culturalExplanation || selectedDialect.culturalNote}
                </div>
              </div>
            </div>

            {onSelectDialectForRfp && (
              <button
                type="button"
                onClick={() => onSelectDialectForRfp(selectedDialect.name)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs btn-brand text-zinc-950 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                <span>Deploy {selectedDialect.name.split(" ")[0]}</span>
                <ArrowRight size={13} className="rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
