export type ServiceIconName = "camera" | "radio" | "play" | "zap";

export interface ServiceItem {
  id: string;
  iconName: ServiceIconName;
  title: string;
  arabicTitle: string;
  subtitle: string;
  arabicSubtitle: string;
  description: string;
  arabicDescription: string;
  badge: string;
  arabicBadge: string;
  image: string;
  specs: string[];
  arabicSpecs: string[];
  stat: string;
  statLabel: string;
  arabicStatLabel: string;
  href: string;
  highlight?: boolean;
  accentGlow: string;
  includedFeatures: string[];
  arabicIncludedFeatures: string[];
}

export const SERVICES_DATA: readonly ServiceItem[] = [
  {
    id: "outdoor-filming",
    iconName: "play",
    title: "Outdoor Filming",
    arabicTitle: "التصوير الميداني والخارجي",
    subtitle: "On-Location Film & Production Units",
    arabicSubtitle: "وحدات التصوير والإنتاج السينمائي الميداني",
    description:
      "Full-scale location filming units across Dubai and UAE deserts, equipped with cinema dollies, ARRI lighting kits, cinema wireless transmission, and licensed drone operators.",
    arabicDescription:
      "وحدات تصوير ميداني متكاملة في دبي ومواقع التصوير الخارجية بالإمارات، مجهزة بمنصات تحريك سينمائية، إضاءة ARRI، وأجهزة بث لاسلكي وطواقم درون مرخصة.",
    badge: "Field Production",
    arabicBadge: "إنتاج ميداني متكامل",
    image: "/images/services/outdoor-filming.webp",
    specs: ["Heavy-Lift Cinema Drones", "Wireless Director Monitors", "UAE Location Permits"],
    arabicSpecs: ["درون سينمائي متقدم", "شاشات مراقبة إخراج لاسلكية", "تصاريح تصوير معتمدة"],
    stat: "8K Cinema",
    statLabel: "RAW Capture",
    arabicStatLabel: "تصوير سينمائي فائق",
    href: "#outdoor-filming",
    highlight: true,
    accentGlow: "from-brand-violet/25 via-brand-mauve/10 to-transparent",
    includedFeatures: [
      "RED V-Raptor / ARRI Alexa Mini LF Cinema packages",
      "Wireless Teradek 4K video feeds & director audio monitors",
      "Field DIT data offload station with LTO archive backup",
      "UAE ministerial location permits and dedicated location scouts",
    ],
    arabicIncludedFeatures: [
      "باقات كاميرات سينمائية RED V-Raptor و ARRI Alexa Mini LF",
      "بث فيديو فوري Teradek 4K وسماعات إخراج عالية النقاء",
      "محطة تفريغ ومطابقة بيانات DIT ميدانية مع نسخ احتياطي",
      "استخراج تصاريح التصوير الحكومية وفريق استكشاف المواقع",
    ],
  },
  {
    id: "studio-booking",
    iconName: "camera",
    title: "Studio Booking",
    arabicTitle: "حجز استوديوهات التصوير",
    subtitle: "Acoustic Soundstage & Infinite Cyc",
    arabicSubtitle: "استوديوهات عازلة للصوت وكروما لا نهائية",
    description:
      "Fully soundproofed production stages with motorized overhead DMX lighting grids, infinite cyclorama green/white screens, and virtual production LED volumes.",
    arabicDescription:
      "استوديوهات عازلة للصوت بالكامل مجهزة بشبكات إضاءة DMX سقفية متحركة، كروما خضراء وبيضاء لا نهائية، وتقنيات الإنتاج الافتراضي الحديثة.",
    badge: "Flagship Facility",
    arabicBadge: "المقر الرئيسي المتطور",
    image: "/images/services/studio-booking.webp",
    specs: ["Motorized Lighting Grid", "Infinite 180° Cyc", "ARRI & RED Ready"],
    arabicSpecs: ["شبكة إضاءة أوتوماتيكية", "كروما بانورامية 180°", "جاهزة لكاميرات ARRI وRED"],
    stat: "850 m²",
    statLabel: "Stage Footprint",
    arabicStatLabel: "مساحة الاستوديو",
    href: "/studio-booking",
    highlight: true,
    accentGlow: "from-brand-lavender/25 via-brand-mauve/10 to-transparent",
    includedFeatures: [
      "850 sqm sound-insulated main stage with silent HVAC system",
      "Full motorized DMX overhead rig with pre-rigged SkyPanels",
      "Private VIP greenroom, makeup suites, and client viewing gallery",
      "Dedicated fiber gigabit upload pipes for instant remote dailies",
    ],
    arabicIncludedFeatures: [
      "مساحة 850 متر مربع معزولة صوتياً بالكامل وتكييف صامت",
      "شبكة إضاءة DMX علوية متحركة مجهزة بأحدث كشافات SkyPanel",
      "غرف VIP خاصة، أجنحة مكياج وتجهيز، وصالة استراحة للعملاء",
      "شبكة ألياف فائقة السرعة لنقل المواد والمشاهد اليومية فورياً",
    ],
  },
  {
    id: "podcast-booking",
    iconName: "zap",
    title: "Podcast Booking",
    arabicTitle: "حجز استوديو البودكاست",
    subtitle: "Multi-Cam Turnkey Creator Lounge",
    arabicSubtitle: "استوديو بودكاست متعدد الكاميرات جاهز فوراً",
    description:
      "Sound-treated broadcast lounge featuring Shure SM7B dynamic microphones, AI-assisted multi-camera switching, studio neon backdrops, and same-day viral cutdowns.",
    arabicDescription:
      "صالة بودكاست معزولة صوتياً مجهزة بميكروفونات Shure SM7B، وتبديل كاميرات ذكي، وخلفيات إضاءة نيون أنيقة، مع تسليم مقاطع السوشيال ميديا في نفس اليوم.",
    badge: "Turnkey Viral Cut",
    arabicBadge: "مقاطع جاهزة للنشر",
    image: "/images/services/podcast-booking.webp",
    specs: ["Shure Broadcast Mics", "AI Auto-Switching", "Live Social Cuts"],
    arabicSpecs: ["ميكروفونات Shure للبث", "تبديل ذكي للكاميرات", "قص سريع للسوشيال"],
    stat: "4K Turnkey",
    statLabel: "Same-Day Delivery",
    arabicStatLabel: "تسليم في نفس اليوم",
    href: "/podcast-booking",
    highlight: false,
    accentGlow: "from-brand-violet/25 via-brand-mauve/10 to-transparent",
    includedFeatures: [
      "4x Sony FX3/FX6 multi-camera synchronized 4K recording",
      "4x Shure SM7B broadcast microphones + Rodecaster Pro II console",
      "Acoustic diffusers and custom RGB ambient lighting backdrops",
      "Instant vertical reels & shorts edited with AI captions within hours",
    ],
    arabicIncludedFeatures: [
      "تسجيل متزامن بدقة 4K عبر 4 كاميرات Sony FX3/FX6",
      "4 ميكروفونات Shure SM7B وميكسر صوت احترافي Rodecaster Pro II",
      "عزل صوتي متطور مع إضاءات نيون وRGB قابلة للتخصيص الكامل",
      "استخراج مقاطع ريلز وفيديوهات قصيرة عمودية مع نصوص تلقائية في ساعات",
    ],
  },
  {
    id: "ob-van-broadcast",
    iconName: "radio",
    title: "OB-VAN Live Broadcast",
    arabicTitle: "عربات البث المباشر المتنقلة",
    subtitle: "Gulf Mobile Broadcast Command",
    arabicSubtitle: "وحدة إنتاج وبث خارجية لتغطية الفعاليات الكبرى",
    description:
      "Heavy-duty broadcast command vehicle equipped with multi-channel fiber feeds, satellite uplink, and EVS live replay for sports, arenas, and government summits.",
    arabicDescription:
      "عربات قيادة بث متطورة مزودة باتصالات ألياف بصرية متعددة القنوات، وربط أقمار صناعية، وإعادة فورية EVS للفعاليات الرياضية الكبرى والمؤتمرات الحكومية.",
    badge: "Zero-Latency 4K",
    arabicBadge: "بث 4K دون تأخير",
    image: "/images/services/ob-van-broadcast.webp",
    specs: ["12-Cam 4K Fiber Feeds", "Live EVS Slow-Mo", "Encrypted Uplink"],
    arabicSpecs: ["12 قناة ألياف بصرية 4K", "إعادة بطيئة EVS مباشرة", "بث مشفر فضائي"],
    stat: "12 Channels",
    statLabel: "Simultaneous 4K",
    arabicStatLabel: "قنوات بث متزامنة",
    href: "#ob-van-broadcast",
    highlight: false,
    accentGlow: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    includedFeatures: [
      "Up to 12 SMPTE fiber broadcast camera chains (Sony HDC-4300)",
      "Dedicated EVS XT-VIA server for instant slow-motion replays",
      "Redundant live satellite & dual-bonded 5G cellular uplink",
      "Dual audio engineer and technical director production suites",
    ],
    arabicIncludedFeatures: [
      "حتى 12 كاميرا بث مباشر عبر الألياف البصرية (Sony HDC-4300)",
      "سيرفر EVS XT-VIA مخصص للإعادة البطيئة الفورية الاحترافية",
      "بث فضائي احتياطي فوري مع شبكات 5G مزدوجة مشفرة",
      "كابينة تحكم مزدوجة لمهندس الصوت والمخرج التلفزيوني",
    ],
  },
];
