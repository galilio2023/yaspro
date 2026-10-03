export type StudioCategory =
  | "all"
  | "virtual-production"
  | "podcast-broadcast"
  | "music-recording"
  | "photo-cyclorama"
  | "voiceover";

export interface StudioHardwareSpec {
  label: string;
  arabicLabel?: string;
  value: string;
  arabicValue?: string;
}

export interface SoundstageDetail {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  headline: string;
  arabicHeadline: string;
  category: StudioCategory;
  categoryLabel: string;
  arabicCategoryLabel: string;
  badge: string;
  arabicBadge: string;
  rate: number; // AED per hour
  halfDayRate: number; // AED (4h)
  fullDayRate: number; // AED (8h)
  capacity: number;
  areaSqm: number;
  dimensions: string;
  ceilingHeight: string;
  power: string;
  soundIsolation: string;
  image: string;
  gallery: string[];
  overview: string;
  arabicOverview: string;
  keyHardware: StudioHardwareSpec[];
  amenities: string[];
  arabicAmenities: string[];
  idealFor: string[];
  arabicIdealFor: string[];
  isActive?: boolean;
}
