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
      className="relative flex flex-col w-[290px] sm:w-[350px] md:w-[380px] h-[450px] sm:h-[480px] rounded-3xl bg-zinc-900/80 border border-white/8 group/card shrink-0 select-none transition-all duration-300 hover:border-white/20 hover:-translate-y-1.5 shadow-xl shadow-black/40"
    >
      {/* Image Window with Film Vignette */}
      <div className="relative w-full h-[65%] p-4 sm:p-5 pb-0">
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950">
          <Image
            src={service.image}
            alt={displayTitle}
            fill
            sizes="(max-width: 768px) 290px, (max-width: 1200px) 350px, 380px"
            className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 px-6 sm:px-8 py-5">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          {displayTitle}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
          {displaySubtitle}
        </p>
        
        <div className="mt-auto flex items-center gap-2 text-sm font-medium text-zinc-300 group-hover/card:text-amber-400 transition-colors">
          <span>{isArabic ? "اكتشف المزيد" : "Explore Studio Capability"}</span>
          <ArrowUpRight size={16} className="transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
