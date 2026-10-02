import type { InfluencerItem } from "../types";

export interface InfluencerBioProps {
  creator: InfluencerItem;
}

export function InfluencerBio({ creator }: InfluencerBioProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/20">
      <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold block mb-2">
        Creator Profile
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 font-display">
        About {creator.name}
      </h2>
      <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
        {creator.bio}
      </p>
    </div>
  );
}
