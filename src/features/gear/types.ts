export type GearCategory = "all" | "cameras" | "lenses" | "lighting" | "audio" | "bundles";

export type DeliveryMethod = "studio_delivery" | "courier_dubai" | "pickup_hub";

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  categoryLabel: string;
  dailyRate: number;
  specs: string[];
  description: string;
  isPopular?: boolean;
  image?: string;
  isKit?: boolean;
  includedInKit?: string[];
  securityDeposit?: number; // Refundable deposit in AED
}

export interface RentalDateRange {
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  totalDays: number;
  billingMultiplier: number;
  discountPercentage: number;
}
