"use client";

import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";

export interface DailyClip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  timecode: string;
  camera: string;
  status: "APPROVED" | "PENDING_REVIEW";
  watermarkCode: string;
}

interface PortalDailiesProps {
  activeClip: DailyClip;
  clips: DailyClip[];
  onSelectClip: (clip: DailyClip) => void;
}

export function PortalDailies({
  activeClip,
  clips,
  onSelectClip,
}: PortalDailiesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8">
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
            <div className="text-xs sm:text-sm font-mono text-white tracking-widest rotate-[-15deg] select-none text-center px-4">
              {activeClip.watermarkCode}
              <br />
              DEMO CONTENT — SAMPLE WATERMARK
            </div>
          </div>

          {/* Top Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
            <span className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-emerald-400 border border-emerald-500/40 font-bold">
              PRORES 4444 RAW
            </span>
            <span className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-white/90 border border-white/10 font-bold">
              TC {activeClip.timecode}
            </span>
          </div>
        </div>

        {/* Clip Metadata Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{activeClip.title}</h3>
            <div className="text-[11px] sm:text-xs text-text-secondary font-mono mt-0.5 truncate">
              {activeClip.camera} • {activeClip.duration}
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(`Demo download for ${activeClip.title}. No file will be downloaded.`)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Download size={13} />
            <span>Download Master</span>
          </button>
        </div>
      </div>

      {/* Dailies Playlist */}
      <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
          Recent Session Takes
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-2.5">
          {clips.map((clip) => {
            const isSelected = activeClip.id === clip.id;
            return (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? "border-brand-purple bg-card ring-2 ring-brand-purple/30"
                    : "border-white/10 bg-slate-900/60 hover:bg-slate-900"
                }`}
              >
                <div className="relative size-14 sm:size-16 rounded-xl overflow-hidden shrink-0">
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
                  <div className="text-[10px] sm:text-[11px] text-text-muted font-mono mt-0.5">
                    {clip.duration} • {clip.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
