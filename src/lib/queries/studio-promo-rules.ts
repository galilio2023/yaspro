import "server-only";

import { db, isDatabaseConfigured } from "@/db";
import { promoCodes } from "@/db/schema";
import type { StudioWizardCatalogOverride } from "@/features/booking/constants";

/** Keep database overrides, including blocked codes, authoritative over static promos. */
export async function getStudioPromoRules(): Promise<StudioWizardCatalogOverride["promoRules"]> {
  if (!isDatabaseConfigured()) return undefined;
  try {
    const rows = await db.select().from(promoCodes);
    const now = Date.now();
    const rules: NonNullable<StudioWizardCatalogOverride["promoRules"]> = {};
    for (const row of rows) {
      // Studio sessions do not identify an offer to validate offer-scoped promos against.
      const allowed = row.isActive !== false &&
        (!row.expiresAt || new Date(row.expiresAt).getTime() > now) &&
        !row.eligibleOfferIds?.length;
      rules[row.code.toUpperCase()] = allowed ? {
        discountPercent: row.discountPercent ?? undefined,
        discountFlat: row.discountAmount ? Number(row.discountAmount) : undefined,
      } : null;
    }
    return rules;
  } catch {
    return undefined;
  }
}
