"use client";

import React, { createContext, startTransition, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import enMessages from "../../../messages/en.json";
import arMessages from "../../../messages/ar.json";

export type Language = "en" | "ar";

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends Record<string, unknown>
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type AppTranslationKey = NestedKeyOf<typeof enMessages>;
export type TranslationParams = Record<string, string | number>;

export interface LanguageContextType {
  language: Language;
  isArabic: boolean;
  direction: "ltr" | "rtl";
  dir: "ltr" | "rtl";
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: AppTranslationKey | (string & {}), params?: TranslationParams) => string;
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

function interpolateParams(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    return Object.prototype.hasOwnProperty.call(params, token)
      ? String(params[token])
      : match;
  });
}

export function translateMessage(
  lang: Language,
  key: string,
  params?: TranslationParams
): string {
  const val = getNestedValue(MESSAGES[lang] ?? MESSAGES.en, key);
  if (val !== undefined) return interpolateParams(val, params);
  const fallback = getNestedValue(MESSAGES.en, key);
  if (fallback !== undefined) return interpolateParams(fallback, params);
  return interpolateParams(key, params);
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

const DEFAULT_LANGUAGE_CONTEXT: LanguageContextType = {
  language: "en",
  isArabic: false,
  direction: "ltr",
  dir: "ltr",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, params) => translateMessage("en", key, params),
};

const LanguageContext =
  typeof createContext === "function"
    ? createContext<LanguageContextType | undefined>(undefined)
    : (null as unknown as React.Context<LanguageContextType | undefined>);

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
        const hasCookie = document.cookie.includes("NEXT_LOCALE=");
        if (!hasCookie) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setUserLang(saved);
          syncLocaleStorage(saved);
          startTransition(() => {
            router.refresh();
          });
          return;
        }
      }
    } catch {}

    syncLocaleStorage(language);
  }, [routeLang, userLang, language, router]);

  const setLanguage = (newLang: Language) => {
    setUserLang(newLang);
    syncLocaleStorage(newLang);

    if (!pathname) {
      startTransition(() => {
        router.refresh();
      });
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";

    if (newLang === "ar") {
      if (!pathname.startsWith("/ar")) {
        const stripped = pathname.replace(/^\/en(\/|$)/, "/") || "/";
        const target = stripped === "/" ? "/ar" : `/ar${stripped}`;
        startTransition(() => {
          router.push(`${target}${search}`);
          router.refresh();
        });
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } else {
      if (!pathname.startsWith("/en")) {
        const stripped = pathname.replace(/^\/ar(\/|$)/, "/") || "/";
        const target = stripped === "/" ? "/en" : `/en${stripped}`;
        startTransition(() => {
          router.push(`${target}${search}`);
          router.refresh();
        });
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  const t = (key: AppTranslationKey | (string & {}), params?: TranslationParams): string => {
    return translateMessage(language, key, params);
  };

  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic,
        direction,
        dir: direction,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  try {
    if (!LanguageContext || typeof useContext !== "function") {
      return DEFAULT_LANGUAGE_CONTEXT;
    }
    const context = useContext(LanguageContext);
    if (!context) {
      return DEFAULT_LANGUAGE_CONTEXT;
    }
    return context;
  } catch {
    return DEFAULT_LANGUAGE_CONTEXT;
  }
}
