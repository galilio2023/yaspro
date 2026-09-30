import React from "react";
import { PortalStages } from "@/features/enterprise/components/portal/PortalTendersAndStages";

export const metadata = { title: "Soundstage Reservations | Enterprise Vault" };

export default function StagesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Soundstage Reservations</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time soundstage allocation with LED volume, Unreal LiveLink, and Dolby Atmos configuration.</p>
      </div>
      <PortalStages />
    </div>
  );
}
