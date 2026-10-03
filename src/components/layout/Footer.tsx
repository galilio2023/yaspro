"use client";

import Link from "next/link";
import Image from "next/image";
import { FooterHubCard, RegionalHub } from "./FooterHubCard";
import { FooterSocialLinks } from "./FooterSocialLinks";
import { BrandLogo } from "./BrandLogo";
import { YasproEmblem } from "@/components/ui/YasproEmblem";
import { FooterNavLinks } from "./FooterNavLinks";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { YAS_GROUP_COMPANIES } from "@/features/group/data";

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
  { key: "footer.services.enterprise", label: "Enterprise Sovereign Solutions", href: "/enterprise", icon: Building2 },
  { key: "footer.services.studios", label: "Studio Stage Bookings", href: "/studio-booking", icon: Calendar },
  { key: "footer.services.obVan", label: "OB-VAN Live Broadcast", href: "/enterprise#ob-van-command", icon: Radio },
  { key: "footer.services.gear", label: "Equipment Rental", href: "/shop", icon: Camera },
  { key: "footer.services.bundles", label: "Production Bundles", href: "/shop?category=bundles", icon: Layers },
  { key: "footer.services.virtual", label: "Virtual Production & VFX", href: "/enterprise#virtual-simulator", icon: Wand2 },
];

const NETWORK_LINKS: readonly FooterLinkItem[] = [
  { key: "footer.network.creators", label: "Influencer Talent Network", href: "/influencers", icon: Users },
  { key: "footer.network.shows", label: "Original Shows & Formats", href: "/projects", icon: Tv },
  { key: "footer.network.portfolio", label: "Masterpiece Portfolio", href: "/projects", icon: Film },
  { key: "footer.network.about", label: "About Yas Pro", href: "/about", icon: Building2 },
  { key: "footer.network.contact", label: "Contact Studios", href: "/contact", icon: Mail },
];

const REGIONAL_HUBS: readonly RegionalHub[] = [
  {
    key: "dubai",
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
    key: "cairo",
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
    key: "amman",
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
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir="ltr"
      style={{ direction: "ltr" }}
      className="w-full bg-background border-t border-white/[0.08] relative overflow-hidden film-grain"
    >
      {/* Architectural Subtle Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Massive Architectural Watermark Typography */}
      <div
        aria-hidden="true"
        dir="ltr"
        className="pointer-events-none absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 select-none overflow-hidden flex items-center justify-center gap-2 sm:gap-4 font-black tracking-tighter leading-none whitespace-nowrap font-display z-0 opacity-10"
      >
        <YasproEmblem
          size="15vw"
          idPrefix="footer-bg-emblem"
          className="filter opacity-40"
        />
        <span
          className="text-[17vw] tracking-tighter text-white"
          style={{
            WebkitTextStroke: "1px rgba(255, 255, 255, 0.15)",
          }}
        >
          YASPRO
        </span>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10" dir="ltr" style={{ direction: "ltr" }}>
        {/* Main Footer Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 text-left" dir="ltr" style={{ direction: "ltr" }}>
          {/* Column 1: Brand Info & Socials */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col justify-between text-left">
            <div>
              <div className="mb-5">
                <BrandLogo showIndicator={false} />
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-sm text-left">
                {t("footer.brandDesc")}
              </p>
            </div>

            <div className="pt-2 text-left">
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                {t("footer.officialChannels")}
              </span>
              <FooterSocialLinks />
            </div>
          </div>

          {/* Column 2: Production Services */}
          <div className="col-span-1 lg:col-span-2 text-left">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest rtl:tracking-normal font-display rtl:font-arabic leading-snug mb-4 sm:mb-5">
              {t("footer.productionHeading")}
            </h3>
            <FooterNavLinks links={PRODUCTION_SERVICES} />
          </div>

          {/* Column 3: Network & Formats */}
          <div className="col-span-1 lg:col-span-2 text-left">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest rtl:tracking-normal font-display rtl:font-arabic leading-snug mb-4 sm:mb-5">
              {t("footer.networkHeading")}
            </h3>
            <FooterNavLinks links={NETWORK_LINKS} />
          </div>

          {/* Column 4: Regional Hubs */}
          <div className="sm:col-span-2 lg:col-span-4 text-left">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest rtl:tracking-normal font-display rtl:font-arabic leading-snug">
                {t("footer.studiosHubs")}
              </h3>
              <span className="text-[11px] font-mono text-amber-400">{t("footer.locations")}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {REGIONAL_HUBS.map((hub) => (
                <FooterHubCard key={hub.city} hub={hub} />
              ))}
            </div>
          </div>
        </div>

        {/* Yas Media Group Conglomerate Network Strip */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/[0.08]" dir="ltr" style={{ direction: "ltr" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 text-left">
            <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400 font-semibold flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>{t("footer.companiesHeading")}</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              DUBAI • CAIRO • AMMAN
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto lg:grid lg:grid-cols-7 scrollbar-none pb-2 lg:pb-0" dir="ltr" style={{ direction: "ltr" }}>
            {YAS_GROUP_COMPANIES.map((company) => (
              <Link
                key={company.id}
                href="/about#conglomerate"
                title={`${company.name} — ${company.division}`}
                className="h-13 w-32 lg:w-auto px-2.5 rounded-xl bg-black/40 border border-white/8 hover:border-amber-500/40 flex items-center justify-center transition-all duration-300 group shrink-0 cursor-pointer"
              >
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={120}
                  height={38}
                  className="max-h-full max-w-full h-auto w-auto object-contain opacity-70 group-hover:opacity-100 filter group-hover:brightness-110 transition-all duration-300"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Telemetry & Legal */}
        <div className="mt-8 pt-6 sm:pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 text-center sm:text-left" dir="ltr" style={{ direction: "ltr" }}>
          <p>© {currentYear} YAS PRO MEDIA LLC. {t("footer.allRights")}</p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors py-1 min-h-[36px] sm:min-h-0 flex items-center">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors py-1 min-h-[36px] sm:min-h-0 flex items-center">
              {t("footer.terms")}
            </Link>

            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px]">
              <span className="size-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.7)]" />
              <span>{t("footer.soundstagesOnline")}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
