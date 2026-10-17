"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export interface CategoryCardItem {
  id: string;
  categorySlug: "cameras" | "lenses" | "accessories" | "lighting" | "audio" | "bundles";
  imageUrl: string;
  filterValue: string;
}

const GEAR_PRODUCT_CATEGORIES: CategoryCardItem[] = [
  {
    id: "cameras-combo",
    categorySlug: "cameras",
    filterValue: "cameras",
    imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
  },
  {
    id: "lenses-filters",
    categorySlug: "lenses",
    filterValue: "lenses",
    imageUrl: "/images/gear/cooke-s4i-set.jpg",
  },
  {
    id: "camera-accessories",
    categorySlug: "accessories",
    filterValue: "accessories",
    imageUrl: "/images/gear/smallhd-cine-7.jpg",
  },
  {
    id: "lights-accessories",
    categorySlug: "lighting",
    filterValue: "lighting",
    imageUrl: "/images/gear/aputure-600c-pro.jpg",
  },
  {
    id: "sound-equipment",
    categorySlug: "audio",
    filterValue: "audio",
    imageUrl: "/images/gear/sennheiser-mkh416-kit.jpg",
  },
  {
    id: "other-equipment",
    categorySlug: "bundles",
    filterValue: "bundles",
    imageUrl: "/images/gear/ob-van-live-pack.jpg",
  },
];

interface ProductsCategoriesGridProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
  counts?: Record<string, number>;
}

export function ProductsCategoriesGrid({
  onSelectCategory,
  selectedCategory,
  counts,
}: ProductsCategoriesGridProps) {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="w-full py-6 sm:py-10 space-y-8 sm:space-y-12 animate-in fade-in duration-500 text-start">
      {/* Title matching cinema equipment catalog */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white font-display">
          {t("shop.categories.products")}
        </h1>
        <span className="block text-3xl sm:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-brand-mauve drop-shadow-[0_0_25px_rgba(152,123,165,0.3)] font-display">
          {t("shop.categories.categories")}
        </span>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {GEAR_PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.filterValue;
          const count = counts?.[cat.filterValue];
          const titlePrefix = t(`shop.categories.${cat.categorySlug}Prefix` as keyof typeof t);
          const titleMain = t(`shop.categories.${cat.categorySlug}Title` as keyof typeof t);

          const content = (
            <div
              className={`group relative h-48 sm:h-56 rounded-3xl overflow-hidden border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-brand-mauve shadow-[0_0_35px_rgba(152,123,165,0.35)] ring-2 ring-brand-mauve/60 bg-brand-violet/15 scale-[1.01]"
                  : "border-white/10 hover:border-brand-mauve/45 hover:shadow-[0_0_25px_rgba(152,123,165,0.2)] bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl"
              }`}
            >
              {/* Background Gear Image with seamless obsidian wash */}
              <div className="absolute right-0 rtl:right-auto rtl:left-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none opacity-45 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500">
                <Image
                  src={cat.imageUrl}
                  alt={titleMain}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-[#070709] via-[#070709]/75 to-transparent" />
              </div>

              {/* Mauve & Violet Ambient Keylight */}
              <div className="absolute -left-10 rtl:-left-auto rtl:-right-10 -bottom-10 size-40 rounded-full bg-brand-violet/20 blur-2xl pointer-events-none group-hover:bg-brand-mauve/25 transition-all" />

              {/* Top Text Content */}
              <div className="relative z-10 space-y-1.5 max-w-[65%]">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold tracking-wider text-brand-mauve uppercase block font-display">
                    {titlePrefix}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-mauve/15 text-brand-mauve border border-brand-mauve/30">
                      {count} {count === 1 ? t("shop.categories.unit") : t("shop.categories.units")}
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight leading-tight whitespace-pre-line group-hover:text-brand-lavender transition-colors font-display">
                  {titleMain}
                </h3>
              </div>

              {/* Bottom Action Indicator */}
              <div className="relative z-10 flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-brand-mauve group-hover:text-brand-lavender uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                  <span>{t("shop.categories.openCategory")}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-mono">
                  {t("shop.categories.locations")}
                </span>
              </div>
            </div>
          );

          if (onSelectCategory) {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.filterValue)}
                className="text-start w-full focus:outline-none"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={cat.id} href={`/shop?category=${cat.filterValue}`}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
