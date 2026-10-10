"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { FooterSocialLinks } from "./FooterSocialLinks";
import { useLanguage } from "@/components/providers/LanguageProvider";
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
  Video,
  MapPin,
  Phone,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly icon?: LucideIcon;
  readonly key?: string;
  readonly isExternal?: boolean;
}

const PRODUCTION_LINKS: readonly FooterLink[] = [
  { key: "footer.services.podcast", label: "Podcast Studio Booking", href: "/podcast-booking", icon: Radio },
  { key: "footer.services.socialMedia", label: "Social Media Packages", href: "/social-media-packages", icon: Video },
  { key: "footer.services.studios", label: "Soundstages & Studios Hub", href: "/studios", icon: Calendar },
  { key: "footer.services.gear", label: "Cinema Equipment Rental", href: "/shop", icon: Camera },
  { key: "footer.services.bundles", label: "Production Bundles", href: "/shop?category=bundles", icon: Layers },
  { key: "footer.services.virtual", label: "Virtual Production & VFX", href: "/#virtual-studio", icon: Wand2 },
  { key: "footer.services.obVan", label: "OB-VAN Live Broadcast", href: "/contact?service=ob-van", icon: Film },
];

const NETWORK_LINKS: readonly FooterLink[] = [
  { key: "footer.network.creators", label: "Influencer Talent Network", href: "/influencers", icon: Users },
  { key: "footer.network.shows", label: "Original Shows & Formats", href: "/projects", icon: Tv },
  { key: "footer.network.portfolio", label: "Masterpiece Portfolio", href: "/projects", icon: Film },
  { key: "footer.network.about", label: "About Yas Pro", href: "/about", icon: Building2 },
  { key: "footer.network.contact", label: "Contact Studios & RFPs", href: "/contact", icon: Mail },
];

interface StudioLocation {
  city: string;
  cityAr: string;
  country: string;
  code: string;
  role: string;
  roleAr: string;
  address: string;
  addressAr: string;
  phone?: string;
  timeZone: string;
  mapUrl: string;
}

const STUDIO_LOCATIONS: readonly StudioLocation[] = [
  {
    city: "Dubai",
    cityAr: "دبي",
    country: "UAE",
    code: "DXB",
    role: "Global HQ & Main Soundstages",
    roleAr: "المقر الرئيسي واستوديوهات التصوير",
    address: "Iris Bay Tower, Level 18, Business Bay",
    addressAr: "برج آيريس باي، الخليج التجاري",
    phone: "+971 55 401 0465",
    timeZone: "Asia/Dubai",
    mapUrl: "https://www.google.com/maps/place/%D9%8A%D8%A7%D8%B3+%D8%A8%D8%B1%D9%88+%D9%84%D9%84%D8%A5%D8%B9%D9%84%D8%A7%D9%85%E2%80%AD/@25.1859019,55.2602652,17z",
  },
  {
    city: "Cairo",
    cityAr: "القاهرة",
    country: "Egypt",
    code: "CAI",
    role: "Production & Broadcast Hub",
    roleAr: "مركز الإنتاج والبث الفضائي",
    address: "Elite Tower, Zahraa Al Maadi",
    addressAr: "برج إيليت، زهراء المعادي",
    timeZone: "Africa/Cairo",
    mapUrl: "https://www.google.com/maps/place/YAS+PRO+MEDIA+Egypt/@29.9612031,31.2887851,17z",
  },
  {
    city: "Amman",
    cityAr: "عَمّان",
    country: "Jordan",
    code: "AMM",
    role: "Levant Regional Studio",
    roleAr: "استوديو بلاد الشام الإقليمي",
    address: "BlackRock Tower, Mecca Street",
    addressAr: "برج بلاك روك، شارع مكة",
    timeZone: "Asia/Amman",
    mapUrl: "https://www.google.com/maps/place/BlackRock+Technology/@31.9481289,35.9083383,17z",
  },
];

export default function Footer() {
  const { t, isArabic } = useLanguage();
  const currentYear = new Date().getFullYear();

  // Live clocks for regional hubs
  const [hubTimes, setHubTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {};
      STUDIO_LOCATIONS.forEach((loc) => {
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: loc.timeZone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          times[loc.city] = formatter.format(new Date());
        } catch {
          times[loc.city] = "";
        }
      });
      setHubTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      dir="ltr"
      style={{ direction: "ltr" }}
      className="w-full bg-[#06070a] border-t border-white/[0.08] relative overflow-hidden text-left"
    >
      {/* Background Micro Film Texture & Subtle Studio Vignette */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-mauve/[0.05] blur-[100px] pointer-events-none" />

      {/* ─── 1. STUDIO PRE-FOOTER ACTION HEADER ─── */}
      <div className="w-full border-b border-white/[0.06] bg-white/[0.01] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5 font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-zinc-400">
              <span className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span>[REC ● 4 SOUNDSTAGES ONLINE · 24/7 BROADCAST READY]</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
              {isArabic ? "أين تلتقي التكنولوجيا بالإنتاج السينمائي" : "Where Cinematic Craft Meets AI Media Infrastructure"}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isArabic
                ? "من استوديوهات دبي في الخليج التجاري وعربات البث المباشر المتنقلة إلى شبكة المبدعين في الشرق الأوسط."
                : "Flagship soundstages, OB-VAN live broadcast fleets, high-tier gear rental, and premier creator talent across UAE, Egypt, and Jordan."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/studio-booking"
              className="px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 hover:border-brand-mauve/50 font-bold text-xs uppercase tracking-wider transition-all backdrop-blur-md"
            >
              {isArabic ? "حجز استوديو تصوير" : "Book Soundstage"}
            </Link>
            <Link
              href="/social-media-packages"
              className="px-5 py-2.5 rounded-full bg-brand-mauve hover:bg-brand-mauve-soft text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-brand-violet/40"
            >
              {isArabic ? "باقات السوشيال ميديا" : "Social Media Plans"}
            </Link>
            <a
              href="https://wa.me/971554010465"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Phone size={13} className="text-brand-mauve" />
              <span className="font-mono text-[11px]">+971 55 401 0465</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN 4-COLUMN ARCHITECTURAL DIRECTORY ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Media Trust (col-span-4) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <div>
              <div className="mb-4">
                <BrandLogo showIndicator={false} />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                {t("footer.brandDesc")}
              </p>
            </div>

            {/* Official Social Channels */}
            <div>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-3">
                {t("footer.officialChannels")}
              </span>
              <FooterSocialLinks />
            </div>

            {/* Regulatory & Security Badge */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3">
              <div className="size-8 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-zinc-200">
                  {isArabic ? "ترخيص إعلامي معتمد وتوثيق رسمي" : "Mawthooq Certified Media Network"}
                </span>
                <span className="block text-[10px] text-zinc-500 font-mono">
                  UAE · SAUDI ARABIA · EGYPT · JORDAN
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Production Pillars (col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] font-display flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <span>{t("footer.productionHeading")}</span>
            </h3>

            <ul className="space-y-2">
              {PRODUCTION_LINKS.map((link) => {
                const Icon = link.icon;
                const label = link.key ? t(link.key) : link.label;
                return (
                  <li key={link.key || `${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <span className="size-5 rounded-md bg-white/[0.03] border border-white/[0.06] text-amber-400/80 group-hover:text-amber-300 group-hover:border-amber-400/30 flex items-center justify-center shrink-0 transition-colors">
                            <Icon size={11} />
                          </span>
                        )}
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight size={12} className="text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Talent & Ecosystem (col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] font-display flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-amber-400" />
              <span>{t("footer.networkHeading")}</span>
            </h3>

            <ul className="space-y-2">
              {NETWORK_LINKS.map((link) => {
                const Icon = link.icon;
                const label = link.key ? t(link.key) : link.label;
                return (
                  <li key={link.key || `${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-1 text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {Icon && (
                          <span className="size-5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <Icon size={11} />
                          </span>
                        )}
                        <span className="truncate">{label}</span>
                      </div>
                      <ChevronRight size={12} className="text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: Architectural Regional Studios Directory (col-span-3) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] font-display flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span>{t("footer.studiosHubs")}</span>
              </h3>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                {t("footer.locations")}
              </span>
            </div>

            <div className="divide-y divide-white/[0.05]">
              {STUDIO_LOCATIONS.map((loc) => {
                const time = hubTimes[loc.city];
                return (
                  <div
                    key={loc.city}
                    className="group py-3 first:pt-1 last:pb-0 transition-colors"
                  >
                    {/* Header: City Name + Hub Code + Live Time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-display text-xs font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors">
                          {isArabic ? loc.cityAr : loc.city}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                          {loc.code} · {loc.country}
                        </span>
                      </div>

                      {time && (
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400 shrink-0 tabular-nums">
                          <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{time}</span>
                        </div>
                      )}
                    </div>

                    {/* Facility Role */}
                    <p className="mt-1 text-[11px] text-zinc-400 leading-snug">
                      {isArabic ? loc.roleAr : loc.role}
                    </p>

                    {/* Address & Directions */}
                    <div className="mt-1.5 flex items-start justify-between gap-3 text-[11px]">
                      <p className="text-zinc-500 text-[10.5px] leading-relaxed flex items-start gap-1 min-w-0">
                        <MapPin size={11} className="shrink-0 mt-0.5 text-zinc-600" />
                        <span className="truncate">{isArabic ? loc.addressAr : loc.address}</span>
                      </p>

                      <a
                        href={loc.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-amber-400 transition-colors shrink-0 inline-flex items-center gap-0.5 font-mono text-[10px] group/link"
                      >
                        <span>{isArabic ? "الخريطة" : "Map"}</span>
                        <ArrowUpRight size={10} className="text-zinc-500 group-hover/link:text-amber-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>

                    {/* Direct phone if available */}
                    {loc.phone && (
                      <div className="mt-1.5">
                        <a
                          href={`tel:${loc.phone}`}
                          className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1.5 font-mono text-[10px]"
                        >
                          <Phone size={9} className="text-amber-400/80" />
                          <span>{loc.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── BOTTOM COPYRIGHT & SYSTEM TELEMETRY STRIP ─── */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="font-mono text-[11px]">
            © {currentYear} YAS PRO MEDIA LLC · {t("footer.allRights")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-mono text-[11px]">
            <Link href="/privacy-policy" className="hover:text-zinc-300 transition-colors">
              {t("footer.privacy")}
            </Link>
            <span className="opacity-30">·</span>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              {t("footer.terms")}
            </Link>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>[25.1859° N, 55.2603° E · BROADCAST READY]</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
