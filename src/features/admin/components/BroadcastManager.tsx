"use client";

import React, { useState } from "react";
import {
  Radio,
  Send,
  CheckCircle2,
  Wifi,
  Satellite,
  ShieldCheck,
  Video,
} from "lucide-react";
import { dispatchTelemetryEvent } from "@/lib/cms-actions";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";

type TelemetryType = "C2C_INGEST" | "OB_VAN_GPS" | "MAWTHOOQ_AUDIT" | "GENLOCK_SYNC" | "RENDER_COMPLETE";
type SeverityLevel = "info" | "success" | "warning";

interface TelemetryEventItem {
  id: string;
  source: string;
  type: TelemetryType;
  level: SeverityLevel;
  summary: string;
  timestamp: string;
}

const INITIAL_DISPATCHED_FEED: TelemetryEventItem[] = [];

const PRESET_EVENTS = [
  {
    title: "OB Van Starlink Uplink Lock",
    source: "OB-VAN MERCEDES 01",
    type: "OB_VAN_GPS" as TelemetryType,
    level: "info" as SeverityLevel,
    summary: "High-power Starlink & O3b Ka-band link locked at 1.2 Gbps uplink from Riyadh Boulevard stage.",
    icon: Satellite,
  },
  {
    title: "SMPTE ST-2110 Genlock Locked",
    source: "DUBAI STAGE A",
    type: "GENLOCK_SYNC" as TelemetryType,
    level: "success" as SeverityLevel,
    summary: "Disguise vx4+ media servers genlocked with ARRI Alexa 35 at 24.000 fps (SMPTE ST 2059-2 PTP).",
    icon: Wifi,
  },
  {
    title: "C2C Proxy Take Ingested",
    source: "CAMERA-TO-CLOUD",
    type: "C2C_INGEST" as TelemetryType,
    level: "info" as SeverityLevel,
    summary: "Take 18 proxy uploaded via Frame.io C2C API. Watermark hash verified: DEMO-WATERMARK-DXB-9912.",
    icon: Video,
  },
  {
    title: "Mawthooq License Audit Passed",
    source: "MAWTHOOQ COMPLIANCE BOT",
    type: "MAWTHOOQ_AUDIT" as TelemetryType,
    level: "success" as SeverityLevel,
    summary: "GAMR License verification passed for Saudi National Day cross-platform syndication.",
    icon: ShieldCheck,
  },
];

export function BroadcastManager() {
  const [source, setSource] = useState("OB-VAN MERCEDES 01");
  const [type, setType] = useState<TelemetryType>("OB_VAN_GPS");
  const [level, setLevel] = useState<SeverityLevel>("info");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedFeed, setDispatchedFeed] = useState<TelemetryEventItem[]>(INITIAL_DISPATCHED_FEED);

  const { feedback, showFeedback } = useFeedbackAlert(3500);

  const handleDispatch = async (eventData: {
    source: string;
    type: TelemetryType;
    level: SeverityLevel;
    summary: string;
  }) => {
    if (isSubmitting) return;
    if (!eventData.summary.trim()) {
      alert("Please provide an event description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatchTelemetryEvent(eventData);
      if (res.success) {
        const dispatchTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setDispatchedFeed((prev) => [
          {
            id: `ev-${prev.length + 1}`,
            ...eventData,
            timestamp: dispatchTime,
          },
          ...prev,
        ]);

        showFeedback("Event dispatched to sovereign edge relays!");
        setSummary("");
      } else {
        alert(res.error || "Failed to dispatch event");
      }
    } catch (err) {
      alert((err as Error).message || "An unexpected error occurred while dispatching event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2.5">
            <Radio size={24} className="text-cyan-400" />
            Broadcast Telemetry &amp; OB Van Master Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch SMPTE ST-2110 IP video sync, satellite uplink statuses, and C2C proxy ingest alerts to client portals.
          </p>
        </div>

        {feedback && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Quick Preset Dispatch Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
          One-Click Fleet Presets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_EVENTS.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  handleDispatch({
                    source: preset.source,
                    type: preset.type,
                    level: preset.level,
                    summary: preset.summary,
                  })
                }
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 hover:bg-slate-900 transition-all text-left group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    Preset
                  </span>
                </div>
                <h4 className="font-semibold text-white text-xs group-hover:text-cyan-400 transition-colors">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {preset.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dispatch Console & Live Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Console */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Send size={15} className="text-cyan-400" />
            Custom Telemetry Dispatcher
          </h3>
          <p className="text-xs text-slate-400">
            Publish an edge event instantly visible across all enterprise client portals.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDispatch({ source, type, level, summary });
            }}
            className="space-y-3.5 text-xs"
          >
            <div>
              <label className="block text-slate-300 font-medium mb-1">Broadcasting Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="OB-VAN MERCEDES 01">OB-VAN MERCEDES 01 (Riyadh)</option>
                <option value="OB-VAN MERCEDES 02">OB-VAN MERCEDES 02 (Dubai)</option>
                <option value="DUBAI STAGE A">DUBAI STAGE A (Studio City)</option>
                <option value="CAIRO STAGE B">CAIRO STAGE B (Media City)</option>
                <option value="CAMERA-TO-CLOUD">CAMERA-TO-CLOUD (Frame.io Gateway)</option>
                <option value="MAWTHOOQ COMPLIANCE BOT">MAWTHOOQ COMPLIANCE BOT (GAMR)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Protocol / Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TelemetryType)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                >
                  <option value="OB_VAN_GPS">OB_VAN_GPS</option>
                  <option value="GENLOCK_SYNC">GENLOCK_SYNC</option>
                  <option value="C2C_INGEST">C2C_INGEST</option>
                  <option value="MAWTHOOQ_AUDIT">MAWTHOOQ_AUDIT</option>
                  <option value="RENDER_COMPLETE">RENDER_COMPLETE</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Alert Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as SeverityLevel)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-cyan-500 text-[11px]"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Telemetry Summary &amp; Status</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Ka-band satellite lock verified with latency < 45ms..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              <span>{isSubmitting ? "Broadcasting..." : "Dispatch to Relay Edge"}</span>
            </button>
          </form>
        </div>

        {/* Live Relayed Feed Monitor */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-emerald-400" />
              <h3 className="font-bold text-white text-sm">
                Sovereign Relay Event Log
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SMPTE ST-2110 PTP Active
            </span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {dispatchedFeed.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {ev.source}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        ev.level === "success"
                          ? "text-emerald-400"
                          : ev.level === "warning"
                          ? "text-amber-400"
                          : "text-cyan-400"
                      }`}
                    >
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {ev.summary}
                  </p>
                </div>

                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {ev.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
