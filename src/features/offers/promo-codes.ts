import "server-only";

import type { AppliedOffersPromo } from "./types";

export interface OffersPromoRule {
  discountPercent?: number;
  discountAmount?: number;
  eligibleOfferIds?: string[];
  expiresAt?: string;
  maxUses?: number;
  isActive?: boolean;
}

// These existing codes have no configured expiry or redemption cap. Add policies
// here when specified; availability and usage are checked again at checkout.
export const OFFERS_PROMO_CODES: Record<string, OffersPromoRule> = {
  YAS10: { discountPercent: 10 },
  CREATOR20: { discountPercent: 20 },
  VIP50: { discountPercent: 50 },
};

export class OffersPromoError extends Error {}

export async function resolveOffersPromo(
  code: string,
  offerId: string,
  readUsage: (code: string) => Promise<number>,
  readDbRule?: (code: string) => Promise<OffersPromoRule | null>,
): Promise<AppliedOffersPromo> {
  const cleanCode = code.trim().toUpperCase();
  // Admin-managed (database) rules take precedence; static codes remain the fallback.
  const dbRule = readDbRule ? await readDbRule(cleanCode) : null;
  if (dbRule && dbRule.isActive === false) throw new OffersPromoError("Invalid promotional code.");
  const rule = dbRule ?? (Object.hasOwn(OFFERS_PROMO_CODES, cleanCode) ? OFFERS_PROMO_CODES[cleanCode] : undefined);
  if (!rule) throw new OffersPromoError("Invalid promotional code.");
  if (rule.eligibleOfferIds && !rule.eligibleOfferIds.includes(offerId)) {
    throw new OffersPromoError("This promotional code is not available for the selected offer.");
  }
  if (rule.expiresAt && !(Date.now() < Date.parse(rule.expiresAt))) {
    throw new OffersPromoError("This promotional code has expired.");
  }
  if (rule.maxUses !== undefined && await readUsage(cleanCode) >= rule.maxUses) {
    throw new OffersPromoError("This promotional code has reached its usage limit.");
  }
  // Only the entered code's pricing rule is returned to the client.
  return {
    code: cleanCode,
    discountPercent: rule.discountPercent,
    discountAmount: rule.discountAmount,
    eligibleOfferIds: rule.eligibleOfferIds,
  };
}
