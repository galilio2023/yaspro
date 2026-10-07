import {
  Calendar,
  Camera,
  Sparkles,
  Users,
  Layers,
  CreditCard,
  Video,
} from "lucide-react";
import {
  BookingState,
  SessionTypeItem,
  StudioItem,
  CrewEquipmentItem,
  PropItem,
  AddonItem,
  StudioGearPackage,
  WizardStepItem,
} from "./types";
import catalogData from "./catalog-data.json";

export const INITIAL_BOOKING_STATE: BookingState = {
  date: "",
  time: "10:00 AM",
  durationHours: 1,
  headcount: 2,

  // Step 2: Default to Photography
  sessionType: "98",
  turnkeyPackageId: "none",

  // Step 3: Default to Green Cyclorama
  studioId: "100",

  // Step 4: Crew & Equipment
  selectedCrewEquipmentIds: [],

  // Step 5: Props
  selectedPropIds: [],

  // Step 6: Post Production
  selectedAddonIds: [],

  // Backward compatibility fields
  needsCrew: false,
  selectedGearPackage: "none",
  hasTeleprompter: false,
  extraMicsCount: 0,
  hasRushDelivery: false,
  promoCode: "",
  equipmentNotes: "",
  propsNotes: "",
  needsEditing: false,
  needsColorGrading: false,
  needsSoundMastering: false,
  needsAiAutoCut: false,

  // Step 7: Contact Info
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  specialRequests: "",
};

// 7 Steps matching yasproductions.com/studio-booking/ and screenshots
export const WIZARD_STEPS: readonly WizardStepItem[] = [
  { id: 1, label: "Date & Time", icon: Calendar },
  { id: 2, label: "Session Type", icon: Camera },
  { id: 3, label: "Choose Studio", icon: Video },
  { id: 4, label: "Crew & Equipment", icon: Users },
  { id: 5, label: "Props", icon: Layers },
  { id: 6, label: "Post Production", icon: Sparkles },
  { id: 7, label: "Payment", icon: CreditCard },
];

export const SESSION_TYPES: readonly SessionTypeItem[] = catalogData.sessionTypes as SessionTypeItem[];

export const STUDIOS: readonly StudioItem[] = catalogData.studios as StudioItem[];

export const CREW_EQUIPMENT_ITEMS: readonly CrewEquipmentItem[] = catalogData.crewEquipment as CrewEquipmentItem[];

export const PROPS_ITEMS: readonly PropItem[] = catalogData.props as PropItem[];

export const ADDONS_ITEMS: readonly AddonItem[] = catalogData.addons as AddonItem[];

export const PROP_CATEGORIES: readonly string[] = catalogData.propCategories;

export const STUDIO_GEAR_PACKAGES: readonly StudioGearPackage[] = [
  {
    id: "none",
    name: "Bring My Own Equipment",
    rate: 0,
    description: "Use the soundstage with your own camera & lighting gear.",
  },
  {
    id: "sony-multicam",
    name: "Sony FX6 3-Cam 4K Studio Package",
    rate: 1200,
    description: "3x Sony FX6 4K bodies, G-Master zooms, wireless director monitor & switcher.",
  },
  {
    id: "lighting-grid",
    name: "Full Aputure Studio Lighting Grid",
    rate: 800,
    description: "Ceiling motorized grid with RGBWW color-tunable fixtures and light domes.",
  },
  {
    id: "podcast-mics",
    name: "4-Person Shure SM7B Acoustic Mic Suite",
    rate: 500,
    description: "Broadcast vocal mics with RØDECaster Pro II & live sound mastering console.",
  },
  {
    id: "arri-commercial",
    name: "ARRI Alexa Mini LF Cinema Package",
    rate: 3500,
    description: "Pre-calibrated A-camera with Cooke cinema primes and wireless focus control.",
  },
];

export interface TurnkeyStudioPackage {
  id: string;
  name: string;
  rate: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  includedHours: number;
  eligibleStudios: readonly string[];
}

export const TURNKEY_STUDIO_PACKAGES: readonly TurnkeyStudioPackage[] = [
  {
    id: "none",
    name: "Standard Soundstage Booking",
    rate: 0,
    description: "Hourly stage rental with customized gear, crew, and post-production.",
    features: ["Acoustically isolated room", "High-speed optical fiber feed", "Base stage access"],
    includedHours: 0,
    eligibleStudios: [],
  },
];

export const STUDIO_ADDONS = [
  { id: "teleprompter", name: "Professional Teleprompter", rate: 85, rateType: "hourly", desc: "Scrolling teleprompter with operator rig" },
  { id: "extra-mic", name: "Additional Shure SM7B Vocal Mic", rate: 120, rateType: "flat", desc: "Includes boom arm and XLR connection" },
  { id: "rush-delivery", name: "24-Hour Express Turnaround", rate: 150, rateType: "flat", desc: "Expedited post-production delivery" },
] as const;

export const PROMO_CODES: Record<string, { discountPercent?: number; discountFlat?: number }> = {
  YAS10: { discountPercent: 10 },
  YASPRO: { discountPercent: 15 },
  WELCOME50: { discountFlat: 50 },
  DUBAI2026: { discountPercent: 10 },
};

export interface BookingPricingInput {
  sessionTypeId?: string;
  durationHours?: number;
  selectedCrewEquipmentIds?: string[];
  selectedPropIds?: string[];
  selectedAddonIds?: string[];
  promoCode?: string;

  // Legacy fields
  studioId?: string;
  turnkeyPackageId?: string;
  needsCrew?: boolean;
  selectedGearPackage?: string;
  hasTeleprompter?: boolean;
  extraMicsCount?: number;
  hasRushDelivery?: boolean;
  needsEditing?: boolean;
  needsColorGrading?: boolean;
  needsSoundMastering?: boolean;
  needsAiAutoCut?: boolean;
}

export interface BookingPricingBreakdown {
  sessionCost: number;
  studioCost: number;
  crewCost: number;
  gearCost: number;
  propsCost: number;
  addonsCost: number;
  turnkeyCost: number;
  postCost: number;
  subtotal: number;
  discount: number;
  tax: number; // 8% tax matching yasproductions.com calculation
  vat: number; // alias
  total: number;
}

/**
 * Pricing calculation matching yasproductions.com updatePricing() formula:
 * subtotal = session.price * duration + addons + crewEquipment + props
 * tax = subtotal * 0.08 (8%)
 * total = subtotal + tax
 */
export function calculateBookingPrice(
  input: BookingPricingInput,
  _selectedStudio?: StudioItem
): BookingPricingBreakdown {
  const duration = Math.max(1, input.durationHours ?? 1);

  // 1. Session type cost
  const sessionItem = SESSION_TYPES.find(
    (s) => s.id === input.sessionTypeId || s.id === input.studioId
  ) || SESSION_TYPES[0];
  const sessionCost = sessionItem ? sessionItem.price * duration : 0;

  // 2. Crew & Equipment cost
  let crewCost = 0;
  if (input.selectedCrewEquipmentIds && input.selectedCrewEquipmentIds.length > 0) {
    for (const id of input.selectedCrewEquipmentIds) {
      const item = CREW_EQUIPMENT_ITEMS.find((c) => c.id === id);
      if (item) {
        crewCost += item.priceType === "hourly" ? item.price * duration : item.price;
      }
    }
  } else if (input.needsCrew) {
    crewCost = 500;
  }

  // 3. Props cost
  let propsCost = 0;
  if (input.selectedPropIds && input.selectedPropIds.length > 0) {
    for (const id of input.selectedPropIds) {
      const prop = PROPS_ITEMS.find((p) => p.id === id);
      if (prop) {
        propsCost += prop.priceType === "hourly" ? prop.price * duration : prop.price;
      }
    }
  }

  // 4. Post-production Addons cost
  let addonsCost = 0;
  if (input.selectedAddonIds && input.selectedAddonIds.length > 0) {
    for (const id of input.selectedAddonIds) {
      const addon = ADDONS_ITEMS.find((a) => a.id === id);
      if (addon) {
        addonsCost += addon.priceType === "hourly" ? addon.price * duration : addon.price;
      }
    }
  } else {
    // fallback legacy post options
    addonsCost =
      (input.needsEditing ? 400 : 0) +
      (input.needsColorGrading ? 300 : 0) +
      (input.needsSoundMastering ? 250 : 0) +
      (input.needsAiAutoCut ? 450 : 0);
  }

  // 5. Gear Package cost (legacy)
  const gearPkg = (STUDIO_GEAR_PACKAGES || []).find((g) => g.id === input.selectedGearPackage);
  const gearCost = gearPkg ? gearPkg.rate : 0;

  const studioCost = 0; // Studio is included in session
  const turnkeyCost = 0;
  const postCost = addonsCost;

  const subtotal = sessionCost + crewCost + propsCost + addonsCost + gearCost;

  // Discount / Promo code
  let discount = 0;
  if (input.promoCode) {
    const code = input.promoCode.trim().toUpperCase();
    const rule = PROMO_CODES[code];
    if (rule) {
      if (rule.discountPercent) {
        discount = Math.round((subtotal * rule.discountPercent) / 100);
      } else if (rule.discountFlat) {
        discount = Math.min(subtotal, rule.discountFlat);
      }
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  // Exactly matches taxRate = 0.08 on yasproductions.com
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  return {
    sessionCost,
    studioCost,
    crewCost,
    gearCost,
    propsCost,
    addonsCost,
    turnkeyCost,
    postCost,
    subtotal,
    discount,
    tax,
    vat: tax,
    total,
  };
}
