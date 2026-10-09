"use client";

import dynamic from "next/dynamic";

const CosmicConstellationSparkles = dynamic(
  () =>
    import("@/components/aceternity/CosmicConstellationSparkles").then(
      (mod) => mod.CosmicConstellationSparkles
    ),
  {
    ssr: false,
    loading: () => <div className="size-full bg-transparent" />,
  }
);

export function HeroSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Gentle cosmic radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 48% 44%, rgba(255,255,255,0.07) 0%, rgba(152,123,165,0.08) 30%, transparent 65%)",
        }}
      />

      {/* High-Density Sparkles with Dynamic Camera & Influencer Woman in Gown Constellation Shaping */}
      <CosmicConstellationSparkles className="size-full" />
    </div>
  );
}
