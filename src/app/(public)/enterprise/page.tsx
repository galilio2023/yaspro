"use client";

import React, { useState } from "react";

import { EnterpriseHero } from "@/features/enterprise/components/EnterpriseHero";
import { EnterpriseTrustLogos } from "@/features/enterprise/components/EnterpriseTrustLogos";
import { HoloTwinStudioSimulator } from "@/features/enterprise/components/HoloTwinStudioSimulator";
import { KhaleejiAiTransmuter } from "@/features/enterprise/components/KhaleejiAiTransmuter";
import { MawthooqCampaignPlanner } from "@/features/enterprise/components/MawthooqCampaignPlanner";
import { ObVanTelemetryDashboard } from "@/features/enterprise/components/ObVanTelemetryDashboard";
import { ObVanCommandCenter } from "@/features/enterprise/components/ObVanCommandCenter";
import { EnterpriseTiersSection } from "@/features/enterprise/components/EnterpriseTiersSection";
import { EnterpriseRfpModal } from "@/features/enterprise/components/EnterpriseRfpModal";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { Lock, ArrowRight, Video } from "lucide-react";
import { ProductionCopilotModal } from "@/features/enterprise/components/ai/ProductionCopilotModal";
import { type ProductionProposalResponse } from "@/lib/ai/production-advisor";

import { type EnterpriseRfpInput } from "@/lib/validations";

export default function EnterprisePage() {
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [rfpInitialData, setRfpInitialData] = useState<{
    scope?: EnterpriseRfpInput["projectScope"];
    environment?: string;
    creators?: string[];
    tier?: string;
  }>({});

  const handleOpenRfp = (data?: {
    scope?: EnterpriseRfpInput["projectScope"];
    environment?: string;
    creators?: string[];
    tier?: string;
  }) => {
    if (data) {
      setRfpInitialData(data);
    } else {
      setRfpInitialData({});
    }
    setIsRfpModalOpen(true);
  };

  const handleApplyCopilotProposal = (proposal: ProductionProposalResponse) => {
    handleOpenRfp({
      scope: "turnkey_enterprise_retainer",
      tier: `${proposal.campaignConcept} (Est. ${proposal.estimatedTotalAed.toLocaleString()} AED)`,
      creators: proposal.recommendedInfluencers.map((i) => i.name),
    });
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-brand-purple selection:text-white">
      {/* 1. Executive Sovereign Hero */}
      <EnterpriseHero
        onOpenRfp={() => handleOpenRfp()}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Sovereign Trust & Enterprise Partner Logos Marquee */}
      <EnterpriseTrustLogos />

      {/* 3. HoloTwin™ Real-Time Virtual Production Stage Simulator */}
      <HoloTwinStudioSimulator
        onSelectEnvironmentForRfp={(env) =>
          handleOpenRfp({ scope: "virtual_production_xr", environment: env })
        }
      />

      {/* 4. Khaleeji-AI™ Multi-Dialect Audio & Lip-Sync Studio */}
      <KhaleejiAiTransmuter
        onSelectDialectForRfp={(dialect) =>
          handleOpenRfp({
            scope: "national_campaign_film",
            tier: `Localized for ${dialect}`,
          })
        }
      />

      {/* 5. Mawthooq-Audited Creator Syndication Engine */}
      <MawthooqCampaignPlanner
        onBundleCreators={(creators) =>
          handleOpenRfp({ scope: "mawthooq_creator_syndication", creators })
        }
      />

      {/* 6. 12-Channel Live Tactical Grid & Mobile Command Switcher */}
      <ObVanTelemetryDashboard
        onDispatchVan={() => handleOpenRfp({ scope: "ob_van_live_broadcast" })}
      />

      {/* 7. Mobile OB-VAN Live Fleet & 8-Second AI Engine */}
      <ObVanCommandCenter
        onReserveObVan={() => handleOpenRfp({ scope: "ob_van_live_broadcast" })}
      />

      {/* 8. Enterprise Retainer Tiers & SLAs */}
      <EnterpriseTiersSection
        onSelectTier={(tier) => handleOpenRfp({ tier, scope: "turnkey_enterprise_retainer" })}
      />

      {/* 9. Sovereign Client Portal & Camera-to-Cloud Vault Banner */}
      <section className="py-16 bg-slate-950/60 border-t border-white/10 relative overflow-hidden">
        <Container className="max-w-6xl relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl border border-brand-purple/30 bg-gradient-to-r from-card via-slate-900 to-brand-purple/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-purple/20 text-brand-purple-light border border-brand-purple/40">
                <Lock size={12} />
                <span>CLIENT OPERATIONS ACCESS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
                Already an Accredited Enterprise Partner?
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Access the Sovereign Media Vault to review multi-cam dailies, monitor active tender progress, and download 10-bit ProRes broadcast masters with air-gapped security.
              </p>
            </div>

            <Link
              href="/enterprise/portal"
              className="w-full md:w-auto px-8 py-4 rounded-xl text-xs font-bold btn-brand text-white shadow-xl shadow-brand-purple/25 flex items-center justify-center gap-2.5 shrink-0 transition-transform duration-200 hover:scale-[1.02]"
            >
              <Video size={15} />
              <span>Launch Client Operations Vault</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </Container>
      </section>

      {/* 10. Enterprise RFP Modal */}
      <EnterpriseRfpModal
        isOpen={isRfpModalOpen}
        onClose={() => setIsRfpModalOpen(false)}
        initialData={rfpInitialData}
      />

      {/* 11. Autonomous AI Production Copilot Modal */}
      <ProductionCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onApplyToRfp={handleApplyCopilotProposal}
      />
    </main>
  );
}

