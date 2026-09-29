import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { TEAM_MEMBERS } from "../data";
import { SectionHeader } from "@/components/ui/section-header";
import { Users } from "lucide-react";

interface TeamGridProps {
  headingId?: string;
}

export function TeamGrid({ headingId }: TeamGridProps) {
  return (
    <div>
      <SectionHeader
        headingId={headingId}
        badge="Executive Leadership"
        badgeVariant="cyan"
        badgeIcon={<Users size={13} />}
        title="Our"
        gradientText="Leadership"
        description="Experienced media directors, broadcast engineers, and digital innovators leading Yas Pro forward."
      />

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
        {TEAM_MEMBERS.map((member) => (
          <StaggerItem as="article" key={member.role} className="h-full">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 flex flex-col justify-between h-full hover:border-brand-purple/40 hover:bg-white/[0.06] transition-all duration-300">
              <div>
                <span className="text-xs font-semibold text-brand-purple-light uppercase tracking-wider block mb-2 font-mono">
                  {member.role}
                </span>
                <h3 className="text-xl font-bold text-white mb-3 font-display">
                  {member.name}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {member.focus}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
