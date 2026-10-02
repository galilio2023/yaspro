"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  Sliders,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

interface ComparisonPreset {
  id: string;
  titleEn: string;
  titleAr: string;
  camera: string;
  coloristSuite: string;
  imageSrc: string;
  descriptionEn: string;
  descriptionAr: string;
  beforeLabelEn: string;
  beforeLabelAr: string;
  afterLabelEn: string;
  afterLabelAr: string;
}

const PRESETS: ComparisonPreset[] = [
  {
    id: "stadiums-dubai",
    titleEn: "Dubai National Stadiums Commercial",
    titleAr: "إعلان استادات دبي الوطنية",
    camera: "ARRI Alexa Mini LF · LogC3",
    coloristSuite: "DaVinci Resolve Studio 19 · AcesCC",
    imageSrc: "/images/projects/stadiums-dubai.jpg",
    descriptionEn: "Interactive simulation comparing a flat Log look against an HDR10 master grade with custom film print emulation.",
    descriptionAr: "محاكاة تفاعلية تقارن المظهر المسطح المنبسط (Log) مع ماستر سينمائي معتمد ومعاير للألوان.",
    beforeLabelEn: "SIMULATED FLAT LOG LOOK (ARRI LogC3)",
    beforeLabelAr: "محاكاة المظهر المسطح (ARRI LogC3)",
    afterLabelEn: "DAVINCI RESOLVE MASTER GRADE",
    afterLabelAr: "ماستر تصحيح الألوان النهائي",
  },
  {
    id: "flag-day",
    titleEn: "UAE Flag Day Cinematic Campaign",
    titleAr: "حملة يوم العلم الإماراتي السينمائية",
    camera: "RED V-Raptor XL 8K · REDCODE RAW",
    coloristSuite: "FilmLight Baselight & DaVinci Resolve",
    imageSrc: "/images/projects/flag-day.jpg",
    descriptionEn: "Interactive simulation demonstrating a simulated flat profile against the final broadcast grade with balanced skin tones and desert skies.",
    descriptionAr: "محاكاة تفاعلية توضح المظهر المسطح مقابل معالجة البث الإعلاني المعتمدة مع درجات بشرة دقيقة وتدرجات سماء الصحراء.",
    beforeLabelEn: "SIMULATED FLAT LOOK (RED IPP2)",
    beforeLabelAr: "محاكاة المظهر المسطح (RED IPP2)",
    afterLabelEn: "BROADCAST COMMERCIAL GRADE",
    afterLabelAr: "معالجة البث الإعلاني المعتمدة",
  },
  {
    id: "virtual-xr",
    titleEn: "Studio XR Unreal Engine Live Composite",
    titleAr: "استوديو XR والدمج المباشر مع Unreal Engine",
    camera: "Sony FX9 CineAlta · S-Log3 / S-Gamut3.Cine",
    coloristSuite: "Real-Time Mo-Sys Color Matcher & Resolve",
    imageSrc: "/images/projects/dmx.jpg",
    descriptionEn: "Interactive simulation comparing a flat studio capture against the final photoreal XR composite with live color matching.",
    descriptionAr: "محاكاة تفاعلية بين تسجيل الاستوديو بمظهر مسطح والدمج الواقعي النهائي في بيئة الإنتاج الافتراضي.",
    beforeLabelEn: "SIMULATED FLAT CAPTURE (Sony S-Log3)",
    beforeLabelAr: "محاكاة التسجيل المسطح (Sony S-Log3)",
    afterLabelEn: "FINAL PHOTOREAL XR COMPOSITE",
    afterLabelAr: "الدمج النهائي الواقعي للإنتاج الافتراضي",
  },
];

export function CinematicColorGradeShowcase() {
  const { isArabic } = useLanguage();
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [showMotionVideo, setShowMotionVideo] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const preset = PRESETS[activePresetIndex];

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointerMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handlePointerMove(e.touches[0].clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPos((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPos((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <div className="my-16 sm:my-20 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0a0a0f] to-black p-6 sm:p-10 relative overflow-hidden shadow-2xl">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider mb-3">
            <Sliders size={13} />
            <span>{isArabic ? "مقارنة حية لتصحيح الألوان والماسترينغ" : "Live Color Grading Comparison"}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
            {isArabic ? "من خام الكاميرا إلى الماستر السينمائي" : "From Raw Sensor to Master Grade"}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
            {isArabic
              ? "اسحب شريط المقارنة التفاعلي لمشاهدة الفارق بين تسجيل الكاميرات الخام (Flat LOG) والنتيجة النهائية بعد تدرج الألوان في DaVinci Resolve."
              : "Drag the interactive slider to inspect the dynamic range transformation from flat camera LOG to polished DaVinci Resolve color grading."}
          </p>
        </div>

        {/* Mode & Preset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMotionVideo(!showMotionVideo)}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2",
              showMotionVideo
                ? "bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/30"
                : "bg-white/10 border-white/20 text-white hover:bg-white/15"
            )}
          >
            <span>🎬</span>
            <span>{isArabic ? "مشاهدة فيديو التقسيم المتحرك" : "Watch Motion Split Reel"}</span>
          </button>

          {!showMotionVideo && PRESETS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePresetIndex(idx);
                setSliderPos(50);
              }}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                activePresetIndex === idx
                  ? "bg-amber-500 border-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                  : "bg-white/5 border-white/10 text-text-secondary hover:text-white hover:border-white/20"
              )}
            >
              <Film size={13} />
              <span>{isArabic ? p.titleAr : p.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {showMotionVideo ? (
        /* Real Motion Split Video Player from WordPress */
        <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none border border-white/15 shadow-2xl bg-black">
          <video
            src="/videos/grading/color-grading-split.mp4"
            autoPlay
            loop
            muted
            playsInline
            controls
            className="size-full object-cover"
          />
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
              {isArabic ? "فيديو تقسيم ألوان الإنتاج الفعلي" : "Authentic Studio Grade Motion Reel"}
            </span>
          </div>
        </div>
      ) : (
        /* Interactive Split Slider Container */
        <div
          ref={containerRef}
          role="slider"
          aria-label={isArabic ? "مقارنة تدرج الألوان" : "Color grading comparison slider"}
          aria-valuenow={Math.round(sliderPos)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => isDragging && handlePointerMove(e.clientX)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => {
          if (isDragging && e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX);
          }
        }}
        onTouchEnd={handlePointerUp}
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none touch-none cursor-ew-resize border border-white/15 shadow-2xl group bg-black @container"
      >
        {/* AFTER IMAGE (Underneath, Full Grade) */}
        <div className="absolute inset-0">
          <Image
            src={preset.imageSrc}
            alt={preset.titleEn}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
            style={{
              filter: "saturate(1.15) contrast(1.1) brightness(1.02)",
            }}
          />
        </div>

        {/* BEFORE IMAGE (Clipped Overlay with Simulated Flat LOG Filter Emulation) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <div
            className="relative h-full w-[100cqw] max-w-none"
            style={{ width: "100cqw" }}
          >
            <Image
              src={preset.imageSrc}
              alt={`${preset.titleEn} - Simulated Flat Look`}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              style={{
                // Authentic flat LOG profile emulation: desaturated, lifted shadows, low contrast
                filter: "saturate(0.3) contrast(0.68) brightness(1.18)",
              }}
            />
          </div>
        </div>

        {/* Vertical Divider Line with Cinema Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none shadow-[0_0_12px_rgba(251,191,36,0.8)]"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Draggable Badge / Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-10 sm:size-12 rounded-full bg-black/90 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-xl shadow-black/80 backdrop-blur-md">
            <div className="flex items-center gap-0.5">
              <ChevronLeft size={16} />
              <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* Badges Overlays */}
        {/* Left Badge: RAW LOG */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-zinc-400 animate-pulse" />
            <span className="font-semibold">{isArabic ? preset.beforeLabelAr : preset.beforeLabelEn}</span>
          </div>
        </div>

        {/* Right Badge: MASTER GRADE */}
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/90 backdrop-blur-md border border-amber-300 text-black text-[11px] font-mono flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
            <Sparkles size={12} className="fill-black" />
            <span className="font-bold">{isArabic ? preset.afterLabelAr : preset.afterLabelEn}</span>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none text-[11px] font-mono text-white/90">
          <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/10 hidden sm:inline">
            📹 {preset.camera}
          </span>
          <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm border border-white/10">
            🎨 {preset.coloristSuite}
          </span>
        </div>
      </div>
      )}

      {/* Preset Details Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-text-secondary">
        <p className="leading-relaxed max-w-2xl">
          {isArabic ? preset.descriptionAr : preset.descriptionEn}
        </p>

        {/* Quick Position Snap Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-text-muted">
            {isArabic ? "محاذاة سريعة:" : "Snap:"}
          </span>
          <button
            type="button"
            onClick={() => setSliderPos(0)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer",
              sliderPos === 0
                ? "bg-amber-400 text-black border-amber-400 font-bold"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            100% Grade
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(50)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer",
              sliderPos === 50
                ? "bg-amber-400 text-black border-amber-400 font-bold"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            50/50 Split
          </button>
          <button
            type="button"
            onClick={() => setSliderPos(100)}
            className={cn(
              "px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer",
              sliderPos === 100
                ? "bg-amber-400 text-black border-amber-400 font-bold"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
          >
            100% Flat Log
          </button>
        </div>
      </div>
    </div>
  );
}
