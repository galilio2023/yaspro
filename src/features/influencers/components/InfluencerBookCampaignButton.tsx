"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { InfluencerCampaignModal } from "./InfluencerCampaignModal";
import type { InfluencerItem } from "../types";

export interface InfluencerBookCampaignButtonProps {
  creator: InfluencerItem;
}

export function InfluencerBookCampaignButton({
  creator,
}: InfluencerBookCampaignButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="w-full min-h-[44px] py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-brand-purple to-brand-purple-light hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/30 transition-all cursor-pointer"
      >
        <Sparkles size={15} />
        <span>Request Campaign RFP with {creator.name}</span>
      </button>

      <InfluencerCampaignModal
        creator={creator}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
