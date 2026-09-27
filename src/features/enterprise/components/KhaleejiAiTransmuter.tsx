"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Languages,
  ArrowRight,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

interface DialectPreset {
  id: string;
  name: string;
  arabicName: string;
  flag: string;
  region: string;
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
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setSimulatedProgress(0);
    } else {
      setSimulatedProgress(0);
      setIsPlayingAudio(true);
    }
  };

  // Simulated audio playback progress and waveform animation
  useEffect(() => {
    if (!isPlayingAudio) return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingAudio(false);
          return 0;
        }
        return prev + 4;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlayingAudio]);


  return (
    <section id="khaleeji-ai" className="py-20 bg-slate-950 border-b border-white/10 relative overflow-hidden">
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
          className="mb-10 text-center"
        />

        {/* ─── 1. Dialect Selector Tabs: Horizontal touch-scrolling on mobile ─── */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none px-1">
          {DIALECT_PRESETS.map((preset) => {
            const isSelected = selectedDialect.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedDialect(preset);
                  setIsPlayingAudio(false);
                }}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm shrink-0 ${
                  isSelected
                    ? "border-brand-purple bg-card ring-2 ring-brand-purple/30 text-white shadow-brand-purple/20 font-bold"
                    : "border-white/10 bg-slate-900/60 text-text-secondary hover:text-white hover:border-white/20 hover:bg-slate-900"
                }`}
              >
                <span className="text-sm sm:text-base">{preset.flag}</span>
                <span className="whitespace-nowrap">{preset.name}</span>
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

            {/* Telemetry Chips: Responsive Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-black/50 p-3.5 rounded-2xl border border-white/5 divide-x divide-white/10">
              <div className="text-left pr-2">
                <div className="text-[9px] sm:text-[10px] text-text-muted font-mono uppercase">Lip-Sync Precision</div>
                <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span className="truncate">{selectedDialect.lipSyncAccuracy}</span>
                </div>
              </div>

              <div className="text-left pl-3">
                <div className="text-[9px] sm:text-[10px] text-text-muted font-mono uppercase">Phase Alignment</div>
                <div className="text-xs sm:text-sm font-black text-brand-cyan font-mono mt-0.5">0.4ms Jitter</div>
              </div>
            </div>
          </div>

          {/* Spoken Sample Box with Audio Waveform */}
          <div className="my-6 p-4 sm:p-6 rounded-2xl bg-black/60 border border-white/10">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4">
              <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Mic size={13} className="text-brand-purple-light shrink-0" />
                <span>Culturally Localized Script:</span>
              </span>

              {/* Audio Playback Toggle Button */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className={`w-full xs:w-auto px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPlayingAudio
                    ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/30 animate-pulse"
                    : "bg-white/10 text-white hover:bg-white/15"
                }`}
              >
                {isPlayingAudio ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span>{isPlayingAudio ? "Stop Audio Sample" : "Play Dialect Sample"}</span>
              </button>
            </div>

            {/* Arabic Script Display */}
            <p className="text-base sm:text-2xl font-arabic font-bold text-white leading-loose text-right dir-rtl mb-4 selection:bg-brand-purple">
              &ldquo;{selectedDialect.spokenSample}&rdquo;
            </p>

            {/* English Literal Translation */}
            <p className="text-xs text-text-secondary italic mb-4">
              Literal: &ldquo;{selectedDialect.englishTranslation}&rdquo;
            </p>

            {/* Waveform Visualization Bars */}
            <div className="flex items-center gap-0.5 sm:gap-1 h-8 px-2 py-1 bg-slate-950/80 rounded-xl border border-white/5 overflow-hidden">
              {Array.from({ length: 36 }).map((_, idx) => {
                const isActive = (idx / 36) * 100 <= simulatedProgress;
                const randomHeight = isPlayingAudio
                  ? 20 + Math.sin(idx * 0.4 + simulatedProgress * 0.2) * 50 + (idx % 3) * 10
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

          {/* Cultural Slang Nuance Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-brand-gold shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white font-display">
                  Linguistic &amp; Cultural Calibration:
                </div>
                <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  {selectedDialect.culturalNote}
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
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
