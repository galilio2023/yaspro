export interface PodcastStudio {
  key: string;
  name: string;
  arabicName?: string;
  seats: number;
  location: string;
  arabicLocation?: string;
  image: string;
  gradient: string;
  description?: string;
  arabicDescription?: string;
  isAvailable?: boolean;
}

export interface PodcastServiceFeature {
  ok: boolean;
  text: string;
  textAr?: string;
}

export interface PodcastService {
  key: string;
  title: string;
  titleAr?: string;
  sub: string;
  subAr?: string;
  price: number;
  best?: boolean;
  isActive?: boolean;
  features: PodcastServiceFeature[];
  after: PodcastServiceFeature[];
  note?: string;
  noteAr?: string;
  badge?: string;
  badgeAr?: string;
  highlights?: string[];
  highlightsAr?: string[];
}

export interface PodcastAddon {
  isActive?: boolean;
  key: string;
  title: string;
  titleAr?: string;
  desc: string;
  descAr?: string;
  priceNum: number;
  priceDisplay: string;
  priceDisplayAr?: string;
  unit: string;
  unitAr?: string;
  gradient: string;
  vimeoEmbed?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
}

export interface PodcastSessionItem {
  id: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  headcount: number;
  studioKey: string;
  serviceKey: string;
  addons: Record<string, number>; // addonKey -> quantity
  notes?: string;
}

export interface PodcastBookingContact {
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  promoCode?: string;
}

export type PodcastBookingStep = 1 | 2 | 3 | 4 | 5;
