"use client";

import React, { useState, useRef } from "react";
import { FileSpreadsheet, MapPin, Building, Eye, Mail, Phone, Search } from "lucide-react";
import { updateEnterpriseRfpStatus } from "@/lib/actions/bookings-rfp-operations";
import type { EnterpriseRfp } from "@/db/schema";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableEmpty } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { StatusBadge, MawthooqBadge } from "@/components/ui/status-badge";
import { Dialog } from "@/components/ui/dialog";
import { usePagination } from "@/hooks/usePagination";

interface RfpsManagerProps {
  initialRfps: EnterpriseRfp[];
}

export function RfpsManager({ initialRfps }: RfpsManagerProps) {
  const [rfpList, setRfpList] = useState<EnterpriseRfp[]>(initialRfps);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inspectRfp, setInspectRfp] = useState<EnterpriseRfp | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const updatePending = useRef(false);

  const totalCount = rfpList.length;
  const pendingCount = rfpList.filter((r) => r.status === "pending_review").length;
  const inProductionCount = rfpList.filter((r) => r.status === "in_production").length;
  const approvedCount = rfpList.filter((r) => r.status === "approved" || r.status === "sla_active").length;

  const filteredRfps = rfpList.filter((rfp) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      rfp.referenceCode.toLowerCase().includes(q) ||
      rfp.organizationName.toLowerCase().includes(q) ||
      rfp.contactName.toLowerCase().includes(q) ||
      rfp.workEmail.toLowerCase().includes(q) ||
      rfp.projectScope.toLowerCase().includes(q);
    const matchesStatus = selectedStatus === "all" || rfp.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const pagination = usePagination(filteredRfps, 20);

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (updatePending.current) return;
    updatePending.current = true;
    setUpdatingId(id);
    try {
      const res = await updateEnterpriseRfpStatus(id, newStatus);
      if (res.success) {
        setRfpList((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setInspectRfp((prev) => prev?.id === id ? { ...prev, status: newStatus } : prev);
      }
    } finally {
      updatePending.current = false;
      setUpdatingId(null);
    }
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

      {/* KPI Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
          <span className="text-[11px] text-slate-400 font-mono uppercase block">Total Proposals</span>
          <span className="text-xl font-bold text-white font-mono mt-1 block">{totalCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-amber-500/20 bg-amber-950/10">
          <span className="text-[11px] text-amber-400 font-mono uppercase block">Pending Review</span>
          <span className="text-xl font-bold text-amber-300 font-mono mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-blue-500/20 bg-blue-950/10">
          <span className="text-[11px] text-blue-400 font-mono uppercase block">In Production</span>
          <span className="text-xl font-bold text-blue-300 font-mono mt-1 block">{inProductionCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-emerald-500/20 bg-emerald-950/10">
          <span className="text-[11px] text-emerald-400 font-mono uppercase block">Approved / SLA</span>
          <span className="text-xl font-bold text-emerald-300 font-mono mt-1 block">{approvedCount}</span>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search RFPs by code, organization, contact..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                pagination.resetPage();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {[
            { id: "all", label: "All Proposals", count: totalCount },
            { id: "pending_review", label: "Pending Review", count: pendingCount },
            { id: "in_production", label: "In Production", count: inProductionCount },
            { id: "approved", label: "Approved", count: rfpList.filter(r => r.status === "approved").length },
            { id: "sla_active", label: "SLA Active", count: rfpList.filter(r => r.status === "sla_active").length },
            { id: "rejected", label: "Rejected", count: rfpList.filter(r => r.status === "rejected").length },
          ].map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.id);
                  pagination.resetPage();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md"
                    : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.06]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-rose-500 text-white font-bold" : "bg-white/10 text-slate-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
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
          {filteredRfps.length === 0 ? (
            <DataTableEmpty colSpan={7} message="No enterprise RFPs match your current search and filters." />
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
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                      title="Inspect full RFP proposal"
                    >
                      <Eye size={12} />
                      <span>Inspect</span>
                    </button>
                    <button
                      disabled={updatingId !== null}
                      onClick={() => handleStatusChange(rfp.id, "approved")}
                      className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={updatingId !== null}
                      onClick={() => handleStatusChange(rfp.id, "sla_active")}
                      className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50"
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
        <Dialog
          isOpen={Boolean(inspectRfp)}
          onClose={() => setInspectRfp(null)}
          title={`RFP ${inspectRfp.referenceCode}`}
          maxWidth="2xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={inspectRfp.status} />
                  {inspectRfp.requiresMawthooqCompliance && <MawthooqBadge />}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted {new Date(inspectRfp.createdAt).toLocaleString()}
                </p>
              </div>

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
                  <span className="font-bold text-amber-300 capitalize block mt-0.5">{inspectRfp.estimatedBudget.replace(/_/g, " ")}</span>
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
                          <span key={c} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {inspectRfp.digitalTwinEnvironment && (
                    <div className="mt-2">
                      <span className="text-slate-400 block text-[11px]">Digital Twin Environment:</span>
                      <span className="font-mono text-amber-300 text-[11px]">{inspectRfp.digitalTwinEnvironment}</span>
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
                <label htmlFor="rfp-phase" className="text-xs font-semibold text-slate-400">Change Tender Phase:</label>
                <select
                  id="rfp-phase"
                  disabled={updatingId !== null}
                  value={inspectRfp.status}
                  onChange={(e) => handleStatusChange(inspectRfp.id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium cursor-pointer focus:outline-none focus:border-amber-500"
                >
                  <option value="pending_review" className="bg-slate-900 text-white">Pending Review</option>
                  <option value="approved" className="bg-slate-900 text-white">Approved</option>
                  <option value="in_production" className="bg-slate-900 text-white">In Production</option>
                  <option value="sla_active" className="bg-slate-900 text-white">SLA Active</option>
                  <option value="rejected" className="bg-slate-900 text-white">Rejected</option>
                </select>
              </div>
            </div>
        </Dialog>
      )}
    </div>
  );
}
