import { Video, ShieldCheck, Clock, Award, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { SERVICES_DATA } from "./services.data";
import { ServiceCard } from "./ServiceCard";

const HIGHLIGHT_PERKS = [
  { icon: Award, text: "GCC & UAE Tier-One Certified Facilities" },
  { icon: Video, text: "Cinema 8K RAW & Multi-Cam 4K DCI" },
  { icon: Clock, text: "24/7 Crew & Fast-Response OB-Van Units" },
  { icon: ShieldCheck, text: "Guaranteed Turnkey Master Deliverables" },
];

export function ServicesSection() {
  return (
    <Section
      id="services"
      aria-labelledby="services-title"
      className="bg-background relative overflow-hidden py-20 lg:py-28 border-b border-white/5"
      background={
        <>
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 right-1/4 size-[400px] rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
            }}
          />
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      }
    >
      <Container className="relative z-10">
        <SectionHeader
          headingId="services-title"
          badge="Turnkey Production Pillars"
          badgeVariant="cyan"
          badgeIcon={<Sparkles size={13} className="text-brand-cyan" />}
          title="Shape Your Content"
          gradientText="With Us"
          description="From high-capacity soundproof cyclorama stages to mobile live OB-VAN broadcasting and cinema drone cinematography — built for government entities, prestige brands, and tier-one creators."
        />

        <StaggerContainer
          as="ul"
          role="list"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full mb-14"
        >
          {SERVICES_DATA.map((svc) => (
            <StaggerItem
              as="li"
              key={svc.id}
              id={svc.id === "ob-van-broadcast" ? "ob-van" : svc.id}
              className="h-full scroll-mt-24"
            >
              <ServiceCard service={svc} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Feature Highlights Ribbon */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {HIGHLIGHT_PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 text-left py-1 text-text-secondary text-xs font-mono"
              >
                <div className="size-7 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-brand-purple-light" />
                </div>
                <span>{perk.text}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
