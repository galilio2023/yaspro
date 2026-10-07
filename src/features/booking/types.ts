import { LucideIcon } from "lucide-react";

export interface BookingState {
  // Step 1: Datetime & Headcount
  date: string;
  time: string;
  durationHours: number;
  headcount: number;

  // Step 2: Session Type
  sessionType: string; // "98" (Photography), "95" (Videography), etc.
  turnkeyPackageId?: string;

  // Step 3: Studio Selection
  studioId: string; // "100" (Green Cyclorama), "101", etc.

  // Step 4: Crew & Equipment
  selectedCrewEquipmentIds: string[]; // e.g. ["40", "41"]

  // Step 5: Props & Set Design
  selectedPropIds: string[]; // e.g. ["43", "85"]

  // Step 6: Post Production Addons
  selectedAddonIds: string[]; // e.g. ["103", "127"]

  // Legacy fields preserved for backward compatibility
  needsCrew: boolean;
  selectedGearPackage: string;
  hasTeleprompter?: boolean;
  extraMicsCount?: number;
  hasRushDelivery?: boolean;
  promoCode?: string;
  equipmentNotes: string;
  propsNotes: string;
  needsEditing: boolean;
  needsColorGrading: boolean;
  needsSoundMastering: boolean;
  needsAiAutoCut: boolean;

  // Step 7: Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  specialRequests: string;
}

export interface SessionTypeItem {
  id: string;
  title: string;
  label?: string;
  description: string;
  desc?: string;
  price: number;
  imageUrl: string;
  image?: string;
  icon?: string;
}

export interface StudioItem {
  id: string;
  slug?: string;
  name: string;
  desc: string;
  description?: string;
  rate: number;
  capacity?: number;
  location?: string;
  image?: string;
  imageUrl?: string;
  galleryImages?: string[];
  features?: string[];
  isActive?: boolean;
}

export interface CrewEquipmentItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: "hourly" | "flat";
  category: "crew" | "equipment";
  imageUrl: string;
}

export interface PropItem {
  id: string;
  title: string;
  price: number;
  priceType: "hourly" | "flat";
  category: string;
  imageUrl: string;
}

export interface AddonItem {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: "hourly" | "flat";
  imageUrl: string;
}

export interface StudioGearPackage {
  id: string;
  name: string;
  rate: number;
  description: string;
}

export interface WizardStepItem {
  id: number;
  label: string;
  icon?: LucideIcon;
}

export interface WizardStepProps {
  state: BookingState;
  update: (values: Partial<BookingState>) => void;
}
