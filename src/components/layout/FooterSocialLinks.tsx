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
    <div className="flex items-center gap-3">
      {SOCIAL_LINKS.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="size-10 rounded-xl bg-white/5 hover:bg-brand-purple/20 border border-white/10 hover:border-brand-purple/40 flex items-center justify-center text-text-secondary hover:text-white transition-all duration-200"
        >
          <s.icon size={16} />
        </a>
      ))}
    </div>
  );
}
