import {
  Calendar,
  Camera,
  Sparkles,
  Users,
  Layers,
  CreditCard,
} from "lucide-react";
import { BookingState, SessionTypeItem, StudioItem, StudioGearPackage, WizardStepItem } from "./types";

export const INITIAL_BOOKING_STATE: BookingState = {
  date: "",
  time: "10:00",
  durationHours: 2,
  headcount: 2,
  sessionType: "video_production",
  turnkeyPackageId: "none",
  studioId: "studio-a",
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
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  specialRequests: "",
};

export const SESSION_TYPES: readonly SessionTypeItem[] = [
  { id: "virtual_production", label: "Virtual Production (XR)", icon: "🌌", desc: "3D real-time Unreal set" },
  { id: "podcast", label: "Podcast", icon: "🎙️", desc: "Audio & video recording" },
  { id: "video_production", label: "Video Production", icon: "🎬", desc: "Full 4K video shoot" },
  { id: "photography", label: "Photography", icon: "📸", desc: "Studio photo session" },
  { id: "interview", label: "Interview", icon: "🎤", desc: "Talk show & interviews" },
  { id: "commercial", label: "Commercial", icon: "📺", desc: "Brand & ad production" },
  { id: "music_video", label: "Music Video", icon: "🎵", desc: "Music video production" },
];

export const STUDIOS: readonly StudioItem[] = [
  {
    id: "studio-xr",
    name: "Studio XR — 270° Virtual Production Stage",
    desc: "270° Micro-LED volume, Unreal Engine 5.4 LiveSync, Mo-Sys optical tracking, and genlock synchronization",
    rate: 1500,
    image: "/images/projects/dmx.jpg",
  },
  {
    id: "luminous-quartz",
    name: "Luminous Quartz — Podcast & Vodcast Suite",
    desc: "4K multi-cam capture, Rodecaster Pro II, 4x Shure SM7B mics, soundproofing & motorized RGB lighting",
    rate: 450,
    image: "/images/studios/luminous-quartz.jpg",
  },
  {
    id: "nature-grid",
    name: "Nature Grid — Flagship Soundstage & Live Tracking",
    desc: "Flagship recording studio with Neve 8078 console, Pro Tools HDX, live tracking room & pristine studio acoustics",
    rate: 850,
    image: "/images/studios/nature-grid.jpg",
  },
  {
    id: "dark-walnut",
    name: "Dark Walnut — Live Band & Acoustic Studio",
    desc: "Acoustically isolated live room for bands & ensembles with SSL AWS console, full drum kit, and Logic Pro X",
    rate: 700,
    image: "/images/studios/dark-walnut.jpg",
  },
  {
    id: "earthy-sand",
    name: "Earthy Sand — Cyclorama Photo & Video Stage",
    desc: "Infinite white cyclorama with motorized seamless backdrops, Profoto B10X lighting array, and hair & makeup bay",
    rate: 600,
    image: "/images/studios/earthy-sand.jpg",
  },
  {
    id: "classic-oak",
    name: "Classic Oak — Voiceover & Sound Isolation Booth",
    desc: "Ultra-quiet acoustic vocal booth with Neumann U87, Avalon 737 tube preamp, and STC 65 sound isolation",
    rate: 350,
    image: "/images/studios/classic-oak.jpg",
  },
  // Backward-compatibility aliases for legacy reservations & automated tests
  {
    id: "studio-a",
    name: "Nature Grid (Studio A) — Main Soundstage",
    desc: "Flagship recording studio with Neve 8078 console, Pro Tools HDX, and 200 sqm live tracking room",
    rate: 800,
    image: "/images/studios/nature-grid.jpg",
  },
  {
    id: "studio-b",
    name: "Luminous Quartz (Studio B) — Podcast Suite",
    desc: "Acoustic-treated multi-mic podcast studio with Rodecaster Pro II, 4x Shure SM7B, and 4K multi-cam",
    rate: 400,
    image: "/images/studios/luminous-quartz.jpg",
  },
  {
    id: "studio-c",
    name: "Earthy Sand (Studio C) — Photography Stage",
    desc: "Cyclorama infinity wall, full Profoto lighting kit, and tethered capture station",
    rate: 600,
    image: "/images/studios/earthy-sand.jpg",
  },
];

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
    eligibleStudios: [
      "luminous-quartz",
      "nature-grid",
      "dark-walnut",
      "earthy-sand",
      "classic-oak",
      "studio-xr",
      "studio-a",
      "studio-b",
      "studio-c",
    ],
  },
  {
    id: "basic-recording",
    name: "Basic Recording Deal",
    rate: 490,
    description: "Soundproof studio room, broadcast microphone, sound engineer, and digital master delivery.",
    features: ["Soundproof room", "Broadcast mic kit", "Recording sound engineer", "Instant file delivery"],
    includedHours: 2,
    eligibleStudios: ["luminous-quartz", "nature-grid", "classic-oak", "studio-b", "studio-a"],
  },
  {
    id: "podcast-package",
    name: "Turnkey Podcast Package",
    rate: 740,
    description: "Dual soundproof suites with 4x Shure SM7B microphones, sound engineer, and multi-track stems.",
    features: ["Two soundproof rooms", "4x Shure SM7B mics", "Recording engineer", "Basic audio mastering"],
    isPopular: true,
    includedHours: 2,
    eligibleStudios: ["luminous-quartz", "nature-grid", "classic-oak", "studio-b", "studio-a"],
  },
  {
    id: "recording-pro-edit",
    name: "Recording + Professional Edit",
    rate: 990,
    description: "Fully equipped 3-Cam 4K podcast set, Shure SM7B mics, studio operator, color grading & full episode cut.",
    features: ["3x Cinema 4K Cameras", "3x Shure SM7B mics", "Studio operator & switcher", "Full master episode edit & sync"],
    isPopular: true,
    includedHours: 2,
    eligibleStudios: ["luminous-quartz", "nature-grid", "classic-oak", "studio-b", "studio-a"],
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

export const WIZARD_STEPS: readonly WizardStepItem[] = [
  { id: 1, label: "Date & Time", icon: Calendar },
  { id: 2, label: "Session Type", icon: Camera },
  { id: 3, label: "Choose Studio", icon: Sparkles },
  { id: 4, label: "Crew & Equipment", icon: Users },
  { id: 5, label: "Props & Set", icon: Layers },
  { id: 6, label: "Post Production", icon: Sparkles },
  { id: 7, label: "Contact & Confirm", icon: CreditCard },
];

export interface BookingPricingInput {
  studioId?: string;
  durationHours?: number;
  turnkeyPackageId?: string;
  needsCrew?: boolean;
  selectedGearPackage?: string;
  hasTeleprompter?: boolean;
  extraMicsCount?: number;
  hasRushDelivery?: boolean;
  promoCode?: string;
  needsEditing?: boolean;
  needsColorGrading?: boolean;
  needsSoundMastering?: boolean;
  needsAiAutoCut?: boolean;
}

export interface BookingPricingBreakdown {
  studioCost: number;
  turnkeyCost: number;
  crewCost: number;
  gearCost: number;
  addOnsCost: number;
  postCost: number;
  subtotal: number;
  discount: number;
  vat: number; // 5% UAE VAT
  total: number;
}

/**
 * Pure domain pricing calculation for studio reservations.
 * Enforces canonical pricing rules across both client wizard and server mutations.
 * Incorporates turnkey packages from WordPress, add-on accessories, promo codes, and 5% UAE VAT.
 */
export function calculateBookingPrice(input: BookingPricingInput, selectedStudio?: StudioItem): BookingPricingBreakdown {
  const durationHours = Math.max(1, Math.min(input.durationHours ?? 1, 24));
  const studio = selectedStudio || (STUDIOS || []).find((s) => s.id === input.studioId) || (STUDIOS || [])[0];
  const studioRate = studio ? studio.rate : 800;
  
  // Turnkey package resolution
  const turnkeyPkg = TURNKEY_STUDIO_PACKAGES.find((p) => p.id === input.turnkeyPackageId);
  const isPackageEligible = Boolean(
    turnkeyPkg &&
    turnkeyPkg.id !== "none" &&
    turnkeyPkg.eligibleStudios?.includes(studio?.slug || studio?.id || "")
  );

  const turnkeyCost = isPackageEligible && turnkeyPkg ? turnkeyPkg.rate : 0;
  const includedHours = isPackageEligible && turnkeyPkg ? turnkeyPkg.includedHours : 0;
  const extraHours = Math.max(0, durationHours - includedHours);
  const studioCost = isPackageEligible ? extraHours * studioRate : studioRate * durationHours;

  const crewCost = input.needsCrew ? 500 : 0;

  const gearPkg = (STUDIO_GEAR_PACKAGES || []).find((g) => g.id === input.selectedGearPackage);
  const gearCost = gearPkg ? gearPkg.rate : 0;

  // Add-ons cost looked up from STUDIO_ADDONS catalog
  const teleprompterRate = (STUDIO_ADDONS || []).find((a) => a.id === "teleprompter")?.rate ?? 85;
  const extraMicRate = (STUDIO_ADDONS || []).find((a) => a.id === "extra-mic")?.rate ?? 120;
  const rushDeliveryRate = (STUDIO_ADDONS || []).find((a) => a.id === "rush-delivery")?.rate ?? 150;

  const teleprompterCost = input.hasTeleprompter ? teleprompterRate * durationHours : 0;
  const extraMicsCost = (input.extraMicsCount || 0) * extraMicRate;
  const rushDeliveryCost = input.hasRushDelivery ? rushDeliveryRate : 0;
  const addOnsCost = teleprompterCost + extraMicsCost + rushDeliveryCost;

  const postCost =
    (input.needsEditing ? 400 : 0) +
    (input.needsColorGrading ? 300 : 0) +
    (input.needsSoundMastering ? 250 : 0) +
    (input.needsAiAutoCut ? 450 : 0);

  const subtotal = studioCost + turnkeyCost + crewCost + gearCost + addOnsCost + postCost;

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
  // 5% UAE VAT FTA compliant
  const vat = Math.round(taxableAmount * 0.05 * 100) / 100;
  const total = taxableAmount + vat;

  return {
    studioCost,
    turnkeyCost,
    crewCost,
    gearCost,
    addOnsCost,
    postCost,
    subtotal,
    discount,
    vat,
    total,
  };
}
