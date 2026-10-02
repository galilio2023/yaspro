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

/**
 * Synchronize document attributes, localStorage, and next-intl cookies.
 */
function syncLocaleStorage(lang: Language) {
  if (typeof window === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  try {
    localStorage.setItem("yaspro_lang", lang);
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `locale=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}
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
  const [userLang, setUserLang] = useState<Language>(initialLocale);
  const [prevPathname, setPrevPathname] = useState(pathname);

  const routeLang: Language | null =
    pathname === "/en" || pathname?.startsWith("/en/")
      ? "en"
      : pathname === "/ar" || pathname?.startsWith("/ar/")
      ? "ar"
      : null;

  // Reconcile when pathname changes during render without cascading effects
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (routeLang && routeLang !== userLang) {
      setUserLang(routeLang);
    }
  }

  const language = routeLang ?? userLang;

  // Reconcile and synchronize client storage & cookies on hydration and language changes
  useEffect(() => {
    // If there is an explicit route-level locale (/en or /ar), always trust it.
    // Never let a stale localStorage value override an explicit URL or server cookie.
    if (routeLang) {
      syncLocaleStorage(routeLang);
      return;
    }

    // If no route-level locale, and initialLocale came from the server (cookie),
    // only read localStorage if it matches the server locale to avoid hydration mismatch.
    try {
      const saved = localStorage.getItem("yaspro_lang") as Language;
      if ((saved === "ar" || saved === "en") && saved !== userLang) {
        // Only override if the server gave us "en" as a fallback (no cookie set),
        // indicated by initialLocale being the default. This prevents stale Arabic
        // from a previous session persisting on a fresh EN page load.
        const hasCookie = document.cookie.includes("NEXT_LOCALE=");
        if (!hasCookie) {
          setUserLang(saved);
          syncLocaleStorage(saved);
          return;
        }
      }
    } catch {}

    syncLocaleStorage(language);
  }, [routeLang, userLang, language]);

  const setLanguage = (newLang: Language) => {
    setUserLang(newLang);
    syncLocaleStorage(newLang);

    if (!pathname) return;

    if (newLang === "ar") {
      if (!pathname.startsWith("/ar")) {
        const stripped = pathname.replace(/^\/en(\/|$)/, "/") || "/";
        const target = stripped === "/" ? "/ar" : `/ar${stripped}`;
        router.push(target);
      }
    } else {
      if (!pathname.startsWith("/en")) {
        const stripped = pathname.replace(/^\/ar(\/|$)/, "/") || "/";
        const target = stripped === "/" ? "/en" : `/en${stripped}`;
        router.push(target);
      }
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
