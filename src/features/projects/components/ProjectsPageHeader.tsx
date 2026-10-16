"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ProjectsPageHeader() {
  const { isArabic } = useLanguage();

  return (
    <SectionHeader
      headingId="projects-title"
      as="h1"
      title={isArabic ? "إنتاجات تتصدر" : "Projects That"}
      gradientText={isArabic ? "شاشات العرض" : "Dominate Screens"}
      description={
        isArabic
          ? "من الحملات الوطنية الكبرى إلى البرامج الرقمية والمسلسلات التي شاهدها الملايين عبر الشرق الأوسط. استكشف قدراتنا الفنية والإبداعية."
          : "From official national campaigns to viral series watched by millions across the Middle East. Explore our creative and technical productions."
      }
    />
  );
}
