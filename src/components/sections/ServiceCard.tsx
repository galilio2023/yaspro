"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { ServiceItem } from "./services.data";

export interface ServiceCardProps {
  service: ServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { isArabic } = useLanguage();

  const displayTitle = isArabic ? (service.arabicTitle || service.title) : service.title;
  const displaySubtitle = isArabic ? (service.arabicSubtitle || service.subtitle) : service.subtitle;

  return (
    <Link
      href={service.href}
      dir={isArabic ? "rtl" : "ltr"}
      className="relative flex flex-col w-[290px] sm:w-[350px] md:w-[380px] h-[450px] sm:h-[480px] rounded-[2.5rem] bg-slate-900 border border-white/10 group/card shrink-0 select-none transition-transform duration-500 hover:-translate-y-2"
    >
      {/* Image Window (Google Labs style: image has margin inside the card) */}
      <div className="relative w-full h-[65%] p-4 sm:p-5 pb-0">
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
          <Image
            src={service.image}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 290px, (max-width: 1200px) 350px, 380px"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
        </div>
      </div>

      {/* Content Area (Clean, always visible text) */}
      <div className="flex flex-col flex-1 px-6 sm:px-8 py-6">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          {displayTitle}
        </h3>
        <p className="text-sm sm:text-base text-slate-400 line-clamp-3">
          {displaySubtitle}
        </p>
        
        <div className="mt-auto flex items-center gap-2 text-sm font-medium text-purple-400">
          {isArabic ? "اكتشف المزيد" : "Learn more"}
          <ArrowUpRight size={16} className="transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
