"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { Video } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function StudioBookingPageHeader() {
  const { isArabic } = useLanguage();

  return (
    <SectionHeader
      headingId="booking-title"
      as="h1"
      badge={isArabic ? "استوديوهات إنتاج متكاملة" : "Professional Studio Space"}
      badgeVariant="gold"
      badgeIcon={<Video size={13} className="text-amber-400" />}
      title={isArabic ? "احجز" : "Book a"}
      gradientText={isArabic ? "استوديو تصوير" : "Studio"}
      description={
        isArabic
          ? "احجز جلسة التصوير الخاصة بك في دقائق. تجهيزات متكاملة، طواقم عمل متمرسة، ومراحل ما بعد الإنتاج مدعومة بالذكاء الاصطناعي مع دفع آمن عبر Ziina."
          : "Secure your session in minutes. Fully customizable setups with professional crew, AI-enhanced post-production, and secure Ziina payment."
      }
    />
  );
}
