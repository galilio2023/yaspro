"use client";

import React, { useRef, useState, useEffect, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MoveHorizontal,
  Repeat,
  Hand,
  Play,
  Pause,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { VIRTUAL_HERO_SCENE } from "./virtual-studio.data";

type RevealMode = "auto" | "manual";

/** Auto-sweep amplitude (percent from center) and angular speed (rad/s). */
const SWEEP_AMPLITUDE = 34;
const SWEEP_SPEED = 0.9;
/** How long auto mode waits after a manual drag before resuming (ms). */
const AUTO_RESUME_DELAY = 2500;
const KEY_STEP = 5;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (cb: () => void) => {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

export function VirtualStudioSection() {
  const { t } = useLanguage();
  // null = user hasn't chosen yet → default follows the reduced-motion preference
  const [userMode, setUserMode] = useState<RevealMode | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );
  const mode: RevealMode = userMode ?? (prefersReducedMotion ? "manual" : "auto");
  const setMode = setUserMode;
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const isVideoPaused = userPaused ?? prefersReducedMotion;
  const [isSectionVisible, setIsSectionVisible] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  // Animation state lives in refs so the render loop never waits on React re-renders.
  // The canvas reveal edge and the handle are written in the SAME frame → zero drift.
  const posRef = useRef<number>(50);
  const angleRef = useRef<number>(0);
  const modeRef = useRef<RevealMode>("auto");
  const draggingRef = useRef<boolean>(false);
  const resumeAtRef = useRef<number>(0);
  const suspendedRef = useRef<boolean>(false);
  const lastAriaRef = useRef<number>(-1);

  useEffect(() => {
    modeRef.current = mode;
    if (mode === "auto") {
      resumeAtRef.current = 0;
    }
  }, [mode]);

  // Track viewport visibility (pauses render loop + video decode off-screen)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Respect the playback control and pause decoding while off-screen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isSectionVisible && !isVideoPaused) {
      if (v.paused) v.play().catch((error) => {
        if (error?.name === "NotAllowedError") {
          setUserPaused(true);
        }
      });
    } else if (!v.paused) {
      v.pause();
    }
  }, [isSectionVisible, isVideoPaused]);

  // Keep canvas backing store matched to its CSS size (crisp on HiDPI)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /**
   * Draws one composited frame from the stacked source video:
   * top half = green stage, bottom half = 3D virtual set.
   * Both halves come from the same decoded frame, so they are always frame-locked.
   */
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const pos = posRef.current;

    if (handleRef.current) {
      handleRef.current.style.left = `${pos}%`;
    }

    const rounded = Math.round(pos);
    if (containerRef.current && rounded !== lastAriaRef.current) {
      lastAriaRef.current = rounded;
      containerRef.current.setAttribute("aria-valuenow", String(rounded));
    }

    if (!canvas || !video || video.readyState < 2 || !video.videoWidth) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const sw = video.videoWidth;
    const sh = video.videoHeight / 2;

    // object-fit: cover math
    const scale = Math.max(cw / sw, ch / sh);
    const cropW = cw / scale;
    // Inset 1px from the half seam to avoid bilinear bleed between halves
    const cropH = Math.min(ch / scale, sh - 2);
    const sx = (sw - cropW) / 2;
    const sy = clamp((sh - cropH) / 2, 1, sh - cropH - 1);

    // 1. Base layer: 3D virtual set (bottom half of source)
    ctx.drawImage(video, sx, sh + sy, cropW, cropH, 0, 0, cw, ch);

    // 2. Reveal layer: green stage (top half of source), clipped to the slider position
    const splitPx = (pos / 100) * cw;
    if (splitPx > 0.5) {
      ctx.drawImage(video, sx, sy, cropW * (splitPx / cw), cropH, 0, 0, splitPx, ch);
    }
  }, []);

  // Main render loop: auto-sweep + draw, only while visible
  useEffect(() => {
    if (!isSectionVisible) return;
    let rafId = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const autoActive =
        modeRef.current === "auto" && !draggingRef.current && now >= resumeAtRef.current;

      if (autoActive) {
        if (suspendedRef.current) {
          // Resume the sine wave from wherever the user left the handle (no jump)
          angleRef.current = Math.asin(clamp((posRef.current - 50) / SWEEP_AMPLITUDE, -1, 1));
          suspendedRef.current = false;
        }
        angleRef.current += dt * SWEEP_SPEED;
        const target = 50 + Math.sin(angleRef.current) * SWEEP_AMPLITUDE;
        // Critically-damped style easing toward the target for a soft glide
        posRef.current += (target - posRef.current) * Math.min(1, dt * 6);
      }

      drawFrame();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isSectionVisible, drawFrame]);

  // ── Manual interaction (unified pointer events: mouse, touch, pen) ──
  const setPosFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    posRef.current = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }, []);

  const suspendAuto = () => {
    suspendedRef.current = true;
    resumeAtRef.current = performance.now() + AUTO_RESUME_DELAY;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    suspendedRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPosFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setPosFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    suspendAuto();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = posRef.current - KEY_STEP;
    else if (e.key === "ArrowRight") next = posRef.current + KEY_STEP;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    posRef.current = clamp(next, 0, 100);
    suspendAuto();
  };

  return (
    <section
      ref={sectionRef}
      id="virtual-3d"
      aria-labelledby="virtual-heading"
      className="relative w-full py-16 sm:py-20 lg:py-28 overflow-hidden bg-black text-white"
    >
      {/* Subtle ambient stage backlights (calibrated for mobile clarity & OLED luminance) */}
      <div
        className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[550px] h-60 sm:h-[350px] bg-brand-violet/25 sm:bg-brand-violet/15 blur-[60px] sm:blur-[140px] rounded-full pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-1/4 w-64 sm:w-[450px] h-56 sm:h-[320px] bg-brand-mauve/20 sm:bg-brand-mauve/15 blur-[60px] sm:blur-[150px] rounded-full pointer-events-none z-0"
        aria-hidden="true"
      />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* ─── LEFT COLUMN: TYPOGRAPHY & VALUE PROPOSITION ─── */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <FadeUp delay={0.05}>
              <h2
                id="virtual-heading"
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-extrabold tracking-tight leading-[1.15] rtl:leading-[1.35] text-white"
              >
                {t("virtualStudio.title")}{" "}
                <span className="bg-gradient-to-r from-brand-lavender via-brand-mauve to-brand-mauve-soft bg-clip-text text-transparent">
                  {t("virtualStudio.titleGradient")}
                </span>
              </h2>

              <p className="text-base sm:text-lg text-zinc-300/90 leading-relaxed max-w-xl font-normal mt-4">
                {t("virtualStudio.description")}
              </p>
            </FadeUp>

            <FadeUp delay={0.15} className="pt-2">
              <Link
                href="/studio-booking"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl btn-brand text-sm font-bold w-fit"
              >
                <span>{t("virtualStudio.bookVirtual")}</span>
                <ArrowRight size={15} className="rtl:rotate-180 shrink-0" />
              </Link>
            </FadeUp>
          </div>

          {/* ─── RIGHT COLUMN: FRAME-LOCKED COMPARISON SLIDER ─── */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <FadeUp delay={0.1}>
              <div
                dir="ltr"
                ref={containerRef}
                role="slider"
                tabIndex={0}
                aria-label={t("virtualStudio.sliderLabel")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
                style={{ touchAction: "pan-y" }}
                className="relative w-full aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl shadow-brand-violet/30 select-none group cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-brand-mauve/70"
              >
                {/* Single source video (green top / 3D bottom) — decoded once, drawn to canvas */}
                <video
                  ref={videoRef}
                  src={VIRTUAL_HERO_SCENE.stackedVideoSrc}
                  loop
                  muted
                  playsInline
                  preload={isVideoPaused ? "auto" : "metadata"}
                  aria-hidden="true"
                  tabIndex={-1}
                  className="absolute top-0 left-0 size-px opacity-0 pointer-events-none"
                />

                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 size-full pointer-events-none"
                  aria-hidden="true"
                />

                {/* Seam line + handle — positioned by the render loop in the same frame as the canvas */}
                <div
                  ref={handleRef}
                  className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-brand-mauve/90 via-white to-brand-mauve/90 z-20 pointer-events-none shadow-[0_0_12px_rgba(152,123,165,0.9)] will-change-[left]"
                  style={{ left: "50%" }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 size-10 rounded-full bg-zinc-950/90 border border-brand-mauve/80 shadow-xl shadow-brand-violet/60 flex items-center justify-center text-brand-lavender group-hover:scale-110 group-active:scale-95 transition-transform backdrop-blur-md">
                    <MoveHorizontal size={18} />
                  </div>
                </div>
              </div>

              {/* ─── CONTROLS: Auto / Manual and video playback ─── */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-950/80 rounded-xl border border-white/10 mt-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    role="radiogroup"
                    aria-label={t("virtualStudio.modeLabel")}
                    className="flex items-center p-1 rounded-lg bg-white/5 border border-white/10"
                  >
                    <button
                      role="radio"
                      aria-checked={mode === "auto"}
                      onClick={() => setMode("auto")}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                        mode === "auto"
                          ? "bg-brand-violet text-white font-bold shadow-md shadow-brand-violet/40"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Repeat size={12} />
                      <span>{t("virtualStudio.modeAuto")}</span>
                    </button>
                    <button
                      role="radio"
                      aria-checked={mode === "manual"}
                      onClick={() => setMode("manual")}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                        mode === "manual"
                          ? "bg-brand-violet text-white font-bold shadow-md shadow-brand-violet/40"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Hand size={12} />
                      <span>{t("virtualStudio.modeManual")}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUserPaused(!isVideoPaused)}
                    className="min-h-11 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    {isVideoPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
                    <span>{t(isVideoPaused ? "virtualStudio.playVideo" : "virtualStudio.pauseVideo")}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
                  <MoveHorizontal size={13} className="text-brand-mauve shrink-0" />
                  <span>{t("virtualStudio.dragPrompt")}</span>
                </div>
              </div>
            </FadeUp>
          </div>

        </div>
      </Container>
    </section>
  );
}
