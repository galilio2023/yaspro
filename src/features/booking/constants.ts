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
  arabicName?: string;
  rate: number;
  description: string;
  arabicDescription?: string;
  features: readonly string[];
  arabicFeatures?: readonly string[];
  isPopular?: boolean;
  includedHours: number;
  eligibleStudios: readonly string[];
}

export const TURNKEY_STUDIO_PACKAGES: readonly TurnkeyStudioPackage[] = [
  {
    id: "none",
    name: "Standard Soundstage Booking",
    arabicName: "حجز استوديو قياسي",
    rate: 0,
    description: "Hourly stage rental with customized gear, crew, and post-production.",
    arabicDescription: "تأجير بالساعة مع تخصيص المعدات وطاقم العمل والمونتاج حسب الحاجة.",
    features: ["Acoustically isolated room", "High-speed optical fiber feed", "Base stage access"],
    arabicFeatures: ["غرفة معزولة صوتياً بالكامل", "اتصال فايبر عالي السرعة", "دخول قياسي للاستوديو"],
    includedHours: 0,
    eligibleStudios: [],
  },
  {
    id: "creator-half-day",
    name: "Creator Turnkey Half-Day",
    arabicName: "باقة صناع المحتوى (نصف يوم)",
    rate: 1600,
    description: "4-hour broadcast lounge session with multi-cam 4K setup, Shure mics, and live audio mastering.",
    arabicDescription: "جلسة 4 ساعات في جناح البودكاست مع تصوير 4K متعدد الكاميرات وميكروفونات شور وهندسة صوتية.",
    features: [
      "4 Hours in Podcast Suite or Daylight Room",
      "Multi-camera 4K Sony FX6 coverage",
      "Shure SM7B studio microphone array",
      "Instant 10Gbps raw export at session wrap",
      "Dedicated sound engineer on-set",
    ],
    arabicFeatures: [
      "4 ساعات في جناح البودكاست أو استوديو الإضاءة الطبيعية",
      "تصوير 4K بثلاث كاميرات Sony FX6",
      "منظومة ميكروفونات Shure SM7B الاحترافية",
      "تسليم المواد الخام فورياً بسرعة 10 جيجابت",
      "مهندس صوت مخصص طوال الجلسة",
    ],
    isPopular: false,
    includedHours: 4,
    eligibleStudios: ["luminous-quartz", "nature-grid"],
  },
  {
    id: "commercial-full-day",
    name: "Commercial Production Day",
    arabicName: "باقة الإنتاج التجاري (يوم كامل)",
    rate: 4800,
    description: "Full 8-hour soundstage lockout for TV commercials, brand campaigns, and fashion shoots.",
    arabicDescription: "حجز حصري 8 ساعات للاستوديو لتصوير الإعلانات التجارية وحملات الأزياء والبرامج.",
    features: [
      "8 Hours Full Soundstage Lockout (Cyc / Stage A)",
      "Aputure & SkyPanel motorized overhead lighting grid",
      "Private VIP executive green room & dressing suite",
      "Elephant door drive-in access for vehicles & cranes",
      "Studio grip & electric equipment cart included",
      "Dedicated studio stage manager",
    ],
    arabicFeatures: [
      "حجز كامل 8 ساعات (السايكلو أو الاستوديو الرئيسي)",
      "شبكة إضاءة علوية بمصابيح SkyPanel وAputure",
      "غرفة كبار الشخصيات VIP وجناح مكياج وأزياء",
      "بوابة دخول واسعة للسيارات ورافعات الكاميرا",
      "عربة معدات الجريب والكهرباء السينمائية",
      "مدير استوديو مخصص للمتابعة الميدانية",
    ],
    isPopular: true,
    includedHours: 8,
    eligibleStudios: ["earthy-sand", "classic-oak", "studio-xr"],
  },
  {
    id: "xr-virtual-lockout",
    name: "Virtual Production XR Tier",
    arabicName: "باقة الإنتاج الافتراضي XR (270°)",
    rate: 9800,
    description: "10-hour full lockout in the 270° Micro-LED volume with Unreal Engine 5.4 LiveLink tracking.",
    arabicDescription: "حجز كامل 10 ساعات في مسرح شاشات الليد 270 درجة مع محرك Unreal Engine وتتبع الكاميرا المباشر.",
    features: [
      "10 Hours in 270° Micro-LED Curved Stage",
      "Mo-Sys StarTracker optical tracking calibrated",
      "Dual RTX 6000 Ada nDisplay rendering cluster",
      "On-site DIT & real-time color grading station",
      "Tri-level master genlock sync with camera bodies",
      "Full VIP hospitality suite & private hair/makeup bay",
    ],
    arabicFeatures: [
      "10 ساعات كاملة في مسرح الليد المنحني 270 درجة",
      "نظام تتبع الكاميرا البصري Mo-Sys StarTracker",
      "محطات معالجة جرافيك RTX 6000 Ada nDisplay",
      "محطة DIT لمعالجة وتدريج الألوان في الوقت الفعلي",
      "مزامنة جينلوك كاملة مع الكاميرات السينمائية",
      "جناح ضيافة VIP كامل وغرفة مكياج وتصفيف شعر خاصة",
    ],
    isPopular: false,
    includedHours: 10,
    eligibleStudios: ["studio-xr"],
  },
];

const PROMO_CODES: Record<string, { discountPercent?: number; discountFlat?: number }> = {
  YAS10: { discountPercent: 10 },
  YASPRO: { discountPercent: 15 },
  WELCOME50: { discountFlat: 50 },
  DUBAI2026: { discountPercent: 10 },
};

export interface BookingPricingInput {
  sessionTypeId?: string;
  sessionType?: string;
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
export interface StudioWizardCatalogOverride {
  sessionTypes?: readonly SessionTypeItem[];
  crewEquipment?: readonly CrewEquipmentItem[];
  props?: readonly PropItem[];
  addons?: readonly AddonItem[];
}

export function calculateBookingPrice(
  input: BookingPricingInput,
  _selectedStudio?: StudioItem,
  catalog?: StudioWizardCatalogOverride
): BookingPricingBreakdown {
  const duration = Math.max(1, input.durationHours ?? 1);
  const sessionTypesList = catalog?.sessionTypes?.length ? catalog.sessionTypes : SESSION_TYPES;
  const crewList = catalog?.crewEquipment ?? CREW_EQUIPMENT_ITEMS;
  const propsList = catalog?.props ?? PROPS_ITEMS;
  const addonsList = catalog?.addons ?? ADDONS_ITEMS;

  // 1. Session type cost (resolved by sessionTypeId, id, or enum/title)
  const targetSessionId = input.sessionTypeId || input.sessionType;
  const sessionItem =
    sessionTypesList.find((s) => s.id === targetSessionId || s.title?.toLowerCase() === targetSessionId?.toLowerCase()) ||
    sessionTypesList[0];
  const sessionCost = sessionItem ? sessionItem.price * duration : 0;

  // 2. Crew & Equipment cost
  let crewCost = 0;
  if (input.selectedCrewEquipmentIds && input.selectedCrewEquipmentIds.length > 0) {
    for (const id of input.selectedCrewEquipmentIds) {
      const item = crewList.find((c) => c.id === id);
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
      const prop = propsList.find((p) => p.id === id);
      if (prop) {
        propsCost += prop.priceType === "hourly" ? prop.price * duration : prop.price;
      }
    }
  }

  // 4. Post-production Addons cost
  let addonsCost = 0;
  if (input.selectedAddonIds && input.selectedAddonIds.length > 0) {
    for (const id of input.selectedAddonIds) {
      const addon = addonsList.find((a) => a.id === id);
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
