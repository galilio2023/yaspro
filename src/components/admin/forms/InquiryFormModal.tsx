"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminTextarea, AdminSelect } from "../shared/AdminFormFields";

export interface InquiryFormValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: "ob_van" | "live_broadcast" | "outdoor_filming" | "studio_booking" | "technical_support" | "general";
  message: string;
}

export interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: InquiryFormValues) => Promise<boolean | void>;
  isSubmitting?: boolean;
  error?: string | null;
}

export function InquiryFormModal(props: InquiryFormModalProps) {
  if (!props.isOpen) return null;
  return <InquiryFormContent {...props} />;
}

function InquiryFormContent({ isOpen, onClose, onSave, isSubmitting = false, error }: InquiryFormModalProps) {
  const [form, setForm] = useState<InquiryFormValues>({
    name: "", email: "", phone: "", company: "", inquiryType: "general", message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const set = (key: keyof InquiryFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email";
    if (!form.message.trim()) errors.message = "Describe the request";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    await onSave(form);
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title="Log Manual Lead"
      description="Record a phone call or walk-in enquiry so it appears alongside website leads."
      submitLabel="Log Lead"
      maxWidth="md"
    >
      {error && <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput label="Name" required value={form.name} error={fieldErrors.name} onChange={set("name")} />
        <AdminInput label="Email" type="email" required value={form.email} error={fieldErrors.email} onChange={set("email")} />
        <AdminInput label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
        <AdminInput label="Company" value={form.company} onChange={set("company")} />
      </div>
      <AdminSelect
        label="Lead Type"
        value={form.inquiryType}
        onChange={set("inquiryType")}
        options={[
          { value: "general", label: "General Inquiry" },
          { value: "studio_booking", label: "Studio Booking" },
          { value: "ob_van", label: "OB Van Broadcast" },
          { value: "live_broadcast", label: "Live Broadcast" },
          { value: "outdoor_filming", label: "Outdoor Filming" },
          { value: "technical_support", label: "Technical Support / Gear" },
        ]}
      />
      <AdminTextarea label="Request Details" required rows={4} value={form.message} error={fieldErrors.message} onChange={set("message")} />
    </AdminModal>
  );
}
