"use client";

import React, { useState } from "react";
import {
  CalendarOff,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Building,
  CheckCircle,
} from "lucide-react";
import type { StudioBlackoutItem } from "@/lib/actions/blackout-operations";
import {
  createStudioBlackout,
  deleteStudioBlackout,
} from "@/lib/actions/blackout-operations";
import { BlackoutFormModal } from "@/components/admin/forms/BlackoutFormModal";
import type { PodcastStudio } from "@/features/podcast-booking/types";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface BlackoutManagerProps {
  initialBlackouts: StudioBlackoutItem[];
  podcastSets: PodcastStudio[];
}

export function BlackoutManager({
  initialBlackouts,
  podcastSets,
}: BlackoutManagerProps) {
  const [blackouts, setBlackouts] = useState<StudioBlackoutItem[]>(initialBlackouts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [page, setPage] = useState(0);
  const pageSize = 6;

  const total = blackouts.length;
  const pageCount = Math.ceil(total / pageSize) || 1;
  const safePage = Math.min(page, Math.max(0, pageCount - 1));
  const startIndex = safePage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const paginatedBlackouts = blackouts.slice(startIndex, endIndex);

  const handleOpenModal = () => {
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveBlackout = async (data: {
    studioId?: string | null;
    podcastSetId?: string | null;
    title: string;
    reason?: string;
    startTime: string;
    endTime: string;
    allDay?: boolean;
  }) => {
    setIsSaving(true);
    setModalError(null);
    try {
      const res = await createStudioBlackout(data);
      if (res.success && res.data) {
        const item: StudioBlackoutItem = {
          id: res.data.id,
          studioId: res.data.studioId,
          podcastSetId: res.data.podcastSetId,
          title: res.data.title,
          reason: res.data.reason,
          startTime: res.data.startTime.toISOString(),
          endTime: res.data.endTime.toISOString(),
          allDay: res.data.allDay,
          createdAt: res.data.createdAt.toISOString(),
        };
        setBlackouts((prev) => [item, ...prev]);
        setIsModalOpen(false);
      } else {
        setModalError(res.error || "Failed to schedule blackout.");
      }
    } catch (e) {
      setModalError((e as Error).message || "Failed to create blackout window.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBlackout = async (id: string) => {
    if (!confirm("Are you sure you want to lift this studio lockout?")) return;
    setBlackouts((prev) => prev.filter((b) => b.id !== id));
    await deleteStudioBlackout(id);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-brand-violet/20 border border-brand-mauve/30 text-brand-mauve">
            <CalendarOff className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Studio Blackouts & Floor Lockouts
            </h2>
            <p className="text-xs text-text-muted">
              Block dates and time windows for VIP sessions, engineer maintenance, or internal shoots.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Lockout Window</span>
        </button>
      </div>

      {/* List */}
      {blackouts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-white/10 bg-white/[0.01] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-violet/20 text-brand-mauve flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Active Lockouts</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            All studio spaces and podcast sets are fully open for client bookings according to the standard schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBlackouts.map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(b.endTime);
              const setName = b.podcastSetId
                ? podcastSets.find((s) => s.key === b.podcastSetId)?.name || b.podcastSetId
                : null;

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-brand-mauve/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{b.title}</h3>
                        <span className="text-[10px] font-mono text-brand-mauve">
                          {setName ? `Set: ${setName}` : "Studio-Wide Lockout"}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Locked
                      </span>
                    </div>

                    {b.reason && (
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {b.reason}
                      </p>
                    )}

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs text-slate-300 font-mono">
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-brand-mauve" />
                        <span>
                          {start.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {b.allDay ? " (All Day)" : ` @ ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                        <span className="w-3.5 text-center text-brand-mauve font-bold">→</span>
                        <span>
                          {end.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {b.allDay ? " (All Day)" : ` @ ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 mt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleDeleteBlackout(b.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Lift Lockout</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <PaginationControls
            currentPage={safePage}
            pageCount={pageCount}
            total={total}
            startIndex={startIndex}
            endIndex={endIndex}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            variant="card"
          />
        </div>
      )}

      {/* Modal */}
      <BlackoutFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlackout}
        podcastSetsList={podcastSets}
        isSubmitting={isSaving}
        error={modalError}
      />
    </div>
  );
}
