"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Video, FileText, Calendar } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PortalDailies, type DailyClip } from "@/features/enterprise/components/portal/PortalDailies";
import { PortalTenders, PortalStages } from "@/features/enterprise/components/portal/PortalTendersAndStages";

const SAMPLE_DAILIES: DailyClip[] = [
  {
    id: "clip-01",
    title: "Take 04 - UAE Flag Day Cinema Golden Hour Aerial",
    thumbnail: "/images/projects/flag-day.jpg",
    duration: "02:45",
    timecode: "00:14:22:18",
    camera: "RED V-Raptor XL 8K / Master Prime 35mm",
    status: "APPROVED",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
  {
    id: "clip-02",
    title: "Take 07 - Dubai Sports Council Stadium FPV Sprint",
    thumbnail: "/images/projects/stadiums-dubai.jpg",
    duration: "01:18",
    timecode: "01:08:44:02",
    camera: "High-Speed FPV / Sony FX6 Rig",
    status: "APPROVED",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
  {
    id: "clip-03",
    title: "Take 12 - Virtual Production LED Cyc Diriyah Gate Sequence",
    thumbnail: "/images/projects/dmx.jpg",
    duration: "03:10",
    timecode: "02:22:15:10",
    camera: "ARRI Alexa 35 / Unreal 5.4 LiveLink",
    status: "PENDING_REVIEW",
    watermarkCode: "DEMO-WATERMARK-DXB-9912",
  },
];

export default function EnterprisePortalPage() {
  const [activeClip, setActiveClip] = useState<DailyClip>(SAMPLE_DAILIES[0]);
  const [activeTab, setActiveTab] = useState<"dailies" | "rfps" | "stages">("dailies");

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-24 sm:pt-28 pb-16 sm:pb-20 selection:bg-brand-purple">
      {/* Background accents */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        {/* Demo Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="size-9 sm:size-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex flex-wrap items-center gap-2">
                <span>PORTAL DEMONSTRATION MODE</span>
                <span className="text-[9px] sm:text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  SIMULATED ACCESS
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-text-secondary">
                Production vaults operate air-gapped per sovereign protocol.
              </div>
            </div>
          </div>

          <Link
            href="/enterprise"
            className="text-xs font-mono text-brand-purple-light hover:text-white flex items-center gap-1 transition-colors self-end sm:self-auto"
          >
            <span>&larr; Back to Enterprise</span>
          </Link>
        </div>

        {/* Executive Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
            Client Executive Operations &amp; C2C Vault
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
            Review live multi-camera dailies, track active tender deliverables, and manage guaranteed SLA studio days in real time.
          </p>
        </div>

        {/* Navigation Tabs: Horizontal Scrollable on Mobile */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 sm:mb-8 overflow-x-auto scrollbar-none px-1">
          <button
            type="button"
            onClick={() => setActiveTab("dailies")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "dailies"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <Video size={14} />
            <span>Camera-to-Cloud Dailies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rfps")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "rfps"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <FileText size={14} />
            <span>Active Tenders &amp; RFPs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stages")}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "stages"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30 font-bold"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <Calendar size={14} />
            <span>Soundstage Reservations</span>
          </button>
        </div>

        {/* TAB 1: Dailies Reviewer */}
        {activeTab === "dailies" && (
          <PortalDailies
            activeClip={activeClip}
            clips={SAMPLE_DAILIES}
            onSelectClip={setActiveClip}
          />
        )}

        {/* TAB 2: Active Tenders */}
        {activeTab === "rfps" && <PortalTenders />}

        {/* TAB 3: Soundstage Allocations */}
        {activeTab === "stages" && <PortalStages />}
      </Container>
    </main>
  );
}
