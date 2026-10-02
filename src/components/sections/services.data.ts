export type ServiceIconName = "camera" | "radio" | "play" | "zap";

export interface ServiceItem {
  id: string;
  iconName: ServiceIconName;
  title: string;
  arabicTitle?: string;
  subtitle: string;
  arabicSubtitle?: string;
  description: string;
  arabicDescription?: string;
  badge: string;
  arabicBadge?: string;
  image: string;
  specs: string[];
  arabicSpecs?: string[];
  stat: string;
  statLabel: string;
  arabicStatLabel?: string;
  href: string;
  highlight?: boolean;
  accentGlow: string;
}

export const SERVICES_DATA: readonly ServiceItem[] = [
  {
    id: "studio-production",
    iconName: "camera",
    title: "Soundstage Studios",
    arabicTitle: "استوديوهات التصوير المجهزة",
    subtitle: "Acoustic Stage & Cyclorama",
    arabicSubtitle: "عزل صوتي كامل وكروما لا نهائية",
    description:
      "Fully soundproofed production stages with motorized overhead DMX lighting grids, infinite cyclorama green screens, and cinema camera dollies.",
    arabicDescription:
      "استوديوهات عازلة للصوت بالكامل مجهزة بشبكات إضاءة DMX سقفية متحركة، شاشات كروما خضراء لا نهائية، ومنصات تحريك كاميرات سينمائية متطورة.",
    badge: "Flagship Facility",
    arabicBadge: "المقر الرئيسي",
    image: "/images/virtual-studio/greenscreen-raw.jpg",
    specs: ["Motorized Lighting Grid", "Infinite 180° Cyc", "ARRI & RED Ready"],
    arabicSpecs: ["شبكة إضاءة أوتوماتيكية", "كروما بانورامية 180°", "جاهزة لكاميرات ARRI وRED"],
    stat: "850 m²",
    statLabel: "Stage Footprint",
    arabicStatLabel: "مساحة الاستوديو",
    href: "/studio-booking",
    highlight: true,
    accentGlow: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  {
    id: "ob-van-broadcast",
    iconName: "radio",
    title: "OB-VAN Live Broadcast",
    arabicTitle: "عربات البث المباشر المتنقلة",
    subtitle: "Gulf Mobile Production Unit",
    arabicSubtitle: "وحدة إنتاج خارجية لتغطية الفعاليات",
    description:
      "Heavy-duty broadcast command vehicle equipped with multi-channel fiber feeds, satellite uplink, and EVS live replay for sports and arena events.",
    arabicDescription:
      "عربات قيادة بث متطورة مزودة باتصالات ألياف بصرية متعددة القنوات، وربط أقمار صناعية، وإعادة فورية EVS للفعاليات الرياضية الكبرى والمهرجانات.",
    badge: "Zero-Latency 4K",
    arabicBadge: "بث 4K دون تأخير",
    image: "/images/projects/stadiums-dubai.jpg",
    specs: ["12-Cam 4K Fiber Feeds", "Live EVS Slow-Mo", "Encrypted Uplink"],
    arabicSpecs: ["12 قناة ألياف بصرية 4K", "إعادة بطيئة EVS مباشرة", "بث مشفر فضائي"],
    stat: "12 Channels",
    statLabel: "Simultaneous 4K",
    arabicStatLabel: "قنوات بث متزامنة",
    href: "/contact",
    highlight: false,
    accentGlow: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  {
    id: "outdoor-cinema",
    iconName: "play",
    title: "Commercial & Cinema",
    arabicTitle: "الإنتاج السينمائي والتجاري",
    subtitle: "On-Location Film Units",
    arabicSubtitle: "وحدات تصوير ميداني سينمائي",
    description:
      "End-to-end cinema crews, heavy-lift aerial cinematography drones, and anamorphic prime lenses for national campaigns and music videos.",
    arabicDescription:
      "طواقم سينمائية متكاملة، طائرات درون للتصوير الجوي الثقيل، وعدسات أنامورفيك فائقة الدقة للحملات الوطنية والإعلانية والأفلام.",
    badge: "Full Cinema Crew",
    arabicBadge: "طاقم سينمائي متكامل",
    image: "/images/projects/flag-day.jpg",
    specs: ["Heavy-Lift Drones", "Anamorphic Primes", "UAE Location Permits"],
    arabicSpecs: ["درون سينمائي ثقيل", "عدسات أنامورفيك", "تصاريح تصوير معتمدة"],
    stat: "8K Cinema",
    statLabel: "RAW DCI Standard",
    arabicStatLabel: "معيار RAW DCI سينمائي",
    href: "/contact",
    highlight: false,
    accentGlow: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  {
    id: "podcast-suite",
    iconName: "zap",
    title: "Podcast & Creator Suite",
    arabicTitle: "استوديوهات البودكاست وصناع المحتوى",
    subtitle: "Multi-Cam Turnkey Studio",
    arabicSubtitle: "استوديو متعدد الكاميرات جاهز فورا",
    description:
      "Sound-treated broadcast lounge featuring Shure SM7B microphones, AI-assisted multi-camera switching, studio neon backdrops, and same-day cutdowns.",
    arabicDescription:
      "صالة بودكاست معزولة صوتياً مجهزة بميكروفونات Shure SM7B، وتبديل كاميرات ذكي، وخلفيات إضاءة حديثة، مع تسليم المقاطع الجاهزة في نفس اليوم.",
    badge: "Turnkey Viral Cut",
    arabicBadge: "مقاطع جاهزة للنشر",
    image: "/images/studios/podcast-suite.jpg",
    specs: ["Shure Broadcast Mics", "AI Auto-Switching", "Live Social Cuts"],
    arabicSpecs: ["ميكروفونات Shure للبث", "تبديل ذكي للكاميرات", "قص سريع للسوشيال"],
    stat: "Turnkey",
    statLabel: "Same-Day Delivery",
    arabicStatLabel: "تسليم في نفس اليوم",
    href: "/studio-booking",
    highlight: false,
    accentGlow: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
];
