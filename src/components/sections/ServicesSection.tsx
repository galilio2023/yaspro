"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Sparkles } from "lucide-react";
import { SERVICES_DATA, ServiceItem } from "./services.data";
import { SendMessageModal } from "./SendMessageModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ServicesSection() {
  const router = useRouter();
  const { isArabic } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const [inquiryModal, setInquiryModal] = useState<{
    isOpen: boolean;
    service: "ob_van" | "outdoor_filming";
  }>({ isOpen: false, service: "ob_van" });

  const totalServices = SERVICES_DATA.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalServices);
  }, [totalServices]);

  // Auto-switch which card is expanded every 4 seconds
  useEffect(() => {
    if (isPaused || isFocusWithin || inquiryModal.isOpen) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, isFocusWithin, inquiryModal.isOpen, nextSlide]);

  const handleCardClick = (service: ServiceItem) => {
    if (service.id === "studio-booking") {
      router.push("/studio-booking");
    } else if (service.id === "podcast-booking") {
      router.push("/podcast-booking");
    } else if (service.id === "outdoor-filming") {
      setInquiryModal({ isOpen: true, service: "outdoor_filming" });
    } else if (service.id === "ob-van-broadcast") {
      setInquiryModal({ isOpen: true, service: "ob_van" });
    } else if (service.href) {
      router.push(service.href);
    }
  };

  return (
    <Section
      id="services"
      aria-label="Services Section"
      className="bg-black relative overflow-hidden py-16 sm:py-24"
    >
      <Container className="relative z-10 max-w-7xl">
        {/* Section Header with Yas Pro Editorial Hierarchy */}
        <SectionHeader
          headingId="services-title"
          badge={isArabic ? "ركائز الإنتاج المتكامل" : "Turnkey Production Pillars"}
          badgeVariant="purple"
          badgeIcon={<Sparkles size={13} className="text-brand-lavender" />}
          title={isArabic ? "شكل محتواك مع" : "Shape Your Content With"}
          gradientText={isArabic ? "إمكانياتنا الإنتاجية" : "Cinematic Craft"}
          gradientVariant="mauve"
          description={
            isArabic
              ? "من البث المباشر الميداني بعربات OB-VAN وأحدث استوديوهات التصوير الافتراضي إلى صناعة المحتوى السريع وفق أعلى المعايير العالمية."
              : "From mobile OB-VAN live broadcast to flagship soundstages and high-impact social cutdowns, engineered for visionary brands."
          }
          align="left"
          className="mb-10 sm:mb-14"
        />

        {/* Cards: Responsive Accordion on Mobile (vertical flex) & Desktop (horizontal flex) */}
        <div
          className="flex flex-col md:flex-row h-[560px] sm:h-[620px] md:h-[520px] w-full gap-3 sm:gap-4 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onFocusCapture={() => setIsFocusWithin(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusWithin(false);
          }}
        >
          {SERVICES_DATA.map((service, index) => {
            const isActive = activeIndex === index;
            const title = isArabic ? service.arabicTitle : service.title;
            const subtitle = isArabic ? service.arabicSubtitle : service.subtitle;

            return (
              <motion.button
                type="button"
                aria-label={title}
                aria-expanded={isActive}
                key={service.id}
                onMouseEnter={() => {
                  setActiveIndex(index);
                  setIsPaused(true);
                }}
                onClick={() => {
                  if (isActive) {
                    handleCardClick(service);
                  } else {
                    setActiveIndex(index);
                    setIsPaused(true);
                  }
                }}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                }}
                className={`group relative min-h-0 min-w-0 rounded-2xl sm:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 overflow-hidden cursor-pointer transition-all duration-500 border ${
                  isActive
                    ? "flex-[3.2] sm:flex-[3] md:flex-[3.5] border-amber-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/20"
                    : "flex-[1] border-white/[0.08] hover:border-white/20 opacity-80 md:opacity-70 hover:opacity-100"
                }`}
              >
                {/* 3D Visual Asset with Cinematic Vignette */}
                <Image
                  src={service.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover object-center transition-transform duration-700 ease-out ${
                    isActive ? "scale-100 brightness-100" : "scale-105 brightness-50 md:brightness-45 group-hover:brightness-75"
                  }`}
                  priority={index < 2}
                />

                {/* Ambient Film Vignette Gradient */}
                <span className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                {/* Subtle Amber Glow behind active card text */}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
                )}

                {/* Active & Inactive Content Overlay */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-left rtl:text-right z-10 pointer-events-none">
                  {/* Category Micro-Tag */}
                  <div className={`transition-all duration-300 mb-1.5 flex items-center gap-2 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 md:opacity-0"
                  }`}>
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-amber-400/90 font-medium">
                      0{index + 1} // {isArabic ? service.arabicBadge : service.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold tracking-tight text-white transition-all duration-300 drop-shadow-md ${
                    isActive 
                      ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl text-amber-50" 
                      : "text-base sm:text-lg md:text-xl text-zinc-300 truncate"
                  }`}>
                    {title}
                  </h3>

                  {/* Subtitle & CTA — revealed when active */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 }}
                      className="mt-1 sm:mt-2 space-y-2 sm:space-y-3"
                    >
                      <p className="text-xs sm:text-sm text-zinc-300/90 font-normal line-clamp-1 sm:line-clamp-2 max-w-lg leading-relaxed">
                        {subtitle}
                      </p>

                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                        <span>{isArabic ? "استكشف الخدمة والحجز" : "Explore & Reserve"}</span>
                        <span className="text-xs rtl:rotate-180">→</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Bottom Navigation Dots Indicator (Responsive for both Mobile & Desktop) */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-zinc-950/80 border border-white/10 backdrop-blur-md shadow-lg">
            {SERVICES_DATA.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPaused(true);
                }}
                aria-label={`Go to service ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-7 bg-amber-400"
                    : "w-2 bg-zinc-700 hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* Direct Inquiry Form Modal matching Book Now callback */}
      <SendMessageModal
        isOpen={inquiryModal.isOpen}
        onClose={() => setInquiryModal((prev) => ({ ...prev, isOpen: false }))}
        initialService={inquiryModal.service}
      />
    </Section>
  );
}
export default ServicesSection;
