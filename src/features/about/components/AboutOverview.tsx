"use client";
import Image from "next/image";
import { FadeUp } from "@/components/animations/MotionWrappers";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { REGIONAL_HUBS_EXPANDED } from "../data";
import { MapPin, CheckCircle2, ShieldCheck } from "lucide-react";

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
          <div className="relative rounded-3xl border border-white/10 hover:border-brand-mauve/30 transition-colors duration-500 bg-card/80 backdrop-blur-2xl p-6 sm:p-9 lg:p-10 h-full flex flex-col justify-between shadow-2xl shadow-black/50 overflow-hidden group">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-brand-mauve bg-brand-violet/20 border border-brand-mauve/30">
                  <span className="size-1.5 rounded-full bg-brand-mauve shadow-[0_0_8px_rgba(152,123,165,0.6)]" />
                  <span>{t("about.philosophyBadge")}</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 font-latin" dir="ltr">
                  <ShieldCheck size={14} className="text-brand-mauve" /> EST. 2015 DUBAI
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-6 font-display tracking-tight leading-snug rtl:leading-tight">
                {t("about.philosophyTitle")}
              </h2>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed rtl:leading-loose mb-5">
                {t("about.philosophyP1")}
              </p>

              <p className="text-text-secondary text-sm sm:text-base leading-relaxed rtl:leading-loose">
                {t("about.philosophyP2")}
              </p>
            </div>

            {/* Credential micro-strip */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 text-white/80">
                <CheckCircle2 size={14} className="text-brand-mauve shrink-0" />
                <span>{isArabic ? "معتمد لدى الجهات الحكومية والسيادية" : "Accredited for Sovereign & Giga Projects"}</span>
              </span>
              <span className="font-mono text-brand-mauve text-[11px] font-latin" dir="ltr">
                NMC LICENSED • UAE FTA COMPLIANT
              </span>
            </div>
          </div>
        </FadeUp>

        {/* Scale & Reach Card (5 cols) */}
        <FadeUp delay={0.1} className="lg:col-span-5 h-full">
          <div className="rounded-3xl border border-white/10 hover:border-brand-mauve/30 transition-colors duration-500 bg-card/60 backdrop-blur-2xl p-6 sm:p-8 lg:p-9 h-full flex flex-col justify-between shadow-2xl shadow-black/50">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-brand-mauve bg-brand-violet/20 border border-brand-mauve/30">
                  <span className="size-1.5 rounded-full bg-brand-mauve shadow-[0_0_8px_rgba(152,123,165,0.6)]" />
                  <span>{t("about.scaleBadge")}</span>
                </span>
                <span className="text-[11px] font-mono text-zinc-400 font-latin" dir="ltr">
                  VERIFIED AUDIT
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display tracking-tight rtl:leading-tight">
                {t("about.scaleTitle")}
              </h2>

              <p className="text-xs sm:text-sm text-text-muted rtl:leading-relaxed mb-6">
                {isArabic
                  ? "أرقام قياسية تعكس عمق انتشارنا الإقليمي وثقة عملائنا في الخليج والعالم."
                  : "Production metrics demonstrating our regional reach and broadcast consistency."}
              </p>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-2">
                {scaleStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-mauve/20 transition-colors text-start"
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-start mb-1">
                      <span
                        dir="ltr"
                        className="font-latin inline-block"
                        style={{
                          background: "linear-gradient(135deg, #DDD3E1 0%, #BBA7C3 50%, #987BA5 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-text-muted leading-tight rtl:leading-normal">
                      {stat.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-text-muted flex items-center justify-between">
              <span>{isArabic ? "تحديث العمليات:" : "Operations Telemetry:"}</span>
              <span className="text-brand-mauve font-mono font-medium flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isArabic ? "كافة الاستوديوهات متصلة" : "All Facilities Active"}</span>
              </span>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── Section 2: Regional Production Infrastructure Strip ── */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display rtl:leading-tight">
            {isArabic ? "ثلاثة مقرات استوديو كبرى تحت إدارة موحدة" : "Three Dedicated Regional Production Hubs"}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-2.5 rtl:leading-relaxed">
            {isArabic
              ? "مرافق مجهزة بأحدث شبكات الألياف الضوئية وغرف التحكم المركزية لتأمين إنتاج سلس عبر الحدود."
              : "Synchronized broadcast soundstages and post facilities connected via ultra-low latency fiber."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {REGIONAL_HUBS_EXPANDED.map((hub) => (
            <FadeUp key={hub.id} className="h-full">
              <div className="rounded-3xl border border-white/10 hover:border-brand-mauve/40 bg-card/60 hover:bg-card/80 backdrop-blur-xl p-5 sm:p-6 h-full flex flex-col justify-between transition-all duration-300 group shadow-xl shadow-black/20 overflow-hidden">
                <div>
                  {/* 3D Heritage Visual Banner */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 border border-white/10 group-hover:border-brand-mauve/30 transition-all shadow-lg bg-black/40">
                    <Image
                      src={hub.image}
                      alt={isArabic ? hub.landmarkAr : hub.landmarkEn}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.92] group-hover:brightness-100"
                    />

                    {/* Ambient gradient vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                    {/* Top Badges Over Image */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-sm">
                        <span className="text-base leading-none" role="img" aria-label={hub.cityEn}>
                          {hub.flag}
                        </span>
                        <span>{isArabic ? hub.cityAr : hub.cityEn}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-brand-mauve bg-black/70 backdrop-blur-md border border-brand-mauve/40 shadow-sm font-latin" dir="ltr">
                        <span className="size-1.5 rounded-full bg-brand-mauve animate-pulse" />
                        <span>{isArabic ? hub.arStatus : hub.status}</span>
                      </span>
                    </div>

                    {/* Bottom Landmark Caption Over Image */}
                    <div className="absolute bottom-2.5 inset-x-3 z-10 flex items-center justify-between text-[10.5px] font-mono text-zinc-300">
                      <span className="bg-black/65 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10 text-brand-mauve truncate max-w-full font-medium">
                        {isArabic ? hub.landmarkAr : hub.landmarkEn}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-mauve transition-colors mb-2 font-display rtl:leading-snug">
                    {isArabic ? hub.titleAr : hub.titleEn}
                  </h4>

                  <p className="text-xs text-zinc-300 font-medium mb-3 flex items-start gap-1.5">
                    <MapPin size={13} className="shrink-0 text-brand-mauve mt-0.5" />
                    <span className="leading-snug">{isArabic ? hub.facilityAr : hub.facilityEn}</span>
                  </p>

                  <p className="text-xs text-text-secondary leading-relaxed rtl:leading-relaxed bg-white/[0.02] border border-white/5 rounded-2xl p-3">
                    {isArabic ? hub.arStats : hub.stats}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-muted font-mono">
                  <span>{isArabic ? "المعايير التقنية:" : "Technical Standard:"}</span>
                  <span className="text-brand-mauve font-latin" dir="ltr">4K HDR • GENLOCK 120 FPS</span>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

    </div>
  );
}
