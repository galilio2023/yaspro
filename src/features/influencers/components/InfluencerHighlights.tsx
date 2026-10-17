import { Sparkles, Award } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface InfluencerHighlightsProps {
  signatureProductions?: readonly string[];
  collaborations?: readonly string[];
}

export function InfluencerHighlights({
  signatureProductions,
  collaborations,
}: InfluencerHighlightsProps) {
  const { t } = useLanguage();

  const productions = signatureProductions || [
    t("influencers.defaultProduction1"),
    t("influencers.defaultProduction2"),
    t("influencers.defaultProduction3"),
  ];

  const collabItems = collaborations || [
    t("influencers.defaultCollab1"),
    t("influencers.defaultCollab2"),
    t("influencers.defaultCollab3"),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {/* Signature Productions Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 font-display">
          <div className="size-8 rounded-xl bg-brand-mauve/10 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve">
            <Sparkles size={18} />
          </div>
          <span>{t("influencers.signatureProductions")}</span>
        </h2>
        <ul className="space-y-4">
          {productions.map((item) => (
            <li key={item} className="text-sm text-text-secondary flex items-start gap-3">
              <span className="size-2 rounded-full bg-brand-mauve mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Featured Collaborations Card */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5 font-display">
          <div className="size-8 rounded-xl bg-brand-mauve/10 border border-brand-mauve/30 flex items-center justify-center text-brand-mauve">
            <Award size={18} />
          </div>
          <span>{t("influencers.featuredCollaborations")}</span>
        </h2>
        <ul className="space-y-4">
          {collabItems.map((collab) => (
            <li key={collab} className="text-sm text-text-secondary flex items-start gap-3">
              <span className="size-2 rounded-full bg-brand-mauve mt-2 shrink-0" />
              <span>{collab}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
