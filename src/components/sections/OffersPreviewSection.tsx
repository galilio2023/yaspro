"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface OfferCategoryPreviewItem {
  id: string;
  targetPackageId: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  badgeEn: string;
  badgeAr: string;
  deliverableEn: string;
  deliverableAr: string;
  image: string;
}

const OFFER_CATEGORIES_PREVIEW: OfferCategoryPreviewItem[] = [
  {
    id: "production-bundles",
    targetPackageId: "5-hour-bundles",
    nameEn: "Production & Pro Edit",
    nameAr: "تصوير ومونتاج احترافي",
    taglineEn: "Multi-Cam 4K · Full Color Grading · Social Reels",
    taglineAr: "تصوير 4K وتلوين سينمائي وماسترينغ وقص ريلز",
    badgeEn: "Turnkey Post",
    badgeAr: "إنتاج متكامل",
    deliverableEn: "Full Master + Reels",
    deliverableAr: "ماستر كامل + ريلز",
    image: "/images/offers/category-production-bundles.jpg",
  },
  {
    id: "live-mix",
    targetPackageId: "5-hours-live-mix",
    nameEn: "Live Mix & Instant Master",
    nameAr: "ميكس مباشر وتسليم فوري",
    taglineEn: "Real-Time Switching · Live Audio EQ · Zero Edit Lag",
    taglineAr: "سويتش كاميرات وميكس صوتي فوري جاهز للنشر",
    badgeEn: "Instant Export",
    badgeAr: "تسليم فوري",
    deliverableEn: "Instant Wrap Delivery",
    deliverableAr: "تسليم فوري بنهاية الجلسة",
    image: "/images/offers/category-live-mix.jpg",
  },
  {
    id: "soundstage-raw",
    targetPackageId: "5-hours-recording",
    nameEn: "Soundstage RAW Lockouts",
    nameAr: "حجز استوديو وتسجيل خام",
    taglineEn: "Uncompressed 4K ISO Feeds · Multitrack Audio",
    taglineAr: "ملفات 4K خام غير مضغوطة ومسارات صوتية نقية",
    badgeEn: "Pure 4K ISO",
    badgeAr: "تسجيل خام 4K",
    deliverableEn: "RAW Camera Files",
    deliverableAr: "ملفات الكاميرات المستقلة",
    image: "/images/offers/category-soundstage.jpg",
  },
  {
    id: "creator-deals",
    targetPackageId: "vloggers-setup",
    nameEn: "Creator & Special Perks",
    nameAr: "عروض المبدعين والطلاب",
    taglineEn: "Student Fund · YouTube Vloggers Setup · Lunch Break",
    taglineAr: "صندوق الطلاب وباقات اليوتيوب وعروض الظهيرة",
    badgeEn: "Exclusive Perks",
    badgeAr: "مزايا حصرية",
    deliverableEn: "Turnkey Creator Sets",
    deliverableAr: "جلسات مخصصة لصناع المحتوى",
    image: "/images/offers/category-creator-deals.jpg",
  },
];

export function OffersPreviewSection() {
  const { isArabic } = useLanguage();

  return (
    <Section
      id="offers-preview"
      aria-labelledby="offers-preview-title"
      className="bg-[#070709] relative overflow-hidden py-8 sm:py-10 border-y border-white/[0.06]"
    >
      {/* Subtle Studio Key Light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-80 sm:w-[460px] h-28 bg-brand-violet/15 blur-[80px] rounded-full -z-10"
      />

      <Container className="relative z-10">
        {/* ── Sleek, Single-Line Header (No Tabs) ── */}
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-white/[0.06]"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-brand-mauve font-semibold mb-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              <span>
                {isArabic ? "عروض وباقات استوديو حصرية" : "EXCLUSIVE STUDIO PACKAGES"}
              </span>
            </div>

            <h2
              id="offers-preview-title"
              className="text-base sm:text-xl font-bold text-white tracking-tight font-display rtl:font-arabic"
            >
              {isArabic ? "باقات وعروض الإنتاج السينمائي" : "Offers & Production Packages"}
            </h2>
          </div>

          {/* Direct Link to Full Catalog */}
          <Link
            href="/offers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <span>{isArabic ? "عرض كافة الباقات (12)" : "View all packages (12)"}</span>
            <ArrowRight
              size={13}
              className={`text-brand-mauve shrink-0 ${isArabic ? "rotate-180" : ""}`}
            />
          </Link>
        </div>

        {/* ── Clean 4-Card Category Grid (Fast Scanning, No Prices) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {OFFER_CATEGORIES_PREVIEW.map((item) => (
            <div
              key={item.id}
              dir={isArabic ? "rtl" : "ltr"}
              className="group relative rounded-xl border border-white/[0.08] bg-[#0c0c11] hover:border-brand-mauve/40 transition-all duration-200 flex flex-col overflow-hidden hover:-translate-y-0.5 shadow-sm shadow-black/40"
            >
              {/* Thumbnail with Generated Category Visual */}
              <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-zinc-900">
                <Image
                  src={item.image}
                  alt={isArabic ? item.nameAr : item.nameEn}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c11] via-transparent to-black/35" />

                {/* Badge Overlay */}
                <div className="absolute top-2 start-2 z-10">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-violet text-white border border-brand-mauve/40 backdrop-blur-md">
                    {isArabic ? item.badgeAr : item.badgeEn}
                  </span>
                </div>

                <span className="absolute bottom-2 end-2 font-mono text-[9px] uppercase text-zinc-300 bg-black/75 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-md">
                  {isArabic ? "حجز مباشر" : "Instant Book"}
                </span>
              </div>

              {/* Card Details */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-display rtl:font-arabic truncate mb-0.5 group-hover:text-brand-mauve-soft transition-colors">
                    {isArabic ? item.nameAr : item.nameEn}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate mb-3">
                    {isArabic ? item.taglineAr : item.taglineEn}
                  </p>
                </div>

                {/* Clean Bottom Action - No Price */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider truncate">
                    {isArabic ? item.deliverableAr : item.deliverableEn}
                  </span>

                  <Link
                    href={`/offers?package=${item.targetPackageId}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold text-xs text-white bg-white/10 hover:bg-brand-mauve hover:text-black border border-white/10 hover:border-brand-mauve transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <span>{isArabic ? "احجز" : "Book"}</span>
                    <ChevronRight
                      size={12}
                      className={`shrink-0 ${isArabic ? "rotate-180" : ""}`}
                    />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
