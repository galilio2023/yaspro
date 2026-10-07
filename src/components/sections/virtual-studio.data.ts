export interface VirtualStudioScene {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  videoSrc: string;
  rawImage?: string;
  compositeImage?: string;
  lightingType: string;
  trackingEngine: string;
}

export const VIRTUAL_SCENES: VirtualStudioScene[] = [
  {
    id: "virtual-stage-split",
    name: "Live XR Studio Split (Green vs 3D)",
    category: "Virtual Production & XR",
    description: "Authentic Yas Pro studio production demonstrating live camera green-screen capture against the real-time Unreal Engine 3D virtual environment with show presenters.",
    badge: "Unreal 5.4 Live Composite",
    badgeColor: "#10b981",
    videoSrc: "/videos/grading/virtual-studio-split-reel.mp4",
    lightingType: "Studio Key Light + Virtual City Skyline Rim",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
  {
    id: "fashion-runway",
    name: "Paris Fashion Runway",
    category: "Fashion & Luxury",
    description: "Middle Eastern fashion influencer in emerald dress keyed onto a marble Parisian runway arch overlooking the Eiffel Tower.",
    badge: "Parisian Arch 3D",
    badgeColor: "#10b981",
    videoSrc: "/videos/reels/commercial-fashion-reel.mp4",
    lightingType: "Golden Hour Warm Key + Ambient Paris Sunset",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
  {
    id: "podcast-broadcast",
    name: "Future Tech Talk Show",
    category: "Podcast & Talk Show",
    description: "Woman podcast host in smart blazer live-streamed inside an ultra-modern curved neon studio with holographic telemetry.",
    badge: "Tech Studio XR",
    badgeColor: "#d97706",
    videoSrc: "/videos/backgrounds/neon-studio.mp4",
    rawImage: "/images/virtual-studio/podcast-raw.jpg",
    compositeImage: "/images/virtual-studio/podcast-composite.jpg",
    lightingType: "5600K High-CRI Key + Tungsten Rim Lighting",
    trackingEngine: "Stype RedSpy FreeD Genlock",
  },
  {
    id: "cyberpunk",
    name: "Futuristic Studio Stage Hub",
    category: "Sci-Fi & Commercial",
    description: "Holographic telemetry HUDs, warm titanium and amber accents, and panoramic vista of a futuristic metropolis.",
    badge: "Cinema Tech Hub",
    badgeColor: "#f59e0b",
    videoSrc: "/videos/backgrounds/cube-motion.mp4",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/cyberpunk-composite.jpg",
    lightingType: "Dual Tungsten Rim + Golden Floor Spill",
    trackingEngine: "Unreal 5.4 LiveLink",
  },
  {
    id: "dubai-penthouse",
    name: "Dubai Skyline Commercial Film",
    category: "Luxury & Commercial",
    description: "Curved floor-to-ceiling glass panorama overlooking Burj Khalifa at golden hour sunset with warm marble reflections.",
    badge: "Golden Hour Dubai",
    badgeColor: "#f59e0b",
    videoSrc: "/videos/projects/talabat-breakfast-commercial.mp4",
    rawImage: "/images/virtual-studio/greenscreen-raw.jpg",
    compositeImage: "/images/virtual-studio/dubai-composite.jpg",
    lightingType: "Sunset 3200K Warm Key + Daylight Fill",
    trackingEngine: "Mo-Sys StarTracker Optical",
  },
];
