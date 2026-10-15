"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  PhoneCall,
  Save,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import {
  updatePlatformSettings,
  type PlatformPaymentSettings,
} from "@/lib/actions/platform-settings-operations";
import { AdminPageHeader } from "@/components/admin";
import { AdminInput } from "@/components/admin/shared/AdminFormFields";

interface SettingsManagerProps {
  initialSettings: PlatformPaymentSettings;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [form, setForm] = useState<PlatformPaymentSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    setError(null);

    try {
      const res = await updatePlatformSettings(form);
      if (res.success && res.data) {
        setForm(res.data);
        setFeedback(res.message || "Settings updated successfully.");
      } else {
        setError(res.error || "Failed to update settings.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <AdminPageHeader
        title="Platform & Payment Settings"
        description="Configure corporate wire transfer details, deposit percentage thresholds, turnaround buffers, and operational concierge channels."
        icon={Settings}
      />

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Corporate UAE Bank Transfer Details */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Building2 size={18} className="text-brand-mauve" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Corporate UAE Bank Wire Transfer
              </h2>
              <p className="text-xs text-slate-400">
                Displayed to customers on the checkout screen when selecting Bank Wire.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Beneficiary Legal Name"
              required
              value={form.beneficiaryName}
              onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
              placeholder="e.g. YAS PRO MEDIA PRODUCTION LLC"
            />
            <AdminInput
              label="Bank & Branch Name"
              required
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="e.g. Emirates NBD — Business Bay, Dubai"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="Corporate IBAN Number"
              required
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
              placeholder="e.g. AE24 0260 0010 2345 6789 001"
              helper="Must start with AE followed by 21 alphanumeric characters"
            />
            <AdminInput
              label="SWIFT / BIC Code"
              required
              value={form.swift}
              onChange={(e) => setForm({ ...form, swift: e.target.value })}
              placeholder="e.g. EBBDAEADXXX"
            />
          </div>
        </div>

        {/* Section 2: Deposit & Booking Parameters */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <CreditCard size={18} className="text-brand-mauve" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Deposit Rates & Booking Turnaround
              </h2>
              <p className="text-xs text-slate-400">
                Control the required upfront commitment and buffer times between soundstage sessions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminInput
              label="Default Booking Deposit (%)"
              type="number"
              min={10}
              max={100}
              required
              value={form.depositPercent}
              onChange={(e) => setForm({ ...form, depositPercent: Number(e.target.value) })}
              helper="E.g. 50 for a 50% deposit, 100 for full payment required"
            />
            <AdminInput
              label="UAE VAT Rate (%)"
              type="number"
              min={0}
              max={30}
              required
              value={form.vatRatePercent}
              onChange={(e) => setForm({ ...form, vatRatePercent: Number(e.target.value) })}
              helper="Standard UAE Federal Tax (currently 5%)"
            />
            <AdminInput
              label="Studio Turnaround Buffer (Minutes)"
              type="number"
              min={0}
              max={180}
              required
              value={form.turnaroundBufferMinutes}
              onChange={(e) => setForm({ ...form, turnaroundBufferMinutes: Number(e.target.value) })}
              helper="Automatic buffer between consecutive bookings"
            />
          </div>
        </div>

        {/* Section 3: Concierge & Operational Contacts */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <PhoneCall size={18} className="text-brand-mauve" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Customer Support & Concierge Dispatch
              </h2>
              <p className="text-xs text-slate-400">
                Official contact channels linked in confirmation emails and WhatsApp floating buttons.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminInput
              label="WhatsApp Concierge Phone"
              required
              value={form.conciergePhone}
              onChange={(e) => setForm({ ...form, conciergePhone: e.target.value })}
              placeholder="e.g. +971 55 401 0465"
            />
            <AdminInput
              label="Operations Support Email"
              type="email"
              required
              value={form.conciergeEmail}
              onChange={(e) => setForm({ ...form, conciergeEmail: e.target.value })}
              placeholder="operations@yaspro.ae"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-2xl btn-brand text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-brand-violet/20"
          >
            <Save size={16} />
            <span>{isSaving ? "Saving Settings..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
