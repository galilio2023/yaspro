"use client";

import React, { useId, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { studioSprings, tactilePress } from "@/lib/studio-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface VisualBookingCard {
  id: string;
  labelEn: string;
  labelAr: string;
  categoryEn: string;
  categoryAr: string;
  image: string;
  href: string;
}

const VISUAL_CARDS: VisualBookingCard[] = [
  {
    id: "offers-bundles",
    labelEn: "Offers & Bundles",
    labelAr: "العروض والباقات",
    categoryEn: "Packages",
    categoryAr: "باقات متكاملة",
    image: "/images/modal/offers-bundles.jpg",
    href: "/studios#packages",
  },
  {
    id: "outdoor-filming",
    labelEn: "Outdoor Filming",
    labelAr: "التصوير الميداني",
    categoryEn: "On-Location",
    categoryAr: "تصوير خارجي",
    image: "/images/services/outdoor-filming.webp",
    href: "/contact?service=outdoor-filming",
  },
  {
    id: "studio-booking",
    labelEn: "Studio Booking",
    labelAr: "حجز الاستوديوهات",
    categoryEn: "Soundstages",
    categoryAr: "استوديوهات رئيسية",
    image: "/images/modal/studio-booking.jpg",
    href: "/studio-booking",
  },
  {
    id: "podcast-booking",
    labelEn: "Podcast Booking",
    labelAr: "حجز البودكاست",
    categoryEn: "4K Multi-Cam",
    categoryAr: "استوديو بودكاست",
    image: "/images/studios/podcast-suite.jpg",
    href: "/studio-booking?service=podcast",
  },
  {
    id: "social-media-packages",
    labelEn: "Social Media Packages",
    labelAr: "باقات السوشيال ميديا",
    categoryEn: "Viral Reels",
    categoryAr: "صناعة المحتوى",
    image: "/images/modal/social-media-packages.jpg",
    href: "/contact?service=social-media",
  },
  {
    id: "ob-van-broadcast",
    labelEn: "OB VAN Live Broadcast",
    labelAr: "عربات البث المباشر",
    categoryEn: "Live 4K",
    categoryAr: "بث تلفزيوني",
    image: "/images/services/ob-van-broadcast.webp",
    href: "/contact?service=ob-van",
  },
];

export function BookNowModal({ isOpen, onClose }: BookNowModalProps) {
  const { isArabic } = useLanguage();

  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useFocusTrap({ isOpen, onClose, containerRef: dialogRef });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Soft Cinematic Dimmer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
        />

        {/* Modal Sheet */}
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={studioSprings.cinematic}
          dir={isArabic ? "rtl" : "ltr"}
          className="relative my-auto w-full max-w-5xl rounded-3xl bg-[#09090c] p-6 sm:p-8 md:p-10 z-10 shadow-2xl"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 id={headingId} className="text-xl sm:text-2xl font-bold text-white font-display rtl:font-arabic tracking-tight">
              {isArabic ? "اختر نوع الحجز" : "Select Booking Category"}
            </h2>

            {/* Seamless Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? "إغلاق" : "Close"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* 6 Visual Production Image Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VISUAL_CARDS.map((card) => (
              <motion.div
                key={card.id}
                whileTap={tactilePress}
                className="w-full"
              >
                <Link
                  href={card.href}
                  onClick={onClose}
                  className="group relative flex flex-col justify-end h-52 sm:h-56 w-full rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer shadow-lg"
                >
                  {/* Real Production Imagery with Smooth Zoom on Hover */}
                  <Image
                    src={card.image}
                    alt={isArabic ? card.labelAr : card.labelEn}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Clean Film Vignette Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity group-hover:via-black/20" />

                  {/* Bottom Title */}
                  <div className="relative z-10 p-5">
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-md group-hover:text-amber-300 transition-colors">
                      {isArabic ? card.labelAr : card.labelEn}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
