import { InstagramIcon, YoutubeIcon, TiktokIcon } from "@/components/icons/SocialIcons";
import type { InfluencerItem } from "../types";

export interface InfluencerSocialListProps {
  creator: InfluencerItem;
}

export function InfluencerSocialList({ creator }: InfluencerSocialListProps) {
  return (
    <div className="flex flex-col gap-2.5 pt-6 border-t border-white/10">
      <span className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
        Social Channels
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
        {creator.instagram && (
          <a
            href={`https://instagram.com/${creator.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-brand-purple/20 border border-white/10 text-text-secondary hover:text-white transition-all flex items-center gap-2.5 text-xs font-medium cursor-pointer"
          >
            <InstagramIcon size={16} />
            <span>@{creator.instagram}</span>
          </a>
        )}
        {creator.youtube && (
          <a
            href={`https://youtube.com/@${creator.youtube}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-text-secondary hover:text-red-400 transition-all flex items-center gap-2.5 text-xs font-medium cursor-pointer"
          >
            <YoutubeIcon size={16} />
            <span>@{creator.youtube}</span>
          </a>
        )}
        {creator.tiktok && (
          <a
            href={`https://tiktok.com/@${creator.tiktok}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-text-secondary hover:text-cyan-400 transition-all flex items-center gap-2.5 text-xs font-medium cursor-pointer"
          >
            <TiktokIcon size={16} />
            <span>@{creator.tiktok}</span>
          </a>
        )}
      </div>
    </div>
  );
}
