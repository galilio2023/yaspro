"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight, Sparkles } from "lucide-react";
import { InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/icons/SocialIcons";
import { InfluencerItem } from "../types";
import { Badge } from "@/components/ui/badge";

export function InfluencerCard({ creator }: { creator: InfluencerItem }) {
  return (
    <article className="relative group w-full h-[400px] sm:h-[430px] rounded-3xl overflow-hidden border border-white/10 hover:border-brand-purple/50 bg-zinc-950 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-brand-purple/20 flex flex-col justify-between">
      {/* Background Creator Portrait Image */}
      {creator.avatar && (
        <div className="absolute inset-0 size-full overflow-hidden">
          <Image
            src={creator.avatar}
            alt={creator.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top group-hover:scale-108 transition-transform duration-700 ease-out filter group-hover:contrast-105"
          />
        </div>
      )}

      {/* Cinematic Vignette Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />

      {/* Top Meta: Nationality & Audience Reach */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
        <Badge variant="secondary" className="text-[11px] backdrop-blur-md bg-black/50 border border-white/15">
          <span>{creator.flag}</span>
          <span className="ml-1 text-white">{creator.nationality}</span>
        </Badge>

        <Badge variant="default" className="text-[11px] font-mono gap-1.5 backdrop-blur-md bg-black/60 border border-brand-purple/40">
          <Users size={11} className="text-brand-cyan" />
          <span className="text-white font-bold">{creator.totalFollowers}</span>
        </Badge>
      </div>

      {/* Bottom Content: Creator Details & Actions */}
      <div className="relative z-10 p-4 sm:p-5 pt-0 sm:pt-0 flex flex-col justify-end">
        {/* Creator Name & Niche */}
        <div className="mb-3">
          <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight group-hover:text-brand-purple-light transition-colors line-clamp-1">
            <Link
              href={`/influencers/${creator.slug}`}
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple rounded-sm"
            >
              {creator.name}
            </Link>
          </h3>
          <span className="text-xs text-brand-cyan font-semibold flex items-center gap-1 mt-1">
            <Sparkles size={11} className="text-brand-gold shrink-0" />
            <span className="line-clamp-1">{creator.role}</span>
          </span>
        </div>

        {/* Bio preview (2 lines) */}
        <p className="text-[11.5px] text-white/70 line-clamp-2 leading-relaxed mb-4">
          {creator.bio}
        </p>

        {/* Social Channel Links + Profile Link */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {creator.instagram && (
              <a
                href={`https://instagram.com/${creator.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${creator.name} on Instagram`}
                className="size-11 sm:size-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-black/60 hover:bg-brand-purple/30 border border-white/15 hover:border-brand-purple/50 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110"
              >
                <InstagramIcon size={14} />
              </a>
            )}
            {creator.youtube && (
              <a
                href={`https://youtube.com/@${creator.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${creator.name} on YouTube`}
                className="size-11 sm:size-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-black/60 hover:bg-red-500/30 border border-white/15 hover:border-red-500/50 text-white/80 hover:text-red-400 flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110"
              >
                <YoutubeIcon size={14} />
              </a>
            )}
            {creator.tiktok && (
              <a
                href={`https://tiktok.com/@${creator.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${creator.name} on TikTok`}
                className="size-11 sm:size-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-black/60 hover:bg-brand-cyan/30 border border-white/15 hover:border-brand-cyan/50 text-white/80 hover:text-brand-cyan flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110"
              >
                <TiktokIcon size={14} />
              </a>
            )}
          </div>

          <Link
            href={`/influencers/${creator.slug}`}
            className="inline-flex items-center justify-center gap-1 min-h-[44px] px-3.5 py-2 sm:min-h-0 sm:py-1.5 sm:px-3 rounded-xl bg-white/10 hover:bg-brand-purple text-white text-xs font-semibold backdrop-blur-md transition-all duration-200 group-hover:scale-105"
          >
            <span>Profile</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
