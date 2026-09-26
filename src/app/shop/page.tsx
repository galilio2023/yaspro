import type { Metadata } from "next";
import { GearExplorer } from "@/features/gear/components/GearExplorer";
import { GEAR_DATA } from "@/features/gear/data";
import { SectionHeader } from "@/components/ui/section-header";
import { Camera } from "lucide-react";

import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Rent Equipment",
  description: "Rent cinema cameras, lenses, lighting, and turnkey broadcast packages across UAE, Egypt, and Jordan.",
};

export default function ShopPage() {
  return (
    <Section id="shop-page" aria-labelledby="shop-title" className="py-12 md:py-20 bg-background">
      <Container>
        <SectionHeader
          headingId="shop-title"
          as="h1"
          badge="Cinema &amp; Broadcast Gear"
          badgeVariant="gold"
          badgeIcon={<Camera size={13} />}
          title="Rent Professional"
          gradientText="Equipment"
          description="Cinema cameras, anamorphic optics, wireless audio, and turnkey OB van packages. Available for rental across Dubai, Cairo, and Amman."
        />

        <GearExplorer initialGear={GEAR_DATA} />
      </Container>
    </Section>
  );
}
