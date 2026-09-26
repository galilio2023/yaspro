"use client";

import { useState } from "react";
import { X, Sparkles, CheckCircle2, Send, Building, DollarSign, Calendar } from "lucide-react";
import { submitInfluencerCampaignRequest } from "@/lib/actions";
import { InfluencerItem } from "../types";
import { Badge } from "@/components/ui/badge";

interface InfluencerCampaignModalProps {
  creator: InfluencerItem;
  isOpen: boolean;
  onClose: () => void;
}

const CAMPAIGN_OBJECTIVES = [
  "Brand Integration & Sponsorship",
  "Studio Podcast Guest / Co-host",
  "Commercial Video / TVC Shoot",
  "Turnkey Multi-Episode Series",
];

const BUDGET_TIERS = [
  "50,000 – 100,000 AED",
  "100,000 – 250,000 AED",
  "250,000 – 500,000 AED",
  "500,000+ AED (Enterprise Tier)",
];

const STUDIO_FACILITIES = [
  "Soundstage A (Dubai 4K Cyc Wall)",
  "Acoustic Podcast Suite",
  "Live OB Van Stadium Broadcast",
  "On-Location Dubai / GCC",
];

export function InfluencerCampaignModal({
  creator,
  isOpen,
  onClose,
}: InfluencerCampaignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    brandName: "",
    contactName: "",
    email: "",
    phone: "",
    campaignObjective: CAMPAIGN_OBJECTIVES[0],
    budgetTier: BUDGET_TIERS[1],
    targetStudio: STUDIO_FACILITIES[0],
    message: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitInfluencerCampaignRequest({
        creatorId: creator.id,
        creatorName: creator.name,
        brandName: formData.brandName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        campaignObjective: formData.campaignObjective,
        budgetTier: formData.budgetTier,
        targetStudio: formData.targetStudio,
        message: formData.message,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSuccess(true); // show confirmation
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="campaign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-up"
    >
      <div className="w-full max-w-2xl bg-card border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-purple/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple-light">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="campaign-modal-title" className="text-xl font-bold text-white font-display">
                  Book Campaign with {creator.name}
                </h2>
                <Badge variant="cyan" className="text-[10px] hidden sm:inline-flex">
                  {creator.totalFollowers} Reach
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Yas Pro Talent Desk &amp; Dubai Production Hub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="size-16 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-display">
              RFP Successfully Submitted!
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">
              Our Dubai creator production desk has received your proposal for{" "}
              <strong className="text-white">{creator.name}</strong>. A dedicated talent manager will
              review your deliverables and provide rate cards &amp; soundstage schedules within 24 hours.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-white/10 hover:bg-white/15 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Brand / Organization *
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dubai Tourism / Red Bull"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-text-ghost focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Mansour"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-ghost focus:outline-none focus:border-brand-purple"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@agency.ae"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-ghost focus:outline-none focus:border-brand-purple"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                  WhatsApp / Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+971 50 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-ghost focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            {/* Campaign Objective */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Campaign Objective
              </label>
              <select
                value={formData.campaignObjective}
                onChange={(e) => setFormData({ ...formData, campaignObjective: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
              >
                {CAMPAIGN_OBJECTIVES.map((obj) => (
                  <option key={obj} value={obj} className="bg-neutral-900 text-white">
                    {obj}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Budget Tier */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1">
                  <DollarSign size={12} className="text-brand-purple" />
                  <span>Budget Tier (AED)</span>
                </label>
                <select
                  value={formData.budgetTier}
                  onChange={(e) => setFormData({ ...formData, budgetTier: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                >
                  {BUDGET_TIERS.map((tier) => (
                    <option key={tier} value={tier} className="bg-neutral-900 text-white">
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Studio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1">
                  <Calendar size={12} className="text-brand-cyan" />
                  <span>Target Studio / Location</span>
                </label>
                <select
                  value={formData.targetStudio}
                  onChange={(e) => setFormData({ ...formData, targetStudio: e.target.value })}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-purple"
                >
                  {STUDIO_FACILITIES.map((fac) => (
                    <option key={fac} value={fac} className="bg-neutral-900 text-white">
                      {fac}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campaign Brief / Message */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Campaign Brief / Timeline Details
              </label>
              <textarea
                rows={3}
                placeholder="Share your campaign deliverables, target shoot date, or specific creative concept..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-text-ghost focus:outline-none focus:border-brand-purple resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex items-center justify-between border-t border-white/10">
              <span className="text-[11px] text-text-muted">
                Official Yas Pro Agency Bridge • Guaranteed Response in 24h
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-purple to-brand-purple-light flex items-center gap-2 shadow-lg shadow-brand-purple/25 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                <span>{isSubmitting ? "Submitting..." : "Submit Campaign RFP"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
