import HeroSection from "@/components/sections/HeroSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { ServicesSection } from "@/components/sections/ServicesSection";
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

      {/* Second Section: Shape Your Content With Us */}
      <ServicesSection />

      {/* Main Feature Sections */}
      <VirtualStudioSection />
      <PartnersMarquee />
      <PortfolioSection />
      <InfluencersSection />
    </>
  );
}
