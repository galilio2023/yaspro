import { GearItem, RentalDateRange, DeliveryMethod } from "../types";

export interface GearRentalPricingBreakdown {
  baseDayRate: number;
  rentalSubtotal: number;
  deliveryFee: number;
  grandTotal: number;
  totalDeposit: number;
}

/**
 * Pure domain calculation for gear rental cart totals, delivery surcharges, and deposits.
 */
export function calculateGearCartTotals(
  items: Pick<GearItem, "dailyRate" | "securityDeposit">[],
  dateRange: Pick<RentalDateRange, "totalDays">,
  deliveryMethod: DeliveryMethod
): GearRentalPricingBreakdown {
  const baseDayRate = items.reduce((acc, curr) => acc + curr.dailyRate, 0);
  const multiplier = calculateRentalMultiplier(dateRange.totalDays).multiplier;
  const rentalSubtotal = baseDayRate * multiplier;
  const deliveryFee = deliveryMethod === "courier_dubai" ? 250 : 0;
  const grandTotal = rentalSubtotal + deliveryFee;
  const totalDeposit = items.reduce(
    (acc, curr) => acc + (curr.securityDeposit || curr.dailyRate * 1.5),
    0
  );

  return {
    baseDayRate,
    rentalSubtotal,
    deliveryFee,
    grandTotal,
    totalDeposit,
  };
}

export function calculateRentalMultiplier(totalDays: number): {
  multiplier: number;
  discountPct: number;
  discountLabel: string;
} {
  if (totalDays <= 1) {
    return { multiplier: 1, discountPct: 0, discountLabel: "Standard Daily Rate" };
  }
  if (totalDays === 2 || totalDays === 3) {
    // 2-3 Days: Weekend shoot discount (3 days for the price of 2)
    const multiplier = 2;
    const discountPct = Math.round(((totalDays - multiplier) / totalDays) * 100);
    return {
      multiplier,
      discountPct,
      discountLabel: totalDays === 3 ? "Weekend Deal: 1 Day Free (33% OFF)" : "2-Day Production Rate",
    };
  }
  if (totalDays >= 4 && totalDays < 7) {
    const multiplier = totalDays - 1;
    const discountPct = Math.round((1 / totalDays) * 100);
    return {
      multiplier,
      discountPct,
      discountLabel: `Multi-Day Production: 1 Day Free (${discountPct}% OFF)`,
    };
  }
  // 7+ Days: Weekly rate (7 days billed as 4 days)
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const multiplier = weeks * 4 + Math.min(remainingDays, 3);
  const discountPct = Math.round(((totalDays - multiplier) / totalDays) * 100);
  return {
    multiplier,
    discountPct,
    discountLabel: `Weekly Tier: 3 Days Free per Week (${discountPct}% OFF)`,
  };
}
