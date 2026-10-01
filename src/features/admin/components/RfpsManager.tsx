"use client";

import React, { useState } from "react";
import { FileSpreadsheet, MapPin, Building, Eye, X, Mail, Phone } from "lucide-react";
import { updateEnterpriseRfpStatus } from "@/lib/actions/bookings-rfp-operations";
import type { EnterpriseRfp } from "@/db/schema";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge, MawthooqBadge } from "@/components/ui/status-badge";
import { usePagination } from "@/hooks/usePagination";

interface RfpsManagerProps {
  initialRfps: EnterpriseRfp[];
}

export function RfpsManager({ initialRfps }: RfpsManagerProps) {
  const [rfpList, setRfpList] = useState<EnterpriseRfp[]>(initialRfps);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inspectRfp, setInspectRfp] = useState<EnterpriseRfp | null>(null);

  const pagination = usePagination(rfpList, 20);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateEnterpriseRfpStatus(id, newStatus);
    if (res.success) {
      setRfpList((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (inspectRfp && inspectRfp.id === id) {
        setInspectRfp((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileSpreadsheet className="text-rose-400" /> Enterprise RFPs &amp; Tenders Board
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review government ministries, sovereign entities, and large-scale broadcast RFPs in Neon DB.
        </p>
      </div>

      <DataTable>
        <DataTableHeader>
          <tr>
            <th className="py-3 px-4">Tender Code</th>
            <th className="py-3 px-4">Organization</th>
            <th className="py-3 px-4">Contact</th>
            <th className="py-3 px-4">Scope &amp; Budget</th>
            <th className="py-3 px-4">Compliance</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Update Phase</th>
          </tr>
        </DataTableHeader>
        <DataTableBody>
          {rfpList.length === 0 ? (
            <DataTableEmpty colSpan={7} message="No enterprise RFPs submitted yet in database." />
          ) : (
            pagination.paginatedItems.map((rfp) => (
              <DataTableRow key={rfp.id}>
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
                  {rfp.requiresMawthooqCompliance && <MawthooqBadge />}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={rfp.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setInspectRfp(rfp)}
                      className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="Inspect full RFP proposal"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                    <button
                      disabled={updatingId === rfp.id}
                      onClick={() => handleStatusChange(rfp.id, "approved")}
                      className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={updatingId === rfp.id}
                      onClick={() => handleStatusChange(rfp.id, "sla_active")}
                      className="px-2 py-1 rounded bg-brand-teal/20 hover:bg-brand-teal/30 border border-brand-teal/30 text-brand-teal-light text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      SLA
                    </button>
                  </div>
                </td>
              </DataTableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>

      <PaginationControls
        currentPage={pagination.currentPage}
        pageCount={pagination.pageCount}
        total={pagination.total}
        startIndex={pagination.startIndex}
        endIndex={pagination.endIndex}
        onPrev={pagination.prevPage}
        onNext={pagination.nextPage}
        variant="table"
      />

      {/* Enterprise RFP Inspection Modal */}
      {inspectRfp && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setInspectRfp(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white font-mono">{inspectRfp.referenceCode}</span>
                  <StatusBadge status={inspectRfp.status} />
                  {inspectRfp.requiresMawthooqCompliance && <MawthooqBadge />}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(inspectRfp.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setInspectRfp(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-5 text-xs text-slate-300">
              {/* Organization & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Organization Entity</span>
                  <span className="font-bold text-white text-sm block">{inspectRfp.organizationName}</span>
                  <div className="text-[11px] text-slate-400 capitalize">Type: {inspectRfp.organizationType.replace(/_/g, " ")}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={11} /> {inspectRfp.country}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Key Contact</span>
                  <span className="font-bold text-white text-sm block">{inspectRfp.contactName} {inspectRfp.contactTitle ? `(${inspectRfp.contactTitle})` : ""}</span>
                  <div className="text-[11px] text-slate-400 font-mono"><Mail size={11} className="inline mr-1" />{inspectRfp.workEmail}</div>
                  <div className="text-[11px] text-slate-400 font-mono"><Phone size={11} className="inline mr-1" />{inspectRfp.phone}</div>
                </div>
              </div>

              {/* Scope & Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Scope</span>
                  <span className="font-bold text-white capitalize block mt-0.5">{inspectRfp.projectScope.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Budget Tier</span>
                  <span className="font-bold text-purple-300 capitalize block mt-0.5">{inspectRfp.estimatedBudget.replace(/_/g, " ")}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Timeline</span>
                  <span className="font-bold text-white block mt-0.5">{inspectRfp.projectTimeline || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">OB-VAN Unit</span>
                  <span className="font-bold text-white block mt-0.5">{inspectRfp.requiresObVan ? "Required" : "None"}</span>
                </div>
              </div>

              {/* Creators & Environment */}
              {((inspectRfp.selectedCreators as string[])?.length > 0 || inspectRfp.digitalTwinEnvironment) && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Specialized Retainers</span>
                  {(inspectRfp.selectedCreators as string[])?.length > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Selected Creators:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(inspectRfp.selectedCreators as string[]).map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {inspectRfp.digitalTwinEnvironment && (
                    <div className="mt-2">
                      <span className="text-slate-400 block text-[11px]">Digital Twin Environment:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">{inspectRfp.digitalTwinEnvironment}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes / Brief */}
              {inspectRfp.notes && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Client Brief &amp; Notes</span>
                  <p className="text-slate-200 text-xs whitespace-pre-line leading-relaxed">{inspectRfp.notes}</p>
                </div>
              )}

              {/* Quick Status Update */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Change Tender Phase:</span>
                <select
                  value={inspectRfp.status}
                  onChange={(e) => handleStatusChange(inspectRfp.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium cursor-pointer focus:outline-none focus:border-purple-500"
                >
                  <option value="pending_review" className="bg-slate-900 text-white">Pending Review</option>
                  <option value="approved" className="bg-slate-900 text-white">Approved</option>
                  <option value="in_production" className="bg-slate-900 text-white">In Production</option>
                  <option value="sla_active" className="bg-slate-900 text-white">SLA Active</option>
                  <option value="rejected" className="bg-slate-900 text-white">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
