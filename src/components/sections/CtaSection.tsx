"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Calendar, Video, Sparkles, MapPin } from "lucide-react";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";

// Dynamically import Three.js — SSR-off, zero-placeholder since it's behind the scene
const RocketAndHexBallCanvas = dynamic(
  () => import("@/components/3d/RocketAndHexBallCanvas").then((m) => m.RocketAndHexBallCanvas),
  { ssr: false, loading: () => null }
);

interface CtaSectionProps {
  title?: string;
  gradientText?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

const HUBS = [
  { flag: "🇦🇪", city: "Dubai" },
  { flag: "🇪🇬", city: "Cairo" },
  { flag: "🇯🇴", city: "Amman" },
];

export function CtaSection({
  title = "Ready to Create",
  gradientText = "Something Great?",
  description = "Whether you need a 4K soundstage, a live OB-VAN, or a full influencer content flywheel — our production team is on-call across three regional hubs.",
  primaryCtaText = "Book a Studio",
  primaryCtaHref = "/studio-booking",
  secondaryCtaText = "Talk to Producers",
  secondaryCtaHref = "/contact",
}: CtaSectionProps) {
  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="relative w-full min-h-[700px] sm:min-h-[780px] flex items-end justify-center overflow-hidden bg-[#03020a]"
    >
      {/* ── Layer 0: Full-bleed 3D Scene (lives behind everything) ── */}
      <RocketAndHexBallCanvas className="absolute inset-0 w-full h-full pointer-events-auto" />

      {/* ── Layer 1: Cinematic Gradient Curtain (ensures text legibility) ── */}
      {/* Vertical: strong at bottom so text reads clean, feathers into 3D at top */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#03020a] via-[#03020a]/70 to-[#03020a]/10" />
      {/* Horizontal vignette: darkens left/right edges for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#03020a]/60 via-transparent to-[#03020a]/60" />
      {/* Subtle radial center glow to keep brand purple alive */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_80%,rgba(124,58,237,0.15),transparent)]" />

      {/* ── Layer 2: Text / CTA Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-28 pt-40 flex flex-col items-center text-center">
        <FadeUp>
          {/* Live status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mb-6 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Now Booking Q3 &amp; Q4 2026 Productions
          </div>

          {/* Headline */}
          <h2
            id="cta-title"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 font-display tracking-tight leading-[1.08] text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]"
          >
            {title}{" "}
            <span className="bg-gradient-to-r from-brand-purple via-brand-purple-light to-brand-cyan bg-clip-text text-transparent">
              {gradientText}
            </span>
          </h2>

          {/* Sub-copy */}
          <p className="text-base sm:text-lg text-text-secondary mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
            {description}
          </p>

          {/* Hub pills */}
          <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
            {HUBS.map((hub) => (
              <span
                key={hub.city}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium border border-white/10 bg-white/5 text-text-muted backdrop-blur-md"
              >
                <MapPin size={9} className="text-brand-cyan" />
                {hub.flag} {hub.city}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ShimmerButton
              asChild
              shimmerColor="var(--brand-purple-light)"
              shimmerDuration="2.5s"
              className="w-full sm:w-auto px-9 py-4 font-semibold text-sm gap-2 shadow-[0_8px_32px_rgba(124,58,237,0.35)]"
            >
              <Link href={primaryCtaHref}>
                <Calendar size={15} />
                <span>{primaryCtaText}</span>
                <ArrowRight size={15} />
              </Link>
            </ShimmerButton>

            <Link
              href={secondaryCtaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white border border-white/20 bg-white/[0.06] hover:bg-white/10 hover:border-white/30 transition-all text-center backdrop-blur-sm"
            >
              <Video size={15} className="text-brand-cyan" />
              {secondaryCtaText}
            </Link>
          </div>
        </FadeUp>

        {/* Decorative bottom divider beam */}
        <div className="relative w-full max-w-sm mx-auto mt-14 h-px overflow-hidden rounded-full">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-purple/60 to-transparent" />
          <BorderBeam size={80} duration={6} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />
        </div>
      </div>
    </section>
  );
}
