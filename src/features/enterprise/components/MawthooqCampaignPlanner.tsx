"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Check,
  Plus,
  ArrowRight,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ENTERPRISE_CREATORS } from "../data";
import { MawthooqAuditorModal } from "./MawthooqAuditorModal";

interface MawthooqCampaignPlannerProps {
  onBundleCreators?: (creators: string[]) => void;
}

export function MawthooqCampaignPlanner({ onBundleCreators }: MawthooqCampaignPlannerProps) {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([
    ENTERPRISE_CREATORS[0].id,
    ENTERPRISE_CREATORS[2].id,
  ]);


  const toggleCreator = (id: string) => {
    setSelectedCreatorIds((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((c) => c !== id) : prev) : [...prev, id]
    );
  };

  const selectedCreators = ENTERPRISE_CREATORS.filter((c) => selectedCreatorIds.includes(c.id));

  // Compute aggregated campaign stats
  const totalCombinedFollowers = selectedCreators.reduce((acc, curr) => acc + curr.rawFollowers, 0);
  const avgSaudiReach = Math.round(
    selectedCreators.reduce((acc, curr) => acc + curr.saudiReachPct, 0) / selectedCreators.length
  );
  const avgUaeReach = Math.round(
    selectedCreators.reduce((acc, curr) => acc + curr.uaeReachPct, 0) / selectedCreators.length
  );
  const totalEstimatedCostAED = selectedCreators.reduce((acc, curr) => acc + curr.baseCampaignFeeAED, 0);

  return (
    <section id="mawthooq-planner" className="py-20 bg-background border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="KSA GAMR & UAE NMC RegTech"
          badgeVariant="live"
          badgeIcon={<ShieldCheck size={13} className="text-emerald-400" />}
          title="Mawthooq-Audited Creator Syndication &"
          gradientText="Enterprise Campaign Builder"
          description="Build high-impact government and brand campaigns with Yas Pro's exclusive tier-one creator roster. Guaranteed 100% regulatory compliance, verified tax IDs, and escrow settlement."
          className="mb-10 text-center"
        />

        {/* ─── 1. Creator Selection Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ENTERPRISE_CREATORS.map((creator) => {
            const isSelected = selectedCreatorIds.includes(creator.id);
            return (
              <div
                key={creator.id}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => toggleCreator(creator.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCreator(creator.id);
                  }
                }}
                className={`relative rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isSelected
                    ? "border-emerald-500/80 bg-card ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10"
                    : "border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/90"
                }`}
              >

                <div>
                  {/* Top Bar with Selection Pill & Flag */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl" title="Nationality">{creator.flag}</span>
                    <div
                      className={`size-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                          : "border border-white/20 bg-white/5 text-text-secondary group-hover:border-white/40"
                      }`}
                    >
                      {isSelected ? <Check size={13} strokeWidth={3} /> : <Plus size={13} />}
                    </div>
                  </div>

                  {/* Avatar & Names */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative size-12 rounded-xl overflow-hidden border border-white/15 shrink-0">
                      <Image
                        src={creator.avatar}
                        alt={creator.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {creator.name}
                      </div>
                      <div className="text-xs font-arabic text-text-secondary">{creator.arabicName}</div>
                      <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                        {creator.totalFollowers}
                      </div>
                    </div>
                  </div>

                  {/* Niche */}
                  <p className="text-[11px] text-text-secondary mb-3 line-clamp-2 leading-relaxed">
                    {creator.niche}
                  </p>
                </div>

                {/* Mawthooq Badge & Reach Footer */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 mb-1.5 font-bold">
                    <ShieldCheck size={12} />
                    <span>{creator.mawthooqLicenseId}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                    <span>🇸🇦 KSA: {creator.saudiReachPct}%</span>
                    <span>🇦🇪 UAE: {creator.uaeReachPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 2. Live Aggregated Campaign Telemetry Panel ─── */}
        <div className="p-6 rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mb-2">
                <FileCheck2 size={14} />
                <span>ACTIVE CAMPAIGN SYNDICATION SUMMARY</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {selectedCreators.length} Selected Creators ({selectedCreators.map((c) => c.name).join(", ")})
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
                All agreements execute under pre-cleared GAMR Mawthooq advertising licensing and UAE National Media Council commercial guidelines.
              </p>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-900/90 p-4 rounded-2xl border border-white/10">
              <div>
                <div className="text-[11px] text-text-secondary font-mono">Combined Audience</div>
                <div className="text-xl font-black text-white font-mono">{totalCombinedFollowers}M+</div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <div className="text-[11px] text-emerald-400 font-mono font-bold">Avg KSA Penetration</div>
                <div className="text-xl font-black text-emerald-400 font-mono">{avgSaudiReach}%</div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <div className="text-[11px] text-brand-cyan font-mono font-bold">Avg UAE Penetration</div>
                <div className="text-xl font-black text-brand-cyan font-mono">{avgUaeReach}%</div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <div className="text-[11px] text-brand-gold font-mono font-bold">Base Package Range</div>
                <div className="text-xl font-black text-brand-gold font-mono">
                  {totalEstimatedCostAED.toLocaleString()} AED
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <AlertCircle size={14} className="text-brand-purple-light shrink-0" />
              <span>Includes Yas Pro 4K Studio shoots, multi-camera direction, and 9:16 viral cutdowns.</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <ShieldCheck size={14} />
                <span>Verify GAMR Certificate</span>
              </button>

              {onBundleCreators && (
                <button
                  type="button"
                  onClick={() => onBundleCreators(selectedCreators.map((c) => c.name))}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Bundle Creators into RFP</span>
                  <ArrowRight size={13} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mawthooq Verification Certificate Modal */}
        <MawthooqAuditorModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          creatorSlugs={selectedCreatorIds}
        />
      </Container>
    </section>
  );
}

