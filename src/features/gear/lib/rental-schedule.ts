import type { RentalDateRange } from "../types";
import { calculateRentalMultiplier } from "./cart-pricing";

/** Calendar dates belong to the customer; they are not UTC timestamps. */
export function getLocalCalendarDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Use UTC only for arithmetic on date-only strings, avoiding DST offsets. */
export function addCalendarDays(date: string, days: number): string {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().split("T")[0];
}

export function normalizeRentalDateRange(pickupDate: string, returnDate: string): RentalDateRange | null {
  const span = (Date.parse(returnDate) - Date.parse(pickupDate)) / 86400000;
  if (!Number.isFinite(span)) return null;
  const totalDays = Math.max(1, span);
  const { multiplier, discountPct } = calculateRentalMultiplier(totalDays);
  return {
    pickupDate,
    returnDate: addCalendarDays(pickupDate, totalDays),
    totalDays,
    billingMultiplier: multiplier,
    discountPercentage: discountPct,
  };
}

/** Called after validating date formats and a positive integer duration. */
export function isRentalScheduleConsistent(input: {
  startDate?: string;
  returnDate?: string;
  durationDays: number;
}): boolean {
  if (!input.returnDate) return true;
  if (!input.startDate) return false;
  return (Date.parse(input.returnDate) - Date.parse(input.startDate)) / 86400000 === input.durationDays;
}
