import HeroSection from "@/components/sections/HeroSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { StudiosShowcaseSection } from "@/components/sections/StudiosShowcaseSection";
import { VirtualStudioSection } from "@/components/sections/VirtualStudioSection";
import { PortfolioSection } from "@/components/sections/PortfolioSection";
import { GearRentalSection } from "@/components/sections/GearRentalSection";
import InfluencersSection from "@/components/sections/InfluencersSection";
import { YasGroupEcosystem } from "@/components/sections/YasGroupEcosystem";
import { CtaSection } from "@/components/sections/CtaSection";

import { getCachedStudios } from "@/lib/cached-queries";
import { getDynamicSoundstages } from "@/features/studios/data";

export const revalidate = 3600;

export default async function HomePage() {
  const cmsStudios = await getCachedStudios();
  const initialStudios = getDynamicSoundstages(cmsStudios);

  return (
    <>
      {/* Above the fold */}
      <HeroSection />
      <PartnersMarquee />

      {/* Main Feature Sections */}
      <StudiosShowcaseSection initialStudios={initialStudios} />
      <VirtualStudioSection />
      <PortfolioSection />
      <GearRentalSection />
      <InfluencersSection />
      <YasGroupEcosystem />
      <CtaSection />
    </>
  );
}
