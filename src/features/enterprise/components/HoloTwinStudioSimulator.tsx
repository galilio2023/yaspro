"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sun,
  Moon,
  Camera,
  Layers,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Crosshair,
  Sliders,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { DIGITAL_TWINS } from "../data";
import { DigitalTwinLocation } from "../types";

type LightingPreset = "golden_hour" | "high_noon" | "cyber_night" | "blue_hour";

interface HoloTwinSimulatorProps {
  onSelectEnvironmentForRfp?: (environmentName: string) => void;
}

export function HoloTwinStudioSimulator({ onSelectEnvironmentForRfp }: HoloTwinSimulatorProps) {
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwinLocation>(DIGITAL_TWINS[0]);
  const [lighting, setLighting] = useState<LightingPreset>("golden_hour");
  const [focalLength, setFocalLength] = useState<number>(35);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Lighting overlay styling based on active preset
  const getLightingStyle = () => {
    switch (lighting) {
      case "golden_hour":
        return "bg-gradient-to-t from-amber-600/30 via-orange-500/10 to-transparent mix-blend-color-dodge";
      case "high_noon":
        return "bg-gradient-to-b from-white/20 via-sky-300/10 to-transparent mix-blend-screen";
      case "cyber_night":
        return "bg-gradient-to-tr from-purple-900/40 via-cyan-900/20 to-transparent mix-blend-color-dodge";
      case "blue_hour":
        return "bg-gradient-to-t from-blue-900/40 via-indigo-950/20 to-transparent mix-blend-multiply";
    }
  };

  const getLightingKelvin = () => {
    switch (lighting) {
      case "golden_hour":
        return "3,200K Warm Tungsten";
      case "high_noon":
        return "5,600K High-CRI Daylight";
      case "cyber_night":
        return "7,800K Cyber Specular";
      case "blue_hour":
        return "4,100K Ambient Twilight";
    }
  };

  // Traditional cost comparison logic
  const traditionalLocationCost = 145000;
  const virtualStageCost = Math.round(traditionalLocationCost * (1 - selectedTwin.permitSavingsPercentage / 100));
  const estimatedSavings = traditionalLocationCost - virtualStageCost;

  return (
    <section id="virtual-simulator" className="py-20 bg-slate-950 border-b border-white/10 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="HoloTwin™ GCC Sovereign Asset Cloud"
          badgeVariant="purple"
          badgeIcon={<Layers size={13} className="text-brand-purple-light" />}
          title="Remote In-Camera VFX &"
          gradientText="Digital Twin Simulator"
          description="Direct physical actors on Yas Pro's Dubai & Cairo LED volume stages while streaming photorealistic, millimeter-accurate 3D Unreal 5.4 environments of iconic GCC landmarks."
          className="mb-10 text-center"
        />

        {/* ─── 1. Environment Tabs ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {DIGITAL_TWINS.map((twin) => {
            const isSelected = selectedTwin.id === twin.id;
            return (
              <button
                key={twin.id}
                onClick={() => {
                  setSelectedTwin(twin);
                  setLighting(twin.defaultTimeOfDay);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "border-brand-purple bg-card ring-2 ring-brand-purple/30 shadow-lg shadow-brand-purple/15"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{twin.countryFlag}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-md border border-brand-cyan/20">
                    {twin.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-purple-lighter transition-colors line-clamp-1">
                  {twin.name}
                </div>
                <div className="text-[11px] font-arabic text-text-secondary mt-0.5 line-clamp-1">{twin.arabicName}</div>
              </button>
            );
          })}
        </div>

        {/* ─── 2. Main 3D Viewport Simulation Stage ─── */}
        <div className="relative rounded-3xl border border-white/20 bg-black overflow-hidden shadow-2xl mb-6">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
            {/* Base Photorealistic 3D Environment Image */}
            <Image
              src={selectedTwin.image}
              alt={selectedTwin.name}
              fill
              className={`object-cover transition-transform duration-700 ${
                showWireframe ? "opacity-40 grayscale contrast-200" : "opacity-100"
              }`}
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />

            {/* Dynamic Real-Time Lighting Shader Layer */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${getLightingStyle()}`} />

            {/* Optional Nanite Wireframe Grid Overlay */}
            {showWireframe && (
              <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            )}

            {/* Top Left Viewport HUD */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-brand-purple/40 text-xs font-mono text-brand-purple-light">
                <span className="size-2 rounded-full bg-brand-purple-light animate-pulse" />
                <span className="font-bold">UNREAL ENGINE 5.4.4</span>
                <span className="text-white/40">|</span>
                <span className="text-white/90">{selectedTwin.featuredPill}</span>
              </div>
              <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-text-secondary w-fit">
                Polycount: {selectedTwin.polyCount}
              </div>
            </div>

            {/* Top Right Live Telemetry */}
            <div className="absolute top-4 right-4 flex items-center gap-2 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>GENLOCK 120 FPS</span>
                <span className="text-white/40">|</span>
                <span className="text-white/90">LATENCY 1.8ms</span>
              </div>
            </div>

            {/* Bottom Left Crosshair & Optics */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
              <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-mono text-white/80 flex items-center gap-2">
                <Crosshair size={13} className="text-brand-gold" />
                <span>ARRI Alexa 35 Optics</span>
                <span className="text-brand-cyan font-bold">{focalLength}mm Anamorphic</span>
              </div>
            </div>

            {/* Bottom Right Lighting Kelvin Display */}
            <div className="absolute bottom-4 right-4 pointer-events-none">
              <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-white/90 flex items-center gap-2">
                {lighting === "golden_hour" || lighting === "high_noon" ? (
                  <Sun size={14} className="text-amber-400" />
                ) : (
                  <Moon size={14} className="text-brand-cyan" />
                )}
                <span>{getLightingKelvin()}</span>
              </div>
            </div>
          </div>

          {/* ─── 3. Viewport Control Deck ─── */}
          <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            {/* Lighting Temperature Switchers */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider hidden sm:inline">
                Lighting:
              </span>
              <button
                onClick={() => setLighting("golden_hour")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lighting === "golden_hour"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                    : "bg-white/5 text-text-secondary hover:text-white"
                }`}
              >
                <Sun size={13} />
                <span>Golden Hour</span>
              </button>
              <button
                onClick={() => setLighting("high_noon")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lighting === "high_noon"
                    ? "bg-white text-black shadow-md"
                    : "bg-white/5 text-text-secondary hover:text-white"
                }`}
              >
                <Sun size={13} />
                <span>Noon 5600K</span>
              </button>
              <button
                onClick={() => setLighting("cyber_night")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lighting === "cyber_night"
                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/40"
                    : "bg-white/5 text-text-secondary hover:text-white"
                }`}
              >
                <Moon size={13} />
                <span>Cyber Night</span>
              </button>
              <button
                onClick={() => setLighting("blue_hour")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  lighting === "blue_hour"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white/5 text-text-secondary hover:text-white"
                }`}
              >
                <Moon size={13} />
                <span>Blue Hour</span>
              </button>
            </div>

            {/* Focal Length Slider & Wireframe Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-text-secondary" />
                <span className="text-xs font-mono text-text-secondary">{focalLength}mm</span>
                <input
                  type="range"
                  min="18"
                  max="85"
                  step="5"
                  value={focalLength}
                  onChange={(e) => setFocalLength(Number(e.target.value))}
                  className="w-20 accent-brand-cyan cursor-pointer"
                  title="Virtual Focal Length"
                  aria-label="Virtual camera focal length in millimeters"
                />

              </div>

              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  showWireframe
                    ? "bg-brand-cyan text-black font-bold"
                    : "bg-white/5 text-text-secondary hover:text-white border border-white/10"
                }`}
              >
                <Sliders size={12} />
                <span>Nanite Wireframe</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 4. Enterprise ROI & Permit Savings Calculator Card ─── */}
        <div className="p-6 rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 mb-1">
              <TrendingDown size={14} />
              <span>SOVEREIGN PRODUCTION COST OPTIMIZATION</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
              Virtual Production vs. Physical Location Permits ({selectedTwin.region})
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              By using our calibrated Unreal 5.4 photogrammetry volume in Dubai or Cairo, your production avoids flight logistics, drone airspace approvals, crew visas, and unpredictable weather delays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-black/60 p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div className="text-[11px] text-text-secondary font-mono">Traditional Permit & Shoot</div>
              <div className="text-sm font-bold text-red-400 line-through">
                ${traditionalLocationCost.toLocaleString()} USD
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div>
              <div className="text-[11px] text-emerald-400 font-mono font-bold">Yas Pro Virtual Stage</div>
              <div className="text-lg font-black text-white font-mono">
                ${virtualStageCost.toLocaleString()} USD
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="text-right">
              <div className="text-[11px] text-brand-gold font-mono font-bold">Client Net Savings</div>
              <div className="text-lg font-black text-brand-gold font-mono">
                +${estimatedSavings.toLocaleString()} ({selectedTwin.permitSavingsPercentage}%)
              </div>
            </div>

            {onSelectEnvironmentForRfp && (
              <button
                onClick={() => onSelectEnvironmentForRfp(selectedTwin.name)}
                className="btn-brand py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-brand-purple/25 transition-all"
              >
                <span>Reserve Stage</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
