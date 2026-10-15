export type OfferCategory = "all" | "bundles" | "special_offers";

export interface OfferBundleItem {
  id: string;
  category: "bundle" | "offer";
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  savings?: string;
  savingsAr?: string;
  hours: number;
  badge?: string;
  badgeAr?: string;
  image: string;
  features: string[];
  featuresAr: string[];
  /** Allowed days: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat */
  restrictedDays?: number[];
  /** Allowed hours slot window */
  restrictedHours?: {
    start: string;
    end: string;
    slots: string[];
  };
  restrictionNoteEn?: string;
  restrictionNoteAr?: string;
  isActive?: boolean;
}

export interface OffersBookingContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  specialRequests: string;
}

export interface OffersPricingBreakdown {
  basePrice: number;
  discount: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
}

export interface AppliedOffersPromo {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  eligibleOfferIds?: string[];
}
