import React from "react";
import { DailiesPageClient } from "@/features/enterprise/components/portal/DailiesPageClient";

export const metadata = { title: "C2C Dailies Vault | Enterprise Vault" };

export default function DailiesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">C2C Dailies Vault</h1>
        <p className="text-sm text-slate-400 mt-1">Frame-accurate camera-to-cloud footage review with timecoded annotations.</p>
      </div>
      <DailiesPageClient />
    </div>
  );
}
