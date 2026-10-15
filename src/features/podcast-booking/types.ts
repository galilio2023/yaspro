export interface PodcastStudio {
  key: string;
  name: string;
  seats: number;
  location: string;
  image: string;
  gradient: string;
  description?: string;
  isAvailable?: boolean;
}

export interface PodcastServiceFeature {
  ok: boolean;
  text: string;
}

export interface PodcastService {
  key: string;
  title: string;
  sub: string;
  price: number;
  best?: boolean;
  features: PodcastServiceFeature[];
  after: PodcastServiceFeature[];
  note?: string;
  badge?: string;
  highlights?: string[];
}

export interface PodcastAddon {
  isActive?: boolean;
  key: string;
  title: string;
  desc: string;
  priceNum: number;
  priceDisplay: string;
  unit: string;
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
