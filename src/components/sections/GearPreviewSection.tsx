"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface GearCategoryPreviewItem {
  id: string;
  categorySlug: string;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  badgeEn: string;
  badgeAr: string;
  image: string;
}

const GEAR_CATEGORIES_PREVIEW: GearCategoryPreviewItem[] = [
  {
    id: "cameras",
    categorySlug: "cameras",
    nameEn: "Cinema Cameras",
    nameAr: "كاميرات سينمائية",
    taglineEn: "ARRI Alexa · RED 8K · Sony Cinema",
    taglineAr: "أنظمة ARRI و RED وسلسلة Sony FX",
    badgeEn: "8K & 4K Systems",
    badgeAr: "أنظمة 8K و 4K",
    image: "/images/gear/category-cameras.jpg",
  },
  {
    id: "lenses",
    categorySlug: "lenses",
    nameEn: "Cinema Lenses",
    nameAr: "عدسات سينمائية",
    taglineEn: "Cooke S4/i · Primes & Anamorphics",
    taglineAr: "أطقم Cooke برايم وعدسات أنامورفيك",
    badgeEn: "Full Frame & S35",
    badgeAr: "إطار كامل وسوبر 35",
    image: "/images/gear/category-lenses.jpg",
  },
  {
    id: "lighting",
    categorySlug: "lighting",
    nameEn: "Lighting & Grip",
    nameAr: "إضاءات الاستوديو",
    taglineEn: "Aputure 600c · Astera Titan Tubes",
    taglineAr: "أجهزة Aputure وأنابيب Astera LED",
    badgeEn: "RGBWW & Daylight",
    badgeAr: "إضاءة نهارية وألوان RGB",
    image: "/images/gear/category-lighting.jpg",
  },
  {
    id: "audio",
    categorySlug: "audio",
    nameEn: "Sound & Audio Rigs",
    nameAr: "معدات الصوت الميداني",
    taglineEn: "Sennheiser MKH · Shure · Wireless",
    taglineAr: "ميكروفونات سنهايزر وشور ووحدات لاسلكية",
    badgeEn: "32-Bit Float & Mics",
    badgeAr: "صوت احترافي للبث",
    image: "/images/gear/category-audio.jpg",
  },
];

export function GearPreviewSection() {
  const { t, isArabic } = useLanguage();

  return (
    <Section
      id="gear-preview"
      aria-labelledby="gear-preview-title"
      className="bg-[#070709] relative overflow-hidden py-8 sm:py-10 border-b border-white/[0.06]"
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mauve opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-mauve" />
              </span>
              <span>
                {t("gearPreview.badge")}
              </span>
            </div>

            <h2
              id="gear-preview-title"
              className="text-base sm:text-xl font-bold text-white tracking-tight font-display rtl:font-arabic"
            >
              {t("gearPreview.title")}
            </h2>
          </div>

          {/* Direct Link to Full Gear Catalog */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <span>{t("gearPreview.viewAll", { count: 20 })}</span>
            <ArrowRight
              size={13}
              className={`text-brand-mauve shrink-0 ${isArabic ? "rotate-180" : ""}`}
            />
          </Link>
        </div>

        {/* ── Clean 4-Card Category Grid (Fast Scanning, No Prices) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {GEAR_CATEGORIES_PREVIEW.map((item) => (
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
                  {t("gearPreview.instantReserve")}
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
                  <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
                    {isArabic ? "متاح للطلب الميداني" : "Rental Fleet"}
                  </span>

                  <Link
                    href={`/shop?category=${item.categorySlug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold text-xs text-white bg-white/10 hover:bg-brand-mauve hover:text-black border border-white/10 hover:border-brand-mauve transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <span>{t("gearPreview.reserve")}</span>
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
