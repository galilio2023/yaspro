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
  items: GearItem[],
  dateRange: RentalDateRange,
  deliveryMethod: DeliveryMethod
): GearRentalPricingBreakdown {
  const baseDayRate = items.reduce((acc, curr) => acc + curr.dailyRate, 0);
  const multiplier = dateRange.billingMultiplier > 0 ? dateRange.billingMultiplier : 1;
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
