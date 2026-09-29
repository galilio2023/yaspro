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

interface DialectPreset {
  id: string;
  name: string;
  arabicName: string;
  flag: string;
  region: string;
  langCode: string;
  targetMarket: string;
  spokenSample: string;
  englishTranslation: string;
  culturalNote: string;
  lipSyncAccuracy: string;
  preferredTones: string[];
}

const DIALECT_PRESETS: DialectPreset[] = [
  {
    id: "najdi",
    name: "Najdi (Riyadh / Central KSA)",
    arabicName: "اللهجة النجدية (الرياض)",
    flag: "🇸🇦",
    region: "Riyadh & Central Province",
    langCode: "ar-SA",
    targetMarket: "Saudi Vision 2030, Giga-projects & Prime TVCs",
    spokenSample: "طال عمرك، التصوير والإنتاج هنا ما تلقاه بأي مكان ثاني، الجودة تفرَق معك من أول لقطة والإنجاز يرفع الراس!",
    englishTranslation: "May your life be long, this production quality is unmatched anywhere else; the difference shows from the very first frame!",
    culturalNote: "Employs high-prestige Najdi honorifics ('طال عمرك', 'تفرق معك') to build instant trust with Saudi decision-makers.",
    lipSyncAccuracy: "99.8% Neural Phoneme Sync",
    preferredTones: ["Authoritative", "Honorable", "Inspiring"],
  },
  {
    id: "emirati",
    name: "Emirati (Dubai & Abu Dhabi)",
    arabicName: "اللهجة الإماراتية (دبي وأبوظبي)",
    flag: "🇦🇪",
    region: "United Arab Emirates",
    langCode: "ar-AE",
    targetMarket: "Dubai Tourism, Sovereign Summits & Luxury Brands",
    spokenSample: "طال عمرك، الشغل اهني ما عليه كلام، تقنيات عالمية واستوديوهات متطورة تبيّض الويه في كل محفل!",
    englishTranslation: "May your life be long, the craftsmanship here is unquestionable; world-class tech that brings honor on every global stage!",
    culturalNote: "Infused with authentic Gulf vernacular ('اهني', 'ما عليه كلام', 'تبيّض الويه') reflecting Emirati warmth and excellence.",
    lipSyncAccuracy: "99.6% Neural Phoneme Sync",
    preferredTones: ["Warm", "Prestigious", "Forward-looking"],
  },
  {
    id: "hijazi",
    name: "Hijazi (Jeddah & Western KSA)",
    arabicName: "اللهجة الحجازية (جدة ومكة)",
    flag: "🇸🇦",
    region: "Jeddah & Red Sea Coast",
    langCode: "ar-SA",
    targetMarket: "Youth Lifestyle, Entertainment & Red Sea Festivals",
    spokenSample: "يا سيدي، الشغل هنا على أصوله، استوديوهات وكاميرات 4K وإخراج عالمي يفرّح القلب ويخليك مبسوط!",
    englishTranslation: "Respected master, the work here is done to perfection; 4K cameras and world-class direction that delights the heart!",
    culturalNote: "Features relaxed and convivial Western Saudi idioms ('يا سيدي', 'على أصوله') ideal for entertainment and hospitality.",
    lipSyncAccuracy: "99.7% Neural Phoneme Sync",
    preferredTones: ["Approachable", "Energetic", "Culturally Rich"],
  },
  {
    id: "kuwaiti",
    name: "Kuwaiti (Kuwait & Northern Gulf)",
    arabicName: "اللهجة الكويتية",
    flag: "🇰🇼",
    region: "Kuwait & Gulf Coast",
    langCode: "ar-KW",
    targetMarket: "High-Engagement Commercials & Creator Shows",
    spokenSample: "يا طويل العمر، الإنتاج هني حدّه عجيب ومضبوط، لا تحاتي شي فريق ياس برو يضبط لك كل تفصيلة!",
    englishTranslation: "Respected sir, the production here is extremely impressive and precise; leave your worries aside, Yas Pro covers every detail!",
    culturalNote: "Uses classic Kuwaiti emphasis ('حدّه عجيب', 'لا تحاتي', 'يضبط لك') commanding high youth resonance.",
    lipSyncAccuracy: "99.5% Neural Phoneme Sync",
    preferredTones: ["Punchy", "Witty", "Relatable"],
  },
  {
    id: "egyptian",
    name: "Egyptian (Cairo & Pan-Arab)",
    arabicName: "اللهجة المصرية الفصحى المعتدلة",
    flag: "🇪🇬",
    region: "Cairo & North Africa Hub",
    langCode: "ar-EG",
    targetMarket: "Regional TV Commercials & Pan-Arab Streaming",
    spokenSample: "يا فندم، الإنتاج هنا احترافي لأعلى درجة، أحدث أجهزة سينمائية ومعدات هوليوودية هتوصل رسالتك بأجمل صورة!",
    englishTranslation: "Esteemed client, the production here is professional to the highest standard; Hollywood-grade gear that delivers your message beautifully!",
    culturalNote: "Universally comprehended across 100M+ Arab viewers with crisp phonetic articulation and commercial dynamism.",
    lipSyncAccuracy: "99.9% Neural Phoneme Sync",
    preferredTones: ["Cinematic", "Engaging", "Artistic"],
  },
];

interface KhaleejiAiTransmuterProps {
  onSelectDialectForRfp?: (dialect: string) => void;
}

export function KhaleejiAiTransmuter({ onSelectDialectForRfp }: KhaleejiAiTransmuterProps) {
  const [selectedDialect, setSelectedDialect] = useState<DialectPreset>(DIALECT_PRESETS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [selectedTone, setSelectedTone] = useState(selectedDialect.preferredTones[0]);
  
  // Custom Live Script Transmuter States
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [customScriptInput, setCustomScriptInput] = useState("");
  const [isTransmuting, setIsTransmuting] = useState(false);
  const [transmutedOutput, setTransmutedOutput] = useState<string | null>(null);
  const [culturalExplanation, setCulturalExplanation] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeScript = transmutedOutput || selectedDialect.spokenSample;
  const words = activeScript.split(" ");

  // Real Web Speech API + Web Audio Synthesizer Hook
  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlayingAudio(false);
    setPlaybackProgress(0);
    setActiveWordIndex(-1);
  };

  const playSynthesizerFallback = (durationMs: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      // Gentle formant shift simulating Arabic speech cadence
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + durationMs / 2000);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + durationMs / 1000);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
      return;
    }

    setIsPlayingAudio(true);
    setPlaybackProgress(0);

    const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
    const durationMs = 5200; // Estimated phrase duration
    const startTime = performance.now();

    if (hasSpeech) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeScript);
      utterance.lang = selectedDialect.langCode;
      utterance.rate = selectedTone === "Authoritative" ? 0.9 : selectedTone === "Punchy" ? 1.15 : 1.0;
      utterance.pitch = selectedTone === "Warm" ? 0.95 : 1.05;

      // Select Arabic voice if available
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));
      if (arabicVoice) utterance.voice = arabicVoice;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          let runningLength = 0;
          for (let i = 0; i < words.length; i++) {
            runningLength += words[i].length + 1;
            if (charIndex < runningLength) {
              setActiveWordIndex(i);
              break;
            }
          }
        }
      };

      utterance.onend = () => {
        stopAudio();
      };

      utterance.onerror = () => {
        // Fallback to simulated audio synthesis if voice engine errors
        playSynthesizerFallback(durationMs);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      playSynthesizerFallback(durationMs);
    }

    // Smooth continuous progress & viseme progression
    const updateLoop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setPlaybackProgress(progress);

      // Interpolate active word index if boundary events aren't supported
      const wordIdx = Math.floor((progress / 100) * words.length);
      setActiveWordIndex(Math.min(words.length - 1, wordIdx));

      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(updateLoop);
      } else {
        stopAudio();
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  };

  // Cleanup on unmount or dialect switch
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

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
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[350px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="Khaleeji-AI™ Neural Transmutation"
          badgeVariant="purple"
          badgeIcon={<Languages size={13} className="text-brand-purple-light" />}
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
                  ? "bg-brand-purple text-white shadow-sm"
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
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <Sparkles size={13} className="text-brand-gold" />
              <span>Live Script AI Transmuter</span>
            </button>
          </div>
        </div>

        {/* ─── Live Custom Script Input Deck ─── */}
        {activeTab === "custom" && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-purple/15 via-slate-900 to-brand-cyan/10 border border-brand-purple/30 mb-8 backdrop-blur-md">
            <label className="block text-xs font-mono font-bold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-brand-gold" />
                <span>Enter English or Arabic Brand Copy to Localize:</span>
              </span>
              <span className="text-[10px] text-brand-cyan">Neural Adapter Ready</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={customScriptInput}
                onChange={(e) => setCustomScriptInput(e.target.value)}
                placeholder="e.g. 'Our new energy drink gives you wings and power for your workout here in Riyadh!'"
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-brand-purple"
                onKeyDown={(e) => e.key === "Enter" && handleTransmuteCustomScript()}
              />
              <button
                type="button"
                onClick={handleTransmuteCustomScript}
                disabled={isTransmuting || !customScriptInput.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-purple/30 shrink-0"
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
                  className="text-brand-purple-light hover:underline font-arabic text-xs"
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
                    ? "border-brand-purple bg-gradient-to-b from-card via-card to-brand-purple/15 ring-2 ring-brand-purple/40 shadow-xl shadow-brand-purple/20"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                }`}
              >
                {/* Top Row: Flag & Region Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl sm:text-2xl">{preset.flag}</span>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                      isSelected
                        ? "text-brand-purple-light bg-brand-purple/20 border-brand-purple/40 font-bold"
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
                        ? "bg-brand-purple-light shadow-sm shadow-brand-purple animate-pulse"
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
              <div className="text-xs sm:text-sm font-arabic text-brand-purple-light font-medium">
                {selectedDialect.arabicName}
              </div>
              <div className="text-xs text-text-muted mt-1">
                Target Market: {selectedDialect.targetMarket}
              </div>
            </div>

            {/* Tone Selector & Telemetry Chips */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-xl border border-white/10">
                <Sliders size={12} className="text-brand-purple-light ml-1.5 shrink-0" />
                <span className="text-[10px] font-mono text-text-muted uppercase px-1 hidden xs:inline">Tone:</span>
                {selectedDialect.preferredTones.map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedTone === tone
                        ? "bg-brand-purple text-white shadow-sm"
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
                  <div className="text-xs font-black text-brand-cyan font-mono mt-0.5">0.4ms Jitter</div>
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
                    <Mic size={13} className="text-brand-purple-light shrink-0" />
                    <span>Culturally Localized Script:</span>
                  </span>

                  {/* Audio Playback Toggle Button */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`w-full xs:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      isPlayingAudio
                        ? "bg-brand-purple text-white shadow-brand-purple/40 ring-2 ring-brand-purple/50 animate-pulse"
                        : "bg-white text-black hover:bg-white/90"
                    }`}
                  >
                    {isPlayingAudio ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{isPlayingAudio ? "Stop Audio Sample" : "Play Dialect Sample"}</span>
                  </button>
                </div>

                {/* Arabic Script Display with Interactive Word Highlight */}
                <div className="text-lg sm:text-2xl font-arabic font-bold text-white leading-loose text-right dir-rtl mb-4 selection:bg-brand-purple">
                  {words.map((word, idx) => {
                    const isSpoken = idx === activeWordIndex;
                    return (
                      <span
                        key={idx}
                        className={`transition-all duration-150 inline-block px-1 rounded ${
                          isSpoken
                            ? "bg-brand-purple text-white scale-105 shadow-sm shadow-brand-purple"
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
                          ? "bg-gradient-to-t from-brand-purple to-brand-cyan"
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
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs btn-brand text-white flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-lg hover:shadow-brand-purple/25 transition-all"
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
