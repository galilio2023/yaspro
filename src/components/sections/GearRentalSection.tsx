"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Camera,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Clock,
  Box,
  MessageCircle,
  Eye,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Section } from "@/components/ui/section";
import { Container } from "@/components/ui/container";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { GEAR_DATA } from "@/features/gear/data";
import { GearItem, GearCategory } from "@/features/gear/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { GearRentalModal } from "@/features/gear/components/GearRentalModal";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { studioSprings } from "@/lib/studio-motion";

export function GearRentalSection() {
  const { isArabic } = useLanguage();

  // Active filters and pricing duration
  const [activeCategory, setActiveCategory] = useState<GearCategory | "all">("all");
  const [durationTier, setDurationTier] = useState<1 | 3 | 7>(1);
  const [selectedGearItem, setSelectedGearItem] = useState<GearItem | null>(null);

  // Discount rule
  const discountMultiplier = durationTier === 7 ? 0.65 : durationTier === 3 ? 0.8 : 1.0;

  // Filtered gear
  const filteredGear = useMemo(() => {
    if (activeCategory === "all") return GEAR_DATA;
    return GEAR_DATA.filter((g) => g.category === activeCategory);
  }, [activeCategory]);

  // Featured flagship kit (Spotlight card)
  const spotlightKit = useMemo(() => {
    return (
      GEAR_DATA.find((g) => g.id === "arri-commercial-cinema-kit") ||
      GEAR_DATA.find((g) => g.isKit) ||
      GEAR_DATA[0]
    );
  }, []);

  // Category options
  const CATEGORIES: { id: GearCategory | "all"; label: string; arabicLabel: string }[] = [
    { id: "all", label: "All Equipment", arabicLabel: "كافة المعدات" },
    { id: "bundles", label: "Turnkey Packages", arabicLabel: "الباقات الشاملة" },
    { id: "cameras", label: "Cinema Cameras", arabicLabel: "كاميرات سينمائية" },
    { id: "lenses", label: "Optics & Lenses", arabicLabel: "العدسات السينمائية" },
    { id: "lighting", label: "Lighting & Grip", arabicLabel: "الإضاءة والملحقات" },
    { id: "audio", label: "Location Audio", arabicLabel: "صوتيات المواقع" },
  ];

  return (
    <Section
      id="gear-rental"
      aria-labelledby="gear-rental-title"
      className="bg-secondary border-t border-white/10 relative overflow-hidden py-14 sm:py-20 lg:py-24"
      background={
        <>
          <div
            className="absolute top-1/4 right-0 size-[500px] rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-10 left-1/4 size-[400px] rounded-full pointer-events-none opacity-15"
            style={{
              background: "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
            }}
          />
        </>
      }
    >
      <Container className="relative z-10">
        {/* Header */}
        <SectionHeader
          headingId="gear-rental-title"
          badge={isArabic ? "المعدات السينمائية المعتمدة" : "Master Production Gear"}
          badgeVariant="gold"
          badgeIcon={<Camera size={13} className="text-amber-400" />}
          title={isArabic ? "تأجير أحدث المعدات و" : "Rent Turnkey"}
          gradientText={isArabic ? "الباقات السينمائية" : "Cinema Kits"}
          description={
            isArabic
              ? "كاميرات سينمائية 8K، عدسات أنامورفيك، أنظمة إضاءة احترافية، وباقات متكاملة جاهزة للتصوير الفوري في مواقع الإمارات."
              : "Calibrated 8K cinema cameras, anamorphic primes, wireless video director suites, and ready-to-shoot production packages across the UAE."
          }
        />

        {/* Pricing Duration Toggle Bar (Immediate Psychological Incentive) */}
        <FadeUp delay={0.06} className="mt-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-3 sm:p-4 rounded-3xl bg-zinc-950/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 px-2">
            <span className="size-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
              {isArabic ? "اختر مدة التأجير للاستفادة من الخصم:" : "Duration Pricing Tier:"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto p-1 bg-black/40 rounded-full border border-white/8 scrollbar-none">
            {[
              { days: 1 as const, label: isArabic ? "يوم واحد (قياسي)" : "1 Day (Standard)", discount: null },
              { days: 3 as const, label: isArabic ? "عطلة نهاية الأسبوع (3 أيام)" : "3-Day Weekend", discount: "-20%" },
              { days: 7 as const, label: isArabic ? "أسبوعي (7 أيام)" : "Weekly Tier", discount: "-35%" },
            ].map((tier) => {
              const isActive = durationTier === tier.days;
              return (
                <button
                  key={tier.days}
                  type="button"
                  onClick={() => setDurationTier(tier.days)}
                  className="relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 z-10"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDurationPill"
                      className="absolute inset-0 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.25)] -z-10"
                      transition={studioSprings.snappy}
                    />
                  )}
                  <span className={isActive ? "text-amber-300" : "text-zinc-400 hover:text-white"}>
                    {tier.label}
                  </span>
                  {tier.discount && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-black uppercase">
                      {tier.discount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FadeUp>

        {/* ── Spotlight Hero Card (Studio Flagship Kit) ── */}
        {spotlightKit && (
          <FadeUp delay={0.1} className="mb-12">
            <div className="relative rounded-3xl border border-white/12 bg-zinc-950 p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl shadow-black/80">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Visual Stage */}
                <div className="lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/80 border border-white/12 group">
                  {spotlightKit.image && (
                    <Image
                      src={spotlightKit.image}
                      alt={spotlightKit.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 100vw, 550px"
                    />
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Badges */}
                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1.5 shadow-md">
                      <Camera size={12} className="text-amber-400" />
                      {isArabic ? "الباقة الإعلانية الرائدة" : "Featured Production Rig"}
                    </span>

                    {discountMultiplier < 1 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        {isArabic ? `وفر ${Math.round((1 - discountMultiplier) * 100)}%` : `Save ${Math.round((1 - discountMultiplier) * 100)}% on Kit`}
                      </span>
                    )}
                  </div>

                  {/* Live Status Pill */}
                  <div className="absolute bottom-3.5 start-3.5 z-10 pointer-events-none">
                    <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400" />
                      <span>{isArabic ? "جاهز للتسليم الفوري في استوديو دبي" : "In Stock · Calibrated for Set Delivery"}</span>
                    </div>
                  </div>
                </div>

                {/* Details & Inclusions */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                        {isArabic ? "باقة سينمائية متكاملة (Turnkey A-Cam)" : "Turnkey Cinema Package"}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mb-3">
                      {isArabic && spotlightKit.arabicName ? spotlightKit.arabicName : spotlightKit.name}
                    </h3>

                    <p className="text-sm text-text-secondary leading-relaxed mb-5">
                      {isArabic && spotlightKit.arabicDescription ? spotlightKit.arabicDescription : spotlightKit.description}
                    </p>

                    {/* Included Gear Inclusions Pills */}
                    {spotlightKit.includedInKit && (
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                        <span className="text-[11px] uppercase font-mono font-bold text-amber-400 flex items-center gap-1.5">
                          <Box size={13} />
                          {isArabic ? "تجهيزات ومحتويات الباقة الكاملة:" : "Production Kit Inclusions:"}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-text-secondary pt-1">
                          {spotlightKit.includedInKit.map((inc) => (
                            <div key={inc} className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing Action Strip */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white font-display">
                          {formatCurrency(Math.round(spotlightKit.dailyRate * discountMultiplier))}
                        </span>
                        <span className="text-xs text-text-muted">
                          / {isArabic ? "اليوم" : "Day"}
                        </span>
                        {discountMultiplier < 1 && (
                          <span className="text-xs text-text-muted line-through font-mono">
                            {formatCurrency(spotlightKit.dailyRate)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-400 font-mono block mt-0.5">
                        {durationTier === 1
                          ? isArabic ? "تسليم مع كابلات وبطاريات كاملة" : "Includes full power & wireless feed"
                          : isArabic ? `تم احتساب خصم باقة ${durationTier} أيام` : `${durationTier}-Day production rate applied`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setSelectedGearItem(spotlightKit)}
                        whileHover={{ y: -2, scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        transition={studioSprings.snappy}
                        className="px-6 py-3 rounded-2xl btn-brand text-xs font-bold cursor-pointer flex items-center gap-2"
                      >
                        <Eye size={14} />
                        <span>{isArabic ? "معاينة وحجز الباقة" : "Inspect & Reserve Package"}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        )}

        {/* ── Interactive Category Pills ── */}
        <div className="flex items-center justify-start sm:justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 min-h-[44px] rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center justify-center",
                activeCategory === cat.id
                  ? "bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-lg shadow-amber-500/20 scale-105"
                  : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {isArabic ? cat.arabicLabel : cat.label}
            </button>
          ))}
        </div>

        {/* ── Curated Gear Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {filteredGear.map((item, idx) => {
            const effectivePrice = Math.round(item.dailyRate * discountMultiplier);
            const itemName = isArabic && item.arabicName ? item.arabicName : item.name;

            return (
              <FadeUp key={item.id} delay={Math.min(idx * 0.07, 0.45)} className="h-full">
                <motion.article
                  onClick={() => setSelectedGearItem(item)}
                  whileHover={{ y: -4, boxShadow: "0 28px 56px -12px rgba(0,0,0,0.75)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={studioSprings.cinematic}
                  className="rounded-3xl border border-white/8 bg-zinc-900/80 hover:bg-zinc-900 hover:border-white/20 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between h-full group cursor-pointer shadow-xl overflow-hidden"
                >
                  <div>
                    {/* Visual */}
                    <div className="relative w-full aspect-[16/10] mb-4 rounded-2xl overflow-hidden bg-black/60 border border-white/8 group-hover:border-white/20 transition-colors duration-300">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={itemName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                      ) : (
                        <div className="flex items-center justify-center size-full">
                          <Camera size={36} className="text-zinc-500" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 pointer-events-none z-10">
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10">
                          {item.categoryLabel}
                        </span>
                        {item.isPopular && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9.5px] font-bold">
                            ★ {isArabic ? "طلب شائع" : "Popular"}
                          </span>
                        )}
                      </div>

                      {item.isKit && (
                        <div className="absolute bottom-2.5 start-2.5 z-10 pointer-events-none">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9.5px] font-bold flex items-center gap-1">
                            <Box size={10} />
                            <span>{isArabic ? "باقة كاملة" : "Turnkey Kit"}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mb-1.5 font-display group-hover:text-amber-400 transition-colors line-clamp-1">
                      {itemName}
                    </h4>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                      {isArabic && item.arabicDescription ? item.arabicDescription : item.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.specs.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400 font-mono truncate max-w-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-white font-display">
                          {formatCurrency(effectivePrice)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          / {isArabic ? "يوم" : "Day"}
                        </span>
                      </div>
                      {discountMultiplier < 1 && (
                        <span className="text-[10px] text-emerald-400 font-mono block">
                          {isArabic ? `وفر ${Math.round((1 - discountMultiplier) * 100)}%` : `Save ${Math.round((1 - discountMultiplier) * 100)}%`}
                        </span>
                      )}
                    </div>

                    <motion.button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGearItem(item);
                      }}
                      whileHover={{ scale: 1.06, backgroundColor: "rgb(245 158 11)", color: "rgb(9 9 11)" }}
                      whileTap={{ scale: 0.94 }}
                      transition={studioSprings.snappy}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold backdrop-blur-md cursor-pointer shadow-md"
                    >
                      {isArabic ? "حجز" : "Reserve"}
                    </motion.button>
                  </div>
                </motion.article>
              </FadeUp>
            );
          })}
        </div>

        {/* ── Risk-Reversal & Trust Strip (Production Houses & DPs) ── */}
        <FadeUp delay={0.15} className="mt-14 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-900/50 border border-white/8">
            <div className="size-10 rounded-xl bg-zinc-800 border border-white/12 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-0.5">
                {isArabic ? "ضمان الاستبدال الفوري خلال 60 دقيقة" : "Zero Downtime Guarantee"}
              </h5>
              <p className="text-xs text-text-muted leading-relaxed">
                {isArabic
                  ? "وحدة احتياطية جاهزة للتوصيل الفوري لموقع تصويرك داخل الإمارات لتجنب أي توقف للإنتاج."
                  : "On-set backup unit dispatched within 60 minutes anywhere in the UAE to prevent call sheet delays."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="size-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-0.5">
                {isArabic ? "معايرة وفحص تقني 100%" : "100% Bench-Tested & Calibrated"}
              </h5>
              <p className="text-xs text-text-muted leading-relaxed">
                {isArabic
                  ? "تنظيف الحساس وفحص العدسات بأحدث أجهزة الكوليماتور قبل كل تسليم."
                  : "Sensor cleaning and optical collimation verified before every checkout with checklist report."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="size-10 rounded-xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-0.5">
                {isArabic ? "توصيل لموقع التصوير والاستوديوهات" : "Direct Set Delivery in UAE"}
              </h5>
              <p className="text-xs text-text-muted leading-relaxed">
                {isArabic
                  ? "تسليم آمن في حقائب Pelican المقاومة للصدمات مع بطاريات مشحونة وجاهزة للتشغيل."
                  : "Delivered in waterproof Pelican cases with fully charged high-load V-mount power banks."}
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Direct WhatsApp Concierge CTA */}
        <FadeUp delay={0.2} className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-center sm:text-start">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">
                {isArabic ? "هل لديك قائمة معدات مخصصة (Call Sheet Gear List)؟" : "Have a Custom Production Gear Sheet?"}
              </h5>
              <p className="text-xs text-text-secondary">
                {isArabic
                  ? "أرسل قائمة معداتك مباشرة عبر واتساب وسيقوم مهندس التأجير بتجهيز عرض سعر شامل وفوري."
                  : "Send your equipment list directly via WhatsApp for an immediate bundled quote from our head technician."}
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/971501234567?text=Hello%20Yas%20Pro%2C%20I%20have%20a%20custom%20gear%20rental%20list%20for%20an%20upcoming%20shoot."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle size={14} />
            <span>{isArabic ? "محادثة فورية على واتساب" : "Chat on WhatsApp"}</span>
          </a>
        </FadeUp>

        {/* View Full Catalog Link */}
        <FadeUp delay={0.22} className="flex justify-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all text-xs font-bold shadow-md"
          >
            <span>
              {isArabic ? `استكشاف كافة المعدات في المتجر (${GEAR_DATA.length} معدة)` : `Explore Full Rental Inventory (${GEAR_DATA.length} Items)`}
            </span>
            <ArrowRight size={14} className="rtl:rotate-180 shrink-0 transition-transform" />
          </Link>
        </FadeUp>
      </Container>

      {/* ── Interactive Quick-View & Booking Modal (The "Popup") ── */}
      <GearRentalModal
        isOpen={Boolean(selectedGearItem)}
        onClose={() => setSelectedGearItem(null)}
        item={selectedGearItem}
        initialDurationDays={durationTier}
      />
    </Section>
  );
}
