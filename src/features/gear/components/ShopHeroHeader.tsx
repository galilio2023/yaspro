"use client";

import { Camera, ShieldCheck, Truck, Clock } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { FadeUp } from "@/components/animations/MotionWrappers";

export function ShopHeroHeader() {
  const { isArabic } = useLanguage();

  return (
    <div className="mb-10 sm:mb-12">
      <SectionHeader
        headingId="shop-title"
        as="h1"
        badge={isArabic ? "المعدات والبث السينمائي" : "Cinema & Broadcast Gear"}
        badgeVariant="gold"
        badgeIcon={<Camera size={13} />}
        title={isArabic ? "تأجير أحدث المعدات" : "Rent Professional"}
        gradientText={isArabic ? "والباقات السينمائية" : "Equipment"}
        description={
          isArabic
            ? "كاميرات سينمائية فائقة الدقة 8K، عدسات أنامورفيك، أنظمة صوتية لاسلكية، ووحدات بث تلفزيوني OB-VAN متكاملة. جاهزة للتسليم الفوري في دبي، القاهرة، وعَمّان."
            : "Cinema cameras, anamorphic optics, wireless audio, and turnkey OB van packages. Available for rental across Dubai, Cairo, and Amman."
        }
      />

      {/* Trust & Guarantee Highlights Bar */}
      <FadeUp delay={0.08} className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-text-muted">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-full">
          <ShieldCheck size={14} className="text-brand-purple-light shrink-0" />
          <span>{isArabic ? "معايرة وفحص تقني شامل قبل التسليم" : "100% Bench-Tested & Calibrated"}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-full">
          <Truck size={14} className="text-brand-cyan shrink-0" />
          <span>{isArabic ? "توصيل سريع لموقع التصوير في الإمارات" : "Fast UAE Soundstage & Set Delivery"}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3.5 py-1.5 rounded-full">
          <Clock size={14} className="text-amber-400 shrink-0" />
          <span>{isArabic ? "دعم فني هندسي 24/7 طوال فترة التصوير" : "24/7 On-Call Production Engineer"}</span>
        </div>
      </FadeUp>
    </div>
  );
}
