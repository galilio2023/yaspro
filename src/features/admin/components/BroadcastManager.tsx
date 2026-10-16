"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Send,
  Wifi,
  Satellite,
  ShieldCheck,
  Video,
  Activity,
  Layers,
} from "lucide-react";
import { dispatchTelemetryEvent } from "@/lib/actions/broadcast-telemetry-dispatcher";
import { useFeedbackAlert } from "@/hooks/useFeedbackAlert";
import { AdminPageHeader, AdminStatsGrid } from "@/components/admin";

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

import type { Inquiry } from "@/db/schema";
import Link from "next/link";
import { resolveInquiryCategory } from "./InquiriesManager";
import { ExternalLink, ArrowRight } from "lucide-react";

export interface BroadcastManagerProps {
  initialBroadcastInquiries?: Inquiry[];
  initialTelemetryFeed?: TelemetryEventItem[];
}

export function BroadcastManager({
  initialBroadcastInquiries = [],
  initialTelemetryFeed,
}: BroadcastManagerProps) {
  const activeInquiries = initialBroadcastInquiries.filter((inq) => !inq.isResolved);
  const [source, setSource] = useState("OB-VAN MERCEDES 01");
  const [type, setType] = useState<TelemetryType>("OB_VAN_GPS");
  const [level, setLevel] = useState<SeverityLevel>("info");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dispatchedFeed, setDispatchedFeed] = useState<TelemetryEventItem[]>(() => {
    if (Array.isArray(initialTelemetryFeed)) {
      return initialTelemetryFeed;
    }
    if (typeof window === "undefined") return INITIAL_DISPATCHED_FEED;
    try {
      const saved = localStorage.getItem("yaspro_admin_telemetry_feed");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (item) =>
              item &&
              typeof item === "object" &&
              typeof item.id === "string" &&
              typeof item.summary === "string"
          )
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore storage parse error
    }
    return INITIAL_DISPATCHED_FEED;
  });
  const isLoadedRef = useRef(false);

  useEffect(() => {
    isLoadedRef.current = true;
  }, []);

  // Persist feed updates safely in an effect rather than inside the state updater
  useEffect(() => {
    if (!isLoadedRef.current) return;
    try {
      localStorage.setItem("yaspro_admin_telemetry_feed", JSON.stringify(dispatchedFeed));
    } catch {
      // ignore storage quota error
    }
  }, [dispatchedFeed]);

  const { feedback, showFeedback, clearFeedback } = useFeedbackAlert(3500);

  const handleDispatch = async (eventData: {
    source: string;
    type: TelemetryType;
    level: SeverityLevel;
    summary: string;
  }) => {
    if (isSubmitting) return;
    setErrorMessage(null);
    if (!eventData.summary.trim()) {
      setErrorMessage("Please provide an event description before dispatching.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await dispatchTelemetryEvent(eventData);
      if (res.success) {
        const dispatchTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setDispatchedFeed((prev) => [
          {
            id: `ev-${Date.now()}`,
            ...eventData,
            timestamp: dispatchTime,
          },
          ...prev,
        ].slice(0, 50));

        showFeedback("Event dispatched to sovereign edge relays!");
        setSummary("");
      } else {
        setErrorMessage(res.error || "Failed to dispatch event");
      }
    } catch (err) {
      setErrorMessage((err as Error).message || "An unexpected error occurred while dispatching event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Broadcast Telemetry & OB Van Master Control"
        description="Dispatch SMPTE ST-2110 IP video sync, satellite uplink statuses, and C2C proxy ingest alerts to client portals."
        icon={Radio}
        feedback={feedback}
        onDismissFeedback={clearFeedback}
      />

      {errorMessage && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white cursor-pointer px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <AdminStatsGrid
        columns={4}
        stats={[
          {
            label: "Edge Relays",
            value: "Live Edge",
            unit: "Active",
            icon: Radio,
            variant: "brand",
          },
          {
            label: "Sync Standard",
            value: "ST-2110",
            unit: "PTP v2",
            icon: Wifi,
            variant: "success",
          },
          {
            label: "OB Van Uplink",
            value: "1.2 Gbps",
            unit: "Ka-Band",
            icon: Satellite,
            variant: "default",
          },
          {
            label: "Dispatched Events",
            value: dispatchedFeed.length,
            unit: "Recent",
            icon: Activity,
            variant: "default",
          },
        ]}
      />

      {/* Live Broadcast Inquiries from Services & BookNow modal */}
      {activeInquiries.length > 0 && (
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-brand-mauve/30 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Radio size={16} className="text-brand-mauve" />
              <span>Active Broadcast &amp; Outdoor Production Inquiries ({activeInquiries.length})</span>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs text-brand-mauve hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>View in Inquiries Desk</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeInquiries.slice(0, 4).map((inq) => {
              const category = resolveInquiryCategory(inq);
              return (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-brand-mauve/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">
                      {inq.name} {inq.company ? `(${inq.company})` : ""}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-mauve/20 text-brand-lavender border border-brand-mauve/30 uppercase">
                      {category.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 font-mono">
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                    {inq.phone && (
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hello ${inq.name}, following up from Yas Productions regarding your ${category.label} inquiry.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>WhatsApp Followup</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-mauve/40 hover:bg-slate-900 transition-all text-left group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-xl bg-brand-violet/20 text-brand-mauve flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    Preset
                  </span>
                </div>
                <h4 className="font-semibold text-white text-xs group-hover:text-brand-mauve-soft transition-colors">
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
            <Send size={15} className="text-brand-mauve" />
            Custom Telemetry Dispatcher
          </h3>
          <p className="text-xs text-slate-400">
            Publish an edge event instantly visible across all client portals.
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
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-brand-mauve"
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
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-brand-mauve font-mono text-[11px]"
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
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-brand-mauve text-[11px]"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Telemetry Summary Message</label>
              <textarea
                rows={4}
                required
                placeholder="Details of uplink lock, SMPTE timecode sync status, or take ingestion..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-mauve resize-none font-mono text-[11px]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl btn-brand font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Send size={14} />
              <span>{isSubmitting ? "Dispatching..." : "Transmit to Sovereign Edge"}</span>
            </button>
          </form>
        </div>

        {/* Live Broadcast Feed */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/60 border border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers size={15} className="text-emerald-400" />
                Live Dispatched Log Stream
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
              {dispatchedFeed.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs">
                  No telemetry events broadcasted in this session yet. Use the presets above or form to transmit an event.
                </div>
              ) : (
                dispatchedFeed.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-white">{item.source}</span>
                      <span className="text-slate-500 font-mono">{item.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                          item.level === "success"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : item.level === "warning"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-brand-violet/20 text-brand-lavender"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between mt-4">
            <span>Sovereign ST-2110 Telemetry Engine</span>
            <span>Broadcast API v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
