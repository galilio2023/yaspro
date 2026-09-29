"use client";

import React from "react";
import { Check, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ENTERPRISE_TIERS } from "../data";

interface EnterpriseTiersProps {
  onSelectTier: (tierName: string) => void;
}

export function EnterpriseTiersSection({ onSelectTier }: EnterpriseTiersProps) {
  return (
    <section id="enterprise-tiers" className="py-12 sm:py-16 lg:py-28 bg-background border-b border-white/10 relative overflow-hidden">
      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="Enterprise Retainers & SLA Guarantees"
          badgeVariant="purple"
          badgeIcon={<Sparkles size={13} className="text-brand-purple-light" />}
          title="Sovereign Media Operations"
          gradientText="Production Retainer Tiers"
          description="Dedicated soundstage allocations, priority OB-Van dispatch, and full-stack cinema crews for ministries, giga-projects, and multinational agencies."
          className="mb-12 text-center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ENTERPRISE_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative group ${
                tier.popular
                  ? "border-brand-purple bg-gradient-to-b from-card via-card to-brand-purple/10 ring-2 ring-brand-purple/40 shadow-2xl shadow-brand-purple/20"
                  : "border-white/10 bg-card/60 hover:border-white/20 hover:bg-card/90"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-purple to-indigo-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {tier.badge}
                </div>
              )}

              <div>
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-purple-lighter transition-colors">
                    {tier.name}
                  </h3>
                  <div className="text-xs font-arabic text-text-secondary">{tier.arabicName}</div>
                  <div className="text-xs text-text-muted mt-2 font-medium">{tier.targetClientele}</div>
                </div>

                {/* Pricing Display */}
                <div className="mb-6 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">{tier.monthlyInvestment}</div>
                  <div className="text-[11px] text-text-secondary font-mono mt-0.5">{tier.yearlyInvestment}</div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                      <div className="size-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {/* SLA Tag */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-brand-purple-light font-mono mb-4 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="shrink-0" />
                  <span>SLA: {tier.slaGuarantee}</span>
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => onSelectTier(tier.name)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    tier.popular
                      ? "btn-brand text-white shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/15"
                  }`}
                >
                  <span>Select {tier.name}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
