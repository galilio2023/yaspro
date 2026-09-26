"use client";

import { useState } from "react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { InfluencerCard } from "./InfluencerCard";
import { InfluencerFilters } from "./InfluencerFilters";
import { INFLUENCERS_DATA } from "../data";
import type { InfluencerItem } from "../types";

export interface InfluencersExplorerProps {
  initialInfluencers?: readonly InfluencerItem[];
}

export function InfluencersExplorer({
  initialInfluencers = INFLUENCERS_DATA,
}: InfluencersExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNationality, setSelectedNationality] = useState<string>("all");

  const nationalities = ["all", ...Array.from(new Set(initialInfluencers.map((i) => i.nationality)))];

  const filtered = initialInfluencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNation = selectedNationality === "all" || inf.nationality === selectedNationality;
    return matchesSearch && matchesNation;
  });

  const handleReset = () => {
    setSearchTerm("");
    setSelectedNationality("all");
  };

  return (
    <div className="w-full">
      {/* Search & Country Filter Bar */}
      <FadeUp delay={0.1}>
        <InfluencerFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          nationalities={nationalities}
          selectedNationality={selectedNationality}
          onSelectNationality={setSelectedNationality}
        />
      </FadeUp>

      {/* Influencer Grid or Empty State */}
      {filtered.length > 0 ? (
        <StaggerContainer as="ul" role="list" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-stretch">
          {filtered.map((creator) => (
            <StaggerItem as="li" key={creator.id} className="h-full">
              <InfluencerCard creator={creator} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No Creators Found"
          description="We couldn't find any creators matching your filter criteria. Try searching with a different term or view all creators."
          action={
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl">
              Reset Filters
            </Button>
          }
        />
      )}
    </div>
  );
}
