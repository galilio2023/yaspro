"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Zap,
  CheckCircle2,
  Crosshair,
  SplitSquareVertical,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { VIRTUAL_HERO_SCENE } from "./virtual-studio.data";

type DisplayMode = "split" | "green" | "virtual";

export function VirtualStudioSection() {
  const { t, isArabic } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 percentage
  const [isAutoWiping, setIsAutoWiping] = useState<boolean>(false);
  const [isSectionVisible, setIsSectionVisible] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("split");

  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const greenVideoRef = useRef<HTMLVideoElement>(null);
  const virtualVideoRef = useRef<HTMLVideoElement>(null);

  const isDraggingRef = useRef<boolean>(false);
  const rafDragRef = useRef<number | null>(null);

  // Sync play / pause state across both video streams
  useEffect(() => {
    const vGreen = greenVideoRef.current;
    const v3D = virtualVideoRef.current;
    if (!vGreen || !v3D) return;

    if (isPlaying) {
      if (vGreen.paused) vGreen.play().catch(() => {});
      if (v3D.paused) v3D.play().catch(() => {});
    } else {
      if (!vGreen.paused) vGreen.pause();
      if (!v3D.paused) v3D.pause();
    }
  }, [isPlaying]);

  // Sync mute state (vGreen has master sound, v3D stays muted to prevent phase echo)
  useEffect(() => {
    if (greenVideoRef.current) {
      greenVideoRef.current.muted = isMuted;
    }
    if (virtualVideoRef.current) {
      virtualVideoRef.current.muted = true;
    }
  }, [isMuted]);

  // Keep playback time strictly synchronized between green and 3D streams
  useEffect(() => {
    const vGreen = greenVideoRef.current;
    const v3D = virtualVideoRef.current;
    if (!vGreen || !v3D) return;

    const handleSync = () => {
      if (Math.abs(vGreen.currentTime - v3D.currentTime) > 0.08) {
        v3D.currentTime = vGreen.currentTime;
      }
    };

    vGreen.addEventListener("timeupdate", handleSync);
    return () => vGreen.removeEventListener("timeupdate", handleSync);
  }, []);

  // Pause animations when section is out of viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Smooth automatic back-and-forth wipe simulation
  useEffect(() => {
    if (!isAutoWiping || !isSectionVisible || displayMode !== "split") return;
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
  }, [isAutoWiping, isSectionVisible, displayMode]);

  // Drag interaction calculation
  const updateSliderFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));

    if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    rafDragRef.current = requestAnimationFrame(() => {
      setSliderPosition(Math.round(percentage * 10) / 10);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (displayMode !== "split") return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsAutoWiping(false);
    updateSliderFromClientX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (displayMode !== "split") return;
    if (e.touches[0]) {
      isDraggingRef.current = true;
      setIsAutoWiping(false);
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      updateSliderFromClientX(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !e.touches[0]) return;
      updateSliderFromClientX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (rafDragRef.current) cancelAnimationFrame(rafDragRef.current);
    };
  }, []);

  // Effective visual split position depending on display mode
  const effectiveSplit = displayMode === "green" ? 100 : displayMode === "virtual" ? 0 : sliderPosition;

  return (
    <section
      ref={sectionRef}
      id="virtual-3d"
      aria-labelledby="virtual-heading"
      className="relative w-full py-16 sm:py-20 lg:py-28 overflow-hidden bg-black text-white"
    >
      {/* Subtle ambient stage backlight */}
      <div
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-brand-violet/15 blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ─── LEFT COLUMN: TYPOGRAPHY & COPY (Matches Yas Productions reference) ─── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <FadeUp delay={0.05}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/30 text-brand-lavender text-xs font-semibold tracking-wide backdrop-blur-md mb-2">
                <Sparkles size={13} className="text-brand-mauve" />
                <span>{t("virtualStudio.badge")}</span>
              </div>

              {/* Main Headline */}
              <h2
                id="virtual-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-white"
              >
                {t("virtualStudio.title")}{" "}
                <span className="bg-gradient-to-r from-purple-300 via-brand-mauve to-purple-400 bg-clip-text text-transparent">
                  {t("virtualStudio.titleGradient")}
                </span>
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg text-zinc-300/90 leading-relaxed max-w-xl font-normal mt-4">
                {t("virtualStudio.description")}
              </p>
            </FadeUp>

            {/* Mode Selector Tabs (For credibility: Compare Split / 100% Green / 100% 3D) */}
            <FadeUp delay={0.1}>
              <div className="pt-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-brand-mauve" />
                  <span>{isArabic ? "أوضاع الاستعراض والتحقق المباشر:" : "Verification & Preview Modes:"}</span>
                </div>
                <div
                  role="tablist"
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900/90 border border-white/10 w-fit backdrop-blur-md"
                >
                  <button
                    role="tab"
                    aria-selected={displayMode === "split"}
                    onClick={() => {
                      setDisplayMode("split");
                      setSliderPosition(50);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "split"
                        ? "bg-purple-600/90 text-white shadow-md shadow-purple-900/40"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <SplitSquareVertical size={13} />
                    <span>{t("virtualStudio.split5050")}</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={displayMode === "green"}
                    onClick={() => {
                      setDisplayMode("green");
                      setIsAutoWiping(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "green"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="size-2 rounded-full bg-emerald-400" />
                    <span>{t("virtualStudio.greenStage100")}</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={displayMode === "virtual"}
                    onClick={() => {
                      setDisplayMode("virtual");
                      setIsAutoWiping(false);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      displayMode === "virtual"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/50"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="size-2 rounded-full bg-indigo-400" />
                    <span>{t("virtualStudio.scene100")}</span>
                  </button>
                </div>
              </div>
            </FadeUp>

            {/* Stage Specifications / Credibility Badges */}
            <FadeUp delay={0.15}>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-brand-lavender shrink-0">
                    <Layers size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">200 sqm Cyclorama</div>
                    <div className="text-[11px] text-zinc-400">Chroma Green Soundstage</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-brand-lavender shrink-0">
                    <Zap size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-mono">Unreal Engine 5.4</div>
                    <div className="text-[11px] text-zinc-400">Live Real-time Keying</div>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Direct CTA */}
            <FadeUp delay={0.2} className="pt-2">
              <Link
                href="/studio-booking"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] w-fit"
              >
                <span>{t("virtualStudio.bookVirtual")}</span>
                <ArrowRight size={15} className="rtl:rotate-180 shrink-0" />
              </Link>
            </FadeUp>
          </div>

          {/* ─── RIGHT COLUMN: THE TRUE BEFORE/AFTER VIDEO COMPARISON SLIDER ─── */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <FadeUp delay={0.1}>
              <div
                dir="ltr"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="relative w-full aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl shadow-purple-950/40 select-none group cursor-ew-resize"
              >
                {/* 1. BACKGROUND LAYER: 100% UNREAL 5.4 3D VIRTUAL STAGE */}
                <div className="absolute inset-0 size-full pointer-events-none">
                  <video
                    ref={virtualVideoRef}
                    src={VIRTUAL_HERO_SCENE.virtualVideoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="size-full object-cover"
                  />
                </div>

                {/* 2. FOREGROUND LAYER: PHYSICAL GREEN SCREEN STAGE CLIPPED BY SLIDER */}
                <div
                  className="absolute inset-0 size-full pointer-events-none transition-[clip-path] duration-75"
                  style={{ clipPath: `inset(0% ${100 - effectiveSplit}% 0% 0%)` }}
                >
                  <video
                    ref={greenVideoRef}
                    src={VIRTUAL_HERO_SCENE.greenVideoSrc}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="size-full object-cover"
                  />
                </div>

                {/* 3. INTERACTIVE SLIDER DIVIDER (Active in Split Mode) */}
                {displayMode === "split" && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-white to-purple-400 z-20 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-9 rounded-full bg-zinc-900 border-2 border-purple-400 shadow-xl shadow-purple-950/80 flex items-center justify-center text-purple-200 group-hover:scale-110 transition-transform">
                      <SplitSquareVertical size={16} />
                    </div>
                  </div>
                )}

                {/* 4. TOP BROADCAST HUD BADGES */}
                <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 z-30">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-[10px] sm:text-xs font-mono text-emerald-400 font-latin">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">PHYSICAL STAGE</span>
                    <span className="text-white/40 hidden sm:inline">|</span>
                    <span className="text-white/80 hidden sm:inline">Green Cyclorama</span>
                  </div>
                </div>

                <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-2 z-30">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/30 text-[10px] sm:text-xs font-mono text-purple-300 font-latin">
                    <span className="size-2 rounded-full bg-purple-400" />
                    <span className="font-bold">UNREAL 5.4</span>
                    <span className="text-white/40 hidden sm:inline">|</span>
                    <span className="text-white/80 hidden sm:inline">3D Environment</span>
                  </div>
                </div>

                {/* 5. BOTTOM TELEMETRY BAR */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[9px] sm:text-[11px] font-mono text-white/80 bg-black/85 backdrop-blur-md px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/10 font-latin z-30">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 size={12} />
                      {t("virtualStudio.liveGenlock")}
                    </span>
                    <span className="hidden sm:inline text-white/60">{t("virtualStudio.latency")}</span>
                    <span className="hidden md:inline text-purple-300">{t("virtualStudio.hdrPipeline")}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Crosshair size={12} />
                    <span>{t("virtualStudio.tracking")}</span>
                  </div>
                </div>
              </div>

              {/* ─── CONTROLS BAR: Play / Pause, Audio Mute, Auto-Sweep ─── */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-950/80 rounded-xl border border-white/10 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-all flex items-center gap-1.5 cursor-pointer font-medium"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <Pause size={12} className="text-purple-300" /> : <Play size={12} className="text-purple-300" />}
                    <span>{isPlaying ? (isArabic ? "إيقاف" : "Pause") : (isArabic ? "تشغيل" : "Play")}</span>
                  </button>

                  {/* Audio Mute */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-all flex items-center gap-1.5 cursor-pointer font-medium"
                    title={isMuted ? "Unmute Audio" : "Mute Audio"}
                  >
                    {isMuted ? <VolumeX size={13} className="text-zinc-400" /> : <Volume2 size={13} className="text-purple-300" />}
                    <span>{isMuted ? (isArabic ? "مكتوم" : "Muted") : (isArabic ? "صوت مفعّل" : "Audio On")}</span>
                  </button>

                  {/* Auto-Sweep (Split mode only) */}
                  {displayMode === "split" && (
                    <button
                      onClick={() => setIsAutoWiping(!isAutoWiping)}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                        isAutoWiping
                          ? "bg-purple-600 text-white shadow"
                          : "bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      {isAutoWiping ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isAutoWiping ? t("virtualStudio.pauseSweep") : t("virtualStudio.autoSweep")}</span>
                    </button>
                  )}
                </div>

                {/* Slider Drag Hint */}
                {displayMode === "split" && (
                  <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
                    <SplitSquareVertical size={12} className="text-purple-300" />
                    <span>{t("virtualStudio.dragPrompt")}</span>
                  </div>
                )}
              </div>
            </FadeUp>
          </div>

        </div>
      </Container>
    </section>
  );
}

export default VirtualStudioSection;
