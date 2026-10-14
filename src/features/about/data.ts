export interface FounderProfile {
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  orgEn: string;
  orgAr: string;
  initials: string;
  image?: string;
  quoteEn: string;
  quoteAr: string;
  credentialsEn: string[];
  credentialsAr: string[];
  focusAreas: {
    titleEn: string;
    titleAr: string;
    detailEn: string;
    detailAr: string;
  }[];
}

export const FOUNDER_PROFILE: FounderProfile = {
  nameEn: "Yaman Mohammad Alomari",
  nameAr: "يمان محمد العمري",
  roleEn: "Founder & Chief Executive Officer",
  roleAr: "المؤسس والرئيس التنفيذي",
  orgEn: "Yas Pro Media Group",
  orgAr: "مجموعة ياس برو الإعلامية",
  initials: "YA",
  image: "/images/founder/yaman-alomari-portrait.jpg",
  quoteEn: "We built Yas Pro not as another rental studio, but as an integrated sovereign production ecosystem—where Hollywood cinema craft converges with real-time digital velocity.",
  quoteAr: "لم نبنِ Yas Pro لتكون مجرد استوديو أو دار لتأجير المعدات، بل صمّمناها كمنظومة إنتاجية سيادية متكاملة تلتقي فيها معايير السينما العالمية مع سرعة وزخم الإعلام الرقمي الحديث.",
  credentialsEn: [
    "Steering 6 specialized sister enterprises across Yas Media Group",
    "Pioneered virtual soundstage & ICVFX infrastructure in Dubai",
    "Trusted strategic partner for UAE ministries, giga-projects & national campaigns",
    "Architected high-throughput media pipelines serving regional broadcast networks",
  ],
  credentialsAr: [
    "قيادة 6 شركات شقيقة متخصصة تحت مظلة مجموعة ياس برو الإعلامية",
    "ريادة تقنيات الاستوديوهات الافتراضية والمؤثرات الميدانية في دبي",
    "شريك استراتيجي موثوق للوزارات والمشاريع الوطنية والفعاليات الكبرى",
    "هندسة بنية تحتية للإنتاج والبث تخدم كبرى الشبكات الإعلامية في المنطقة",
  ],
  focusAreas: [
    { titleEn: "Virtual Production", titleAr: "الإنتاج الافتراضي", detailEn: "Unreal Engine 5.4 & ICVFX", detailAr: "أنريل إنجن 5.4 ومؤثرات ميدانية" },
    { titleEn: "Sovereign Media", titleAr: "الإعلام السيادي", detailEn: "National Tenders & Campaigns", detailAr: "المشاريع والفعاليات الوطنية الكبرى" },
    { titleEn: "Live Broadcast", titleAr: "البث التلفزيوني", detailEn: "Mobile OB-VAN 12-Channel", detailAr: "عربات النقل المباشر وألياف SMPTE" },
    { titleEn: "Creator Economy", titleAr: "اقتصاد المبدعين", detailEn: "Mawthooq Certified Talent", detailAr: "شبكة صناع المحتوى وترخيص موثوق" },
  ],
};

export const REGIONAL_HUBS_EXPANDED = [
  {
    id: "dubai",
    cityEn: "Dubai, UAE",
    cityAr: "دبي، الإمارات",
    titleEn: "Global Headquarters & Main Stages",
    titleAr: "المقر الرئيسي والاستوديوهات الكبرى",
    facilityEn: "Iris Bay Tower, Business Bay",
    facilityAr: "برج إيريس باي، الخليج التجاري",
    stats: "3 Soundstages • 4K Control Hub • OB-VAN Unit 1",
    arStats: "3 استوديوهات تصوير • غرفة تحكم 4K • عربة بث ميداني 1",
    badge: "Primary HQ",
    arBadge: "المقر الرئيسي",
    flag: "🇦🇪",
    status: "Active 24/7",
    arStatus: "تشغيل 24/7",
    color: "mauve",
    image: "/images/hubs/dubai-heritage-3d.jpg",
    landmarkEn: "Historic Dubai Creek & Al Fahidi",
    landmarkAr: "خور دبي وحي الفهيدي التاريخي",
  },
  {
    id: "cairo",
    cityEn: "Cairo, Egypt",
    cityAr: "القاهرة، مصر",
    titleEn: "Regional Post-Production & Color Hub",
    titleAr: "مركز ما بعد الإنتاج والمكساج اللوني",
    facilityEn: "Elite Tower, Zahraa Al Maadi",
    facilityAr: "برج إيليت، زهراء المعادي",
    stats: "Dolby Atmos Studio • DaVinci 8K Grading Suites",
    arStats: "استوديو دولبي أتموس • أجنحة تلوين دافينشي 8K",
    badge: "Post Hub",
    arBadge: "مركز ما بعد الإنتاج",
    flag: "🇪🇬",
    status: "Online",
    arStatus: "نشط ومتصل",
    color: "violet",
    image: "/images/hubs/cairo-heritage-3d.jpg",
    landmarkEn: "The Great Pyramids & Giza Plateau",
    landmarkAr: "أهرامات الجيزة وهضبة الأجداد",
  },
  {
    id: "amman",
    cityEn: "Amman, Jordan",
    cityAr: "عَمّان، الأردن",
    titleEn: "Levant Regional Studio & Dispatch",
    titleAr: "استوديو بلاد الشام وفرق التصوير الميداني",
    facilityEn: "BlackRock Tower, Mecca St",
    facilityAr: "برج بلاك روك، شارع مكة",
    stats: "Acoustic Podcast Stage • Mountain Cinematic Rigs",
    arStats: "استوديو بودكاست معزول • أطقم تصوير التضاريس الخارجية",
    badge: "Levant Hub",
    arBadge: "مقر بلاد الشام",
    flag: "🇯🇴",
    status: "Online",
    arStatus: "نشط ومتصل",
    color: "mauve",
    image: "/images/hubs/amman-heritage-3d.jpg",
    landmarkEn: "The Treasury of Petra & Amman Citadel",
    landmarkAr: "خزنة البتراء التاريخية وقلعة عمّان",
  },
];
