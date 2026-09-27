import { Suspense } from "react";
import type { Metadata } from "next";
import { GearExplorer } from "@/features/gear/components/GearExplorer";
import { GEAR_DATA } from "@/features/gear/data";
import { getCmsEquipment } from "@/lib/cms-actions";
import { SectionHeader } from "@/components/ui/section-header";
import { Camera } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import type { GearItem, GearCategory } from "@/features/gear/types";

export const metadata: Metadata = {
  title: "Rent Equipment",
  description: "Rent cinema cameras, lenses, lighting, and turnkey broadcast packages across UAE, Egypt, and Jordan.",
};

export default async function ShopPage() {
  const cmsEquipment = await getCmsEquipment();

  const gearToDisplay: GearItem[] = cmsEquipment.map((g) => ({
    id: g.id,
    name: g.name,
    category: g.category as GearCategory,
    categoryLabel:
      g.category === "cameras"
        ? "Cinema Camera"
        : g.category === "bundles"
        ? "Turnkey Kit"
        : g.category === "lighting"
        ? "Studio Lighting"
        : g.category === "lenses"
        ? "Cinema Lens"
        : "Production Audio",
    dailyRate: Number(g.dailyRate),
    securityDeposit: Number(g.securityDeposit || 0),
    specs: g.specs || [],
    description: g.description || "",
    isPopular: g.isPopular,
    isKit: g.isKit,
    includedInKit: g.includedInKit || [],
    image: g.imageUrl || "/images/gear/arri-alexa-mini-lf.jpg",
  }));

  const initialGear = gearToDisplay.length > 0 ? gearToDisplay : GEAR_DATA;

  return (
    <Section id="shop-page" aria-labelledby="shop-title" className="py-12 md:py-20 bg-background">
      <Container>
        <SectionHeader
          headingId="shop-title"
          as="h1"
          badge="Cinema & Broadcast Gear"
          badgeVariant="gold"
          badgeIcon={<Camera size={13} />}
          title="Rent Professional"
          gradientText="Equipment"
          description="Cinema cameras, anamorphic optics, wireless audio, and turnkey OB van packages. Available for rental across Dubai, Cairo, and Amman."
        />

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <GearExplorer initialGear={initialGear} />
        </Suspense>
      </Container>
    </Section>
  );
}
