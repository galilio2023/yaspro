"use client";

import React, { useState, useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Camera,
  Radio,
  Video,
  Sparkles,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Film,
  Zap,
  ShieldCheck,
  ChevronRight,
  Loader2,
  Clock,
  Sliders,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { studioSprings, tactilePress } from "@/lib/studio-motion";
import { submitInquiry } from "@/lib/actions";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { cn } from "@/lib/utils";

type ServiceCategoryFilter = "all" | "studios" | "broadcast" | "gear";

interface ServiceCardData {
  id: string;
  category: "studios" | "broadcast" | "gear";
  badgeEn: string;
  badgeAr: string;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  specsEn: string[];
  specsAr: string[];
  ctaEn: string;
  ctaAr: string;
  href?: string;
  actionType?: "inquiry";
  inquiryService?: "ob_van" | "outdoor_filming";
  isFeatured?: boolean;
}

const SERVICES_CATALOG: ServiceCardData[] = [
  {
    id: "offers-bundles",
    category: "gear",
    badgeEn: "Best Value Packages",
    badgeAr: "باقات التوفير الشاملة",
    titleEn: "Production Offers & Bundles",
    titleAr: "العروض والباقات الإنتاجية المتكاملة",
    subtitleEn: "All-in-one curated packages combining stages, cinema gear kits & technical crew",
    subtitleAr: "باقات شاملة تجمع بين حجز الاستوديوهات، أطقم الكاميرات السينمائية، والإضاءة وطواقم العمل",
    descriptionEn:
      "Engineered for agencies and creators looking for turnkey production efficiency. Save significantly with bundled studio hours, ARRI/RED camera packages, lighting grids, and certified audio engineers.",
    descriptionAr:
      "مصممة للوكالات وصناع المحتوى الباحثين عن كفاءة إنتاجية قصوى. وفّر ميزانيتك مع ساعات استوديو وباقات كاميرات ARRI وRED، وشبكات إضاءة ومهندسي صوت معتمدين.",
    image: "/images/modal/offers-bundles-card.jpg",
    specsEn: ["Package Cost Savings", "Soundstage + ARRI Gear", "Sound & Gaffer Included", "Instant Digital Confirmation"],
    specsAr: ["توفير مضمون في التكلفة", "استوديو + معدات ARRI", "فني إضاءة ومهندس صوت", "تأكيد فوري للحجز"],
    ctaEn: "Explore All Bundles",
    ctaAr: "استعرض كافة العروض",
    href: "/offers",
    isFeatured: true,
  },
  {
    id: "studio-booking",
    category: "studios",
    badgeEn: "Flagship Facility",
    badgeAr: "المقر الرئيسي المتطور",
    titleEn: "Soundstages & Production Studios",
    titleAr: "استوديوهات ومسارح التصوير الرئيسية",
    subtitleEn: "STC 65+ acoustic soundproof stages, motorized DMX lighting grid & infinite cyc",
    subtitleAr: "عزل صوتي كامل STC 65+، شبكة إضاءة DMX علوية متحركة، وكروما لا نهائية",
    descriptionEn:
      "Acoustically certified production stages located in Iris Bay, Business Bay. Built for feature films, high-budget commercials, and multi-camera live tracking with dedicated VIP greenrooms.",
    descriptionAr:
      "استوديوهات معتمدة صوتياً تقع في برج آيريس باي، الخليج التجاري دبي. مجهزة لتصوير الأفلام الروائية، الإعلانات الضخمة، والإنتاج التلفزيوني مع غرف استراحة VIP.",
    image: "/images/modal/studio-booking-card.jpg",
    specsEn: ["STC 65+ Floating Box", "Motorized DMX SkyPanels", "270° Micro-LED Volume", "VIP Dressing & Greenrooms"],
    specsAr: ["عزل صوتي STC 65+", "إضاءات SkyPanel أوتوماتيكية", "مسرح ليد افتراضي 270°", "غرف استراحة ومكياج VIP"],
    ctaEn: "Book Studio Stage",
    ctaAr: "احجز الاستوديو الآن",
    href: "/studio-booking",
  },
  {
    id: "podcast-booking",
    category: "studios",
    badgeEn: "Turnkey Creator Suite",
    badgeAr: "استوديو البودكاست المتكامل",
    titleEn: "4K Multi-Cam Podcast Lounge",
    titleAr: "استوديو البودكاست وصناعة المحتوى",
    subtitleEn: "Shure SM7B broadcast microphones, AI auto-switching & same-day social delivery",
    subtitleAr: "ميكروفونات Shure SM7B للبث، تبديل ذكي للكاميرات، وتسليم مقاطع السوشيال بنفس اليوم",
    descriptionEn:
      "Acoustically treated broadcast lounge designed for talk shows, executive interviews, and viral social content. Features multi-angle Sony FX6 cameras and live dynamic audio mastering.",
    descriptionAr:
      "صالة بث معزولة صوتياً مصممة للبرامج الحوارية واللقاءات القيادية. مزودة بـ 4 كاميرات Sony FX6 متعددة الزوايا مع هندسة صوتية فورية.",
    image: "/images/modal/podcast-booking-card.jpg",
    specsEn: ["4x 4K Sony FX6/FX3 Chains", "Shure SM7B Dynamic Mics", "Rodecaster Pro II Console", "Same-Day Viral Reels & Shorts"],
    specsAr: ["4 كاميرات 4K Sony متزامنة", "ميكروفونات Shure SM7B للبث", "ميكسر Rodecaster Pro II", "تسليم ريلز وفيديوهات في نفس اليوم"],
    ctaEn: "Book Podcast Suite",
    ctaAr: "احجز صالة البودكاست",
    href: "/podcast-booking",
  },
  {
    id: "gear-rental",
    category: "gear",
    badgeEn: "Cinema Inventory",
    badgeAr: "مستودع المعدات السينمائية",
    titleEn: "Cinema Equipment & Gear Rental",
    titleAr: "استئجار وتأجير معدات السينما",
    subtitleEn: "Tier-One ARRI Alexa Mini LF, RED V-Raptor XL, Cooke S4/i Cine Lenses & Lighting",
    subtitleAr: "أحدث كاميرات ARRI وRED، عدسات Cooke السينمائية، ووحدات إضاءة Aputure الاحترافية",
    descriptionEn:
      "Extensive in-house rental inventory maintained by certified camera technicians. Rent individual cinema bodies, anamorphic lenses, wireless Teradek video links, or full lighting grip trucks.",
    descriptionAr:
      "مستودع تأجير متكامل يخضع للفحص والمعايرة من فنيي الكاميرات. استأجر كاميرات سينمائية، عدسات أنامورفيك، أنظمة بث لاسلكي Teradek، أو شاحنات إضاءة متكاملة.",
    image: "/images/gear/arri-commercial-cinema-kit.jpg",
    specsEn: ["ARRI Alexa Mini LF & RED Raptor", "Cooke S4/i & Anamorphic Lenses", "Teradek Bolt 4K Wireless", "Bench-Tested Prior to Pickup"],
    specsAr: ["كاميرات ARRI وRED سينمائية", "عدسات Cooke وأنامورفيك", "بث لاسلكي Teradek 4K", "فحص ومعايرة قبل الاستلام"],
    ctaEn: "Browse Gear Catalog",
    ctaAr: "تصفح مستودع المعدات",
    href: "/shop",
  },
  {
    id: "outdoor-filming",
    category: "broadcast",
    badgeEn: "On-Location Units",
    badgeAr: "تصوير ميداني وتصاريح",
    titleEn: "On-Location & Outdoor Filming",
    titleAr: "وحدات التصوير الميداني والإنتاج الخارجي",
    subtitleEn: "Full-scale mobile field production across Dubai & UAE deserts, dollies, drones & permits",
    subtitleAr: "وحدات تصوير ميداني متكاملة في دبي ومواقع الإمارات، منصات تحريك، طواقم درون وتصاريح رسمية",
    descriptionEn:
      "Equipped for challenging outdoor locations from Abu Dhabi dunes to Dubai downtown architecture. Includes heavy-lift drone cinematography, mobile DIT stations, and UAE governmental filming permits.",
    descriptionAr:
      "مجهزة لكافة مواقع التصوير الخارجية من صحراء الإمارات إلى معالم دبي المعمارية. تشمل تصوير جوي بدرون سينمائي، محطات تفريغ DIT متنقلة وتصاريح حكومية معتمدة.",
    image: "/images/modal/outdoor-filming-card.jpg",
    specsEn: ["Heavy-Lift Cinema Drones", "UAE Official Filming Permits", "Field DIT Offload Stations", "Dedicated Location Scouts"],
    specsAr: ["درون سينمائي معتمد", "تصاريح تصوير رسمية", "محطات تفريغ DIT ميدانية", "فرق متخصصة لاستكشاف المواقع"],
    ctaEn: "Request Filming Quote",
    ctaAr: "طلب استشارة وعرض سعر",
    actionType: "inquiry",
    inquiryService: "outdoor_filming",
  },
  {
    id: "ob-van-broadcast",
    category: "broadcast",
    badgeEn: "Live 4K Broadcast",
    badgeAr: "بث تلفزيوني فوري",
    titleEn: "OB-VAN Mobile Live Broadcast",
    titleAr: "عربات البث المباشر المتنقلة (OB-VAN)",
    subtitleEn: "12-Channel SMPTE fiber vehicle, live EVS slow-motion replay & satellite uplink",
    subtitleAr: "عربات قيادة بث متطورة مزودة بـ 12 قناة ألياف بصرية، وإعادة فورية EVS، وبث فضائي مباشر",
    descriptionEn:
      "Enterprise broadcast command vehicle engineered for live sports tournaments, national celebrations, and international summits. Provides multi-channel SMPTE fiber feeds and encrypted live satellite uplinks.",
    descriptionAr:
      "عربة قيادة بث تلفزيوني متطورة لتغطية البطولات الرياضية، الاحتفالات الوطنية والمؤتمرات العالمية. توفر 12 قناة ألياف بصرية SMPTE وبث فضائي مباشر فائق السرعة.",
    image: "/images/modal/ob-van-broadcast-card.jpg",
    specsEn: ["12x 4K SMPTE Fiber Feeds", "Live EVS XT-VIA Replay", "Bonded 5G & Satellite Uplink", "Dual Director & Audio Suites"],
    specsAr: ["12 قناة ألياف بصرية 4K", "سيرفر إعادة EVS XT-VIA مباشر", "بث فضائي وشبكات 5G مزدوجة", "كابينة تحكم مزدوجة للإخراج والصوت"],
    ctaEn: "Request OB-VAN Dispatch",
    ctaAr: "طلب حجز عربة البث",
    actionType: "inquiry",
    inquiryService: "ob_van",
  },
  {
    id: "social-media-packages",
    category: "gear",
    badgeEn: "Viral Commercial Content",
    badgeAr: "محتوى فيروسي وتجاري",
    titleEn: "Social Media Packages & Growth",
    titleAr: "باقات السوشيال ميديا وصناعة المحتوى",
    subtitleEn: "High-retention commercial reels, brand storytelling, trend hooks & rapid editing",
    subtitleAr: "فيديوهات ريلز وإعلانات ذات انتشار واسع، حبكات تسويقية ذكية، وتلوين وهندسة صوت احترافية",
    descriptionEn:
      "End-to-end social production packages crafted to dominate algorithmic feeds. We script, film, color grade, and master 9:16 vertical content designed for high retention and engagement.",
    descriptionAr:
      "باقات إنتاج محتوى متكاملة مصممة لتصدر خوارزميات المنصات الاجتماعية. نقوم بكتابة السيناريو، التصوير، هندسة الألوان وتسليم فيديوهات عمودية جاهزة لتحقيق أعلى تفاعل.",
    image: "/images/modal/social-media-card.jpg",
    specsEn: ["Monthly Production Retainers", "Viral Hook & Concept Strategy", "Cinema Grade 4K Master Exports", "Multi-Platform Aspect Ratios"],
    specsAr: ["خطط إنتاج محتوى شهرية", "صياغة أفكار وهياكل جذب فيروسية", "تصدير 4K بألوان سينمائية", "مقاسات مخصصة لكافة المنصات"],
    ctaEn: "View Social Packages",
    ctaAr: "استعرض باقات السوشيال",
    href: "/social-media-packages",
  },
];

export function ServicesPageClient() {
  const { isArabic } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryFilter>("all");

  // Direct Inquiry Modal State for OB-VAN and Outdoor Filming
  const [selectedInquiry, setSelectedInquiry] = useState<{
    id: string;
    type: "ob_van" | "outdoor_filming";
    titleEn: string;
    titleAr: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState<"ob_van" | "outdoor_filming">("ob_van");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const submissionIdRef = useRef(0);

  const handleOpenInquiry = (service: ServiceCardData) => {
    if (!service.inquiryService) return;
    submissionIdRef.current += 1;
    setIsSubmitting(false);
    setSelectedInquiry({
      id: service.id,
      type: service.inquiryService,
      titleEn: service.titleEn,
      titleAr: service.titleAr,
    });
    setInquiryType(service.inquiryService);
    setSubject(
      service.inquiryService === "ob_van"
        ? isArabic
          ? "طلب استشارة وحجز عربة بث مباشر (OB VAN)"
          : "OB VAN Live Broadcast Consultation & Quote"
        : isArabic
        ? "طلب استشارة وتصوير ميداني (Outdoor Filming)"
        : "Outdoor Filming Consultation & Quote"
    );
    setSubmitError(null);
    setIsSubmitted(false);
  };

  const handleCloseInquiry = () => {
    submissionIdRef.current += 1;
    setIsSubmitting(false);
    setSelectedInquiry(null);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setSubmitError(null);
    setIsSubmitted(false);
  };

  useFocusTrap({
    isOpen: !!selectedInquiry,
    onClose: handleCloseInquiry,
    containerRef: dialogRef,
  });

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 10) {
      setSubmitError(
        isArabic
          ? "يرجى كتابة تفاصيل متطلباتك بحد أدنى 10 أحرف."
          : "Please describe your project requirements in at least 10 characters."
      );
      return;
    }

    const fullMessage = subject.trim()
      ? `[Subject: ${subject.trim()}]\n\n${trimmedMessage}`
      : trimmedMessage;
    const submissionId = ++submissionIdRef.current;
    setIsSubmitting(true);

    try {
      const res = await submitInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        inquiryType: inquiryType,
        subject: subject.trim(),
        message: fullMessage,
      });

      if (submissionId !== submissionIdRef.current) return;

      if (res && res.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(
          res?.message ||
            (isArabic
              ? "تعذر إرسال الطلب حالياً، يرجى المحاولة لاحقاً."
              : "Failed to send request. Please try again later.")
        );
      }
    } catch {
      if (submissionId !== submissionIdRef.current) return;
      setSubmitError(
        isArabic
          ? "حدث خطأ غير متوقع، يرجى المحاولة ثانية."
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      if (submissionId === submissionIdRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  const filteredServices =
    activeCategory === "all"
      ? SERVICES_CATALOG
      : SERVICES_CATALOG.filter((s) => s.category === activeCategory);

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="w-full bg-[#060608] text-white min-h-screen selection:bg-brand-mauve selection:text-white overflow-x-hidden"
    >
      {/* ── 1. Hero Stage Header ── */}
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-10 border-b border-white/[0.08] overflow-hidden">
        {/* Ambient Mauve & Violet Studio Glows (strictly purple, no amber) */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[300px] bg-brand-violet/20 blur-[120px] rounded-full pointer-events-none z-0"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Clean Title & Subtitle taking half the page */}
          <div className="max-w-2xl text-start mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-display tracking-tight leading-tight mb-2.5">
              {isArabic ? (
                <>
                  خدمات الإنتاج <span className="text-brand-mauve">والبنية التحتية</span>
                </>
              ) : (
                <>
                  Production Services &amp; <span className="text-brand-mauve">Infrastructure</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {isArabic
                ? "استوديوهات تصوير معتمدة، عربات بث تلفزيوني 4K، مستودع كاميرات ARRI وباقات سوشيال ميديا متكاملة."
                : "Certified soundstages, 12-cam live OB-VAN broadcasting, cinema gear rental, and turnkey production packages."}
            </p>
          </div>

          {/* Category Filter Pills (Start-aligned, minimal height) */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                activeCategory === "all"
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/25"
                  : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isArabic ? "كافة الخدمات (7)" : "All 7 Services"}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("studios")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                activeCategory === "studios"
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/25"
                  : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isArabic ? "الاستوديوهات والبودكاست" : "Studios & Suites"}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("broadcast")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                activeCategory === "broadcast"
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/25"
                  : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isArabic ? "البث المباشر والتصوير الميداني" : "Broadcast & Field"}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("gear")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer",
                activeCategory === "gear"
                  ? "bg-brand-violet text-white border border-brand-mauve/40 shadow-md shadow-brand-violet/25"
                  : "text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {isArabic ? "المعدات وباقات السوشيال" : "Gear & Packages"}
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Services Showcase Grid ── */}
      <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((service, index) => {
            const isFeatured = service.isFeatured && activeCategory === "all";

            return (
              <motion.article
                key={service.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={cn(
                  "group relative rounded-3xl bg-[#0c0c11] border border-white/[0.08] hover:border-brand-mauve/40 transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-brand-violet/10",
                  isFeatured && "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-12 lg:gap-8 items-center"
                )}
              >
                {/* Visual Media Container */}
                <div
                  className={cn(
                    "relative w-full overflow-hidden bg-zinc-900",
                    isFeatured
                      ? "h-64 sm:h-80 lg:h-full lg:col-span-6 min-h-[340px]"
                      : "h-56 sm:h-64"
                  )}
                >
                  <Image
                    src={service.image}
                    alt={isArabic ? service.titleAr : service.titleEn}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c11] via-[#0c0c11]/30 to-transparent pointer-events-none" />
                </div>

                {/* Content Card Body */}
                <div
                  className={cn(
                    "p-6 sm:p-7 flex flex-col flex-1 justify-between",
                    isFeatured && "lg:col-span-6 lg:py-8 lg:pe-8"
                  )}
                >
                  <div>
                    {/* Header */}
                    <h2 className="text-lg sm:text-xl font-bold text-white font-display tracking-tight mb-2 group-hover:text-brand-mauve-soft transition-colors">
                      {isArabic ? service.titleAr : service.titleEn}
                    </h2>

                    <p className="text-xs sm:text-sm font-medium text-brand-mauve mb-3">
                      {isArabic ? service.subtitleAr : service.subtitleEn}
                    </p>

                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                      {isArabic ? service.descriptionAr : service.descriptionEn}
                    </p>

                    {/* Spec Pills */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {(isArabic ? service.specsAr : service.specsEn).map((spec, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-300"
                        >
                          <CheckCircle2 size={13} className="text-brand-mauve shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Strip */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    {service.actionType === "inquiry" ? (
                      <button
                        type="button"
                        onClick={() => handleOpenInquiry(service)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full btn-brand text-xs sm:text-sm cursor-pointer active:scale-[0.98]"
                      >
                        <PhoneCall size={14} />
                        <span>{isArabic ? service.ctaAr : service.ctaEn}</span>
                      </button>
                    ) : (
                      <Link
                        href={service.href || "#"}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full btn-brand text-xs sm:text-sm cursor-pointer active:scale-[0.98]"
                      >
                        <span>{isArabic ? service.ctaAr : service.ctaEn}</span>
                        <ArrowRight size={14} className="rtl:rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── 3. Inquiry Modal for Field & OB-VAN ── */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseInquiry}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={studioSprings.cinematic}
              className="relative w-full max-w-xl rounded-3xl bg-[#09090c] border border-white/10 p-5 sm:p-7 md:p-9 z-10 shadow-2xl my-auto text-start"
            >
              {/* Header Row */}
              <div className="flex items-center justify-between mb-5 sm:mb-6 border-b border-white/5 pb-4">
                <h2
                  id={headingId}
                  className="font-bold text-white text-xl sm:text-2xl uppercase tracking-wider font-display"
                >
                  {isArabic ? "أرسل لنا رسالة" : "SEND US A MESSAGE"}
                </h2>

                <button
                  type="button"
                  onClick={handleCloseInquiry}
                  aria-label={isArabic ? "إغلاق" : "Close"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {isSubmitted ? (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 text-emerald-400">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 font-display">
                    {isArabic ? "تم استلام طلبك بنجاح" : "Message Received Successfully"}
                  </h3>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    {isArabic
                      ? "سيتواصل معك فريق الإنتاج التنفيذي في ياس برو هاتفياً في أقرب وقت لمناقشة التفاصيل وتقديم العرض المناسب."
                      : "Our executive production team at Yas Pro will review your requirements and call you shortly to discuss full details and pricing."}
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseInquiry}
                    className="px-6 py-2.5 rounded-full btn-brand text-sm cursor-pointer"
                  >
                    {isArabic ? "إغلاق" : "Close"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-6">
                  {/* Subtitle / Service tag */}
                  <p className="text-xs text-zinc-400">
                    {isArabic
                      ? "سجل بياناتك وسيطلبك فريق المبيعات والإنتاج لتحديد التجهيزات والمواعيد المناسبة."
                      : "Submit your requirements below and our sales & production team will call you to arrange complete specifications and dates."}
                  </p>

                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={`${headingId}-name`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {isArabic ? "الاسم" : "Name"} <span className="text-brand-mauve">*</span>
                      </label>
                      <input
                        id={`${headingId}-name`}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isArabic ? "اسمك الكريم" : "Your full name"}
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor={`${headingId}-email`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {isArabic ? "البريد الإلكتروني" : "Email"} <span className="text-brand-mauve">*</span>
                      </label>
                      <input
                        id={`${headingId}-email`}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor={`${headingId}-type`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {isArabic ? "نوع الطلب" : "Inquiry Type"}
                      </label>
                      <select
                        id={`${headingId}-type`}
                        value={inquiryType}
                        onChange={(e) => {
                          const val = e.target.value as "ob_van" | "outdoor_filming";
                          setInquiryType(val);
                          setSubject(
                            val === "ob_van"
                              ? (isArabic ? "طلب استشارة وحجز عربة بث مباشر (OB VAN)" : "OB VAN Live Broadcast Consultation & Quote")
                              : (isArabic ? "طلب استشارة وتصوير ميداني (Outdoor Filming)" : "Outdoor Filming Consultation & Quote")
                          );
                        }}
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white focus:outline-none focus:border-white transition-colors cursor-pointer [&>option]:bg-zinc-900 [&>option]:text-white"
                      >
                        <option value="ob_van">
                          {isArabic ? "عربات البث المباشر (OB VAN)" : "OB VAN Live Broadcast"}
                        </option>
                        <option value="outdoor_filming">
                          {isArabic ? "التصوير الميداني (Outdoor Filming)" : "Outdoor Filming"}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor={`${headingId}-subject`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                        {isArabic ? "الموضوع" : "Subject"}
                      </label>
                      <input
                        id={`${headingId}-subject`}
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={isArabic ? "موضوع الطلب" : "Subject of inquiry"}
                        className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Number (Crucial for sales team to call) */}
                  <div>
                    <label htmlFor={`${headingId}-phone`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {isArabic ? "رقم الهاتف للاتصال" : "Phone Number (for Callback)"} <span className="text-brand-mauve">*</span>
                    </label>
                    <input
                      id={`${headingId}-phone`}
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 000 0000"
                      dir="ltr"
                      className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors text-start"
                    />
                  </div>

                  {/* Message / Details */}
                  <div>
                    <label htmlFor={`${headingId}-message`} className="block text-xs font-medium text-zinc-400 mb-1.5">
                      {isArabic ? "تفاصيل الطلب والاحتياجات" : "Message / What you need"} <span className="text-brand-mauve">*</span>
                    </label>
                    <textarea
                      id={`${headingId}-message`}
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isArabic
                          ? "اكتب تفاصيل التغطية أو التصوير، التاريخ المقترح، موقع العمل، وأي متطلبات فنية خاصة..."
                          : "Provide details on production dates, location, multi-camera needs, or any specific broadcast requirements..."
                      }
                      className="w-full bg-transparent border-b border-zinc-700 pb-2 text-base sm:text-sm min-h-[44px] text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  {/* Bottom CTA Button (Let's Talk ↗) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full btn-brand text-base sm:text-sm min-h-[44px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>{isArabic ? "جارٍ الإرسال..." : "Sending..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{isArabic ? "تواصل معنا" : "Let's Talk"}</span>
                          <span className="text-base leading-none">↗</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
