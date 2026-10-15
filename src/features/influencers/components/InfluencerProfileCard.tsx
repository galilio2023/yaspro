import Image from "next/image";
import { CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import { InfluencerSocialList } from "./InfluencerSocialList";
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
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8 relative overflow-hidden shadow-2xl shadow-black/40">
        <BorderBeam size={220} duration={12} colorFrom="#987ba5" colorTo="#542568" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 mb-6">
          <div className="relative shrink-0">
            <div className="size-20 sm:size-24 rounded-3xl bg-gradient-to-br from-brand-violet to-brand-mauve flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-xl shadow-brand-violet/40 border border-white/20 font-display overflow-hidden relative">
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
            <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-brand-violet border border-brand-mauve/40 flex items-center justify-center text-white shadow-md z-10">
              <CheckCircle2 size={15} className="text-white" />
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {creator.flag} {creator.nationality}
              </Badge>
              <Badge variant="default" className="text-xs font-bold gap-1.5 shadow-sm shadow-black/20">
                <Users size={12} className="text-brand-mauve" />
                <span>{creator.totalFollowers} Reach</span>
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              {creator.name}
            </h1>

            <p className="text-sm text-brand-mauve font-semibold mt-1">
              {creator.role}
            </p>
          </div>
        </div>

        <InfluencerSocialList creator={creator} />
      </div>
    </>
  );
}
