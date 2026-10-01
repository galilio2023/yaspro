import React from "react";
import { PortalTenders } from "@/features/enterprise/components/portal/PortalTendersAndStages";
import { getUserEnterpriseRfps } from "@/lib/portal-actions";

export const metadata = { title: "Active Tenders | Enterprise Vault" };

export default async function RfpsPage() {
  const userRfps = await getUserEnterpriseRfps();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Tenders & RFPs</h1>
        <p className="text-sm text-slate-400 mt-1">Track proposal statuses, Mawthooq compliance flags, and SLA reference codes.</p>
      </div>
      <PortalTenders initialRfps={userRfps} />
    </div>
  );
}
