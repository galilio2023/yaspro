"use client";

import React, { useState } from "react";
import { AdminModal } from "../shared/AdminModal";
import { AdminInput, AdminSwitch, AdminSelect } from "../shared/AdminFormFields";
import type { CmsOfferInput } from "@/lib/actions/offers-packages-operations";

export interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: CmsOfferInput) => Promise<boolean | void>;
  initialOffer: Partial<CmsOfferInput> | null;
  isSubmitting?: boolean;
  error?: string | null;
}

export function OfferFormModal(props: OfferFormModalProps) {
  if (!props.isOpen) return null;
  return <OfferFormContent key={props.initialOffer?.id || "new"} {...props} />;
}

function OfferFormContent({
  isOpen,
  onClose,
  onSave,
  initialOffer,
  isSubmitting = false,
  error,
}: OfferFormModalProps) {
  const [form, setForm] = useState<CmsOfferInput>(() => ({
    id: initialOffer?.id || "",
    category: initialOffer?.category || "bundle",
    name: initialOffer?.name || "",
    nameAr: initialOffer?.nameAr || "",
    tagline: initialOffer?.tagline || "",
    taglineAr: initialOffer?.taglineAr || "",
    description: initialOffer?.description || "",
    descriptionAr: initialOffer?.descriptionAr || "",
    price: initialOffer?.price ?? 2500,
    originalPrice: initialOffer?.originalPrice ?? "",
    savings: initialOffer?.savings || "",
    savingsAr: initialOffer?.savingsAr || "",
    hours: initialOffer?.hours ?? 5,
    badge: initialOffer?.badge || "",
    badgeAr: initialOffer?.badgeAr || "",
    image: initialOffer?.image || "/images/offers/5-hour-bundles.webp",
    features: initialOffer?.features || [],
    featuresAr: initialOffer?.featuresAr || [],
    restrictedDays: initialOffer?.restrictedDays ?? null,
    restrictedHours: initialOffer?.restrictedHours ?? null,
    restrictionNoteEn: initialOffer?.restrictionNoteEn || "",
    restrictionNoteAr: initialOffer?.restrictionNoteAr || "",
    isActive: initialOffer?.isActive ?? true,
    sortOrder: initialOffer?.sortOrder ?? 0,
  }));

  const [featuresEnText, setFeaturesEnText] = useState((initialOffer?.features || []).join("\n"));
  const [featuresArText, setFeaturesArText] = useState((initialOffer?.featuresAr || []).join("\n"));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(initialOffer?.id);

  const toggleAllowedDay = (dayIdx: number) => {
    const current = form.restrictedDays || [];
    const next = current.includes(dayIdx)
      ? current.filter((d) => d !== dayIdx)
      : [...current, dayIdx].sort((a, b) => a - b);
    setForm({ ...form, restrictedDays: next.length > 0 && next.length < 7 ? next : null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!form.name.trim()) errors.name = "English title is required";
    if (!form.nameAr.trim()) errors.nameAr = "Arabic title is required";
    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) errors.price = "Enter a valid price above 0 AED";
    const hoursNum = Number(form.hours);
    if (isNaN(hoursNum) || hoursNum < 1) errors.hours = "Must be at least 1 hour";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const parsedFeatures = featuresEnText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedFeaturesAr = featuresArText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    await onSave({
      ...form,
      price: priceNum,
      hours: hoursNum,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      features: parsedFeatures,
      featuresAr: parsedFeaturesAr,
    });
  };

  const WEEKDAYS = [
    { idx: 0, label: "Sun" },
    { idx: 1, label: "Mon" },
    { idx: 2, label: "Tue" },
    { idx: 3, label: "Wed" },
    { idx: 4, label: "Thu" },
    { idx: 5, label: "Fri" },
    { idx: 6, label: "Sat" },
  ];

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      title={isEdit ? `Edit Package: ${form.name}` : "Create New Production Package"}
      description="Configure turnkey production bundle pricing, duration, deliverables, and marketing badges."
      submitLabel={isEdit ? "Update Package" : "Create Package"}
      maxWidth="2xl"
    >
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Basic Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <AdminInput
            label="Package Slug / ID"
            value={form.id || ""}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            placeholder="e.g. 5-hour-bundles"
            disabled={isEdit}
            helper={isEdit ? "Slug cannot be changed once created" : "Auto-generated from title if blank"}
          />
          <AdminSelect
            label="Package Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as "bundle" | "offer" })}
            options={[
              { value: "bundle", label: "Production Bundle (Turnkey)" },
              { value: "offer", label: "Creator / Special Offer" },
            ]}
          />
          <AdminInput
            label="Session Hours"
            type="number"
            min={1}
            max={24}
            required
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            error={fieldErrors.hours}
          />
        </div>

        {/* Titles (EN & AR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AdminInput
            label="English Package Title"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. 5 Hour Bundles (Save AED 250)"
            error={fieldErrors.name}
          />
          <AdminInput
            label="Arabic Package Title"
            required
            value={form.nameAr}
            onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
            placeholder="باقة 5 ساعات (وفّر 250 درهم)"
            error={fieldErrors.nameAr}
            dir="rtl"
          />
        </div>

        {/* Taglines (EN & AR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AdminInput
            label="English Tagline"
            value={form.tagline || ""}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="5 Hours Recording and Professional Edit"
          />
          <AdminInput
            label="Arabic Tagline"
            value={form.taglineAr || ""}
            onChange={(e) => setForm({ ...form, taglineAr: e.target.value })}
            placeholder="5 ساعات تصوير وتسجيل مع مونتاج احترافي"
            dir="rtl"
          />
        </div>

        {/* Pricing in AED */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <AdminInput
            label="Offer Price (AED)"
            type="number"
            min={1}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="e.g. 4200"
            error={fieldErrors.price}
            helper="Excl. 5% UAE VAT"
          />
          <AdminInput
            label="Original Price (AED)"
            type="number"
            value={form.originalPrice ?? ""}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            placeholder="e.g. 4450"
            helper="Optional strikethrough price"
          />
          <AdminInput
            label="Savings Badge"
            value={form.savings || ""}
            onChange={(e) => setForm({ ...form, savings: e.target.value })}
            placeholder="Save AED 250"
          />
        </div>

        {/* Badges & Image URL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <AdminInput
            label="Badge (EN)"
            value={form.badge || ""}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="e.g. Best Deal, Pro Suite"
          />
          <AdminInput
            label="Badge (AR)"
            value={form.badgeAr || ""}
            onChange={(e) => setForm({ ...form, badgeAr: e.target.value })}
            placeholder="الأفضل قيمة"
            dir="rtl"
          />
          <AdminInput
            label="Hero Image Path"
            value={form.image || ""}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="/images/offers/5-hour-bundles.webp"
          />
        </div>

        {/* Descriptions (EN & AR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              English Description
            </label>
            <textarea
              rows={2}
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description of this turnkey bundle..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs p-3 focus:outline-none focus:border-brand-mauve"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Arabic Description
            </label>
            <textarea
              rows={2}
              value={form.descriptionAr || ""}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              placeholder="وصف مختصر للباقة..."
              dir="rtl"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs p-3 focus:outline-none focus:border-brand-mauve"
            />
          </div>
        </div>

        {/* Deliverables / Features Lists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Included Deliverables (EN, one per line)
            </label>
            <textarea
              rows={4}
              value={featuresEnText}
              onChange={(e) => setFeaturesEnText(e.target.value)}
              placeholder="5 Hours Studio Recording Access&#10;Full Multi-Angle 4K Camera Rig&#10;Dedicated Sound Engineer & Floor Tech"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs p-3 font-mono focus:outline-none focus:border-brand-mauve"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Included Deliverables (AR, one per line)
            </label>
            <textarea
              rows={4}
              value={featuresArText}
              onChange={(e) => setFeaturesArText(e.target.value)}
              placeholder="5 ساعات استخدام كامل للاستوديو&#10;منظومة تصوير 4K متعددة الزوايا&#10;مهندس صوت وتقني استوديو مخصص"
              dir="rtl"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs p-3 font-arabic focus:outline-none focus:border-brand-mauve"
            />
          </div>
        </div>

        {/* Allowed Days of Week (Step 2 Schedule Restriction) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Allowed Days of Week (Step 2 Calendar Filter)
            </label>
            {form.restrictedDays && form.restrictedDays.length > 0 && (
              <button
                type="button"
                onClick={() => setForm({ ...form, restrictedDays: null })}
                className="text-[11px] text-brand-mauve hover:underline"
              >
                Allow all days
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => {
              const isSelected = form.restrictedDays ? form.restrictedDays.includes(day.idx) : true;
              return (
                <button
                  key={day.idx}
                  type="button"
                  onClick={() => toggleAllowedDay(day.idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    isSelected
                      ? "bg-brand-violet/25 border-brand-mauve text-white"
                      : "bg-white/[0.02] border-white/10 text-slate-500"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scheduling Restriction Note */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <AdminInput
            label="Schedule Restriction Note (EN)"
            value={form.restrictionNoteEn || ""}
            onChange={(e) => setForm({ ...form, restrictionNoteEn: e.target.value })}
            placeholder="Available Sun-Thu, 9am - 2pm only"
            helper="Leave empty if available every day"
          />
          <AdminInput
            label="Schedule Restriction Note (AR)"
            value={form.restrictionNoteAr || ""}
            onChange={(e) => setForm({ ...form, restrictionNoteAr: e.target.value })}
            placeholder="متاح من الأحد إلى الخميس فقط"
            dir="rtl"
          />
        </div>

        {/* Active Toggle */}
        <div className="pt-2 border-t border-white/10">
          <AdminSwitch
            label="Active on Public Website"
            description="When enabled, this bundle appears on the public website and in the client booking wizard."
            checked={Boolean(form.isActive)}
            onChange={(checked) => setForm({ ...form, isActive: checked })}
          />
        </div>
      </div>
    </AdminModal>
  );
}
