"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  Crosshair,
  SplitSquareVertical,
  Video,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ImageCompareSlider } from "@/components/ui/image-compare-slider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  VIRTUAL_SCENES,
  type VirtualStudioScene,
} from "@/features/enterprise/virtual-studio.data";

export function VirtualStudioSection() {
  const { t } = useLanguage();
  const [activeScene, setActiveScene] = useState<VirtualStudioScene>(VIRTUAL_SCENES[0]);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [isAutoWiping, setIsAutoWiping] = useState<boolean>(false);
  const [isSectionVisible, setIsSectionVisible] = useState<boolean>(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Pause auto-sweep animation when section is off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Smooth automatic back-and-forth comparison sweep using requestAnimationFrame
  useEffect(() => {
    if (!isAutoWiping || !isSectionVisible) return;
    let animId: number;
    let angle = 0;
    let lastTime = performance.now();

    const sweep = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      angle += delta * 1.15;
      const pos = 50 + Math.sin(angle) * 35;
      setSliderPosition(Math.round(pos * 10) / 10);
      animId = requestAnimationFrame(sweep);
    };

    animId = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(animId);
  }, [isAutoWiping, isSectionVisible]);

  return (
    <Section
      ref={sectionRef}
      id="virtual-studio"
      aria-labelledby="virtual-studio-title"
      className="bg-secondary border-t border-white/10 relative overflow-hidden !py-12 md:!py-16"
      background={
        <>
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-700 opacity-20 will-change-transform"
            style={{
              background: `radial-gradient(circle, ${activeScene.badgeColor} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full pointer-events-none opacity-25"
            style={{
              background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            }}
          />
        </>
      }
    >
      <Container>
        {/* Section Header */}
        <SectionHeader
          headingId="virtual-studio-title"
          badge={t("virtualStudio.badge")}
          badgeVariant="default"
          badgeIcon={<Video size={13} className="text-brand-purple-light" />}
          title={t("virtualStudio.title")}
          gradientText={t("virtualStudio.titleGradient")}
          description={t("virtualStudio.subtitle")}
          className="mb-8"
        />

        {/* ─── 1. SCENE SELECTOR TABS ─── */}
        <div
          role="tablist"
          aria-label="Virtual production environment presets"
          className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {VIRTUAL_SCENES.map((scene) => {
            const isSelected = activeScene.id === scene.id;
            return (
              <button
                key={scene.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveScene(scene)}
                className={`px-3.5 py-2.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2.5 cursor-pointer shadow-sm shrink-0 whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                  isSelected
                    ? "border-brand-purple ring-2 ring-brand-purple/30 bg-card text-white shadow-brand-purple/10"
                    : "border-white/10 bg-card/60 text-text-secondary hover:text-white hover:border-white/20 hover:bg-card/90"
                }`}
              >
                <div className="relative size-6 rounded-md overflow-hidden shrink-0 border border-white/15">
                  <Image
                    src={scene.compositeImage}
                    alt={scene.name}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
                <span>{scene.name}</span>
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: scene.badgeColor }}
                />
              </button>
            );
          })}
        </div>

        {/* ─── 2. MAIN CINEMA STAGE VIEWPORT (ImageCompareSlider) ─── */}
        <div className="mb-3" dir="ltr">
          <ImageCompareSlider
            beforeImage={activeScene.rawImage}
            afterImage={activeScene.compositeImage}
            beforeAlt={`${activeScene.name} Raw Green Screen Soundstage`}
            afterAlt={`${activeScene.name} 3D Virtual Production Composite`}
            position={sliderPosition}
            onPositionChange={(pos) => {
              setIsAutoWiping(false);
              setSliderPosition(pos);
            }}
            aspectRatio="aspect-[16/9] sm:aspect-[21/10] md:aspect-[16/9]"
          >
            {/* TOP BROADCAST HUD OVERLAYS */}
            <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 pointer-events-none flex items-center gap-2 z-30">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-brand-teal/40 text-[10px] sm:text-xs font-mono text-brand-teal-light font-latin">
                <span className="size-1.5 sm:size-2 rounded-full bg-brand-teal" />
                <span className="font-bold">PHYSICAL STAGE</span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="text-white/80 hidden sm:inline">Green Cyclorama</span>
              </div>
            </div>

            <div className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 pointer-events-none flex items-center gap-2 z-30">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-brand-purple/40 text-[10px] sm:text-xs font-mono text-brand-purple-light font-latin">
                <Sparkles size={12} className="text-brand-purple-light" />
                <span className="font-bold">UNREAL 5.4</span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="text-white/80 hidden sm:inline">{activeScene.badge}</span>
              </div>
            </div>

            {/* BOTTOM TELEMETRY HUD */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none text-[9px] sm:text-[11px] font-mono text-white/80 bg-black/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 font-latin z-30">
              <div className="flex items-center gap-3 sm:gap-5">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 size={12} />
                  GENLOCK 120 FPS
                </span>
                <span className="hidden sm:inline text-white/60">LATENCY 2.1ms</span>
                <span className="hidden md:inline text-brand-cyan">10-BIT HDR BROADCAST PIPELINE</span>
              </div>

              <div className="flex items-center gap-1.5 text-brand-gold font-bold">
                <Crosshair size={12} />
                <span className="hidden sm:inline">TRACKING:</span>
                <span>{activeScene.trackingEngine}</span>
              </div>
            </div>

            {/* Hover Drag Cue */}
            <div className="absolute inset-x-0 bottom-11 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] text-white font-medium flex items-center gap-1.5 shadow-2xl">
                <SplitSquareVertical size={12} className="text-brand-cyan" />
                <span>{t("virtualStudio.dragPrompt")}</span>
              </div>
            </div>
          </ImageCompareSlider>
        </div>

        {/* ─── 3. INTEGRATED BOTTOM CONTROLS & PRODUCTION ACTIONS ─── */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 bg-card/90 rounded-xl sm:rounded-2xl border border-white/10 mb-5 sm:mb-6">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <button
              onClick={() => setIsAutoWiping(!isAutoWiping)}
              className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px] sm:min-h-0 ${
                isAutoWiping
                  ? "bg-brand-cyan text-black shadow-lg shadow-brand-cyan/20"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              {isAutoWiping ? <Pause size={12} /> : <Play size={12} />}
              <span>{isAutoWiping ? t("virtualStudio.pauseSweep") : t("virtualStudio.autoSweep")}</span>
            </button>

            {/* Quick Preset Buttons on Mobile (horizontal scrolling pills) */}
            <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <button
                onClick={() => {
                  setIsAutoWiping(false);
                  setSliderPosition(100);
                }}
                className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer min-h-[40px] ${
                  sliderPosition >= 98
                    ? "bg-emerald-600 text-white shadow"
                    : "text-text-secondary hover:text-white bg-white/5"
                }`}
              >
                {t("virtualStudio.greenStage100")}
              </button>
              <button
                onClick={() => {
                  setIsAutoWiping(false);
                  setSliderPosition(50);
                }}
                className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer min-h-[40px] ${
                  sliderPosition > 40 && sliderPosition < 60
                    ? "bg-brand-purple text-white shadow"
                    : "text-text-secondary hover:text-white bg-white/5"
                }`}
              >
                {t("virtualStudio.split5050")}
              </button>
              <button
                onClick={() => {
                  setIsAutoWiping(false);
                  setSliderPosition(0);
                }}
                className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer min-h-[40px] ${
                  sliderPosition <= 2
                    ? "btn-brand shadow"
                    : "text-text-secondary hover:text-white bg-white/5"
                }`}
              >
                {t("virtualStudio.scene100")}
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => {
                setIsAutoWiping(false);
                setSliderPosition(100);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sliderPosition >= 98
                  ? "bg-emerald-600 text-white shadow"
                  : "text-text-secondary hover:text-white bg-white/5"
              }`}
            >
              {t("virtualStudio.greenStage100")}
            </button>
            <button
              onClick={() => {
                setIsAutoWiping(false);
                setSliderPosition(50);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sliderPosition > 40 && sliderPosition < 60
                  ? "bg-brand-purple text-white shadow"
                  : "text-text-secondary hover:text-white bg-white/5"
              }`}
            >
              {t("virtualStudio.split5050")}
            </button>
            <button
              onClick={() => {
                setIsAutoWiping(false);
                setSliderPosition(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sliderPosition <= 2
                  ? "btn-brand shadow"
                  : "text-text-secondary hover:text-white bg-white/5"
              }`}
            >
              {t("virtualStudio.scene100")}
            </button>
          </div>

          {/* CTA Link */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/studio-booking"
              className="btn-brand w-full sm:w-auto py-2.5 sm:py-1.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-md hover:shadow-brand-purple/20 transition-all min-h-[40px] sm:min-h-0"
            >
              <span>{t("virtualStudio.bookVirtual")}</span>
              <ArrowRight size={13} className="rtl:rotate-180 shrink-0 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ─── 4. SLIM FEATURE BADGES ROW ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card/60 rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple-light shrink-0">
              <Cpu size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Mo-Sys Optical Sync</div>
              <div className="text-[11px] text-text-secondary">Sub-mm tracking, 2.1ms genlock</div>
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">200 sqm Cyclorama</div>
              <div className="text-[11px] text-text-secondary">Motorized ARRI SkyPanel RGBWW grid</div>
            </div>
          </div>

          <div className="bg-card/60 rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-brand-gold shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Unreal Engine 5.4 Live</div>
              <div className="text-[11px] text-text-secondary">Full realtime photorealistic In-Camera VFX</div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default VirtualStudioSection;
