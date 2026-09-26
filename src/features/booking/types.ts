import { LucideIcon } from "lucide-react";

export interface BookingState {
  // Step 1: Datetime & Headcount
  date: string;
  time: string;
  durationHours: number;
  headcount: number;
  // Step 2: Session Type
  sessionType: string;
  // Step 3: Studio Selection
  studioId: string;
  // Step 4: Crew & Gear
  needsCrew: boolean;
  selectedGearPackage: string;
  equipmentNotes: string;
  // Step 5: Props & Set
  propsNotes: string;
  // Step 6: Post Production
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
  label: string;
  icon: string;
  desc: string;
}

export interface StudioItem {
  id: string;
  name: string;
  desc: string;
  rate: number;
  image?: string;
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
  icon: LucideIcon;
}

export interface WizardStepProps {
  state: BookingState;
  update: (values: Partial<BookingState>) => void;
}
