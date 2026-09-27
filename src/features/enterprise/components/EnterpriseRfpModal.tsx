"use client";

import React, { useState, useEffect, useEffectEvent, useRef, useId } from "react";

import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Radio,
  Copy,
  Check,
} from "lucide-react";
import { submitEnterpriseRfp } from "@/lib/actions";
import { type EnterpriseRfpInput } from "@/lib/validations";

interface EnterpriseRfpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    scope?: EnterpriseRfpInput["projectScope"];
    environment?: string;
    creators?: string[];
    tier?: string;
  };
}

export function EnterpriseRfpModal({ isOpen, onClose, initialData }: EnterpriseRfpModalProps) {
  return isOpen ? <EnterpriseRfpDialog onClose={onClose} initialData={initialData} /> : null;
}

function EnterpriseRfpDialog({ onClose, initialData }: Omit<EnterpriseRfpModalProps, "isOpen">) {
  const fieldId = useId();
  const closeDialog = useEffectEvent(onClose);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{ referenceCode: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<EnterpriseRfpInput>({
    organizationName: "",
    organizationType: "government_ministry",
    contactName: "",
    contactTitle: "",
    workEmail: "",
    phone: "",
    country: "UAE",
    projectScope: initialData?.scope || "virtual_production_xr",
    targetLocations: ["Dubai (HQ)"],
    estimatedBudget: "150k_to_500k",
    requiresMawthooqCompliance: Boolean(initialData?.creators && initialData.creators.length > 0),
    requiresObVan: false,
    projectTimeline: "Next 30–60 Days",
    selectedCreators: initialData?.creators || [],
    digitalTwinEnvironment: initialData?.environment || "",
    notes: initialData?.tier ? `Interested in tier: ${initialData.tier}` : "",
  });

  // Each opening mounts a fresh dialog, including its form and submission state.
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = modalPanelRef.current;
    const focusableElements = () => Array.from(panel?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]'
    ) ?? []).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
      if (e.key !== "Tab") return;
      const elements = focusableElements();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        e.preventDefault();
        panel?.focus();
      } else if (!panel?.contains(document.activeElement) || document.activeElement === panel) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (focusableElements()[0] ?? panel)?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const handleCopyCode = (code: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalPanelRef.current && !modalPanelRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitEnterpriseRfp(formData);
      if (res.success && res.referenceCode) {
        setSuccessResult({
          referenceCode: res.referenceCode,
          message: res.message || "Your enterprise RFP has been safely recorded.",
        });
      } else {
        setErrorMessage(res.message || "Failed to submit proposal. Please review your details.");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationToggle = (loc: string) => {
    setFormData((prev) => ({
      ...prev,
      targetLocations: prev.targetLocations.includes(loc)
        ? prev.targetLocations.filter((l) => l !== loc)
        : [...prev.targetLocations, loc],
    }));
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${fieldId}-title`}
    >
      <div
        ref={modalPanelRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950 p-6 sm:p-8 shadow-2xl my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {successResult ? (
          <div className="py-8 text-center">
            <div className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 id={`${fieldId}-title`} className="text-2xl font-black text-white mb-2">
              Enterprise RFP Received
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
              {successResult.message}
            </p>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto mb-6">
              <div className="text-[11px] font-mono text-text-muted">REFERENCE CODE</div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-xl font-black text-brand-cyan font-mono">
                  {successResult.referenceCode}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(successResult.referenceCode)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Copy Reference Code"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {copied ? "Copied to clipboard!" : "Direct Yas Pro Executive assigned"}
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-white/90 transition-colors cursor-pointer shadow-lg"
            >
              Return to Portal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono text-brand-purple-light bg-brand-purple/10 border border-brand-purple/30 mb-2">
                <Building2 size={12} />
                <span>CONFIDENTIAL PROCUREMENT INTAKE</span>
              </div>
              <h2 id={`${fieldId}-title`} className="text-2xl font-black text-white">
                Enterprise Production RFP
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">
                For ministries, giga-projects, broadcast rights holders, and regional brands.
              </p>
            </div>


            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Row 1: Org name & type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${fieldId}-organizationName`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Organization / Entity Name *
                </label>
                <input id={`${fieldId}-organizationName`}
                  type="text"
                  required
                  placeholder="e.g. Dubai Municipality / Zain Group"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor={`${fieldId}-organizationType`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Organization Type
                </label>
                <select id={`${fieldId}-organizationType`}
                  value={formData.organizationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizationType: e.target.value as EnterpriseRfpInput["organizationType"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                >
                  <option value="government_ministry">Government Ministry / Sovereign Authority</option>
                  <option value="giga_project">Giga-Project (NEOM / Diriyah / Red Sea)</option>
                  <option value="multinational_brand">Multinational Brand / Enterprise</option>
                  <option value="telecom_operator">Telecom & Media Operator</option>
                  <option value="advertising_agency">Global Advertising Agency</option>
                  <option value="sports_league">Sports Federation / Esports League</option>
                </select>
              </div>
            </div>

            {/* Row 2: Contact name & work email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${fieldId}-contactName`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Contact Person & Title *
                </label>
                <input id={`${fieldId}-contactName`}
                  type="text"
                  required
                  placeholder="e.g. Ahmed Al-Mansoori (Director of Media)"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor={`${fieldId}-workEmail`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Corporate / Government Email *
                </label>
                <input id={`${fieldId}-workEmail`}
                  type="email"
                  required
                  placeholder="name@organization.gov.ae"
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                />
              </div>
            </div>

            {/* Row 3: Phone & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${fieldId}-phone`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Direct Phone / WhatsApp *
                </label>
                <input id={`${fieldId}-phone`}
                  type="tel"
                  required
                  placeholder="+971 50 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor={`${fieldId}-country`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Country / Operating Market
                </label>
                <select id={`${fieldId}-country`}
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      country: e.target.value as EnterpriseRfpInput["country"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                >
                  <option value="UAE">🇦🇪 United Arab Emirates</option>
                  <option value="Saudi Arabia">🇸🇦 Kingdom of Saudi Arabia</option>
                  <option value="Egypt">🇪🇬 Egypt</option>
                  <option value="Jordan">🇯🇴 Jordan</option>
                  <option value="Qatar">🇶🇦 Qatar</option>
                  <option value="Kuwait">🇰🇼 Kuwait</option>
                  <option value="International">🌍 International / Global</option>
                </select>
              </div>
            </div>

            {/* Row 4: Scope & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${fieldId}-projectScope`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Primary Production Scope
                </label>
                <select id={`${fieldId}-projectScope`}
                  value={formData.projectScope}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      projectScope: e.target.value as EnterpriseRfpInput["projectScope"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                >
                  <option value="virtual_production_xr">HoloTwin™ In-Camera VFX & Virtual Production</option>
                  <option value="ob_van_live_broadcast">OB-VAN Multi-Cam Live Broadcast</option>
                  <option value="national_campaign_film">Government / TVC National Campaign Film</option>
                  <option value="mawthooq_creator_syndication">Mawthooq-Audited Influencer Campaign</option>
                  <option value="turnkey_enterprise_retainer">Annual Sovereign Media Retainer</option>
                </select>
              </div>

              <div>
                <label htmlFor={`${fieldId}-estimatedBudget`} className="block text-xs font-semibold text-text-secondary mb-1">
                  Estimated Budget Range
                </label>
                <select id={`${fieldId}-estimatedBudget`}
                  value={formData.estimatedBudget}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedBudget: e.target.value as EnterpriseRfpInput["estimatedBudget"],
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none"
                >
                  <option value="50k_to_150k">$50,000 – $150,000 USD (AED 180k–550k)</option>
                  <option value="150k_to_500k">$150,000 – $500,000 USD (AED 550k–1.8M)</option>
                  <option value="500k_plus">$500,000+ USD (AED 1.8M+)</option>
                  <option value="custom_annual_retainer">Annual Enterprise Retainer</option>
                </select>
              </div>
            </div>


            {/* Production Hub Checkboxes */}
            <div>
              <div id={`${fieldId}-hubs`} className="block text-xs font-semibold text-text-secondary mb-1.5">
                Target Production Hubs
              </div>
              <div role="group" aria-labelledby={`${fieldId}-hubs`} className="flex flex-wrap gap-2">
                {["Dubai (HQ)", "Riyadh (KSA)", "Cairo", "Amman"].map((loc) => {
                  const isChecked = formData.targetLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      aria-pressed={isChecked}
                      type="button"
                      onClick={() => handleLocationToggle(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isChecked
                          ? "bg-brand-purple text-white border-brand-purple"
                          : "bg-slate-900 text-text-secondary border-white/10 hover:border-white/20"
                      }`}
                    >
                      {isChecked && "✓ "}
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggle checkboxes for Mawthooq and OB-VAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresMawthooqCompliance}
                  onChange={(e) =>
                    setFormData({ ...formData, requiresMawthooqCompliance: e.target.checked })
                  }
                  className="rounded accent-emerald-500"
                />
                <span className="flex items-center gap-1 font-semibold text-white">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Mawthooq RegTech Audit
                </span>
              </label>

              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresObVan}
                  onChange={(e) => setFormData({ ...formData, requiresObVan: e.target.checked })}
                  className="rounded accent-brand-cyan"
                />
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Radio size={13} className="text-brand-cyan" />
                  Include Mobile OB-VAN Unit
                </span>
              </label>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor={`${fieldId}-notes`} className="block text-xs font-semibold text-text-secondary mb-1">
                Project Scope Details / Deliverables
              </label>
                <textarea id={`${fieldId}-notes`}
                rows={3}
                placeholder="Describe your production requirements, creative brief, or tender timeline..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:border-brand-purple focus:outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-brand-purple to-indigo-600 hover:from-brand-purple-light hover:to-indigo-500 text-white shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Generating Proposal Code...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>Transmit Enterprise RFP to Yas Pro Board</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
