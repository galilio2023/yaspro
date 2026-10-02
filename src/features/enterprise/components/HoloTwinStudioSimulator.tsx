"use client";

import React, { useState } from "react";
import { Layers } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { DIGITAL_TWINS } from "../data";
import { DigitalTwinLocation } from "../types";
import { HoloTwinViewport, type LightingPreset } from "./holotwin/HoloTwinViewport";
import { HoloTwinControls } from "./holotwin/HoloTwinControls";
import { HoloTwinRoiCalculator } from "./holotwin/HoloTwinRoiCalculator";

interface HoloTwinSimulatorProps {
  onSelectEnvironmentForRfp?: (environmentName: string) => void;
}

export function HoloTwinStudioSimulator({ onSelectEnvironmentForRfp }: HoloTwinSimulatorProps) {
  const [selectedTwin, setSelectedTwin] = useState<DigitalTwinLocation>(DIGITAL_TWINS[0]);
  const [lighting, setLighting] = useState<LightingPreset>("golden_hour");
  const [focalLength, setFocalLength] = useState<number>(35);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  return (
    <section id="virtual-simulator" className="py-12 sm:py-16 lg:py-28 bg-[#070709] border-b border-white/10 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="HoloTwin™ GCC Sovereign Asset Cloud"
          badgeVariant="gold"
          badgeIcon={<Layers size={13} className="text-amber-400" />}
          title="Remote In-Camera VFX &"
          gradientText="Digital Twin Simulator"
          description="Direct physical actors on Yas Pro's Dubai & Cairo LED volume stages while streaming photorealistic, millimeter-accurate 3D Unreal 5.4 environments of iconic GCC landmarks."
          className="mb-8 sm:mb-10 text-center"
        />

        {/* ─── 1. Environment Tabs: Responsive 2-Col on mobile, 4-Col on desktop ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
          {DIGITAL_TWINS.map((twin) => {
            const isSelected = selectedTwin.id === twin.id;
            return (
              <button
                key={twin.id}
                type="button"
                onClick={() => {
                  setSelectedTwin(twin);
                  setLighting(twin.defaultTimeOfDay);
                }}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/15"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <span className="text-base sm:text-lg">{twin.countryFlag}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-amber-500/20">
                    {twin.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1">
                  {twin.name}
                </div>
                <div className="text-[10px] sm:text-[11px] font-arabic text-text-secondary mt-0.5 line-clamp-1">
                  {twin.arabicName}
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── 2. Main 3D Viewport & Control Deck ─── */}
        <div className="relative rounded-3xl border border-white/10 bg-black overflow-hidden shadow-2xl mb-6">
          <HoloTwinViewport
            selectedTwin={selectedTwin}
            lighting={lighting}
            focalLength={focalLength}
            showWireframe={showWireframe}
          />
          <HoloTwinControls
            lighting={lighting}
            onSelectLighting={setLighting}
            focalLength={focalLength}
            onChangeFocalLength={setFocalLength}
            showWireframe={showWireframe}
            onToggleWireframe={() => setShowWireframe(!showWireframe)}
          />
        </div>

        {/* ─── 3. Modular ROI Calculator ─── */}
        <HoloTwinRoiCalculator
          selectedTwin={selectedTwin}
          onSelectEnvironmentForRfp={onSelectEnvironmentForRfp}
        />
      </Container>
    </section>
  );
}
