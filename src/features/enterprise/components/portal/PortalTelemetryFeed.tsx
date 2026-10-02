"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { getLiveTelemetryFeed, type ProductionTelemetryEvent } from "@/lib/portal-actions";

export function PortalTelemetryFeed() {
  const [events, setEvents] = useState<ProductionTelemetryEvent[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [isPending, startTransition] = useTransition();
  const sequenceRef = useRef(0);

  const fetchTelemetry = React.useCallback(() => {
    const currentSeq = ++sequenceRef.current;
    startTransition(async () => {
      try {
        const feed = await getLiveTelemetryFeed();
        if (currentSeq === sequenceRef.current) {
          setEvents(feed);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // Auto-stream telemetry interval
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 10000);
    return () => clearInterval(interval);
  }, [isLiveStreaming, fetchTelemetry]);

  return (
    <div className="space-y-4 mb-8">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`size-2.5 rounded-full ${isLiveStreaming ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Sovereign Relay Bus &amp; SMPTE 2110 IP Ingest
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {isLiveStreaming ? "SIMULATED TELEMETRY 10s" : "PAUSED"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            {isLiveStreaming ? "Pause Stream" : "Resume Stream"}
          </button>
          <button
            type="button"
            onClick={fetchTelemetry}
            disabled={isPending}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isPending ? "animate-spin" : ""} />
            <span>Refresh Bridge</span>
          </button>
        </div>
      </div>

      {/* Events log list */}
      <div className="space-y-2.5">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Radio size={14} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                    {ev.source}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {ev.type}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed">
                  {ev.summary}
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-text-muted shrink-0 self-end sm:self-auto">
              {ev.timestamp}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
