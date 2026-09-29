import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";

// Code-split below-the-fold sections so initial page load and navigation are instant
const ServicesSection = dynamic(
  () => import("@/components/sections/ServicesSection").then((m) => m.ServicesSection),
  { ssr: true }
);

const VirtualStudioSection = dynamic(
  () => import("@/components/sections/VirtualStudioSection").then((m) => m.VirtualStudioSection),
  { ssr: true }
);

const PortfolioSection = dynamic(
  () => import("@/components/sections/PortfolioSection").then((m) => m.PortfolioSection),
  { ssr: true }
);

const AiEcosystemSection = dynamic(
  () => import("@/components/sections/AiEcosystemSection").then((m) => m.AiEcosystemSection),
  { ssr: true }
);

const GearRentalSection = dynamic(
  () => import("@/components/sections/GearRentalSection").then((m) => m.GearRentalSection),
  { ssr: true }
);

const InfluencersSection = dynamic(
  () => import("@/components/sections/InfluencersSection"),
  { ssr: true }
);

const CtaSection = dynamic(
  () => import("@/components/sections/CtaSection").then((m) => m.CtaSection),
  { ssr: true }
);

export default function HomePage() {
  return (
    <>
      {/* Above the fold — loaded immediately */}
      <HeroSection />
      <PartnersMarquee />

      {/* Below the fold — code-split into distinct on-demand chunks */}
      <ServicesSection />
      <VirtualStudioSection />
      <PortfolioSection />
      <AiEcosystemSection />
      <GearRentalSection />
      <InfluencersSection />
      <CtaSection />
    </>
  );
}
