"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SERVICES_DATA, ServiceItem } from "./services.data";
import { ServiceQuickViewModal } from "./ServiceQuickViewModal";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function ServicesSection() {
  const { isArabic } = useLanguage();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const totalServices = SERVICES_DATA.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalServices);
  }, [totalServices]);

  // Auto-switch which card is expanded every 4 seconds
  useEffect(() => {
    if (isPaused || selectedService !== null) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, selectedService, nextSlide]);

  return (
    <Section
      id="services"
      aria-label="Services Section"
      className="bg-black relative overflow-hidden py-16 sm:py-24"
    >
      <Container className="relative z-10 max-w-7xl">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-left rtl:text-right">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-lavender">
            {isArabic ? "شكل محتواك معنا" : "Shape your content with us"}
          </h2>
        </div>

        {/* 4 Cards Side-by-Side: Expanding Accordion (Clean visual borderless canvas) */}
        <div
          className="flex flex-col md:flex-row h-[420px] md:h-[500px] w-full gap-4 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {SERVICES_DATA.map((service, index) => {
            const isActive = activeIndex === index;
            const title = isArabic ? service.arabicTitle : service.title;
            const description = isArabic ? service.arabicDescription : service.description;

            return (
              <motion.div
                key={service.id}
                onClick={() => {
                  if (isActive) {
                    setSelectedService(service);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                layout
                transition={{
                  layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                }}
                className={`group relative h-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "flex-[3.5] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                    : "flex-[1] opacity-75 hover:opacity-95"
                }`}
              >
                {/* 3D Visual Asset */}
                <Image
                  src={service.image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover object-center transition-transform duration-700 ${
                    isActive ? "scale-100 brightness-100" : "scale-105 brightness-50 group-hover:brightness-70"
                  }`}
                  priority={index < 2}
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Content Overlay: Title ONLY on active card */}
                <div className="absolute bottom-6 left-6 right-6 z-10 text-left rtl:text-right">
                  {isActive && (
                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-bold tracking-tight text-2xl sm:text-3xl text-brand-lavender drop-shadow-md"
                    >
                      {title}
                    </motion.h3>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4 Bottom Dots Indicator */}
        <div className="mt-10 sm:mt-12 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] backdrop-blur-md shadow-lg">
            {SERVICES_DATA.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to service ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx
                    ? "w-6 bg-brand-violet"
                    : "w-2 bg-zinc-600 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* Quick View Interactive Modal */}
      <ServiceQuickViewModal
        service={selectedService}
        isOpen={selectedService !== null}
        onClose={() => setSelectedService(null)}
      />
    </Section>
  );
}
export default ServicesSection;
