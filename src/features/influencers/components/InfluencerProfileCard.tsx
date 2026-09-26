import Image from "next/image";
import { CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import { InfluencerSocialList } from "./InfluencerSocialList";
import { InfluencerBookCampaignButton } from "./InfluencerBookCampaignButton";
import type { InfluencerItem } from "../types";

export interface InfluencerProfileCardProps {
  creator: InfluencerItem;
}

export function InfluencerProfileCard({ creator }: InfluencerProfileCardProps) {
  const initials = creator.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 relative overflow-hidden shadow-2xl shadow-black/40">
        <BorderBeam size={220} duration={12} colorFrom="var(--brand-cyan)" colorTo="var(--brand-purple)" />

        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="size-20 sm:size-24 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-purple-dark flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-xl shadow-brand-purple/30 border border-white/20 font-display overflow-hidden relative">
              {creator.avatar ? (
                <Image
                  src={creator.avatar}
                  alt={creator.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-brand-cyan flex items-center justify-center text-black shadow-md z-10">
              <CheckCircle2 size={15} className="text-black" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {creator.flag} {creator.nationality}
              </Badge>
              <Badge variant="default" className="text-xs font-bold gap-1.5 shadow-sm shadow-brand-purple/20">
                <Users size={12} className="text-brand-purple-light" />
                <span>{creator.totalFollowers} Reach</span>
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {creator.name}
            </h1>

            <p className="text-sm text-brand-purple-light font-semibold mt-1">
              {creator.role}
            </p>
          </div>
        </div>

        <InfluencerSocialList creator={creator} />

        {/* Action Button: Book Creator Campaign */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <InfluencerBookCampaignButton creator={creator} />
        </div>
      </div>
    </>
  );
}
