import React from "react";
import { getCmsBookings } from "@/lib/cms-actions";
import { OffersManager, type OffersManagerPromoItem } from "@/features/admin";
import { OFFERS_PROMO_CODES } from "@/features/offers/promo-codes";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import { formatCurrency } from "@/lib/utils";
import { getCmsPromoCodes, type CmsPromoCode } from "@/lib/actions/offers-promo-operations";
import { getCmsOffers } from "@/lib/actions/offers-packages-operations";

const PROMO_DESCRIPTIONS: Record<string, string> = {
  YAS10: "Site-wide Welcome Promo",
  CREATOR20: "Creator Community Perk",
  VIP50: "Executive / VIP Client Pass",
};

export const metadata = {
  title: "Turnkey Offers & Bundles CMS | Yas Productions",
  description: "Manage packaged production bundles, live mixing suites, and promotional discount campaigns.",
};

export default async function AdminOffersPage() {
  const [initialBookings, dbPromos, initialOffers] = await Promise.all([
    getCmsBookings(),
    getCmsPromoCodes().catch(() => [] as CmsPromoCode[]),
    getCmsOffers().catch(() => []),
  ]);

  const promoMap = new Map<string, OffersManagerPromoItem>();

  // Base: shared static promo codes matching checkout rules & tests
  for (const [code, rule] of Object.entries(OFFERS_PROMO_CODES)) {
    promoMap.set(code, {
      id: code,
      code,
      discount:
        rule.discountPercent !== undefined
          ? `${rule.discountPercent}% OFF`
          : `${formatCurrency(rule.discountAmount || 0)} OFF`,
      type: PROMO_DESCRIPTIONS[code] || "Offer Promo",
      eligibility: rule.eligibleOfferIds
        ? rule.eligibleOfferIds
            .map((id) => OFFERS_AND_BUNDLES.find((offer) => offer.id === id)?.name || id)
            .join(", ") || "No eligible offers"
        : "All valid offers & bundles",
      label: PROMO_DESCRIPTIONS[code] || "Offer Promo",
      discountPercent: rule.discountPercent ?? null,
      discountAmount: rule.discountAmount ? String(rule.discountAmount) : null,
      eligibleOfferIds: rule.eligibleOfferIds ?? null,
      expiresAt: null,
      maxUses: null,
      isActive: true,
      usageCount: 0,
      source: "static" as const,
    });
  }

  // Merge any dynamic DB promo codes
  if (Array.isArray(dbPromos)) {
    for (const dbCode of dbPromos) {
      const existing = promoMap.get(dbCode.code);
      promoMap.set(dbCode.code, {
        ...existing,
        ...dbCode,
        discount:
          dbCode.discountPercent != null
            ? `${dbCode.discountPercent}% OFF`
            : `${formatCurrency(Number(dbCode.discountAmount || 0))} OFF`,
        type: dbCode.label || existing?.type || "Custom Promo",
        eligibility: dbCode.eligibleOfferIds?.length
          ? dbCode.eligibleOfferIds
              .map((id) => OFFERS_AND_BUNDLES.find((offer) => offer.id === id)?.name || id)
              .join(", ") || "No eligible offers"
          : "All valid offers & bundles",
      });
    }
  }

  const promoCodes = Array.from(promoMap.values());
  return (
    <OffersManager
      initialBookings={initialBookings}
      promoCodes={promoCodes}
      initialOffers={initialOffers}
    />
  );
}
