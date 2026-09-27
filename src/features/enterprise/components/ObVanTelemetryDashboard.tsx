"use client";

import React, { useState } from "react";
import { Radio } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ObVanMonitor, type CameraFeed } from "./portal/ObVanMonitor";
import { ObVanSwitcher } from "./portal/ObVanSwitcher";
import { ObVanTelemetryStrip } from "./portal/ObVanTelemetryStrip";

const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 1,
    label: "CAM 01: Sheikh Zayed Grand Mosque 8K Live",
    source: "Sony HDC-4300 4K HDR",
    image: "/images/projects/flag-day.jpg",
    status: "ONLINE",
    resolution: "3840x2160 @ 120p",
  },
  {
    id: 2,
    label: "CAM 02: Dubai Sports Council FPV Drone",
    source: "RED V-Raptor XL 8K VV",
    image: "/images/projects/stadiums-dubai.jpg",
    status: "RECORDING",
    resolution: "8192x4320 @ 60p",
  },
  {
    id: 3,
    label: "CAM 03: Virtual Stage LED Wall Genlock",
    source: "ARRI Alexa 35 Cine",
    image: "/images/projects/dmx.jpg",
    status: "ONLINE",
    resolution: "4096x2160 @ 24p",
  },
  {
    id: 4,
    label: "CAM 04: Diriyah Gate EVS Slow-Motion",
    source: "EVS Super Slow-Mo 4X",
    image: "/images/virtual-studio/cyberpunk-composite.jpg",
    status: "ONLINE",
    resolution: "1920x1080 @ 480p",
  },
  {
    id: 5,
    label: "CAM 05: Ministry Summit Keynote Podium",
    source: "Phantom Flex 4K High Speed",
    image: "/images/projects/kananya.jpg",
    status: "RECORDING",
    resolution: "1920x1080 @ 1000p",
  },
  {
    id: 6,
    label: "CAM 06: Commercial Fashion Runway",
    source: "Sony FX9 Optical Prime Set",
    image: "/images/virtual-studio/fashion-composite.jpg",
    status: "STANDBY",
    resolution: "3840x2160 @ 60p",
  },
];

interface ObVanTelemetryProps {
  onDispatchVan?: () => void;
}

export function ObVanTelemetryDashboard({ onDispatchVan }: ObVanTelemetryProps) {
  const [activeCam, setActiveCam] = useState<CameraFeed>(CAMERA_FEEDS[0]);

  return (
    <section id="ob-van-telemetry" className="py-16 sm:py-20 bg-background border-b border-white/10 relative overflow-hidden">
      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="Broadcast Command & Telemetry Matrix"
          badgeVariant="cyan"
          badgeIcon={<Radio size={13} className="text-brand-cyan" />}
          title="12-Channel Live Tactical Grid &"
          gradientText="Mobile Command Cockpit"
          description="Interactive multi-camera switcher connected directly to Yas Pro's Mercedes Actros broadcast vehicle. Ingesting SMPTE ST 2110 IP fiber feeds across the Gulf."
          className="mb-8 sm:mb-10 text-center"
        />

        {/* ─── 1. Main Broadcast Monitor & Switcher Deck ─── */}
        <div className="rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <ObVanMonitor activeCam={activeCam} />
            <ObVanSwitcher
              feeds={CAMERA_FEEDS}
              activeCam={activeCam}
              onSelectCam={setActiveCam}
              onDispatchVan={onDispatchVan}
            />
          </div>
        </div>

        {/* ─── 2. Real-Time Hardware Telemetry Strip ─── */}
        <ObVanTelemetryStrip />
      </Container>
    </section>
  );
}
