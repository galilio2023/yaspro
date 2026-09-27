"use client";

import React, { useState } from "react";
import { CalendarCheck, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { updateBookingStatus } from "@/lib/cms-actions";
import type { Booking } from "@/db/schema";

interface BookingsManagerProps {
  initialBookings: Booking[];
}

export function BookingsManager({ initialBookings }: BookingsManagerProps) {
  const [bookingList, setBookingList] = useState<Booking[]>(initialBookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled" | "completed"
  ) => {
    setUpdatingId(id);
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) {
      setBookingList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CalendarCheck className="text-amber-400" /> Studio Bookings Management Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review, approve, and manage customer studio reservations and shooting sessions.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Session Type</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookingList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No bookings logged yet in the database.
                  </td>
                </tr>
              ) : (
                bookingList.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                      {b.referenceCode}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-300">
                      {b.sessionType.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(b.scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{b.durationHours} hrs</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      AED {Number(b.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : b.status === "completed"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : b.status === "cancelled"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {b.status === "confirmed" && <CheckCircle2 size={12} />}
                        {b.status === "pending" && <Clock size={12} />}
                        {b.status === "cancelled" && <XCircle size={12} />}
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleStatusChange(b.id, "confirmed")}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-medium transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleStatusChange(b.id, "completed")}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-medium transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          disabled={updatingId === b.id}
                          onClick={() => handleStatusChange(b.id, "cancelled")}
                          className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[11px] font-medium transition-colors"
                        >
                          Cancel
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
