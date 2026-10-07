import { InstagramIcon, FacebookIcon, XTwitterIcon, TiktokIcon, YoutubeIcon, WhatsAppIcon } from "@/components/icons/SocialIcons";
import { WHATSAPP_PHONE } from "@/lib/constants";

const SOCIAL_LINKS = [
  { label: "WhatsApp", href: `https://wa.me/${WHATSAPP_PHONE}`, icon: WhatsAppIcon },
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
          className="size-11 sm:size-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 rounded-xl bg-white/[0.04] hover:bg-brand-violet/30 border border-white/[0.08] hover:border-brand-mauve/40 flex items-center justify-center text-text-muted hover:text-brand-lavender hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
        >
          <s.icon size={16} />
        </a>
      ))}
    </div>
  );
}
