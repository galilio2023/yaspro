import React from "react";
import { getCmsPromoCodes, getCmsPromoUsages } from "@/lib/actions/promo-codes-operations";
import { PromoCodesManager } from "@/features/admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promo Codes & Discounts CMS | Yas Productions",
  description: "Create, configure, and monitor promo codes, discounts, and customer redemptions.",
};

export default async function AdminPromosPage() {
  const [initialPromoCodes, initialUsages] = await Promise.all([
    getCmsPromoCodes(),
    getCmsPromoUsages(),
  ]);

  return <PromoCodesManager initialPromoCodes={initialPromoCodes} initialUsages={initialUsages} />;
}
