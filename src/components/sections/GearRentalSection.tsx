import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { GEAR_DATA } from "@/features/gear/data";
import { GearCard } from "@/features/gear/components/GearCard";

interface GearRentalSectionProps {
  limit?: number;
}

export function GearRentalSection({ limit = 4 }: GearRentalSectionProps) {
  const featuredGear = GEAR_DATA.slice(0, limit);

  return (
    <Section
      id="gear-rental"
      aria-labelledby="gear-rental-title"
      className="bg-secondary border-t border-white/10"
    >
      <Container>
        <SectionHeader
          headingId="gear-rental-title"
          badge="Cinema &amp; Broadcast Rental Hub"
          badgeVariant="gold"
          badgeIcon={<Camera size={13} />}
          title="Turnkey"
          gradientText="Production Gear"
          description="Direct rental of high-end ARRI, RED, Sony cinema cameras, motorized lighting grids, and live OB-VAN packages."
        />

        <StaggerContainer as="ul" role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch w-full">
          {featuredGear.map((item) => (
            <StaggerItem as="li" key={item.id} className="h-full">
              <GearCard
                item={item}
                variant="compact"
                actionHref="/shop"
                actionLabel="Reserve"
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Centered "Explore Inventory" CTA below grid */}
        <FadeUp delay={0.15} className="flex justify-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/15 text-white hover:bg-white/5 transition-all text-xs font-semibold"
          >
            <span>Explore Full Inventory ({GEAR_DATA.length} Items)</span>
            <ArrowRight size={14} />
          </Link>
        </FadeUp>
      </Container>
    </Section>
  );
}
