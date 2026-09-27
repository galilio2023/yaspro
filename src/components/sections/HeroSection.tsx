import Link from "next/link";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ArrowRight, Play } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { HeroStats } from "./HeroStats";
import { SplineScene } from "@/components/3d/SplineScene";
import { HeroSparkles } from "./HeroSparkles";

import { YasproBrandSparkleBadge } from "./YasproBrandSparkleBadge";

export default function HeroSection() {
  return (
    <Section
      id="hero"
      aria-labelledby="hero-title"
      className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center py-12 md:py-20 bg-background relative"
    >
      <HeroSparkles />
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Hero Content */}
          <FadeUp className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="mb-6 flex justify-start">
              <YasproBrandSparkleBadge />
            </div>

            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.1] text-balance"
            >
              Where{" "}
              <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
                AI
              </span>{" "}
              Meets <br className="hidden sm:inline" />
              Human Creativity
            </h1>

            <p className="text-base sm:text-lg text-text-secondary mb-8 max-w-xl text-balance leading-relaxed">
              The fastest-growing production network in the Gulf.
              From mobile OB-VAN live broadcasting to AI-powered post-production and tier-one creator soundstages.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-start items-center mb-10 w-full sm:w-auto">
              <ShimmerButton
                asChild
                shimmerColor="var(--brand-purple-light)"
                shimmerDuration="2.5s"
                className="w-full sm:w-auto px-8 py-3.5 font-semibold text-sm gap-2"
              >
                <Link href="/studio-booking">
                  <span>Book a Studio</span>
                  <ArrowRight size={16} />
                </Link>
              </ShimmerButton>

              <Link
                href="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm"
              >
                <Play size={14} className="text-brand-purple fill-current" /> Watch Showreel
              </Link>
            </div>

            <HeroStats />
          </FadeUp>

          {/* Right Column: Interactive Spline 3D Scene with Cinema HUD & UAE Flag */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-square max-w-[500px] rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-brand-purple/10">
              <BorderBeam size={240} duration={12} delay={2} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />

              {/* Viewfinder Top HUD Pill: UAE Flag + Dubai Studio 4K Broadcast tag */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/70 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/50 select-none pointer-events-none">
                {/* Micro SVG UAE Flag */}
                <div className="size-fit rounded-[3px] overflow-hidden border border-white/20 shadow-sm flex items-center justify-center">
                  <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
                    <rect width="24" height="5.33" y="0" fill="#00732f" />
                    <rect width="24" height="5.33" y="5.33" fill="#ffffff" />
                    <rect width="24" height="5.33" y="10.66" fill="#000000" />
                    <rect width="6" height="16" x="0" fill="#ff0000" />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase font-bold tracking-wider text-white">
                  <span>Dubai</span>
                  <span className="text-white/40">•</span>
                  <span className="text-brand-purple-light">Studio 4K</span>
                </div>

                {/* Live Broadcast REC Beacon */}
                <div className="flex items-center gap-1 pl-1 border-l border-white/15">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 font-semibold">LIVE</span>
                </div>
              </div>

              {/* Viewfinder Bottom Right Spec Tag */}
              <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md text-[9.5px] font-mono text-text-muted select-none pointer-events-none">
                <span className="size-1.5 rounded-full bg-brand-cyan" />
                <span>UAE CINEMA CAM • RAW 8K</span>
              </div>

              <SplineScene className="size-full" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
