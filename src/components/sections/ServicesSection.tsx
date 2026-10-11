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
  const [isHoverPaused, setIsHoverPaused] = useState<boolean>(false);
  const [isSelectionPaused, setIsSelectionPaused] = useState<boolean>(false);
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
    if (isHoverPaused || isSelectionPaused || isFocusWithin || inquiryModal.isOpen) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isHoverPaused, isSelectionPaused, isFocusWithin, inquiryModal.isOpen, nextSlide]);

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
      {/* Subtle ambient stage keylights (responsive violet/mauve radiance) */}
      <div
        className="absolute top-1/4 -left-12 sm:left-4 w-64 sm:w-96 h-64 sm:h-96 bg-brand-violet/20 sm:bg-brand-violet/15 blur-[60px] sm:blur-[120px] rounded-full pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 -right-12 sm:right-4 w-60 sm:w-80 h-60 sm:h-80 bg-brand-mauve/20 sm:bg-brand-mauve/15 blur-[60px] sm:blur-[110px] rounded-full pointer-events-none z-0"
        aria-hidden="true"
      />

      <Container className="relative z-10 max-w-7xl">
        {/* Section Header with Clean Studio Hierarchy */}
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
              ? "استوديوهات تصوير متطورة، بث مباشر ميداني، وحلول إنتاج سينمائي بمعايير عالمية."
              : "Soundstages, mobile OB-VAN broadcast, and cinema-grade field production."
          }
          align="left"
          className="mb-8 sm:mb-12"
        />

        {/* Cards: Responsive Accordion on Mobile (vertical flex) & Desktop (horizontal flex) */}
        <div
          className="flex flex-col md:flex-row h-[560px] sm:h-[620px] md:h-[520px] w-full gap-3 sm:gap-4 select-none"
          onMouseEnter={() => setIsHoverPaused(true)}
          onMouseLeave={() => setIsHoverPaused(false)}
          onTouchStart={() => setIsSelectionPaused(true)}
          onFocusCapture={() => setIsFocusWithin(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsFocusWithin(false);
          }}
        >
          {SERVICES_DATA.map((service, index) => {
            const isActive = activeIndex === index;
            const title = isArabic ? service.arabicTitle : service.title;

            return (
              <motion.button
                type="button"
                aria-label={title}
                aria-expanded={isActive}
                key={service.id}
                onMouseEnter={() => {
                  setActiveIndex(index);
                  setIsHoverPaused(true);
                }}
                onClick={() => {
                  if (isActive) {
                    handleCardClick(service);
                  } else {
                    setActiveIndex(index);
                    setIsSelectionPaused(true);
                  }
                }}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                }}
                className={`group relative min-h-0 min-w-0 rounded-2xl sm:rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40 overflow-hidden cursor-pointer transition-all duration-500 ${
                  isActive
                    ? "flex-[3.2] sm:flex-[3] md:flex-[3.5] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                    : "flex-[1] opacity-75 md:opacity-65 hover:opacity-95"
                }`}
              >
                {/* 3D Visual Asset with Cinematic Vignette */}
                <Image
                  src={service.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover object-center transition-transform duration-700 ease-out ${
                    isActive ? "scale-100 brightness-100" : "scale-105 brightness-50 md:brightness-40 group-hover:brightness-70"
                  }`}
                  priority={index < 2}
                />

                {/* Subtle Film Vignette Gradient */}
                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                {/* Content Overlay: Title ONLY on active card */}
                {isActive && (
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7 sm:right-7 z-10 text-left rtl:text-right pointer-events-none">
                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-bold tracking-tight text-2xl sm:text-3xl lg:text-4xl text-white drop-shadow-md"
                    >
                      {title}
                    </motion.h3>
                  </div>
                )}
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
                  setIsSelectionPaused(true);
                }}
                aria-label={`Go to service ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-7 bg-brand-mauve shadow-[0_0_12px_rgba(152,123,165,0.5)]"
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
