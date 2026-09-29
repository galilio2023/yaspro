"use client";

import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { Badge } from "@/components/ui/badge";
import { BorderBeam } from "@/components/magicui/border-beam";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { REGIONAL_HUBS_EXPANDED, ACCREDITATIONS } from "../data";
import { MapPin, CheckCircle2, ShieldCheck, Clock, Award } from "lucide-react";

export function AboutOverview() {
  const { t, isArabic } = useLanguage();

  const scaleStats = [
    { value: "400M+", label: t("about.reachLabel"), detail: isArabic ? "وصول شبكة المؤثرين الرقميين" : "Combined Digital Reach" },
    { value: "500+", label: t("about.projectsLabel"), detail: isArabic ? "عمل حكومي وإعلاني منجز" : "Prime Delivered Films" },
    { value: "3", label: t("about.hubsLabel"), detail: isArabic ? "دبي • القاهرة • عَمّان" : "Dubai • Cairo • Amman" },
    { value: "100%", label: t("about.satisfactionLabel"), detail: isArabic ? "التزام كامل بمستوى الخدمة SLA" : "Sovereign SLA Adherence" },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 mb-16 sm:mb-24">
      {/* ── Section 1: Philosophy & Scale Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* Philosophy Master Card (7 cols) */}
        <FadeUp className="lg:col-span-7 h-full">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c091f]/90 via-[#0a0718]/80 to-[#070512]/95 backdrop-blur-2xl p-6 sm:p-9 lg:p-10 h-full flex flex-col justify-between shadow-2xl shadow-black/50 overflow-hidden group">
            {/* Subtle interactive border beam */}
            <BorderBeam size={220} duration={14} colorFrom="var(--brand-purple)" colorTo="var(--brand-cyan)" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <Badge variant="default" className="px-3.5 py-1 text-xs">
                  {t("about.philosophyBadge")}
                </Badge>

                <span className="text-[11px] font-mono text-brand-cyan flex items-center gap-1.5 font-latin" dir="ltr">
                  <ShieldCheck size={14} /> EST. 2015 DUBAI
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6 font-display tracking-tight leading-snug">
                {t("about.philosophyTitle")}
              </h2>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-5">
                {t("about.philosophyP1")}
              </p>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                {t("about.philosophyP2")}
              </p>
            </div>

            {/* Credential micro-strip */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 text-white/80">
                <CheckCircle2 size={14} className="text-emerald-400" />
                {isArabic ? "معتمد لدى الجهات الحكومية والسيادية" : "Accredited for Sovereign & Giga Projects"}
              </span>
              <span className="font-mono text-brand-purple-light text-[11px] font-latin" dir="ltr">
                NMC LICENSED • UAE FTA COMPLIANT
              </span>
            </div>
          </div>
        </FadeUp>

        {/* Scale & Reach Card (5 cols) */}
        <FadeUp delay={0.1} className="lg:col-span-5 h-full">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-2xl p-6 sm:p-8 lg:p-9 h-full flex flex-col justify-between shadow-2xl shadow-black/50">
            <div>
              <div className="flex items-center justify-between gap-2 mb-6">
                <Badge variant="cyan" className="px-3.5 py-1 text-xs">
                  {t("about.scaleBadge")}
                </Badge>
                <span className="size-2 rounded-full bg-brand-cyan animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display tracking-tight">
                {t("about.scaleTitle")}
              </h2>

              <p className="text-xs sm:text-sm text-text-muted mb-6">
                {isArabic
                  ? "أرقام قياسية تعكس عمق انتشارنا الإقليمي وثقة عملائنا في الخليج والعالم."
                  : "Production metrics demonstrating our regional reach and broadcast consistency."}
              </p>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
                {scaleStats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div
                      dir="ltr"
                      className="text-2xl sm:text-3xl lg:text-4xl font-black font-display font-latin text-start mb-1"
                      style={{
                        background:
                          i % 2 === 0
                            ? "linear-gradient(135deg, #A855F7 0%, #C084FC 50%, #38BDF8 100%)"
                            : "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-text-muted leading-tight">
                      {stat.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-text-muted flex items-center justify-between">
              <span>{isArabic ? "تحديث العمليات:" : "Operations Telemetry:"}</span>
              <span className="text-emerald-400 font-mono font-medium">
                {isArabic ? "كافة الاستوديوهات متصلة" : "All Facilities Active"}
              </span>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── Section 2: Regional Production Infrastructure Strip ── */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge variant="purple" className="mb-3">
            {isArabic ? "البنية التحتية الإقليمية" : "Regional Footprint"}
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            {isArabic ? "ثلاثة مقرات استوديو كبرى تحت إدارة موحدة" : "Three Dedicated Regional Production Hubs"}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-2">
            {isArabic
              ? "مرافق مجهزة بأحدث شبكات الألياف الضوئية وغرف التحكم المركزية لتأمين إنتاج سلس عبر الحدود."
              : "Synchronized broadcast soundstages and post facilities connected via ultra-low latency fiber."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {REGIONAL_HUBS_EXPANDED.map((hub) => (
            <FadeUp key={hub.id} className="h-full">
              <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl p-5 sm:p-6 h-full flex flex-col justify-between hover:border-brand-purple/40 hover:bg-white/[0.04] transition-all group shadow-xl shadow-black/20">
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={hub.cityEn}>
                        {hub.flag}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {isArabic ? hub.cityAr : hub.cityEn}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isArabic ? hub.arStatus : hub.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-brand-purple-light transition-colors mb-2 font-display">
                    {isArabic ? hub.titleAr : hub.titleEn}
                  </h4>

                  <p className="text-xs text-brand-purple-mid font-medium mb-3 flex items-start gap-1.5">
                    <MapPin size={13} className="shrink-0 text-brand-gold mt-0.5" />
                    <span>{isArabic ? hub.facilityAr : hub.facilityEn}</span>
                  </p>

                  <p className="text-xs text-text-secondary leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                    {isArabic ? hub.arStats : hub.stats}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>{isArabic ? "المعايير:" : "Standard:"}</span>
                  <span className="text-brand-cyan">4K HDR • GENLOCK 120 FPS</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* ── Section 3: Official Accreditations & Trust Grid ── */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-6 sm:p-10">
        <div className="text-start mb-8">
          <Badge variant="cyan" className="mb-2">
            {isArabic ? "الاعتمادات والموثوقية" : "Official Compliance"}
          </Badge>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            {isArabic ? "معايير الجودة والاعتمادات الرسمية" : "Verified Credentials & Sovereign Standards"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACCREDITATIONS.map((acc, idx) => {
            const Icon = acc.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-purple/30 transition-all text-start"
              >
                <div className="size-10 rounded-xl bg-brand-purple/15 text-brand-purple-light border border-brand-purple/30 flex items-center justify-center mb-3">
                  <Icon size={18} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  {isArabic ? acc.titleAr : acc.titleEn}
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isArabic ? acc.descAr : acc.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
