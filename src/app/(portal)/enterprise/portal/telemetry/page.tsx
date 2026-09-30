import React from "react";
import { PortalTelemetryFeed } from "@/features/enterprise/components/portal/PortalTelemetryFeed";

export const metadata = { title: "Live Telemetry Bus | Enterprise Vault" };

export default function TelemetryPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Live Telemetry Bus</h1>
        <p className="text-sm text-slate-400 mt-1">Sovereign relay bus events — SMPTE 2110 IP ingest, sync pulses, and broadcast infrastructure health.</p>
      </div>
      <PortalTelemetryFeed />
    </div>
  );
}
