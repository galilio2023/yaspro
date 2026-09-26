import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { PILLARS } from "../data";
import { SectionHeader } from "@/components/ui/section-header";
import { Shield } from "lucide-react";

interface AboutPillarsProps {
  headingId?: string;
}

export function AboutPillars({ headingId }: AboutPillarsProps) {
  return (
    <div className="mb-20">
      <SectionHeader
        headingId={headingId}
        badge="Foundations"
        badgeVariant="default"
        badgeIcon={<Shield size={13} />}
        title="Our Core"
        gradientText="Pillars"
        description="What sets Yas Pro apart is our end-to-end integration of cutting-edge technology and artistic vision."
      />

      <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PILLARS.map((pillar) => (
          <StaggerItem key={pillar.title} className="h-full">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-7 h-full flex flex-col hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all duration-300">
              <div className="size-12 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center mb-5 text-brand-purple" aria-hidden="true">
                <pillar.icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display">
                {pillar.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
