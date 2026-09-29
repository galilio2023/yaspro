"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const MESSAGES: Record<Language, Record<string, unknown>> = {
  en: enMessages,
  ar: arMessages,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    if (window.location.pathname.startsWith("/ar")) return "ar";
    try {
      const saved = localStorage.getItem("yaspro_lang") as Language;
      if (saved === "ar" || saved === "en") return saved;
    } catch {}
    return (document.documentElement.lang as Language) === "ar" ? "ar" : "en";
  });

  function applyLanguage(lang: Language) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("yaspro_lang", lang);
    } catch {}
  }

  // Sync state if URL changes (e.g., user navigated to /ar or /en)
  useEffect(() => {
    if (pathname?.startsWith("/ar")) {
      if (language !== "ar") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState("ar");
        applyLanguage("ar");
      }
    } else {
      try {
        const saved = localStorage.getItem("yaspro_lang") as Language;
        if (saved === "ar" && language !== "ar") {
          applyLanguage("ar");
          setLanguageState("ar");
        }
      } catch {}
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    applyLanguage(newLang);

    if (!pathname) return;
    if (newLang === "ar" && !pathname.startsWith("/ar")) {
      const target = pathname === "/" ? "/ar" : `/ar${pathname}`;
      router.push(target);
    } else if (newLang === "en" && pathname.startsWith("/ar")) {
      const target = pathname.replace(/^\/ar(\/|$)/, "/") || "/";
      router.push(target);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const t = (key: string): string => {
    const val = getNestedValue(MESSAGES[language], key);
    if (val !== undefined) return val;
    const fallback = getNestedValue(MESSAGES.en, key);
    if (fallback !== undefined) return fallback;
    return key;
  };

  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{ language, isArabic, direction, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
