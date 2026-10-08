"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { BookingHero } from "./ui/BookingKit";

const SPECS_EN = [
  { label: "Soundstages", value: "Green Cyclorama · Black Box · LED XR" },
  { label: "Rigging", value: "Motorized Aputure Overhead Grid" },
  { label: "Support", value: "Green Room, Dressing Suite & Fiber Link" },
  { label: "Location", value: "Iris Bay Tower, Level 18 · Dubai" },
];

const SPECS_AR = [
  { label: "الاستوديوهات", value: "شاشة خضراء · بلاك بوكس · استوديو افتراضي XR" },
  { label: "الإضاءة", value: "شبكة علوية متحركة مجهزة بأنظمة Aputure" },
  { label: "المرافق", value: "غرفة كبار الشخصيات · غرف تبديل · فايبر فائق السرعة" },
  { label: "الموقع", value: "برج إيريس باي · الطابق 18 · دبي" },
];

export function StudioBookingPageHeader() {
  const { isArabic } = useLanguage();

  return (
    <div className="mb-4 sm:mb-6">
      <BookingHero
        headingId="booking-title"
        eyebrow={isArabic ? "استوديوهات إنتاج متكاملة · الطابق 18" : "Soundstages · Virtual XR · Level 18"}
        title={isArabic ? "حجز استوديو" : "Studio & Soundstage"}
        accent={isArabic ? "تصوير احترافي" : "Booking"}
        description={
          isArabic
            ? "احجز مساحات التصوير والإنتاج الافتراضي (XR) وطواقم العمل المتخصصة ومعدات التصوير السينمائية في دبي."
            : "Reserve production soundstages, virtual XR volumes, motorized lighting grids, and dedicated camera operators in Business Bay, Dubai."
        }
        specs={isArabic ? SPECS_AR : SPECS_EN}
        crossLink={{
          href: "/podcast-booking",
          label: isArabic
            ? "هل تبحث تحديداً عن تسجيل بودكاست ومقاطع ريلز قصيرة؟"
            : "Looking specifically for Podcast Recording & Social Reels?",
          cta: isArabic ? "انتقل إلى جناح البودكاست المخصص" : "Go to Dedicated Podcast Suite",
        }}
      />
    </div>
  );
}
