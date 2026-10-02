import HeroSection from "@/components/sections/HeroSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { VirtualStudioSection } from "@/components/sections/VirtualStudioSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { GearRentalSection } from "@/components/sections/GearRentalSection";
import InfluencersSection from "@/components/sections/InfluencersSection";
import { CtaSection } from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      {/* Above the fold */}
      <HeroSection />
      <PartnersMarquee />

      {/* Main Feature Sections */}
     {/*<ServicesSection />*/}
      <VirtualStudioSection />
      <PortfolioSection />
        {/*<AiEcosystemSection />*/}
      <GearRentalSection />
      <InfluencersSection />
      <CtaSection />
    </>
  );
}
