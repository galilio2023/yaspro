"use client";

import { SectionHeader } from "@/components/ui/section-header";
import { Video } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Link from "next/link";

export function StudioBookingPageHeader() {
  const { isArabic } = useLanguage();

  return (
    <div className="space-y-4 mb-8">
      <SectionHeader
        headingId="booking-title"
        as="h1"
        badge={isArabic ? "استوديوهات إنتاج متكاملة" : "Professional Studio Space"}
        badgeVariant="gold"
        badgeIcon={<Video size={13} className="text-amber-400" />}
        title={isArabic ? "احجز" : "Book a"}
        gradientText={isArabic ? "استوديو تصوير" : "Soundstage & Studio"}
        description={
          isArabic
            ? "احجز مساحات التصوير والإنتاج الافتراضي (XR) وطواقم العمل المتخصصة ومعدات التصوير السينمائية."
            : "Reserve production soundstages, virtual XR volumes, cinema camera packages, and sound stages in Dubai."
        }
      />
      <div className="flex items-center justify-center">
        <Link
          href="/podcast-booking"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition shadow-sm"
        >
          <span>🎙️ Looking specifically for Podcast Recording & Social Reels?</span>
          <span className="underline font-bold">Go to Dedicated Podcast Suite →</span>
        </Link>
      </div>
    </div>
  );
}
