import { Globe, Sparkles, BarChart2 } from "lucide-react";
import { CreatorDemographics } from "../types";
import { Badge } from "@/components/ui/badge";

interface InfluencerAudienceCardProps {
  demographics?: CreatorDemographics;
  creatorName: string;
}

export function InfluencerAudienceCard({ demographics, creatorName }: InfluencerAudienceCardProps) {
  if (!demographics) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
            <BarChart2 size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              Audience Demographics &amp; GCC Reach
            </h3>
            <p className="text-xs text-text-muted">
              Verified analytical engagement metrics for {creatorName}
            </p>
          </div>
        </div>

        <Badge variant="cyan" className="text-xs font-semibold gap-1.5 hidden sm:inline-flex">
          <Sparkles size={12} />
          <span>Verified Roster</span>
        </Badge>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            Monthly Views
          </span>
          <span className="text-xl font-extrabold text-white font-display">
            {demographics.monthlyImpressions}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            Engagement
          </span>
          <span className="text-xl font-extrabold text-brand-cyan font-display">
            {demographics.engagementRate}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            Core Age
          </span>
          <span className="text-sm font-bold text-white font-display">
            {demographics.primaryAgeGroup}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
            Gender Split
          </span>
          <span className="text-xs font-bold text-white">
            <span className="text-brand-cyan">{demographics.genderSplit.male}% M</span> /{" "}
            <span className="text-brand-purple-light">{demographics.genderSplit.female}% F</span>
          </span>
        </div>
      </div>

      {/* Top Countries Progress Bars */}
      <div>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Globe size={13} className="text-brand-purple" />
          <span>Primary Geographic Distribution (GCC &amp; MENA)</span>
        </h4>

        <div className="space-y-3">
          {demographics.topCountries.map((c) => (
            <div key={c.country}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary font-medium flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.country}</span>
                </span>
                <span className="font-mono font-bold text-white">{c.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-cyan"
                  style={{ width: `${c.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
