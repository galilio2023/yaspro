import HeroSection from "@/components/sections/HeroSection";
import { OffersPreviewSection } from "@/components/sections/OffersPreviewSection";
import { GearPreviewSection } from "@/components/sections/GearPreviewSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { VirtualStudioSection } from "@/components/sections/VirtualStudioSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import InfluencersSection from "@/components/sections/InfluencersSection";


import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Above the fold */}
      <HeroSection />

      {/* Offers & Turnkey Production Bundles Showcase */}
      <OffersPreviewSection />

      {/* Cinema Gear & Equipment Rental Showcase */}
      <GearPreviewSection />

      {/* Main Feature Sections */}
      <VirtualStudioSection />
      <PartnersMarquee />
      <PortfolioSection />
      <InfluencersSection />
    </>
  );
}
