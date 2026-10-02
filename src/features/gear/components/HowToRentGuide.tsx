"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  FileCheck2,
  ShieldCheck,
  Truck,
  Building2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

export function HowToRentGuide() {
  const { isArabic } = useLanguage();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      step: 1,
      badge: isArabic ? "الخطوة ١" : "Step 1",
      title: isArabic ? "اختيار المعدات وتحديد الأيام" : "Select Gear & Shoot Schedule",
      shortDesc: isArabic
        ? "تصفح كتالوج الكاميرات والعدسات والباقات، وحدد أيام التصوير مع تطبيق خصومات الإيجار الأسبوعي تلقائيًا."
        : "Browse cinema cameras, anamorphic lenses, and kits. Rental rates automatically discount for 3+ days and weekly hires.",
      icon: CalendarDays,
      details: [
        {
          title: isArabic ? "خصومات الفترات الطويلة" : "Duration Discounts",
          desc: isArabic
            ? "خصم 20% عند حجز 3 أيام وخصم 35% للحجز الأسبوعي (7 أيام)، مع أسعار خاصة للمشاريع الشهرية."
            : "20% discount for 3-day hires and 35% discount for weekly hires, with special negotiated rates for monthly principal photography.",
        },
        {
          title: isArabic ? "حجز الكاميرات المشروطة" : "Camera Prep & Lens Testing",
          desc: isArabic
            ? "إمكانية حجز جلسة فحص ومعايرة للكاميرا والعدسات (Camera Prep) في الاستوديو مجانًا قبل يوم التصوير."
            : "Complimentary 2-hour camera prep bench time at our Iris Bay studio prior to call sheet day.",
        },
      ],
    },
    {
      step: 2,
      badge: isArabic ? "الخطوة ٢" : "Step 2",
      title: isArabic ? "التحقق الرقمي والتوثيق (KYC)" : "Digital Identity & KYC",
      shortDesc: isArabic
        ? "توثيق سريع وآمن عبر بطاقة الهوية الإماراتية للمقيمين، أو جواز السفر لشركات الإنتاج الزائرة من الخارج."
        : "Frictionless identity verification via Emirates ID for UAE residents, or Passport & Carnet for international crews.",
      icon: FileCheck2,
      details: [
        {
          title: isArabic ? "للمقيمين والشركات المحلية" : "UAE Residents & Companies",
          desc: isArabic
            ? "صورة الهوية الإماراتية + الرخصة التجارية (للشركات) لتسجيل الحساب المعتمد في دقائق."
            : "Emirates ID copy and Trade License (for production companies) for instant onboarding.",
        },
        {
          title: isArabic ? "للأطقم الدولية الزائرة" : "Visiting International Crews",
          desc: isArabic
            ? "جواز السفر وتفاصيل موقع الإقامة في دبي، مع توفير خطابات تصريح التصوير الرسمية عند الحاجة."
            : "Passport copy and hotel/production base address in Dubai. ATA Carnet assistance provided.",
        },
      ],
    },
    {
      step: 3,
      badge: isArabic ? "الخطوة ٣" : "Step 3",
      title: isArabic ? "الدفع وحجز التأمين المسترد" : "Payment & Refundable Deposit Hold",
      shortDesc: isArabic
        ? "سداد رسوم الإيجار عبر Ziina أو Apple Pay أو البطاقة، مع حجز تأمين مسترد يُعاد لحسابك فور إعادة المعدات."
        : "Pay hire fees seamlessly via Apple Pay, Cards, or Bank Transfer. Refundable security deposit is held and released upon return.",
      icon: ShieldCheck,
      details: [
        {
          title: isArabic ? "بوابة دفع إماراتية آمنة (Ziina)" : "Native UAE Payments (Ziina)",
          desc: isArabic
            ? "دفع فوري عبر Apple Pay أو بطاقات فيزا/ماستركارد مع إيصال ضريبي فوري معتمد (VAT 5%)."
            : "Instant payment via Apple Pay, Google Pay, or Visa/Mastercard with official UAE VAT invoice.",
        },
        {
          title: isArabic ? "إرجاع فوري للتأمين" : "Instant Deposit Release",
          desc: isArabic
            ? "يتم فحص المعدات وإلغاء حجز مبلغ التأمين تلقائيًا خلال 24 ساعة من فحص الاستلام."
            : "Pre-authorized deposit hold is canceled back to your card within 24 hours of technical bench check.",
        },
      ],
    },
    {
      step: 4,
      badge: isArabic ? "الخطوة ٤" : "Step 4",
      title: isArabic ? "استلام من آيريس باي أو توصيل للّوكيشن" : "Iris Bay Pickup or Set Delivery",
      shortDesc: isArabic
        ? "استلم معداتك معقمة ومفحوصة من مقرنا في الخليج التجاري، أو اختر التوصيل بسيارات الإنتاج المجهزة لموقع التصوير."
        : "Pick up calibrated gear from our Business Bay hub (Iris Bay Tower) or request temperature-controlled van delivery to set.",
      icon: Truck,
      details: [
        {
          title: isArabic ? "الاستلام من المركز (مجانًا)" : "Iris Bay Tower Hub (Free)",
          desc: isArabic
            ? "الخليج التجاري، دبي. تتوفر مواقف مخصصة وتفريغ مباشر، مع فحص العدسات والأوزان مع فني المعدات."
            : "Business Bay, Dubai. Dedicated loading bays with hands-on check with a Yas Pro gear technician.",
        },
        {
          title: isArabic ? "سيارات توصيل مجهزة للإنتاج" : "Dedicated Climate-Controlled Vans",
          desc: isArabic
            ? "توصيل مباشر إلى مواقع التصوير في دبي وأبوظبي والشارقة مع حقائب الحماية Pelican الصارمة."
            : "Direct set delivery across Dubai and Abu Dhabi in shock-padded, Pelican-cased flight transports.",
        },
      ],
    },
  ];

  const faqs = [
    {
      q: isArabic ? "كيف يتم احتساب أيام الإيجار وساعات الاستلام والإرجاع؟" : "What is the standard rental day and return window?",
      a: isArabic
        ? "يبدأ يوم الإيجار من الساعة 09:00 صباحاً حتى 09:00 صباح اليوم التالي (24 ساعة كاملة). يُسمح باستلام المعدات في المساء السابق (بين 06:00 م و 08:30 م) مجانًا لتجهيز طاقم التصوير."
        : "A standard rental day is 24 hours (09:00 AM to 09:00 AM next day). We offer complimentary prep pickup the evening prior (between 06:00 PM and 08:30 PM) so your camera team is ready for sunrise call times.",
    },
    {
      q: isArabic ? "هل المعدات مؤمنة ضد التلف أو الكسر أثناء التصوير؟" : "Is equipment insured against accidental damage on set?",
      a: isArabic
        ? "جميع المعدات مفحوصة ومعايرة بدقة. نوفر خيار 'إعفاء التلف العرضي' (Damage Waiver) بنسبة 10% من قيمة الإيجار لتغطية أي حوادث تصوير غير مقصودة، أو يمكنك تقديم بوليصة تأمين الإنتاج المعتمدة للشركة."
        : "All equipment leaves bench-tested. You can opt for our 10% Production Damage Waiver for accidental set mishaps, or provide your company's UAE Film Production Insurance COI.",
    },
    {
      q: isArabic ? "هل يتوفر فني كاميرات أو مهندس إضاءة مرافق للمعدات؟" : "Can you supply a 1st AC, Focus Puller, or Gaffer with the gear?",
      a: isArabic
        ? "نعم! يس برو توفر أطقم تقنية معتمدة تشمل: مساعد مصور أول (1st AC)، مهندس فوكس لاسلكي، وفني إضاءة وصوت سينمائي متمرس لدعم إنتاجك طوال ساعات التصوير."
        : "Yes! Yas Pro can assign vetted cinema crew members alongside your rental: 1st AC / Focus Puller, DIT / Data Wrangler, Gaffer, and Sound Recordist for full peace of mind.",
    },
  ];

  return (
    <div className="my-16 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/60 p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-wider mb-4">
          <Sparkles size={13} />
          <span>{isArabic ? "دليل وبروتوكول الاستئجار في دبي" : "Dubai Film Gear Rental Protocol"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-white font-display tracking-tight">
          {isArabic ? "كيف تستأجر معداتك السينمائية؟" : "How Cinema Rental Works"}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-text-secondary leading-relaxed">
          {isArabic
            ? "نظام سلس مصمم لتلبية متطلبات أطقم الإنتاج المحترفة في الإمارات، من الحجز الفوري حتى التسليم في موقع التصوير."
            : "A high-efficiency workflow designed for professional production crews in the UAE, from instant reservation to live set delivery."}
        </p>
      </div>

      {/* 4 Interactive Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10 mb-12">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveStep(idx)}
              aria-pressed={isSelected}
              className={cn(
                "relative text-start p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group",
                isSelected
                  ? "bg-amber-500/[0.08] border-amber-500/40 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={cn(
                      "text-[11px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider",
                      isSelected
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-white/5 text-text-muted border border-white/5"
                    )}
                  >
                    {s.badge}
                  </span>
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-amber-400 text-black shadow-md shadow-amber-500/30"
                        : "bg-white/5 text-text-secondary group-hover:text-white group-hover:bg-white/10"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">{s.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">{s.shortDesc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className={cn("font-medium", isSelected ? "text-amber-400" : "text-text-muted")}>
                  {isSelected
                    ? isArabic
                      ? "المعلومات التفصيلية بالأسفل"
                      : "Details active below"
                    : isArabic
                    ? "انقر للتفاصيل"
                    : "Click to explore"}
                </span>
                <span
                  className={cn(
                    "size-2 rounded-full transition-transform duration-300",
                    isSelected ? "bg-amber-400 scale-125" : "bg-white/20"
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Active Step Information Banner */}
      <div className="relative z-10 rounded-2xl border border-amber-500/20 bg-black/40 p-6 sm:p-8 mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              {React.createElement(steps[activeStep].icon, { size: 24 })}
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                {steps[activeStep].badge}
              </span>
              <h4 className="text-lg sm:text-xl font-bold text-white font-display">
                {steps[activeStep].title}
              </h4>
            </div>
          </div>
          <span className="text-xs font-mono text-text-muted px-3 py-1 rounded-full bg-white/5 border border-white/10">
            {isArabic ? "البروتوكول الرسمي - يس برو دبي" : "Official Yas Pro Dubai Protocol"}
          </span>
        </div>

        <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-3xl">
          {steps[activeStep].shortDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {steps[activeStep].details.map((detail, dIdx) => (
            <div
              key={dIdx}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3"
            >
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-semibold text-white mb-1">{detail.title}</h5>
                <p className="text-xs text-text-muted leading-relaxed">{detail.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hub Location & Direct Dispatch Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 mb-12">
        {/* Hub Card */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
            <Building2 size={22} className="text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              {isArabic ? "المقر والمستودع الرئيسي" : "Central Distribution Hub"}
            </span>
            <h4 className="text-base font-bold text-white mt-1">
              {isArabic ? "برج آيريس باي، الخليج التجاري، دبي" : "Iris Bay Tower, Business Bay, Dubai"}
            </h4>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {isArabic
                ? "مرفق مجهز بطاولات فحص الكاميرات (Collimator Test) ومعدات قياس العدسات، مع منطقة تحميل مخصصة لسيارات الإنتاج."
                : "Equipped with lens optical projection benches, collimators, and dedicated drive-in loading bays for rapid equipment handover."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-text-muted">
              <span>⏰ 09:00 AM – 09:00 PM</span>
              <span>📍 {isArabic ? "الخليج التجاري، دبي" : "Business Bay, Dubai"}</span>
            </div>
          </div>
        </div>

        {/* Set Delivery Card */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
            <Truck size={22} className="text-amber-400" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              {isArabic ? "التوصيل الميداني للوكيشن" : "On-Set Direct Dispatch"}
            </span>
            <h4 className="text-base font-bold text-white mt-1">
              {isArabic ? "تغطية كاملة لكافة إمارات الدولة ومواقع التصوير" : "UAE-Wide Set & Soundstage Delivery"}
            </h4>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              {isArabic
                ? "سيارات نقل مكيّفة ومجهزة بحقائب Pelican مقاومة للصدمات. توصيل مباشر إلى استوديوهات دبي، استوديوهات twofour54 بأبوظبي، وصحراء القدرة."
                : "Air-conditioned dispatch transport in heavy-duty Pelican air flight cases directly to Dubai Studio City, twofour54 Abu Dhabi, or desert sets."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-text-muted">
              <span>⚡ {isArabic ? "توصيل عاجل في نفس اليوم" : "Same-Day Rush Available"}</span>
              <span>🛡️ {isArabic ? "نقل مؤمّن بالكامل" : "Fully Insured Transport"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Rental Questions */}
      <div className="relative z-10 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle size={18} className="text-amber-400" />
          <h3 className="text-lg font-bold text-white font-display">
            {isArabic ? "الأسئلة الشائعة حول التأجير والضمان" : "Rental Terms & FAQ"}
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 text-start flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-text-muted transition-transform duration-300 shrink-0",
                      isOpen && "rotate-180 text-amber-400"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-text-secondary leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
