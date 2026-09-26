import Link from "next/link";
import { FooterHubCard, RegionalHub } from "./FooterHubCard";
import { FooterSocialLinks } from "./FooterSocialLinks";
import { BrandLogo } from "./BrandLogo";
import { FooterNavLinks } from "./FooterNavLinks";
import { BackgroundBeams } from "@/components/aceternity/background-beams";

import {
  Calendar,
  Radio,
  Camera,
  Layers,
  Wand2,
  Users,
  Tv,
  Film,
  Building2,
  Mail,
} from "lucide-react";
import { FooterLinkItem } from "./FooterNavLinks";

const PRODUCTION_SERVICES: readonly FooterLinkItem[] = [
  { label: "Studio Stage Bookings", href: "/studio-booking", icon: Calendar },
  { label: "OB-VAN Live Broadcast", href: "/#ob-van", icon: Radio },
  { label: "Equipment Rental", href: "/shop", icon: Camera },
  { label: "Production Bundles", href: "/shop?category=bundles", icon: Layers },
  { label: "Virtual Production & VFX", href: "/#virtual-studio", icon: Wand2 },
];

const NETWORK_LINKS: readonly FooterLinkItem[] = [
  { label: "Influencer Talent Network", href: "/influencers", icon: Users },
  { label: "Original Shows & Formats", href: "/#shows", icon: Tv },
  { label: "Masterpiece Portfolio", href: "/projects", icon: Film },
  { label: "About Yas Pro", href: "/about", icon: Building2 },
  { label: "Contact Studios", href: "/contact", icon: Mail },
];

const REGIONAL_HUBS: readonly RegionalHub[] = [
  {
    city: "Dubai, UAE",
    flag: "🇦🇪",
    coordinates: "25.1859° N, 55.2603° E",
    timeZone: "Asia/Dubai",
    role: "Headquarters & Main Stages",
    address: "Iris Bay Tower, Business Bay",
    phone: "+971 55 401 0465",
    mapUrl:
      "https://www.google.com/maps/place/%D9%8A%D8%A7%D8%B3+%D8%A8%D8%B1%D9%88+%D9%84%D9%84%D8%A5%D8%B9%D9%84%D8%A7%D9%85%E2%80%AD/@25.1859019,55.2602652,17z",
  },
  {
    city: "Cairo, Egypt",
    flag: "🇪🇬",
    coordinates: "29.9612° N, 31.2888° E",
    timeZone: "Africa/Cairo",
    role: "Production & Post Hub",
    address: "Elite Tower, Zahraa Al Maadi",
    phone: "+20 10 0000 0000",
    mapUrl:
      "https://www.google.com/maps/place/YAS+PRO+MEDIA+Egypt/@29.9612031,31.2887851,17z",
  },
  {
    city: "Amman, Jordan",
    flag: "🇯🇴",
    coordinates: "31.9481° N, 35.9083° E",
    timeZone: "Asia/Amman",
    role: "Levant Regional Studio",
    address: "BlackRock Tower, Mecca St",
    phone: "+962 6 000 0000",
    mapUrl:
      "https://www.google.com/maps/place/BlackRock+Technology/@31.9481289,35.9083383,17z",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#03020a] border-t border-white/[0.08] relative overflow-hidden">
      {/* Dynamic Background Beams and Grid Pattern */}
      <BackgroundBeams className="opacity-60" />

      {/* Subtle Aurora Ambient Flares */}
      <div className="absolute top-1/4 -left-32 size-96 bg-brand-purple/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 size-96 bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Massive Luxury Watermark Typography in Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 select-none overflow-hidden text-center text-[18vw] font-black tracking-tighter leading-none whitespace-nowrap font-display z-0"
        style={{
          background: "linear-gradient(180deg, rgba(167, 139, 250, 0.14) 0%, rgba(6, 182, 212, 0.08) 60%, rgba(255, 255, 255, 0.02) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: "1px rgba(255, 255, 255, 0.08)",
          textShadow: "0 0 80px rgba(124, 58, 237, 0.15)",
        }}
      >
        YASPRO
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
        {/* Main Footer Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Column 1: Brand Info & Socials */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="mb-5">
                <BrandLogo showIndicator={false} />
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-sm">
                The fastest-growing AI media production company in the Gulf region.
                Where cinematic craft meets next-generation generative media workflows.
              </p>
            </div>

            <div className="pt-2">
              <span className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Official Channels
              </span>
              <FooterSocialLinks />
            </div>
          </div>

          {/* Column 2: Production Services */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest font-display mb-5">
              Production
            </h3>
            <FooterNavLinks links={PRODUCTION_SERVICES} />
          </div>

          {/* Column 3: Network & Formats */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest font-display mb-5">
              Network
            </h3>
            <FooterNavLinks links={NETWORK_LINKS} />
          </div>

          {/* Column 4: Regional Hubs */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest font-display">
                Regional Studios &amp; Hubs
              </h3>
              <span className="text-[11px] font-mono text-brand-cyan">3 Live Locations</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {REGIONAL_HUBS.map((hub) => (
                <FooterHubCard key={hub.city} hub={hub} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar: Telemetry & Legal */}
        <div className="mt-16 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {currentYear} YAS PRO MEDIA LLC. All Rights Reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>

            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All 4 Soundstages Online</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
