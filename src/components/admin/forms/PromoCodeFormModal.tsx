"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSwitch, AdminSelect } from "../shared/AdminFormFields";
import type { PromoCodeInput } from "@/lib/actions/offers-promo-operations";

export interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromoCodeInput) => Promise<boolean | void>;
  initialPromo: Partial<PromoCodeInput> | null;
  offerOptions: { id: string; name: string }[];
  isSubmitting?: boolean;
  error?: string | null;
}

export function PromoCodeFormModal(props: PromoCodeFormModalProps) {
  if (!props.isOpen) return null;
  return <PromoFormContent key={props.initialPromo?.id || props.initialPromo?.code || "new"} {...props} />;
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

function PromoFormContent({ isOpen, onClose, onSave, initialPromo, offerOptions, isSubmitting = false, error }: PromoCodeFormModalProps) {
  const [form, setForm] = useState<PromoCodeInput>(() => ({
    code: "",
    discountPercent: initialPromo?.discountAmount ? null : 10,
    isActive: true,
    ...initialPromo,
  }));
  const [mode, setMode] = useState<"percent" | "amount">(initialPromo?.discountAmount ? "amount" : "percent");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(initialPromo?.code);
  const eligible = form.eligibleOfferIds ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(form.code.trim())) errors.code = "3-32 letters, numbers, - or _";
    if (mode === "percent" && !(Number(form.discountPercent) >= 1 && Number(form.discountPercent) <= 100)) errors.discount = "Enter 1-100";
    if (mode === "amount" && !(Number(form.discountAmount) > 0)) errors.discount = "Enter an amount above 0";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    await onSave({
      ...form,
      code: form.code.trim().toUpperCase(),
      discountPercent: mode === "percent" ? Number(form.discountPercent) : null,
      discountAmount: mode === "amount" ? String(form.discountAmount) : null,
    });
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEdit ? "Edit Promo Code" : "New Promo Code"}
      description="Codes are validated server-side at checkout; usage limits are counted against real bookings."
      submitLabel={isEdit ? "Update Promo" : "Create Promo"}
      maxWidth="lg"
    >
      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Code"
          required
          placeholder="SUMMER25"
          value={form.code}
          error={fieldErrors.code}
          disabled={isEdit}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
        />
        <AdminInput
          label="Internal Label"
          placeholder="Summer campaign"
          value={form.label || ""}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminSelect
          label="Discount Type"
          value={mode}
          options={[{ value: "percent", label: "Percentage (%)" }, { value: "amount", label: "Fixed amount (AED)" }]}
          onChange={(e) => setMode(e.target.value as "percent" | "amount")}
        />
        {mode === "percent" ? (
          <AdminInput
            label="Percent Off"
            type="number"
            min={1}
            max={100}
            suffixNode="%"
            value={form.discountPercent ?? ""}
            error={fieldErrors.discount}
            onChange={(e) => setForm((p) => ({ ...p, discountPercent: e.target.value === "" ? null : Number(e.target.value) }))}
          />
        ) : (
          <AdminInput
            label="Amount Off"
            type="number"
            step="0.01"
            suffixNode="AED"
            value={form.discountAmount ?? ""}
            error={fieldErrors.discount}
            onChange={(e) => setForm((p) => ({ ...p, discountAmount: e.target.value }))}
          />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AdminInput
          label="Expires On"
          type="date"
          helper="Leave empty for no expiry"
          value={toDateInput(form.expiresAt)}
          onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value ? new Date(`${e.target.value}T23:59:59.999+04:00`).toISOString() : null }))}
        />
        <AdminInput
          label="Max Redemptions"
          type="number"
          min={1}
          helper="Leave empty for unlimited"
          value={form.maxUses ?? ""}
          onChange={(e) => setForm((p) => ({ ...p, maxUses: e.target.value === "" ? null : Number(e.target.value) }))}
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold text-slate-300 tracking-wide">
          Eligible Offers <span className="text-slate-500 font-normal">(none selected = all offers)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
          {offerOptions.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={eligible.includes(o.id)}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    eligibleOfferIds: e.target.checked ? [...eligible, o.id] : eligible.filter((id) => id !== o.id),
                  }))
                }
              />
              <span className="truncate">{o.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <AdminSwitch
        label="Active"
        description="Disabled codes are rejected at checkout."
        checked={form.isActive ?? true}
        onChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
      />
    </AdminModal>
  );
}
