import { Sparkles, Award } from "lucide-react";

export interface InfluencerHighlightsProps {
  signatureProductions?: readonly string[];
  collaborations?: readonly string[];
}

export function InfluencerHighlights({
  signatureProductions,
  collaborations,
}: InfluencerHighlightsProps) {
  const productions = signatureProductions || [
    "4K Multi-Camera Production",
    "Creator Podcast Suite Ingest",
    "AI Clip Generation",
  ];

  const collabItems = collaborations || [
    "Regional Brand Campaign",
    "Annual Creator Special",
    "Studio Soundstage Shoots",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* Signature Productions Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 font-display">
          <div className="size-8 rounded-xl bg-brand-purple/20 flex items-center justify-center text-brand-purple-light">
            <Sparkles size={18} />
          </div>
          <span>Yas Pro Signature Productions</span>
        </h2>
        <ul className="space-y-4">
          {productions.map((item) => (
            <li key={item} className="text-sm text-text-secondary flex items-start gap-3">
              <span className="size-2 rounded-full bg-brand-purple mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured Collaborations Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 font-display">
          <div className="size-8 rounded-xl bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
            <Award size={18} />
          </div>
          <span>Featured Collaborations</span>
        </h2>
        <ul className="space-y-4">
          {collabItems.map((collab) => (
            <li key={collab} className="text-sm text-text-secondary flex items-start gap-3">
              <span className="size-2 rounded-full bg-brand-cyan mt-2 shrink-0" />
              <span>{collab}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
