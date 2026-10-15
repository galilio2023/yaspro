"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { BookingHero } from "@/features/booking/components/ui/BookingKit";
import { OffersBookingWizard } from "@/features/offers/components/OffersBookingWizard";
import { HelpCircle } from "lucide-react";

import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import type { OfferBundleItem } from "@/features/offers/types";

export function OffersPageClient({ catalog }: { catalog?: OfferBundleItem[] }) {
  const { isArabic } = useLanguage();

  const packageCount = (catalog ?? OFFERS_AND_BUNDLES).filter((item) => item.isActive !== false).length;

  const specs = [
    {
      label: isArabic ? "الموقع" : "Location",
      value: "Iris Bay Tower, Level 18 · DXB",
    },
    {
      label: isArabic ? "الباقات المتوفرة" : "Available Deals",
      value: isArabic ? `${packageCount} باقة وعرض حصري` : `${packageCount} Curated Packages`,
    },
    {
      label: isArabic ? "بوابة الدفع" : "Payment Gateway",
      value: isArabic ? "دفع فوري عبر Ziina" : "Instant Ziina / Apple Pay",
    },
    {
      label: isArabic ? "التسليم" : "Deliverables",
      value: isArabic ? "4K RAW / ميكس فوري / ماستر" : "4K RAW / Live Mix / Masters",
    },
  ];

  const faqs = [
    {
      qEn: "Can I split the 10-hour bundle across multiple days?",
      qAr: "هل يمكن تجزئة باقة الـ 10 ساعات على عدة أيام؟",
      aEn: "Yes! The 10-hour bundle can be scheduled as two 5-hour sessions or tailored according to your production schedule in coordination with our floor director.",
      aAr: "نعم بالتأكيد! يمكنك تقسيم باقة الـ 10 ساعات على جلستين مدة كل منهما 5 ساعات، أو تنسيقها بما يناسب جدول تصويرك بالتنسيق مع مخرج العمليات.",
    },
    {
      qEn: "How does the Student Fund offer work?",
      qAr: "كيف يعمل عرض صندوق الطلاب والشباب؟",
      aEn: "The Student Fund provides a subsidized studio rate of AED 390. Simply present a valid higher education student ID upon studio check-in on the day of your booking.",
      aAr: "يقدم عرض الطلاب سعراً مدعوماً بقيمة 390 درهم للساعة. كل ما عليك هو إبراز بطاقة جامعية سارية المفعول عند حضورك إلى الاستوديو في موعد جلستك.",
    },
    {
      qEn: "What payment methods are supported through Ziina?",
      qAr: "ما هي طرق الدفع المعتمدة عبر بوابة Ziina؟",
      aEn: "Ziina supports Apple Pay, Google Pay, and all major Visa, Mastercard, and international credit/debit cards with instant confirmation and bank-level encryption.",
      aAr: "تدعم منصة Ziina الدفع عبر Apple Pay و Google Pay وكافة بطاقات فيزا وماستركارد والبطاقات البنكية الدولية مع تشفير مصرفي آمن وتأكيد فوري.",
    },
    {
      qEn: "What happens if I need to reschedule my session?",
      qAr: "ماذا يحدث إذا احتجت إلى إعادة جدولة موعد الجلسة؟",
      aEn: "You can reschedule your booked session up to 24 hours prior to the call time with zero penalty fees via our WhatsApp concierge hotline (+971 55 401 0465).",
      aAr: "يمكنك إعادة جدولة موعدك المحجوز مجاناً قبل 24 ساعة على الأقل من موعد التصوير عبر التواصل المباشر مع خدمة العملاء والعمليات عبر واتساب (+971 55 401 0465).",
    },
  ];

  return (
    <Section
      id="offers-booking-page"
      aria-labelledby="offers-booking-title"
      className="py-6 sm:py-12 md:py-20 bg-background min-h-screen"
    >
      <Container>
        {/* Cinematic Booking Hero */}
        <BookingHero
          headingId="offers-booking-title"
          eyebrow={
            isArabic
              ? "باقات تصوير متكاملة • عروض تفضيلية • برج آيريس باي دبي"
              : "Curated Studio Deals · Special Lockout Rates · Iris Bay Dubai"
          }
          title={isArabic ? "عروض وباقات" : "Offers &"}
          accent={isArabic ? "الإنتاج والاستوديو" : "Bundles"}
          description={
            isArabic
              ? "احصل على أفضل قيمة إنتاجية مع باقات الساعات المجمعة، الميكس المباشر، وخدمات المونتاج الشاملة بأعلى معايير الجودة السينمائية في دبي."
              : "Unlock turnkey soundstage recording hours, live multi-cam mixing, and high-end post-production suites at preferential lockout rates."
          }
          specs={specs}
          crossLink={{
            href: "/studio-booking",
            label: isArabic
              ? "هل ترغب في تخصيص حجز استوديو مفصل بالساعة؟"
              : "Looking for custom hourly studio configuration?",
            cta: isArabic ? "مخصص حجز الاستوديوهات" : "Custom Studio Builder",
          }}
        />

        {/* Dynamic 3-Step Wizard */}
        <OffersBookingWizard catalog={catalog} />

        {/* ── Production FAQs ── */}
        <div className="mt-16 sm:mt-24 pt-12 border-t border-white/[0.08] max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-brand-mauve font-semibold">
              {isArabic ? "الأسئلة الشائعة" : "FREQUENTLY ASKED QUESTIONS"}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              {isArabic ? "كل ما تود معرفته عن العروض والباقات" : "Everything You Need to Know"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0c0c10] border border-white/[0.06] space-y-2 text-start"
              >
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <HelpCircle size={15} className="text-brand-mauve shrink-0" />
                  <h4>{isArabic ? faq.qAr : faq.qEn}</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6 rtl:pl-0 rtl:pr-6">
                  {isArabic ? faq.aAr : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
