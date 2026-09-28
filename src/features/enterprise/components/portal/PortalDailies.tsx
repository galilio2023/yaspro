"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, MessageSquare, CheckCircle, Play, Pause, Send } from "lucide-react";

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

interface FrameAnnotation {
  id: string;
  timecode: string;
  author: string;
  role: string;
  comment: string;
  createdAt: string;
  type: "color" | "audio" | "cut";
}

interface PortalDailiesProps {
  activeClip: DailyClip;
  clips: DailyClip[];
  onSelectClip: (clip: DailyClip) => void;
}

const INITIAL_ANNOTATIONS: Record<string, FrameAnnotation[]> = {
  "clip-01": [
    {
      id: "ann-1",
      timecode: "00:14:22:04",
      author: "Yaman Alomari",
      role: "Lead Colorist",
      comment: "Lift desert shadows by +0.3 EV to preserve dune ripples under harsh sun.",
      createdAt: "10 mins ago",
      type: "color",
    },
    {
      id: "ann-2",
      timecode: "00:14:22:15",
      author: "Farah K.",
      role: "Executive Producer",
      comment: "Approved framing. Perfect alignment with Burj Khalifa silhouette.",
      createdAt: "35 mins ago",
      type: "cut",
    },
  ],
  "clip-02": [
    {
      id: "ann-3",
      timecode: "01:08:43:20",
      author: "Tariq S.",
      role: "Sound Supervisor",
      comment: "Clean prop flutter noise on low-pass filter around 180Hz.",
      createdAt: "1 hour ago",
      type: "audio",
    },
  ],
  "clip-03": [
    {
      id: "ann-4",
      timecode: "02:22:14:02",
      author: "Zaid N.",
      role: "VP Unreal Tech",
      comment: "Unreal 5.4 LiveLink tracking synced with zero dropped frames. LED volume ready.",
      createdAt: "2 hours ago",
      type: "cut",
    },
  ],
};

export function PortalDailies({
  activeClip,
  clips,
  onSelectClip,
}: PortalDailiesProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipStatus, setClipStatus] = useState<Record<string, "APPROVED" | "PENDING_REVIEW">>({
    "clip-01": "APPROVED",
    "clip-02": "APPROVED",
    "clip-03": "PENDING_REVIEW",
  });
  const [annotations, setAnnotations] = useState<Record<string, FrameAnnotation[]>>(INITIAL_ANNOTATIONS);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState<"color" | "audio" | "cut">("color");

  const currentStatus = clipStatus[activeClip.id] || activeClip.status;
  const currentAnnotations = annotations[activeClip.id] || [];

  const handleToggleApproval = () => {
    setClipStatus((prev) => {
      const current = prev[activeClip.id] || activeClip.status;
      return {
        ...prev,
        [activeClip.id]: current === "APPROVED" ? "PENDING_REVIEW" : "APPROVED",
      };
    });
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newEntry: FrameAnnotation = {
      id: `ann-${Date.now()}`,
      timecode: activeClip.timecode,
      author: "Client Reviewer",
      role: "Executive Lead",
      comment: newComment.trim(),
      createdAt: "Just now",
      type: commentType,
    };

    setAnnotations((prev) => ({
      ...prev,
      [activeClip.id]: [newEntry, ...(prev[activeClip.id] || [])],
    }));
    setNewComment("");
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Main Cinema Player */}
        <div className="lg:col-span-8 space-y-4">
          <button
            type="button"
            className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl group cursor-pointer block text-left p-0"
            onClick={() => setIsPlaying((prev) => !prev)}
            data-cursor={isPlaying ? "PAUSE" : "PLAY"}
            aria-label={isPlaying ? "Pause video take" : "Play video take"}
          >
            <Image
              src={activeClip.thumbnail}
              alt={activeClip.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 750px"
            />

            {/* Play/Pause Center Indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] group-hover:bg-black/10 transition-colors">
              <div className="size-16 sm:size-20 rounded-full bg-brand-purple/80 text-white flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
              </div>
            </div>

            {/* Confidential Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="text-xs sm:text-sm font-mono text-white tracking-widest rotate-[-15deg] select-none text-center px-4">
                {activeClip.watermarkCode}
                <br />
                GOVERNMENT &amp; BRAND C2C VAULT • FRAME-ACCURATE REVIEW
              </div>
            </div>

            {/* Top Overlay Badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-emerald-400 border border-emerald-500/40 font-bold">
                  PRORES 4444 RAW
                </span>
                <span className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-brand-cyan border border-brand-cyan/40">
                  SMPTE 24.00 FPS
                </span>
              </div>
              <span className="bg-black/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono text-white/90 border border-white/10 font-bold">
                TC {activeClip.timecode}
              </span>
            </div>

            {/* Bottom Scrubber Timeline Simulation */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-auto">
              <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-2 cursor-pointer">
                <div className="absolute left-0 top-0 bottom-0 w-2/5 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>00:14:22:18</span>
                <span className="text-brand-purple-light font-bold">Frame-Accurate Review Mode</span>
                <span>{activeClip.duration}</span>
              </div>
            </div>
          </button>

          {/* Clip Metadata Bar & One-Click Review Actions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">{activeClip.title}</h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    currentStatus === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {currentStatus.replace("_", " ")}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-text-secondary font-mono truncate">
                {activeClip.camera} • {activeClip.duration} • 8K DCI Master
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleApproval}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentStatus === "APPROVED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-brand-purple text-white hover:bg-brand-purple-light shadow-lg shadow-brand-purple/20"
                }`}
              >
                <CheckCircle size={14} />
                <span>{currentStatus === "APPROVED" ? "Approved Take" : "One-Click Approve"}</span>
              </button>

              <button
                type="button"
                onClick={() => alert(`Download started for master ProRes 4444: ${activeClip.title}`)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download size={14} />
                <span>Master ProRes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dailies Playlist */}
        <div className="lg:col-span-4 space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
            <span>Recent Session Takes</span>
            <span className="text-[10px] text-brand-cyan">{clips.length} Takes Ready</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5">
            {clips.map((clip) => {
              const isSelected = activeClip.id === clip.id;
              const status = clipStatus[clip.id] || clip.status;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => onSelectClip(clip)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 text-left w-full ${
                    isSelected
                      ? "border-brand-purple bg-card ring-2 ring-brand-purple/30 shadow-lg shadow-brand-purple/10"
                      : "border-white/10 bg-slate-900/60 hover:bg-slate-900"
                  }`}
                  data-cursor="SWITCH TAKE"
                  aria-pressed={isSelected}
                  aria-label={`Select take ${clip.title}`}
                >
                  <div className="relative size-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={clip.thumbnail}
                      alt={clip.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    {status === "APPROVED" && (
                      <div className="absolute top-1 right-1 size-3 rounded-full bg-emerald-400 border border-black shadow" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{clip.title}</div>
                    <div className="text-[10px] text-text-muted font-mono mt-0.5">
                      {clip.duration} • {clip.camera.split("/")[0]}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          status === "APPROVED"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : "text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Frame-Accurate Collaborative Annotation & Review Log (Frame.io Style) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-brand-purple/20 text-brand-purple-light flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Frame-Accurate Video Annotations</h4>
              <p className="text-[11px] text-text-secondary">
                Timecode-stamped notes for color grading, sound mastering, and VFX supervisor.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-full border border-brand-cyan/20 self-start sm:self-auto">
            {currentAnnotations.length} Review Notes Active
          </span>
        </div>

        {/* Add Annotation Form */}
        <form onSubmit={handleAddAnnotation} className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-300">Target Timecode:</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {activeClip.timecode}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {(["color", "audio", "cut"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCommentType(type)}
                  className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    commentType === type
                      ? "bg-brand-purple text-white border-brand-purple"
                      : "bg-white/5 text-text-muted border-white/10 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave timecoded directive (e.g. 'Boost cyan fill light on actor left cheek')..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder:text-text-muted text-xs focus:outline-none focus:border-brand-purple"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple-light text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Send size={13} />
              <span>Post Stamp</span>
            </button>
          </div>
        </form>

        {/* Existing Annotations Feed */}
        <div className="space-y-3">
          {currentAnnotations.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex items-start justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                    TC {ann.timecode}
                  </span>
                  <span className="font-bold text-white">{ann.author}</span>
                  <span className="text-[10px] text-text-muted font-mono uppercase">
                    ({ann.role})
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      ann.type === "color"
                        ? "bg-purple-500/20 text-purple-300"
                        : ann.type === "audio"
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {ann.type}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-1">{ann.comment}</p>
              </div>
              <span className="text-[10px] font-mono text-text-muted shrink-0">{ann.createdAt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
