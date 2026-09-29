"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface VirtualStudioScene {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  rawImage: string;
  compositeImage: string;
  lightingType: string;
  trackingEngine: string;
}

export const VIRTUAL_SCENES: VirtualStudioScene[] = [
  {
    id: "fashion-runway",
    name: "Paris Fashion Runway",
    category: "Fashion & Luxury",
    description: "Middle Eastern fashion influencer in emerald dress keyed onto a marble Parisian runway arch overlooking the Eiffel Tower.",
    badge: "Parisian Arch 3D",
    badgeColor: "#10b981",
    rawImage: "/images/virtual-studio/fashion-raw.jpg",
    compositeImage: "/images/virtual-studio/fashion-composite.jpg",
    lightingType: "Golden Hour Warm Key + Ambient Paris Sunset",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
  {
    id: "podcast-broadcast",
    name: "Future Tech Talk Show",
    category: "Podcast & Talk Show",
    description: "Woman podcast host in smart blazer live-streamed inside an ultra-modern curved neon studio with holographic telemetry.",
    badge: "Tech Studio XR",
    badgeColor: "#06b6d4",
    rawImage: "/images/virtual-studio/podcast-raw.jpg",
    compositeImage: "/images/virtual-studio/podcast-composite.jpg",
    lightingType: "5600K High-CRI Key + Cyan Rim Lighting",
    trackingEngine: "Stype RedSpy FreeD Genlock",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk High-Tech Hub",
    category: "Gaming & Sci-Fi",
    description: "Holographic telemetry HUDs, neon violet and cyan accents, and panoramic vista of a futuristic metropolis.",
    badge: "Neo-Tokyo 2088",
    badgeColor: "#8b5cf6",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/cyberpunk-composite.jpg",
    lightingType: "Dual Neon Rim + Cyan Floor Spill",
    trackingEngine: "Unreal 5.4 LiveLink",
  },
  {
    id: "dubai-penthouse",
    name: "Dubai Skyline Penthouse",
    category: "Luxury & Commercial",
    description: "Curved floor-to-ceiling glass panorama overlooking Burj Khalifa at golden hour sunset with warm marble reflections.",
    badge: "Golden Hour Dubai",
    badgeColor: "#f59e0b",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/dubai-composite.jpg",
    lightingType: "Sunset 3200K Warm Key + Daylight Fill",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
];

export function VirtualStudioSection() {
  const { t, isArabic } = useLanguage();
  const [activeScene, setActiveScene] = useState<VirtualStudioScene>(VIRTUAL_SCENES[0]);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoWiping, setIsAutoWiping] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const rafDragRef = useRef<number | null>(null);

  // Mouse / Touch drag handler for Before/After split with rAF throttling
  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (rafDragRef.current !== null) {
      cancelAnimationFrame(rafDragRef.current);
    }
    rafDragRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const clampedX = Math.max(0, Math.min(rect.width, x));
      const percentage = (clampedX / rect.width) * 100;
      setSliderPosition(Math.round(percentage * 10) / 10);
      rafDragRef.current = null;
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoWiping(false);
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsAutoWiping(false);
    setIsDragging(true);
    updateSliderFromClientX(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateSliderFromClientX(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      updateSliderFromClientX(e.touches[0].clientX);
    };

    const handleEnd = () => {
      setIsDragging(false);
      if (rafDragRef.current !== null) {
        cancelAnimationFrame(rafDragRef.current);
        rafDragRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
      if (rafDragRef.current !== null) {
        cancelAnimationFrame(rafDragRef.current);
        rafDragRef.current = null;
      }
    };
  }, [isDragging, updateSliderFromClientX]);

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
      <Container className="relative z-10 max-w-5xl">
        <SectionHeader
          headingId="virtual-studio-title"
          badge={t("virtualStudio.badge")}
          badgeVariant="cyan"
          badgeIcon={<Video size={13} className="text-brand-cyan" />}
          title={isArabic ? t("virtualStudio.title") : "Virtual 3D Studio"}
          gradientText={isArabic ? t("virtualStudio.titleGradient") : "Before & After Simulation"}
          description={t("virtualStudio.description")}
          className="mb-6 sm:mb-8"
        />

        {/* ─── 1. COMPACT SCENE SELECTOR TABS ─── */}
        <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 mb-5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {VIRTUAL_SCENES.map((scene) => {
            const isSelected = activeScene.id === scene.id;
            return (
              <button
                key={scene.id}
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

        {/* ─── 2. MAIN CINEMA STAGE VIEWPORT (Optimized 16:9 Cinema Container) ─── */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl select-none mb-3">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="relative w-full aspect-[16/9] sm:aspect-[21/10] md:aspect-[16/9] cursor-ew-resize group [touch-action:pan-y]"
          >
            {/* UNDER LAYER (RIGHT SIDE): Photorealistic 3D Virtual Scene */}
            <div className="absolute inset-0 size-full">
              <Image
                src={activeScene.compositeImage}
                alt={`${activeScene.name} 3D Virtual Production Composite`}
                fill
                className="object-cover object-center pointer-events-none"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* OVER LAYER (LEFT SIDE): Raw Green Screen Soundstage (Clipped by sliderPosition) */}
            <div
              className="absolute inset-0 size-full overflow-hidden pointer-events-none will-change-[clip-path]"
              style={{
                clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)`,
              }}
            >
              <Image
                src={activeScene.rawImage}
                alt={`${activeScene.name} Raw Green Screen Soundstage`}
                fill
                className="object-cover object-center pointer-events-none"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* VERTICAL SPLIT DIVIDER BAR & DRAG HANDLE */}
            <div
              className="absolute top-0 bottom-0 w-[2.5px] bg-white pointer-events-none transition-none shadow-[0_0_14px_rgba(255,255,255,0.9)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 sm:size-11 rounded-full bg-slate-950/90 border-2 border-white shadow-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                <SplitSquareVertical size={16} className="text-brand-cyan" />
              </div>
            </div>

            {/* TOP BROADCAST HUD OVERLAYS */}
            <div className="absolute top-2.5 start-2.5 sm:top-3.5 sm:start-3.5 pointer-events-none flex items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-brand-teal/40 text-[10px] sm:text-xs font-mono text-brand-teal-light font-latin">
                <span className="size-1.5 sm:size-2 rounded-full bg-brand-teal" />
                <span className="font-bold">PHYSICAL STAGE</span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="text-white/80 hidden sm:inline">Green Cyclorama</span>
              </div>
            </div>

            <div className="absolute top-2.5 end-2.5 sm:top-3.5 sm:end-3.5 pointer-events-none flex items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-brand-purple/40 text-[10px] sm:text-xs font-mono text-brand-purple-light font-latin">
                <Sparkles size={12} className="text-brand-purple-light" />
                <span className="font-bold">UNREAL 5.4</span>
                <span className="text-white/40 hidden sm:inline">|</span>
                <span className="text-white/80 hidden sm:inline">{activeScene.badge}</span>
              </div>
            </div>

            {/* BOTTOM TELEMETRY HUD */}
            <div className="absolute bottom-2.5 start-2.5 end-2.5 sm:bottom-3 sm:start-3 sm:end-3 flex items-center justify-between pointer-events-none text-[9px] sm:text-[11px] font-mono text-white/80 bg-black/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 font-latin">
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
            <div className="absolute inset-x-0 bottom-11 flex justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[11px] text-white font-medium flex items-center gap-1.5 shadow-2xl">
                <SplitSquareVertical size={12} className="text-brand-cyan" />
                <span>{t("virtualStudio.dragPrompt")}</span>
              </div>
            </div>
          </div>
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
