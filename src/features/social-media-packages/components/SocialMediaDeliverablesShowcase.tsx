"use client";

import React from "react";
import { Video, Zap, Palette, CalendarCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function SocialMediaDeliverablesShowcase() {
  const { isArabic } = useLanguage();

  const PILLARS = [
    {
      icon: Video,
      specCode: "SPEC_01",
      badgeEn: "True Cinema Glass",
      badgeAr: "معدات سينما حقيقية",
      titleEn: "Sony FX6 / FX3 Full-Frame",
      titleAr: "تصوير سينمائي بكاميرات سوني FX",
      descEn: "We don't shoot on phones. Every reel and carousel is captured on dedicated full-frame cinema bodies, GM prime glass, and studio lighting.",
      descAr: "لا نعتمد على الهواتف المحمولة؛ كل محتوى يُصور بكاميرات سينمائية احترافية مع عدسات GM وإضاءات استوديو موزونة.",
    },
    {
      icon: Zap,
      specCode: "SPEC_02",
      badgeEn: "Viral Retention Edits",
      badgeAr: "مونتاج مصمم للاحتفاظ بالمشاهد",
      titleEn: "High-Paced 4K Reels",
      titleAr: "ريلز 4K سريعة الإيقاع وجاذبة",
      descEn: "Paced for maximum engagement with motion graphics, animated typographic callouts, SFX sound design, and broadcast color grading.",
      descAr: "مونتاج مبني وفق خوارزميات المنصات مع خطوط متحركة ومؤثرات صوتية وهندسة ألوان دقيقة عبر دافينشي ريزولف.",
    },
    {
      icon: Palette,
      specCode: "SPEC_03",
      badgeEn: "Brand Cohesion",
      badgeAr: "تناغم الهوية البصرية",
      titleEn: "Bespoke Identity Kits",
      titleAr: "قوالب وهوية بصرية موحدة",
      descEn: "Clean typography suites, animated logos, customized carousels, and thumb-stopping cover designs that elevate your brand authority.",
      descAr: "أطقم قوالب بصرية متكاملة وأغلفة ريلز احترافية وشعارات متحركة تمنح علامتك التجارية مظهراً فائق الاحترافية.",
    },
    {
      icon: CalendarCheck,
      specCode: "SPEC_04",
      badgeEn: "Predictable Cadence",
      badgeAr: "التزام ونشر منتظم",
      titleEn: "Turnkey Monthly Cadence",
      titleAr: "جدول إنتاج ونشر شهري منظم",
      descEn: "One scheduled shoot day per month powers your entire content calendar. Zero operational headache, consistent weekly publishing.",
      descAr: "يوم تصوير واحد منظم شهرياً يُنتج كامل محتواك لشهر كامل دون تشتيت، مع تسليم سريع وجدولة واضحة.",
    },
  ];

  return (
    <div className="w-full mt-20 pt-16 border-t border-white/10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mauve/10 border border-brand-mauve/25 text-brand-mauve text-xs font-mono uppercase tracking-wider mb-3 shadow-sm shadow-brand-violet/20">
          <Sparkles size={13} />
          <span>{isArabic ? "المعايير الاستوديوهات الاحترافية" : "THE STUDIO ADVANTAGE"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
          {isArabic ? "إنتاج سينمائي بمعايير الاستوديو لا وكالات التسويق التقليدية" : "Cinema Studio Craft, Not Generic Social Media Posts"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
          {isArabic
            ? "نجمع بين سرعة السوشيال ميديا وجودة الإنتاج التلفزيوني السينمائي في استوديوهاتنا بالخليج التجاري بدبي."
            : "We bring high-end broadcast stage infrastructure to vertical social content with guaranteed delivery."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {PILLARS.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0c0f17]/90 border border-white/[0.08] hover:border-brand-mauve/40 hover:shadow-lg hover:shadow-brand-violet/25 transition-all duration-300 flex flex-col justify-between backdrop-blur-xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-2xl bg-brand-mauve/10 border border-brand-mauve/20 text-brand-mauve flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    [{pillar.specCode}]
                  </span>
                </div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-brand-mauve mb-1">
                  {isArabic ? pillar.badgeAr : pillar.badgeEn}
                </span>
                <h3 className="text-base font-bold text-white mb-2 font-display">
                  {isArabic ? pillar.titleAr : pillar.titleEn}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isArabic ? pillar.descAr : pillar.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
