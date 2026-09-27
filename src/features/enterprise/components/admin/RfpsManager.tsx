"use client";

import React, { useState } from "react";
import { FileSpreadsheet, CheckCircle2, Clock, ShieldCheck, MapPin, Building } from "lucide-react";
import { updateEnterpriseRfpStatus } from "@/lib/cms-actions";
import type { EnterpriseRfp } from "@/db/schema";

interface RfpsManagerProps {
  initialRfps: EnterpriseRfp[];
}

export function RfpsManager({ initialRfps }: RfpsManagerProps) {
  const [rfpList, setRfpList] = useState<EnterpriseRfp[]>(initialRfps);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateEnterpriseRfpStatus(id, newStatus);
    if (res.success) {
      setRfpList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileSpreadsheet className="text-rose-400" /> Enterprise RFPs & Tenders Board
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review government ministries, sovereign entities, and large-scale broadcast RFPs in Neon DB.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tender Code</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Scope & Budget</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rfpList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No enterprise RFPs submitted yet in database.
                  </td>
                </tr>
              ) : (
                rfpList.map((rfp) => (
                  <tr key={rfp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-300">
                      {rfp.referenceCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Building size={12} className="text-slate-400" />
                        <span>{rfp.organizationName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {rfp.country}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 block">{rfp.contactName}</span>
                      <span className="text-[11px] text-slate-400">{rfp.workEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 block capitalize">
                        {rfp.projectScope.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        Budget: {rfp.estimatedBudget.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {rfp.requiresMawthooqCompliance && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
                          <ShieldCheck size={10} /> Mawthooq
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          rfp.status === "sla_active"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : rfp.status === "approved"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {rfp.status === "sla_active" && <CheckCircle2 size={12} />}
                        {rfp.status === "pending_review" && <Clock size={12} />}
                        {rfp.status.toUpperCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={updatingId === rfp.id}
                          onClick={() => handleStatusChange(rfp.id, "approved")}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          disabled={updatingId === rfp.id}
                          onClick={() => handleStatusChange(rfp.id, "sla_active")}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-medium transition-colors"
                        >
                          Activate SLA
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
