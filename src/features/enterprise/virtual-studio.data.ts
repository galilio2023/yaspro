export interface VirtualStudioScene {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  rawImage: string;
  compositeImage: string;
  lightingType: string;
  trackingEngine: string;
}

export const VIRTUAL_SCENES: VirtualStudioScene[] = [
  {
    id: "fashion-runway",
    name: "Paris Fashion Runway",
    category: "Fashion & Luxury",
    description: "Middle Eastern fashion influencer in emerald dress keyed onto a marble Parisian runway arch overlooking the Eiffel Tower.",
    badge: "Parisian Arch 3D",
    badgeColor: "#10b981",
    rawImage: "/images/virtual-studio/fashion-raw.jpg",
    compositeImage: "/images/virtual-studio/fashion-composite.jpg",
    lightingType: "Golden Hour Warm Key + Ambient Paris Sunset",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
  {
    id: "podcast-broadcast",
    name: "Future Tech Talk Show",
    category: "Podcast & Talk Show",
    description: "Woman podcast host in smart blazer live-streamed inside an ultra-modern curved neon studio with holographic telemetry.",
    badge: "Tech Studio XR",
    badgeColor: "#06b6d4",
    rawImage: "/images/virtual-studio/podcast-raw.jpg",
    compositeImage: "/images/virtual-studio/podcast-composite.jpg",
    lightingType: "5600K High-CRI Key + Cyan Rim Lighting",
    trackingEngine: "Stype RedSpy FreeD Genlock",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk High-Tech Hub",
    category: "Gaming & Sci-Fi",
    description: "Holographic telemetry HUDs, neon violet and cyan accents, and panoramic vista of a futuristic metropolis.",
    badge: "Neo-Tokyo 2088",
    badgeColor: "#8b5cf6",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/cyberpunk-composite.jpg",
    lightingType: "Dual Neon Rim + Cyan Floor Spill",
    trackingEngine: "Unreal 5.4 LiveLink",
  },
  {
    id: "dubai-penthouse",
    name: "Dubai Skyline Penthouse",
    category: "Luxury & Commercial",
    description: "Curved floor-to-ceiling glass panorama overlooking Burj Khalifa at golden hour sunset with warm marble reflections.",
    badge: "Golden Hour Dubai",
    badgeColor: "#f59e0b",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/dubai-composite.jpg",
    lightingType: "Sunset 3200K Warm Key + Daylight Fill",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
];
