"use client";

import React, { useState } from "react";
import { Check, Minus, Layers } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface FeatureRow {
  nameEn: string;
  nameAr: string;
  starter: string | boolean;
  growth: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}

interface FeatureSection {
  categoryEn: string;
  categoryAr: string;
  features: FeatureRow[];
}

const COMPARISON_SECTIONS: FeatureSection[] = [
  {
    categoryEn: "Content & Deliverables",
    categoryAr: "المحتوى والمخرجات الشهرية",
    features: [
      {
        nameEn: "4K Vertical Reels (15–45s)",
        nameAr: "فيديوهات ريلز 4K سينمائية",
        starter: "2 Reels",
        growth: "4 Reels",
        premium: "8 Reels",
        enterprise: "Custom (12-30+)",
      },
      {
        nameEn: "Carousel & Editorial Photos",
        nameAr: "منشورات كاورسيل وصور تحريرية",
        starter: "6 Posts",
        growth: "12 Posts",
        premium: "16 Posts",
        enterprise: "Unlimited",
      },
      {
        nameEn: "Monthly Interactive Stories",
        nameAr: "قصص تفاعلية ستوريز",
        starter: "10 Stories",
        growth: "20 Stories",
        premium: "30 Stories (Daily)",
        enterprise: "Daily Dedicated",
      },
      {
        nameEn: "Audio Mastering & Sound Design",
        nameAr: "هندسة صوت ومؤثرات سينمائية",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "Bilingual Captions & Copywriting",
        nameAr: "كتابة نصوص وكابشن باللغتين",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
    ],
  },
  {
    categoryEn: "Filming & Studio Production",
    categoryAr: "جلسات التصوير والاستوديوهات",
    features: [
      {
        nameEn: "Production Filming Visits",
        nameAr: "جلسات وأيام التصوير المعتمدة",
        starter: "1 Half Day (4h)",
        growth: "1 Full Day (8h)",
        premium: "2 Full Days (16h)",
        enterprise: "Unlimited / Full Crew",
      },
      {
        nameEn: "Cinema Gear & Multi-Cam",
        nameAr: "طواقم وكاميرات السينما FX6/FX3",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "Yas Pro Business Bay Soundstages",
        nameAr: "استوديوهات Yas Pro بالخليج التجاري",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "On-Location Client Filming (UAE)",
        nameAr: "تصوير ميداني بمقر العميل بالإمارات",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "Teleprompter & Script Assistance",
        nameAr: "أجهزة تلقين ومساعدة في التقديم",
        starter: false,
        growth: true,
        premium: true,
        enterprise: true,
      },
    ],
  },
  {
    categoryEn: "Motion Graphics & Visual Identity",
    categoryAr: "الموشن جرافيكس والهوية البصرية",
    features: [
      {
        nameEn: "Animated Logo Outro",
        nameAr: "أوتور موشن متحرك للشعار",
        starter: false,
        growth: "1 Custom Outro",
        premium: "2 Intro + Outro",
        enterprise: "Full Bespoke Kit",
      },
      {
        nameEn: "Complete Social Identity Graphics Kit",
        nameAr: "طقم قوالب وهوية بصرية رقمية شاملة",
        starter: false,
        growth: false,
        premium: "Included (One-Time)",
        enterprise: "Custom Rebranding",
      },
      {
        nameEn: "Dynamic On-Screen Motion Subtitles",
        nameAr: "ترجمة ومؤثرات نصية حركية للريلز",
        starter: true,
        growth: true,
        premium: true,
        enterprise: true,
      },
    ],
  },
  {
    categoryEn: "Management & Strategy",
    categoryAr: "الإدارة والمتابعة الاستراتيجية",
    features: [
      {
        nameEn: "Community Moderator & Comment Interaction",
        nameAr: "إدارة تفاعل ومتابعة التعليقات",
        starter: false,
        growth: true,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "Strategy & Creative Planning Calls",
        nameAr: "جلسات تخطيط واستشارات استراتيجية",
        starter: false,
        growth: "1 Monthly Call",
        premium: "Weekly (4x Calls)",
        enterprise: "Dedicated Director",
      },
      {
        nameEn: "Dedicated Account Manager",
        nameAr: "مدير حساب مخصص للتنسيق",
        starter: false,
        growth: false,
        premium: true,
        enterprise: true,
      },
      {
        nameEn: "Rapid 48-72h Turnaround SLA",
        nameAr: "اتفاقية تسليم خلال 48-72 ساعة",
        starter: true,
        growth: true,
        premium: true,
        enterprise: "24h Priority SLA",
      },
    ],
  },
];

export function PackageComparisonTable() {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const renderCellContent = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500/15 text-emerald-400">
          <Check size={13} strokeWidth={3} />
        </span>
      ) : (
        <span className="inline-flex items-center justify-center size-5 rounded-full bg-white/5 text-zinc-500">
          <Minus size={13} />
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-zinc-200">
        {value}
      </span>
    );
  };

  return (
    <div className="w-full mt-16 sm:mt-24 pt-12 border-t border-white/10">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-wider mb-3">
          <Layers size={13} />
          <span>{isArabic ? "مقارنة الميزات التفصيلية" : "Deep Spec Matrix"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
          {isArabic ? "مقارنة شاملة بين جميع الباقات" : "Compare All Features Side-by-Side"}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          {isArabic
            ? "تعرف على تفاصيل كل باقة لتختار الحل الأنسب لأهداف شركتك وطموح علامتك."
            : "Review granular deliverables, soundstage quotas, and post-production capabilities."}
        </p>

        <div className="mt-4 sm:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            {isOpen ? (isArabic ? "إخفاء جدول المقارنة" : "Hide Comparison Table") : (isArabic ? "عرض جدول المقارنة" : "View Full Comparison Table")}
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className={`overflow-x-auto rounded-3xl border border-white/10 bg-[#0a0d14] backdrop-blur-md shadow-2xl ${isOpen ? "block" : "hidden sm:block"}`}>
        <table className="w-full min-w-[760px] text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-zinc-400 w-1/3">
                {isArabic ? "الميزة / الخدمة" : "Feature / Deliverable"}
              </th>
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-center text-white">
                {isArabic ? "البداية (Starter)" : "Starter"}
              </th>
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-center text-amber-400 bg-amber-400/[0.05] border-x border-amber-400/20">
                {isArabic ? "النمو (Growth) ★" : "Growth ★"}
              </th>
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-center text-white">
                {isArabic ? "المتميزة (Premium)" : "Premium"}
              </th>
              <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-center text-zinc-300">
                {isArabic ? "الشركات (Enterprise)" : "Enterprise"}
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_SECTIONS.map((section, sIdx) => (
              <React.Fragment key={sIdx}>
                {/* Category Header Row */}
                <tr className="border-t border-b border-white/[0.08] bg-white/[0.03]">
                  <td
                    colSpan={5}
                    className="py-3 px-4 sm:px-5 text-xs font-mono font-bold tracking-wider uppercase text-amber-400"
                  >
                    {isArabic ? section.categoryAr : section.categoryEn}
                  </td>
                </tr>

                {/* Rows */}
                {section.features.map((feature, fIdx) => (
                  <tr
                    key={fIdx}
                    className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
                  >
                    <td className="p-4 sm:p-5 text-xs sm:text-sm font-medium text-zinc-300">
                      {isArabic ? feature.nameAr : feature.nameEn}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {renderCellContent(feature.starter)}
                    </td>
                    <td className="p-4 sm:p-5 text-center bg-amber-400/[0.02] border-x border-amber-400/10">
                      {renderCellContent(feature.growth)}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {renderCellContent(feature.premium)}
                    </td>
                    <td className="p-4 sm:p-5 text-center">
                      {renderCellContent(feature.enterprise)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
