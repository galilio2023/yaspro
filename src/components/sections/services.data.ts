export type ServiceIconName = "camera" | "radio" | "play" | "zap";

export interface ServiceItem {
  id: string;
  iconName: ServiceIconName;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  image: string;
  specs: string[];
  stat: string;
  statLabel: string;
  href: string;
  highlight?: boolean;
  accentGlow: string;
}

export const SERVICES_DATA: readonly ServiceItem[] = [
  {
    id: "studio-production",
    iconName: "camera",
    title: "Soundstage Studios",
    subtitle: "Acoustic Stage & Cyclorama",
    description:
      "Fully soundproofed production stages with motorized overhead DMX lighting grids, infinite cyclorama green screens, and cinema camera dollies.",
    badge: "Flagship Facility",
    image: "/images/virtual-studio/greenscreen-raw.jpg",
    specs: ["Motorized Lighting Grid", "Infinite 180° Cyc", "ARRI & RED Ready"],
    stat: "850 m²",
    statLabel: "Stage Footprint",
    href: "/studio-booking",
    highlight: true,
    accentGlow: "from-brand-purple/20 via-brand-purple/5 to-transparent",
  },
  {
    id: "ob-van-broadcast",
    iconName: "radio",
    title: "OB-VAN Live Broadcast",
    subtitle: "Gulf Mobile Production Unit",
    description:
      "Heavy-duty broadcast command vehicle equipped with multi-channel fiber feeds, satellite uplink, and EVS live replay for sports and arena events.",
    badge: "Zero-Latency 4K",
    image: "/images/projects/stadiums-dubai.jpg",
    specs: ["12-Cam 4K Fiber Feeds", "Live EVS Slow-Mo", "Encrypted Uplink"],
    stat: "12 Channels",
    statLabel: "Simultaneous 4K",
    href: "/contact",
    highlight: false,
    accentGlow: "from-brand-teal/20 via-brand-teal/5 to-transparent",
  },
  {
    id: "outdoor-cinema",
    iconName: "play",
    title: "Commercial & Cinema",
    subtitle: "On-Location Film Units",
    description:
      "End-to-end cinema crews, heavy-lift aerial cinematography drones, and anamorphic prime lenses for national campaigns and music videos.",
    badge: "Full Cinema Crew",
    image: "/images/projects/flag-day.jpg",
    specs: ["Heavy-Lift Drones", "Anamorphic Primes", "UAE Location Permits"],
    stat: "8K Cinema",
    statLabel: "RAW DCI Standard",
    href: "/contact",
    highlight: false,
    accentGlow: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  {
    id: "podcast-suite",
    iconName: "zap",
    title: "Podcast & Creator Suite",
    subtitle: "Multi-Cam Turnkey Studio",
    description:
      "Sound-treated broadcast lounge featuring Shure SM7B microphones, AI-assisted multi-camera switching, studio neon backdrops, and same-day cutdowns.",
    badge: "Turnkey Viral Cut",
    image: "/images/studios/podcast-suite.jpg",
    specs: ["Shure Broadcast Mics", "AI Auto-Switching", "Live Social Cuts"],
    stat: "Turnkey",
    statLabel: "Same-Day Delivery",
    href: "/studio-booking",
    highlight: false,
    accentGlow: "from-purple-500/20 via-cyan-500/5 to-transparent",
  },
];
