"use client";

import Image from "next/image";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function PartnersMarquee() {
  const { isArabic } = useLanguage();
  return (
    <aside
      aria-label="Government and Brand Partners"
      dir="ltr"
      className="relative w-full py-10 sm:py-14 lg:py-18 border-y border-white/8 bg-zinc-950/60 backdrop-blur-md overflow-hidden flex flex-col items-center select-none max-w-full"
    >
      {/* Edge Fade Masks */}
      <div className="pointer-events-none absolute inset-y-0 start-0 w-16 sm:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 end-0 w-16 sm:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

      {/* Subtle Production Label */}
      <div className="mb-6 flex items-center justify-center gap-2.5 px-4 text-center">
        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] rtl:tracking-normal rtl:font-arabic rtl:normal-case text-zinc-400">
          {isArabic
            ? "شريك الإنتاج المعتمد للمؤسسات الحكومية في الإمارات وكبرى العلامات العالمية"
            : "Chosen For UAE Government & Global Brand Productions"}
        </span>
        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
      </div>

      {/* Row 1: Official UAE Government Entities */}
      <div className="w-full relative z-10 mb-6 sm:mb-8">
        <Marquee pauseOnHover repeat={4} gap="4rem" className="[--duration:40s] py-2 items-center">
          {GOV_LOGOS.map((gov) => (
            <div
              key={gov.id}
              title={gov.name}
              className="flex items-center justify-center opacity-65 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <Image
                src={gov.logo}
                alt={gov.name}
                width={160}
                height={55}
                className="h-9 sm:h-11 w-auto object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* Row 2: Premier Commercial Brands (Reverse Scroll) */}
      <div className="w-full relative z-10">
        <Marquee pauseOnHover reverse repeat={4} gap="4.5rem" className="[--duration:42s] py-2 items-center">
          {BRAND_LOGOS.map((brand) => (
            <div
              key={brand.id}
              title={brand.name}
              className="flex items-center justify-center opacity-65 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {brand.svg ? (
                <div
                  className="flex items-center justify-center filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                  dangerouslySetInnerHTML={{ __html: brand.svg }}
                />
              ) : (
                <Image
                  src={brand.logo!}
                  alt={brand.name}
                  width={150}
                  height={50}
                  className="h-8 sm:h-10 w-auto object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                />
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </aside>
  );
}
