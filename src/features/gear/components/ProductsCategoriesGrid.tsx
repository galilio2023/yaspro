"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface CategoryCardItem {
  id: string;
  titlePrefix: string;
  titleMain: string;
  categorySlug: string;
  imageUrl: string;
  filterValue: string;
}

export const GEAR_PRODUCT_CATEGORIES: CategoryCardItem[] = [
  {
    id: "cameras-combo",
    titlePrefix: "RENT",
    titleMain: "CAMERAS\n& COMBO KITS",
    categorySlug: "cameras",
    filterValue: "cameras",
    imageUrl: "/images/gear/arri-alexa-mini-lf.jpg",
  },
  {
    id: "lenses-filters",
    titlePrefix: "RENT",
    titleMain: "LENSES\n& FILTERS",
    categorySlug: "lenses",
    filterValue: "lenses",
    imageUrl: "/images/gear/cooke-s4i-set.jpg",
  },
  {
    id: "camera-accessories",
    titlePrefix: "RENT CAMERA",
    titleMain: "ACCESSORIES",
    categorySlug: "accessories",
    filterValue: "accessories",
    imageUrl: "/images/gear/smallhd-cine-7.jpg",
  },
  {
    id: "lights-accessories",
    titlePrefix: "RENT LIGHTS &",
    titleMain: "ACCESSORIES",
    categorySlug: "lighting",
    filterValue: "lighting",
    imageUrl: "/images/gear/aputure-600c-pro.jpg",
  },
  {
    id: "sound-equipment",
    titlePrefix: "RENT SOUND",
    titleMain: "EQUIPMENT",
    categorySlug: "audio",
    filterValue: "audio",
    imageUrl: "/images/gear/sennheiser-mkh416-kit.jpg",
  },
  {
    id: "other-equipment",
    titlePrefix: "RENT OTHER",
    titleMain: "EQUIPMENT & KITS",
    categorySlug: "bundles",
    filterValue: "bundles",
    imageUrl: "/images/gear/ob-van-live-pack.jpg",
  },
];

interface ProductsCategoriesGridProps {
  onSelectCategory?: (category: string) => void;
  selectedCategory?: string;
}

export function ProductsCategoriesGrid({
  onSelectCategory,
  selectedCategory,
}: ProductsCategoriesGridProps) {
  return (
    <div className="w-full my-10 sm:my-16 space-y-8 animate-in fade-in duration-500">
      {/* Title matching WordPress page */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
          PRODUCTS
        </h2>
        <span className="block text-2xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          CATEGORIES
        </span>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
        {GEAR_PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.filterValue;

          const content = (
            <div
              className={`group relative h-44 sm:h-52 rounded-3xl overflow-hidden border transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-purple-400 shadow-[0_0_35px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/80 scale-[1.01]"
                  : "border-purple-900/30 hover:border-purple-500/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] bg-gradient-to-br from-[#201030] via-[#140b22] to-[#0c0515]"
              }`}
            >
              {/* Background Gear Image with purple film wash */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500">
                <Image
                  src={cat.imageUrl}
                  alt={cat.titleMain}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#201030] via-[#201030]/60 to-transparent" />
              </div>

              {/* Purple Ambient Glow */}
              <div className="absolute -left-10 -bottom-10 size-40 rounded-full bg-purple-600/15 blur-2xl pointer-events-none group-hover:bg-purple-600/25 transition-all" />

              {/* Text Content */}
              <div className="relative z-10 space-y-1 max-w-[65%]">
                <span className="text-xs sm:text-sm font-extrabold tracking-wider text-purple-300 uppercase block">
                  {cat.titlePrefix}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight leading-tight whitespace-pre-line group-hover:text-purple-200 transition-colors">
                  {cat.titleMain}
                </h3>
              </div>

              {/* Bottom Action Indicator */}
              <div className="relative z-10 flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-purple-400/80 uppercase tracking-wider group-hover:text-purple-300 flex items-center gap-1">
                  Explore Gear
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
                className="text-left w-full focus:outline-none"
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
