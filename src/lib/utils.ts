import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = "AED",
  locale: "en" | "ar" = "en"
) {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

export function formatDate(
  dateInput: Date | string | number,
  locale: "en" | "ar" = "en",
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  const date =
    typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
      ? new Date(`${dateInput}T12:00:00`)
      : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return String(dateInput);
  return new Intl.DateTimeFormat(
    locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE",
    options
  ).format(date);
}

export function formatTimeSlot(slot: string, locale: "en" | "ar" = "en"): string {
  if (!slot || locale !== "ar") return slot;
  return slot
    .replace(/\bAM\b/gi, "ص")
    .replace(/\bPM\b/gi, "م");
}

export const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTHS_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
] as const;

export const WEEKDAYS_SHORT_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
export const WEEKDAYS_SHORT_AR = ["أح", "إث", "ثل", "أر", "خم", "جم", "سب"] as const;

/**
 * Strips leading /ar or /en locale prefix from a Next.js pathname.
 */
export function stripLocalePrefix(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  return stripped || "/";
}

/**
 * Checks whether a navigation link href is active against the current pathname,
 * accounting for /ar and /en locale prefixes.
 */
export function isActiveRoute(
  pathname: string | null | undefined,
  href: string
): boolean {
  const normalized = stripLocalePrefix(pathname);
  const target = stripLocalePrefix(href);
  if (target === "/") {
    return normalized === "/";
  }
  return normalized === target || normalized.startsWith(`${target}/`);
}

export function generateBookingReference() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const prefix = "YAS";
  const suffix = Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return `${prefix}-${suffix}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
