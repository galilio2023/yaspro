import type { AppliedOffersPromo } from "./types";

export function getOffersDiscount(basePrice: number, promo: AppliedOffersPromo | null): number {
  if (promo?.discountPercent) return Math.round((basePrice * promo.discountPercent) / 100);
  if (promo?.discountAmount) return Math.min(basePrice, promo.discountAmount);
  return 0;
}
