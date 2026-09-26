import Link from "next/link";
import { ArrowRight, Sparkles, Video, Calendar } from "lucide-react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/magicui/border-beam";

export function FooterCtaBanner() {
  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-b from-card/80 to-background/95 backdrop-blur-2xl p-8 sm:p-12 mb-16 overflow-hidden shadow-2xl shadow-brand-purple/15">
      {/* Border Beam Animation */}
      <BorderBeam
        size={280}
        duration={10}
        delay={1}
        colorFrom="var(--brand-purple)"
        colorTo="var(--brand-cyan)"
      />

      {/* Atmospheric ambient lighting */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-64 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-64 bg-brand-cyan/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Column: Copy & Live Status */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs text-brand-purple-light font-medium mb-4 backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Now Booking Q3 &amp; Q4 2026 Productions</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display mb-3">
            Ready to Create Something{" "}
            <span className="bg-gradient-to-r from-brand-purple-light via-brand-cyan to-white bg-clip-text text-transparent">
              Iconic?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            From tier-one creator soundstages to live OB-VAN mobile broadcasting and AI-driven virtual production. Let’s engineer your vision.
          </p>
        </div>

        {/* Right Column: High-conversion actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto shrink-0">
          <ShimmerButton
            asChild
            shimmerColor="var(--brand-purple-light)"
            shimmerDuration="2.5s"
            className="w-full sm:w-auto px-7 py-3.5 font-semibold text-sm gap-2"
          >
            <Link href="/studio-booking">
              <Calendar size={15} />
              <span>Book Studio Stage</span>
              <ArrowRight size={15} />
            </Link>
          </ShimmerButton>

          <Link
            href="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-center backdrop-blur-sm"
          >
            <Video size={15} className="text-brand-cyan" />
            <span>Talk to Producers</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
