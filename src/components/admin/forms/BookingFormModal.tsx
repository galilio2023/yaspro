"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminTextarea, AdminSelect } from "../shared/AdminFormFields";
import type { CmsBookingInput } from "@/lib/actions/bookings-rfp-operations";

const SESSION_TYPES = [
  { value: "podcast", label: "Podcast" },
  { value: "video_production", label: "Video Production" },
  { value: "photography", label: "Photography" },
  { value: "interview", label: "Interview" },
  { value: "commercial", label: "Commercial" },
  { value: "music_video", label: "Music Video" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `id` is set when editing an existing booking. */
  onSave: (input: CmsBookingInput) => Promise<boolean | void>;
  initialBooking: Partial<CmsBookingInput> | null;
  studios: { id: string; name: string }[];
  isSubmitting?: boolean;
  error?: string | null;
}

/** Local wall-clock value for <input type="datetime-local">, interpreted in Dubai time. */
export function toDubaiInput(iso?: string | Date | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
  return parts.replace(" ", "T");
}

export function BookingFormModal(props: BookingFormModalProps) {
  if (!props.isOpen) return null;
  return <BookingFormContent key={props.initialBooking?.id || "new"} {...props} />;
}

function BookingFormContent({ isOpen, onClose, onSave, initialBooking, studios, isSubmitting = false, error }: BookingFormModalProps) {
  const isEdit = Boolean(initialBooking?.id);
  const [form, setForm] = useState({
    studioId: initialBooking?.studioId || "",
    sessionType: initialBooking?.sessionType || "podcast",
    status: initialBooking?.status || "confirmed",
    scheduledAt: toDubaiInput(initialBooking?.scheduledAt),
    durationHours: String(initialBooking?.durationHours ?? 2),
    headcount: String(initialBooking?.headcount ?? 2),
    totalAmount: initialBooking?.totalAmount ?? "",
    paymentStatus: initialBooking?.paymentStatus || "unpaid",
    contactName: initialBooking?.contactName || "",
    contactEmail: initialBooking?.contactEmail || "",
    contactPhone: initialBooking?.contactPhone || "",
    contactCompany: initialBooking?.contactCompany || "",
    notes: initialBooking?.notes || "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.scheduledAt) errors.scheduledAt = "Date and time are required";
    const duration = Number(form.durationHours);
    if (!Number.isInteger(duration) || duration < 1) errors.durationHours = "Whole hours, minimum 1";
    const headcount = Number(form.headcount);
    if (!Number.isInteger(headcount) || headcount < 1) errors.headcount = "Minimum 1";
    if (form.totalAmount === "" || !(Number(form.totalAmount) >= 0)) errors.totalAmount = "Enter a valid amount";
    if (!isEdit && !form.contactName.trim()) errors.contactName = "Client name is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    await onSave({
      id: initialBooking?.id,
      studioId: form.studioId || null,
      sessionType: form.sessionType as CmsBookingInput["sessionType"],
      status: form.status as CmsBookingInput["status"],
      // The picker is Dubai wall-clock time (UTC+4, no DST).
      scheduledAt: new Date(`${form.scheduledAt}:00+04:00`).toISOString(),
      durationHours: duration,
      headcount,
      totalAmount: form.totalAmount,
      paymentStatus: form.paymentStatus,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      contactCompany: form.contactCompany,
      notes: form.notes,
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEdit ? "Edit Booking Details" : "New Manual Booking"}
      description={isEdit
        ? "Reschedule or correct this reservation. Status and payment are managed from the table."
        : "Record a phone or walk-in reservation. Times are Dubai time (GST)."}
      submitLabel={isEdit ? "Update Booking" : "Create Booking"}
      maxWidth="lg"
    >
      {error && <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}

      {!isEdit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AdminInput label="Client Name" required value={form.contactName} error={fieldErrors.contactName} onChange={set("contactName")} />
          <AdminInput label="Company" value={form.contactCompany} onChange={set("contactCompany")} />
          <AdminInput label="Email" type="email" value={form.contactEmail} onChange={set("contactEmail")} />
          <AdminInput label="Phone" type="tel" value={form.contactPhone} onChange={set("contactPhone")} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminSelect
          label="Studio"
          value={form.studioId}
          onChange={set("studioId")}
          options={[{ value: "", label: "No studio (gear / offsite)" }, ...studios.map((s) => ({ value: s.id, label: s.name }))]}
        />
        <AdminSelect label="Session Type" value={form.sessionType} onChange={set("sessionType")} options={SESSION_TYPES} />
        <AdminInput label="Date & Time (Dubai)" type="datetime-local" required value={form.scheduledAt} error={fieldErrors.scheduledAt} onChange={set("scheduledAt")} />
        <AdminInput label="Duration" type="number" min={1} suffixNode="hrs" required value={form.durationHours} error={fieldErrors.durationHours} onChange={set("durationHours")} />
        <AdminInput label="Headcount" type="number" min={1} required value={form.headcount} error={fieldErrors.headcount} onChange={set("headcount")} />
        <AdminInput label="Total Amount" type="number" step="0.01" min={0} suffixNode="AED" required value={form.totalAmount} error={fieldErrors.totalAmount} onChange={set("totalAmount")} />
        {!isEdit && (
          <>
            <AdminSelect label="Status" value={form.status} onChange={set("status")} options={STATUSES} />
            <AdminSelect
              label="Payment"
              value={form.paymentStatus}
              onChange={set("paymentStatus")}
              options={[
                { value: "unpaid", label: "Unpaid" },
                { value: "deposit_paid", label: "Deposit Paid" },
                { value: "paid", label: "Paid in Full" },
              ]}
            />
          </>
        )}
      </div>

      <AdminTextarea
        label={isEdit ? "Booking Notes (includes contact header — edit carefully)" : "Notes"}
        rows={isEdit ? 5 : 3}
        value={form.notes}
        onChange={set("notes")}
      />
    </AdminModal>
  );
}
