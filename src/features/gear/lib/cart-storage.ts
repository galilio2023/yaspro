import { z } from "zod";
import type { GearItem, RentalDateRange, DeliveryMethod } from "../types";
import { calculateRentalMultiplier } from "./cart-pricing";

const optionalString = z.string().optional().catch(undefined);
const optionalBoolean = z.boolean().optional().catch(undefined);
const optionalStrings = z.array(z.string()).optional().catch(undefined);
const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  arabicName: optionalString,
  category: z.enum(["all", "cameras", "lenses", "lighting", "audio", "bundles"]),
  categoryLabel: z.string(),
  dailyRate: z.number().nonnegative(),
  specs: z.array(z.string()),
  description: z.string(),
  arabicDescription: optionalString,
  isPopular: optionalBoolean,
  image: optionalString,
  isKit: optionalBoolean,
  includedInKit: optionalStrings,
  securityDeposit: z.number().nonnegative().optional().catch(undefined),
  isAvailable: optionalBoolean,
});
const dateRangeSchema = z.object({
  pickupDate: z.iso.date(),
  returnDate: z.iso.date(),
  totalDays: z.number().int().min(1).max(365),
  billingMultiplier: z.number().positive().max(365),
  discountPercentage: z.number().min(0).max(100),
}).refine((range) => range.returnDate >= range.pickupDate &&
  range.totalDays === Math.max(1, Math.round((Date.parse(range.returnDate) - Date.parse(range.pickupDate)) / 86400000)));
const deliverySchema = z.enum(["studio_delivery", "courier_dubai", "pickup_hub"]);

export function getInitialDateRange(): RentalDateRange {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  return { pickupDate: today, returnDate: tomorrow, totalDays: 1, billingMultiplier: 1, discountPercentage: 0 };
}

/** Treat storage from this or another tab as untrusted and restore fields independently. */
export function parseCartStorage(saved: string | null): {
  items: GearItem[]; dateRange: RentalDateRange; deliveryMethod: DeliveryMethod;
} {
  const result = { items: [] as GearItem[], dateRange: getInitialDateRange(), deliveryMethod: "studio_delivery" as DeliveryMethod };
  try {
    const parsed: unknown = JSON.parse(saved ?? "null");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return result;
    const data = parsed as Record<string, unknown>;
    if (Array.isArray(data.items)) {
      for (const value of data.items.slice(0, 100)) {
        const item = itemSchema.safeParse(value);
        if (item.success && !result.items.some((existing) => existing.id === item.data.id)) result.items.push(item.data);
      }
    }
    const dates = dateRangeSchema.safeParse(data.dateRange);
    if (dates.success) {
      const { multiplier, discountPct } = calculateRentalMultiplier(dates.data.totalDays);
      result.dateRange = { ...dates.data, billingMultiplier: multiplier, discountPercentage: discountPct };
    }
    const delivery = deliverySchema.safeParse(data.deliveryMethod);
    if (delivery.success) result.deliveryMethod = delivery.data;
  } catch {
    // Malformed or unavailable storage restores a safe, empty cart.
  }
  return result;
}
