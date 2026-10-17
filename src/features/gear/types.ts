export type GearCategory = "all" | "cameras" | "lenses" | "lighting" | "audio" | "accessories" | "bundles";

export type DeliveryMethod = "studio_delivery" | "courier_dubai" | "pickup_hub";

export interface GearItem {
  id: string;
  name: string;
  arabicName?: string;
  category: GearCategory;
  categoryLabel: string;
  categoryLabelAr?: string;
  dailyRate: number;
  specs: string[];
  arabicSpecs?: string[];
  description: string;
  arabicDescription?: string;
  isPopular?: boolean;
  image?: string;
  isKit?: boolean;
  includedInKit?: string[];
  arabicIncludedInKit?: string[];
  securityDeposit?: number; // Refundable deposit in AED
  isAvailable?: boolean;
}

export interface RentalDateRange {
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  totalDays: number;
  billingMultiplier: number;
  discountPercentage: number;
}
