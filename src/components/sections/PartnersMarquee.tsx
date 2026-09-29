import Image from "next/image";
import { Marquee } from "@/components/magicui/marquee";
import { GOV_LOGOS, BRAND_LOGOS } from "@/features/partners/data";

export function PartnersMarquee() {
  return (
    <aside
      aria-label="Government and Brand Partners"
      className="relative w-full py-10 sm:py-14 lg:py-20 border-y border-white/5 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col items-center select-none max-w-full"
    >
      {/* Left & Right Smooth Edge Fade Out Mask */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-20" />

      {/* Subtle Section Label */}
      <div className="mb-6 flex items-center justify-center gap-2 px-4 text-center">
        <span className="size-1.5 rounded-full bg-brand-cyan animate-pulse shrink-0" />
        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.15em] sm:tracking-[0.25em] text-text-muted">
          Chosen For UAE Government &amp; Global Brand Productions
        </span>
        <span className="size-1.5 rounded-full bg-brand-purple animate-pulse shrink-0" />
      </div>

      {/* Row 1: Official UAE Government Entities (Pure Logos, Zero Cards) */}
      <div className="w-full relative z-10 mb-6 sm:mb-8">
        <Marquee pauseOnHover repeat={4} gap="4rem" className="[--duration:40s] py-2 items-center">
          {GOV_LOGOS.map((gov) => (
            <div
              key={gov.id}
              title={gov.name}
              className="flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-115 transition-all duration-300 cursor-pointer group"
            >
              <Image
                src={gov.logo}
                alt={gov.name}
                width={160}
                height={55}
                className="h-9 sm:h-12 w-auto object-contain filter group-hover:drop-shadow-[0_0_14px_rgba(196,181,253,0.7)] transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* Row 2: Premier Colorful Commercial Brands (Pure Logos, Reverse Scroll) */}
      <div className="w-full relative z-10">
        <Marquee pauseOnHover reverse repeat={4} gap="4.5rem" className="[--duration:42s] py-2 items-center">
          {BRAND_LOGOS.map((brand) => (
            <div
              key={brand.id}
              title={brand.name}
              className="flex items-center justify-center opacity-75 hover:opacity-100 hover:scale-115 transition-all duration-300 cursor-pointer group"
            >
              {brand.svg ? (
                <div
                  className="flex items-center justify-center filter group-hover:drop-shadow-[0_0_16px_rgba(6,182,212,0.8)] transition-all duration-300"
                  dangerouslySetInnerHTML={{ __html: brand.svg }}
                />
              ) : (
                <Image
                  src={brand.logo!}
                  alt={brand.name}
                  width={150}
                  height={50}
                  className="h-8 sm:h-11 w-auto object-contain filter group-hover:drop-shadow-[0_0_14px_rgba(6,182,212,0.6)] transition-all duration-300"
                />
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </aside>
  );
}
