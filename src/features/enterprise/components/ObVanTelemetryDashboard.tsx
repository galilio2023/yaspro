"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Radio,
  Wifi,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";

interface CameraFeed {
  id: number;
  label: string;
  source: string;
  image: string;
  status: "ONLINE" | "RECORDING" | "STANDBY";
  resolution: string;
}

const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 1,
    label: "CAM 01: Main Stadium Director 4K",
    source: "Sony HDC-4300 Cinema Chain",
    image: "/images/projects/stadiums-dubai.jpg",
    status: "ONLINE",
    resolution: "3840x2160 @ 60p",
  },
  {
    id: 2,
    label: "CAM 02: High-Speed FPV Drone",
    source: "RED V-Raptor 8K Heavy Lift",
    image: "/images/projects/flag-day.jpg",
    status: "RECORDING",
    resolution: "4096x2160 @ 120p",
  },
  {
    id: 3,
    label: "CAM 03: Soundstage Cyc LED Volume",
    source: "Unreal 5.4 LiveLink Genlock",
    image: "/images/virtual-studio/dubai-composite.jpg",
    status: "ONLINE",
    resolution: "3840x2160 @ 120p",
  },
  {
    id: 4,
    label: "CAM 04: VIP Keynote & Summit Stage",
    source: "ARRI Alexa 35 Broadcast Rig",
    image: "/images/projects/dmx.jpg",
    status: "ONLINE",
    resolution: "3840x2160 @ 60p",
  },
  {
    id: 5,
    label: "CAM 05: Super Slow-Motion EVS Ingest",
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
    <section id="ob-van-telemetry" className="py-20 bg-background border-b border-white/10 relative overflow-hidden">
      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="Broadcast Command & Telemetry Matrix"
          badgeVariant="cyan"
          badgeIcon={<Radio size={13} className="text-brand-cyan" />}
          title="12-Channel Live Tactical Grid &"
          gradientText="Mobile Command Cockpit"
          description="Interactive multi-camera switcher connected directly to Yas Pro's Mercedes Actros broadcast vehicle. Ingesting SMPTE ST 2110 IP fiber feeds across the Gulf."
          className="mb-10 text-center"
        />

        {/* ─── 1. Main Broadcast Monitor & Switcher Deck ─── */}
        <div className="rounded-3xl border border-white/20 bg-slate-950 overflow-hidden shadow-2xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left 8 Cols: Main Program Monitor */}
            <div className="lg:col-span-8 relative aspect-[16/10] bg-black overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
              <Image
                src={activeCam.image}
                alt={activeCam.label}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 750px"
              />

              {/* Top Telemetry Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/50 text-xs font-mono text-red-400">
                  <span className="size-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold">PROGRAM LIVE FEED</span>
                  <span className="text-white/40">|</span>
                  <span className="text-white/90">{activeCam.label}</span>
                </div>

                <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Activity size={13} />
                  <span>12G-SDI 11.88 Gbps</span>
                </div>
              </div>

              {/* Bottom Monitor Overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs font-mono text-white/80 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-brand-gold font-bold">SOURCE:</span>
                  <span>{activeCam.source}</span>
                </div>
                <div className="text-brand-cyan font-bold">{activeCam.resolution}</div>
              </div>
            </div>

            {/* Right 4 Cols: 6-Cam Multiview Switcher Deck */}
            <div className="lg:col-span-4 p-4 bg-slate-900/90 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3 flex items-center justify-between">
                  <span>Multiview Matrix</span>
                  <span className="text-brand-cyan font-bold">SMPTE ST 2110</span>
                </div>

                {/* Camera Feed Thumbnail Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {CAMERA_FEEDS.map((cam) => {
                    const isSelected = activeCam.id === cam.id;
                    return (
                      <button
                        key={cam.id}
                        type="button"
                        onClick={() => setActiveCam(cam)}
                        className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer group ${
                          isSelected
                            ? "border-red-500 ring-2 ring-red-500/40 bg-black"
                            : "border-white/10 bg-black/40 hover:border-white/20"
                        }`}
                      >
                        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-1">
                          <Image
                            src={cam.image}
                            alt={cam.label}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white font-bold">
                            CAM {cam.id}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-white truncate px-1">
                          {cam.label.split(":")[1]?.trim() || cam.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Command Action */}
              <div className="pt-3 border-t border-white/10">
                {onDispatchVan && (
                  <button
                    type="button"
                    onClick={onDispatchVan}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-brand-cyan hover:bg-brand-cyan/80 text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-cyan/20 transition-all"
                  >
                    <span>Request OB-Van Deployment</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. Real-Time Hardware Telemetry Strip ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-5 rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-mono mb-1">
              <Wifi size={12} className="text-emerald-400" />
              <span>SATELLITE MARGIN</span>
            </div>
            <div className="text-lg font-black text-white font-mono">+14.2 dB</div>
            <div className="text-[10px] text-emerald-400 font-mono">Dual Ku/Ka Locked</div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-mono mb-1">
              <Activity size={12} className="text-brand-cyan" />
              <span>5G PRIVATE NETWORK</span>
            </div>
            <div className="text-lg font-black text-white font-mono">22ms Edge</div>
            <div className="text-[10px] text-brand-cyan font-mono">Dedicated Network Slice</div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-mono mb-1">
              <Radio size={12} className="text-brand-purple-light" />
              <span>EVS REPLAY INGEST</span>
            </div>
            <div className="text-lg font-black text-white font-mono">12 Channels</div>
            <div className="text-[10px] text-brand-purple-light font-mono">XT-VIA Zero Latency</div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-1.5 text-text-muted text-[10px] font-mono mb-1">
              <ShieldCheck size={12} className="text-brand-gold" />
              <span>POWER REDUNDANCY</span>
            </div>
            <div className="text-lg font-black text-white font-mono">2x 60 kVA</div>
            <div className="text-[10px] text-brand-gold font-mono">Auto-Failover UPS</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
