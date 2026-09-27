"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Download,
  Calendar,
  FileText,
  Video,
} from "lucide-react";
import { Container } from "@/components/ui/container";

interface DailyClip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  timecode: string;
  camera: string;
  status: "APPROVED" | "PENDING_REVIEW";
  watermarkCode: string;
}

const SAMPLE_DAILIES: DailyClip[] = [
  {
    id: "clip-01",
    title: "Take 04 - UAE Flag Day Cinema Golden Hour Aerial",
    thumbnail: "/images/projects/flag-day.jpg",
    duration: "02:45",
    timecode: "00:14:22:18",
    camera: "RED V-Raptor XL 8K / Master Prime 35mm",
    status: "APPROVED",
    watermarkCode: "GOV-CONFIDENTIAL-WATERMARK-DXB-9912",
  },
  {
    id: "clip-02",
    title: "Take 07 - Dubai Sports Council Stadium FPV Sprint",
    thumbnail: "/images/projects/stadiums-dubai.jpg",
    duration: "01:18",
    timecode: "01:08:44:02",
    camera: "High-Speed FPV / Sony FX6 Rig",
    status: "APPROVED",
    watermarkCode: "GOV-CONFIDENTIAL-WATERMARK-DXB-9912",
  },
  {
    id: "clip-03",
    title: "Take 12 - Virtual Production LED Cyc Diriyah Gate Sequence",
    thumbnail: "/images/projects/dmx.jpg",
    duration: "03:10",
    timecode: "02:22:15:10",
    camera: "ARRI Alexa 35 / Unreal 5.4 LiveLink",
    status: "PENDING_REVIEW",
    watermarkCode: "GOV-CONFIDENTIAL-WATERMARK-DXB-9912",
  },
];

export default function EnterprisePortalPage() {
  const [activeClip, setActiveClip] = useState<DailyClip>(SAMPLE_DAILIES[0]);
  const [activeTab, setActiveTab] = useState<"dailies" | "rfps" | "stages">("dailies");

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-28 pb-20 selection:bg-brand-purple">
      {/* Background accents */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        {/* Top Sovereign Clearance Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>SOVEREIGN AIR-GAPPED MEDIA VAULT</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ENCRYPTED AES-256
                </span>
              </div>
              <div className="text-[11px] text-text-secondary">
                Saudi PDPL &amp; UAE Federal Data Law Certified • Regional Cloud Residency (Riyadh &amp; Dubai)
              </div>
            </div>
          </div>

          <Link
            href="/enterprise"
            className="text-xs font-mono text-brand-purple-light hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>&larr; Back to Enterprise Overview</span>
          </Link>
        </div>

        {/* Executive Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight mb-2">
            Client Executive Operations &amp; C2C Vault
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-2xl">
            Review live multi-camera dailies, track active tender deliverables, and manage guaranteed SLA studio days in real time.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-8">
          <button
            onClick={() => setActiveTab("dailies")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "dailies"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <Video size={14} />
            <span>Camera-to-Cloud Dailies</span>
          </button>

          <button
            onClick={() => setActiveTab("rfps")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "rfps"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <FileText size={14} />
            <span>Active Tenders &amp; RFPs</span>
          </button>

          <button
            onClick={() => setActiveTab("stages")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "stages"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                : "text-text-secondary hover:text-white bg-white/5"
            }`}
          >
            <Calendar size={14} />
            <span>Soundstage Reservations</span>
          </button>
        </div>

        {/* TAB 1: Dailies Reviewer */}
        {activeTab === "dailies" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Main Cinema Player */}
            <div className="lg:col-span-8 space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl">
                <Image
                  src={activeClip.thumbnail}
                  alt={activeClip.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 750px"
                />

                {/* Confidential Watermark Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                  <div className="text-sm font-mono text-white tracking-widest rotate-[-15deg] select-none text-center">
                    {activeClip.watermarkCode}
                    <br />
                    AUTHORIZED MINISTERIAL ACCESS ONLY
                  </div>
                </div>

                {/* Top Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 border border-emerald-500/40 font-bold">
                    PRORES 4444 RAW 10-BIT
                  </span>
                  <span className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-white/90 border border-white/10 font-bold">
                    TC {activeClip.timecode}
                  </span>
                </div>
              </div>

              {/* Clip Metadata Bar */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">{activeClip.title}</h3>
                  <div className="text-xs text-text-secondary font-mono mt-0.5">
                    {activeClip.camera} • Duration: {activeClip.duration}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Initiating secure download of ${activeClip.title} (ProRes Master 14.8 GB)`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download Master</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dailies Playlist */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                Recent Session Takes
              </div>

              {SAMPLE_DAILIES.map((clip) => {
                const isSelected = activeClip.id === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={() => setActiveClip(clip)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "border-brand-purple bg-card ring-2 ring-brand-purple/30"
                        : "border-white/10 bg-slate-900/60 hover:bg-slate-900"
                    }`}
                  >
                    <div className="relative size-16 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={clip.thumbnail}
                        alt={clip.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{clip.title}</div>
                      <div className="text-[11px] text-text-muted font-mono mt-0.5">
                        {clip.duration} • {clip.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Active Tenders */}
        {activeTab === "rfps" && (
          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-cyan">EXP-9182-DXB</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    SLA ACTIVE
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  Dubai Municipality Professional Academy (DMX) Master Launch Film
                </h4>
                <div className="text-xs text-text-secondary mt-0.5">
                  Senior Producer: Yaman Alomari • Deliverable: 4K Master + 3D CGI Tour
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-text-muted">Target Delivery</div>
                <div className="text-sm font-bold text-white">Next 14 Business Days</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-brand-gold">EXP-7419-KSA</span>
                  <span className="text-[10px] font-mono text-brand-gold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    UNDER REVIEW
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  Saudi Pro League Multi-Cam OB-VAN Broadcast Deployment
                </h4>
                <div className="text-xs text-text-secondary mt-0.5">
                  Mobile Unit 01 Dispatch • EVS Live Replay &amp; AI Viral Syndication
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono text-text-muted">Status</div>
                <div className="text-sm font-bold text-brand-gold">Board Review Stage</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Soundstage Allocations */}
        {activeTab === "stages" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60">
              <div className="text-xs font-mono text-brand-purple-light uppercase mb-1">DUBAI MAIN STAGE A</div>
              <div className="text-lg font-bold text-white mb-2">850 m² Acoustic Volume</div>
              <div className="text-xs text-text-secondary mb-4">
                Infinite 180° Cyclorama • Motorized DMX Grid • ARRI SkyPanel RGBWW
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">● Reserved: 4 Days Remaining This Month</div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60">
              <div className="text-xs font-mono text-brand-cyan uppercase mb-1">DUBAI PODCAST SUITE</div>
              <div className="text-lg font-bold text-white mb-2">4-Host Broadcast Lounge</div>
              <div className="text-xs text-text-secondary mb-4">
                Shure SM7B Broadcast Mics • 4K AI Auto-Switching • Neon Backdrops
              </div>
              <div className="text-xs font-mono text-brand-cyan font-bold">● Reserved: 12 Hours Allocated</div>
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/60">
              <div className="text-xs font-mono text-brand-gold uppercase mb-1">OB-VAN COMMAND UNIT</div>
              <div className="text-lg font-bold text-white mb-2">Mercedes Actros Fleet</div>
              <div className="text-xs text-text-secondary mb-4">
                12x Sony HDC-4300 • Dual EVS XT-VIA • Encrypted Ka/Ku Uplink
              </div>
              <div className="text-xs font-mono text-brand-gold font-bold">● Standby Status: UAE &amp; KSA Ready</div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
