import { InstagramIcon, FacebookIcon, XTwitterIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/SocialIcons";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/yaspromedia", icon: InstagramIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@yaspromedia", icon: TiktokIcon },
  { label: "YouTube", href: "https://www.youtube.com/@yaspromedia", icon: YoutubeIcon },
  { label: "Facebook", href: "https://www.facebook.com/yaspromedia", icon: FacebookIcon },
  { label: "X / Twitter", href: "https://x.com/yaspromedia", icon: XTwitterIcon },
] as const;

export function FooterSocialLinks() {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={s.label}
          aria-label={s.label}
          className="size-11 sm:size-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-white/[0.04] hover:bg-brand-purple/20 border border-white/[0.08] hover:border-brand-purple/40 flex items-center justify-center text-text-muted hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
        >
          <s.icon size={16} />
        </a>
      ))}
    </div>
  );
}
