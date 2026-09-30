"use client";

import React, { useState } from "react";
import { FileSpreadsheet, MapPin, Building } from "lucide-react";
import { updateEnterpriseRfpStatus } from "@/lib/cms-actions";
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

  const pagination = usePagination(rfpList, 20);

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
                      Activate SLA
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
    </div>
  );
}
