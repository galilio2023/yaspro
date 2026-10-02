"use client";

import { MapPin, Phone, Mail } from "lucide-react";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/animations/MotionWrappers";
import { LOCATIONS_DATA } from "../data";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function LocationsList() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="w-full">
      <FadeUp delay={0.1}>
        <h2 className="text-white font-black text-2xl sm:text-3xl font-display tracking-tight leading-tight rtl:leading-[1.4] text-balance mb-6">
          {t("contact.studiosTitle")}
        </h2>
      </FadeUp>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
        {LOCATIONS_DATA.map((loc) => (
          <StaggerItem key={loc.country} className="h-full">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-6 flex items-start gap-4 hover:border-amber-500/40 hover:bg-white/[0.06] transition-all duration-300 h-full">
              <div className="text-3xl shrink-0 p-2 rounded-2xl bg-white/5 border border-white/10">
                {loc.flag}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold font-display tracking-tight rtl:leading-[1.35] text-lg mb-1">
                  {isArabic && loc.arCountry ? loc.arCountry : loc.country}
                </h3>
                <p className="text-text-secondary text-sm flex items-start gap-2 leading-relaxed">
                  <MapPin size={15} className="text-amber-400 mt-0.5 shrink-0" />
                  <span className="break-words">
                    {isArabic && loc.arAddress ? loc.arAddress : loc.address}
                  </span>
                </p>
                <p className="text-text-secondary text-sm flex items-center gap-2 mt-1.5 font-mono" dir="ltr">
                  <Phone size={14} className="text-amber-400 shrink-0" />
                  <span className="break-all font-latin">{loc.phone}</span>
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeUp delay={0.4}>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <span className="text-white font-bold text-sm block">
                {t("contact.directEmail")}
              </span>
              <a
                href="mailto:info@yasproductions.com"
                className="text-amber-400 hover:text-white transition-colors text-sm font-medium font-latin"
                dir="ltr"
              >
                info@yasproductions.com
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="https://web.whatsapp.com/send?phone=971554010465"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl text-center text-sm font-semibold border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
            >
              <span>{t("contact.whatsAppDirect")}</span>
            </a>
            <a
              href="https://instagram.com/yaspromedia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[44px] py-3 px-4 rounded-2xl text-center text-sm font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>{t("contact.instagramChannel")}</span>
            </a>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
