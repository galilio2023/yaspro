import React from "react";
import { getCmsBookings } from "@/lib/cms-actions";
import { OffersManager } from "@/features/admin";
import { OFFERS_PROMO_CODES } from "@/features/offers/promo-codes";
import { OFFERS_AND_BUNDLES } from "@/features/offers/data";
import { formatCurrency } from "@/lib/utils";

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
  const initialBookings = await getCmsBookings();
  const promoCodes = Object.entries(OFFERS_PROMO_CODES).map(([code, rule]) => ({
    code,
    discount: rule.discountPercent !== undefined
      ? `${rule.discountPercent}% OFF`
      : `${formatCurrency(rule.discountAmount || 0)} OFF`,
    type: PROMO_DESCRIPTIONS[code] || "Offer Promo",
    eligibility: rule.eligibleOfferIds
      ? rule.eligibleOfferIds.map((id) => OFFERS_AND_BUNDLES.find((offer) => offer.id === id)?.name || id).join(", ") || "No eligible offers"
      : "All valid offers & bundles",
  }));
  return <OffersManager initialBookings={initialBookings} promoCodes={promoCodes} />;
}
