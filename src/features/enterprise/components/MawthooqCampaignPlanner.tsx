"use client";

import React, { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { ENTERPRISE_CREATORS } from "../data";
import { MawthooqAuditorModal } from "./MawthooqAuditorModal";
import { MawthooqCreatorCard } from "./mawthooq/MawthooqCreatorCard";
import { MawthooqTelemetryPanel } from "./mawthooq/MawthooqTelemetryPanel";

interface CampaignPlannerProps {
  onBundleCreators?: (creators: string[]) => void;
}

export function MawthooqCampaignPlanner({ onBundleCreators }: CampaignPlannerProps) {
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([
    "aboflah",
    "noor-stars",
  ]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const toggleCreator = (id: string) => {
    setSelectedCreatorIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectedCreators = ENTERPRISE_CREATORS.filter((c) =>
    selectedCreatorIds.includes(c.id)
  );

  return (
    <section id="mawthooq-compliance" className="py-16 sm:py-20 bg-background border-b border-white/10 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

      <Container className="relative z-10 max-w-6xl">
        <SectionHeader
          badge="KSA GAMR Mawthooq & UAE NMC Compliance"
          badgeVariant="cyan"
          badgeIcon={<ShieldCheck size={13} className="text-brand-teal" />}
          title="Sovereign Creator Portfolio &"
          gradientText="Government Mawthooq Synergy"
          description="Legally pre-cleared, enterprise-scale creator activations across the GCC. Zero regulatory friction, licensed commercial disclosures, and unified multi-market escrow settlements."
          className="mb-8 sm:mb-10 text-center"
        />

        {/* ─── 1. Responsive 2-Col on mobile, 4-Col on desktop ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {ENTERPRISE_CREATORS.map((creator) => {
            const isSelected = selectedCreatorIds.includes(creator.id);
            return (
              <MawthooqCreatorCard
                key={creator.id}
                creator={creator}
                isSelected={isSelected}
                onToggle={() => toggleCreator(creator.id)}
              />
            );
          })}
        </div>

        {/* ─── 2. Live Aggregated Campaign Telemetry Panel ─── */}
        <MawthooqTelemetryPanel
          selectedCreators={selectedCreators}
          onOpenAuditModal={() => setIsAuditModalOpen(true)}
          onBundleCreators={onBundleCreators}
        />

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
