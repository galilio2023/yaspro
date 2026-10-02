"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { Users } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function InfluencersPageHeader() {
  const { isArabic } = useLanguage();

  return (
    <SectionHeader
      headingId="influencers-title"
      as="h1"
      badge={isArabic ? "شريك إنتاج صناع المحتوى" : "Creator Production Partner"}
      badgeVariant="default"
      badgeIcon={<Users size={13} />}
      title={isArabic ? "منصة انطلاق نخبة" : "Where Elite"}
      gradientText={isArabic ? "المؤثرين والمبدعين" : "Creators Thrive"}
      description={
        isArabic
          ? "الوجهة الأولى لألمع صناع المحتوى في العالم العربي بجمهور يتجاوز 400+ مليون متابع. استوديوهات بودكاست متطورة، إنتاج مسلسلات وتجهيزات تصوير متكاملة."
          : "Trusted by top-tier Arab influencers with over 400M+ combined audience. From podcast spaces to full-scale viral series production."
      }
    />
  );
}
