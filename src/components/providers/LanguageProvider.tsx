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

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Language;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Match initial server and first-client render exactly using the request locale
  const [language, setLanguageState] = useState<Language>(initialLocale);

  function applyLanguage(lang: Language) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem("yaspro_lang", lang);
    } catch {}
  }

  // Post-hydration reconciliation: prioritize explicit /en and /ar paths over localStorage
  useEffect(() => {
    if (pathname === "/en" || pathname?.startsWith("/en/")) {
      if (language !== "en") {
        setLanguageState("en"); // eslint-disable-line
        applyLanguage("en");
      }
    } else if (pathname === "/ar" || pathname?.startsWith("/ar/")) {
      if (language !== "ar") {
        setLanguageState("ar"); // eslint-disable-line
        applyLanguage("ar");
      }
    } else {
      // Unprefixed path: check saved preference
      try {
        const saved = localStorage.getItem("yaspro_lang") as Language;
        if ((saved === "ar" || saved === "en") && saved !== language) {
          applyLanguage(saved);
          setLanguageState(saved); // eslint-disable-line
        }
      } catch {}
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    applyLanguage(newLang);

    if (!pathname) return;
    if (newLang === "ar" && !pathname.startsWith("/ar")) {
      const stripped = pathname.replace(/^\/en(\/|$)/, "/") || "/";
      const target = stripped === "/" ? "/ar" : `/ar${stripped}`;
      router.push(target);
    } else if (newLang === "en") {
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
