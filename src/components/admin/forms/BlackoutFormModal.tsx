"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSwitch, AdminSelect } from "../shared/AdminFormFields";

export interface BlackoutFormData {
  id?: string;
  studioId?: string;
  podcastSetId?: string;
  title: string;
  reason: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  allDay: boolean;
}

export interface BlackoutFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    studioId?: string | null;
    podcastSetId?: string | null;
    title: string;
    reason?: string;
    startTime: string;
    endTime: string;
    allDay?: boolean;
  }) => Promise<boolean | void>;
  podcastSetsList?: { key: string; name: string }[];
  isSubmitting?: boolean;
  error?: string | null;
}

export function BlackoutFormModal(props: BlackoutFormModalProps) {
  if (!props.isOpen) return null;
  return <BlackoutFormContent {...props} />;
}

function BlackoutFormContent({
  isOpen,
  onClose,
  onSave,
  podcastSetsList = [],
  isSubmitting = false,
  error,
}: BlackoutFormModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [title, setTitle] = useState("Private VIP Session / Maintenance");
  const [reason, setReason] = useState("Acoustic calibration & VIP private production lockout");
  const [targetType, setTargetType] = useState<"all" | "podcast">("all");
  const [selectedPodcastSet, setSelectedPodcastSet] = useState("");
  const [startDate, setStartDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [endTime, setEndTime] = useState("18:00");
  const [allDay, setAllDay] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = "Lockout title is required";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";

    const startIso = allDay
      ? `${startDate}T00:00:00.000Z`
      : `${startDate}T${startTime || "00:00"}:00.000Z`;
    const endIso = allDay
      ? `${endDate}T23:59:59.000Z`
      : `${endDate}T${endTime || "23:59"}:00.000Z`;

    const startD = new Date(startIso);
    const endD = new Date(endIso);

    if (isNaN(startD.getTime()) || isNaN(endD.getTime()) || startD >= endD) {
      errors.range = "End time must be strictly after start time";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    await onSave({
      title: title.trim(),
      reason: reason.trim() || undefined,
      podcastSetId: targetType === "podcast" && selectedPodcastSet ? selectedPodcastSet : null,
      studioId: null,
      startTime: startIso,
      endTime: endIso,
      allDay,
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Studio Lockout / Blackout Window"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        {fieldErrors.range && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            {fieldErrors.range}
          </div>
        )}

        <AdminInput
          label="Lockout Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setFieldErrors((prev) => ({ ...prev, title: "" }));
          }}
          placeholder="e.g. VIP Royal Shoot or Annual Maintenance"
          required
          error={fieldErrors.title}
        />

        <AdminInput
          label="Internal Operational Note"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for floor closure or engineer maintenance"
        />

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Lockout Scope
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTargetType("all")}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                targetType === "all"
                  ? "bg-brand-violet/20 border-brand-mauve text-white"
                  : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Studio-Wide (All Sets)
            </button>
            <button
              type="button"
              onClick={() => setTargetType("podcast")}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                targetType === "podcast"
                  ? "bg-brand-violet/20 border-brand-mauve text-white"
                  : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              Specific Podcast Set
            </button>
          </div>
        </div>

        {targetType === "podcast" && podcastSetsList.length > 0 && (
          <AdminSelect
            label="Select Podcast Set"
            value={selectedPodcastSet}
            onChange={(e) => setSelectedPodcastSet(e.target.value)}
            options={[
              { label: "Choose a podcast set...", value: "" },
              ...podcastSetsList.map((s) => ({ label: s.name, value: s.key })),
            ]}
          />
        )}

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Full-Day Lockout</span>
          <AdminSwitch label="" checked={allDay} onChange={setAllDay} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AdminInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          {!allDay ? (
            <AdminInput
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          ) : (
            <div className="flex items-center text-xs text-text-muted pt-6">00:00 (All day)</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AdminInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          {!allDay ? (
            <AdminInput
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          ) : (
            <div className="flex items-center text-xs text-text-muted pt-6">23:59 (All day)</div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:bg-brand-mauve transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Locking..." : "Apply Lockout"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
}
