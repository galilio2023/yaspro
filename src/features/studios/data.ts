import { SoundstageDetail, StudioCategory } from "./types";

export const SOUNDSTAGE_CATEGORIES: { id: StudioCategory; label: string; arabicLabel: string }[] = [
  { id: "all", label: "All Soundstages", arabicLabel: "جميع الاستوديوهات" },
  { id: "virtual-production", label: "Virtual Production (XR)", arabicLabel: "الإنتاج الافتراضي XR" },
  { id: "podcast-broadcast", label: "Podcast & Broadcast", arabicLabel: "البودكاست والبث المباشر" },
  { id: "music-recording", label: "Music & Live Bands", arabicLabel: "التسجيل الموسيقي الحي" },
  { id: "photo-cyclorama", label: "Photo & Cyclorama", arabicLabel: "السايكلو والتصوير الفوتوغرافي" },
  { id: "voiceover", label: "Voiceover & Dubbing", arabicLabel: "التعليق الصوتي والدبلجة" },
];

export const SOUNDSTAGES_CATALOG: SoundstageDetail[] = [
  {
    id: "studio-xr",
    slug: "studio-xr",
    name: "Studio XR — Virtual Production Stage",
    arabicName: "استوديو XR — مسرح الإنتاج الافتراضي 270 درجة",
    headline: "270° Micro-LED Volume Powered by Unreal Engine 5.4 LiveSync",
    arabicHeadline: "شاشة ليد بانورامية 270 درجة مع محرك Unreal Engine 5.4 LiveSync",
    category: "virtual-production",
    categoryLabel: "Virtual Production",
    arabicCategoryLabel: "الإنتاج الافتراضي",
    badge: "270° Micro-LED Volume",
    arabicBadge: "مسرح ليد 270 درجة",
    rate: 1500,
    halfDayRate: 5400,
    fullDayRate: 9800,
    capacity: 35,
    areaSqm: 280,
    dimensions: "18m x 15m x 5.5m",
    ceilingHeight: "5.5m Clear Height",
    power: "3-Phase 125A Clean Cam-Lok",
    soundIsolation: "STC 65 Floating Box-in-Box",
    image: "/images/projects/dmx.jpg",
    gallery: [
      "/images/projects/dmx.jpg",
      "/images/virtual-studio/cyberpunk-composite.jpg",
      "/images/virtual-studio/dubai-composite.jpg",
    ],
    overview:
      "Engineered for high-budget commercial campaigns, television series, and live virtual keynotes. Features a 270-degree curved Micro-LED wall integrated with Unreal Engine 5.4 nDisplay, Mo-Sys optical camera tracking, and genlocked zero-latency camera sync.",
    arabicOverview:
      "مُصمم خصيصاً للإعلانات التجارية الضخمة والأفلام والبث الافتراضي المباشر. يضم شاشات مايكرو ليد منحنية 270 درجة مدمجة مع محرك Unreal Engine 5.4 ونظام التتبع البصري الدقيق Mo-Sys StarTracker بدون أي تأخير زمني.",
    keyHardware: [
      { label: "LED Wall", arabicLabel: "شاشة الليد", value: "270° Curved 1.9mm Micro-LED", arabicValue: "شاشة منحنية 1.9 مم بدقة فائقة" },
      { label: "CGI Engine", arabicLabel: "محرك الرسوميات", value: "Dual RTX 6000 Ada nDisplay Clusters", arabicValue: "محطات RTX 6000 Ada فائقة المعالجة" },
      { label: "Tracking", arabicLabel: "تتبع الكاميرا", value: "Mo-Sys StarTracker Optical System", arabicValue: "نظام التتبع البصري Mo-Sys" },
      { label: "Sync", arabicLabel: "المزامنة", value: "Tri-Level Master Genlock", arabicValue: "مزامنة جينلوك كاملة مع الكاميرات" },
    ],
    amenities: [
      "Dedicated DIT color-grading station with calibrated OLED master monitor",
      "Private VIP executive green room with en-suite shower & dressing room",
      "Drive-in elephant door for vehicle, camera crane, and heavy prop access",
      "10 Gbps symmetrical fiber uplink with direct cloud dailies streaming",
      "Dual private hair, makeup, and wardrobe styling bays",
    ],
    arabicAmenities: [
      "محطة DIT مخصصة لمعالجة الألوان مع شاشة ماستر أوليد سينمائية",
      "غرفة كبار الشخصيات VIP خاصة ومجهزة بالكامل مع حمام خاص",
      "بوابة دخول واسعة للسيارات ورافعات الكاميرا والمعدات الثقيلة",
      "إنترنت فايبر فائق السرعة 10 جيجابت لنقل المواد والمونتاج السحابي الفوري",
      "جناح خاص ومزدوج للمكياج وتصفيف الشعر وتجهيز الأزياء",
    ],
    idealFor: [
      "Automotive & luxury commercials",
      "Feature film VFX sequences",
      "Virtual talk shows & corporate keynotes",
      "Music videos with surreal environments",
    ],
    arabicIdealFor: [
      "إعلانات السيارات والماركات العالمية الفاخرة",
      "المشاهد السينمائية والمؤثرات البصرية المعقدة",
      "المؤتمرات الافتراضية والبرامج الحوارية العالمية",
      "الفيديو كليب والأغاني المصورة في بيئات خيالية",
    ],
  },
  {
    id: "luminous-quartz",
    slug: "luminous-quartz",
    name: "Luminous Quartz — Podcast & Vodcast Suite",
    arabicName: "استوديو لومينوس كوارتز — جناح البودكاست والفودكاست",
    headline: "Broadcast Multi-Camera 4K Podcast Lounge with Acoustic Warmth",
    arabicHeadline: "جناح بودكاست وفودكاست متكامل مع تصوير 4K متعدد الزوايا وعزل صوتي",
    category: "podcast-broadcast",
    categoryLabel: "Podcast & Broadcast",
    arabicCategoryLabel: "البودكاست والبث المباشر",
    badge: "Dubai's #1 Vodcast Suite",
    arabicBadge: "الاستوديو الأول للبودكاست في دبي",
    rate: 450,
    halfDayRate: 1600,
    fullDayRate: 2900,
    capacity: 8,
    areaSqm: 55,
    dimensions: "8m x 7m x 3.8m",
    ceilingHeight: "3.8m Ceiling Grid",
    power: "Clean Isolated Audio Power 32A",
    soundIsolation: "STC 62 Studio Spec (-68dB)",
    image: "/images/studios/luminous-quartz.jpg",
    gallery: [
      "/images/studios/luminous-quartz.jpg",
      "/images/studios/podcast-suite.jpg",
    ],
    overview:
      "Dubai's premier turn-key podcast and vodcast studio located at Iris Bay. Fully equipped with 4x Shure SM7B microphones, Rodecaster Pro II mixer, Sony Cinema Line 4K cameras, and motorized RGB ambient lighting designed for immediate recording and live switching.",
    arabicOverview:
      "أفضل جناح لتسجيل وتصوير البودكاست والفودكاست في برج آيريس باي بدبي. مجهز بالكامل بـ 4 ميكروفونات Shure SM7B ومكسر Rodecaster Pro II وكاميرات سوني 4K السينمائية وإضاءة Astera RGB لتحقيق أعلى معايير الجودة فور دخولك.",
    keyHardware: [
      { label: "Mics", arabicLabel: "الميكروفونات", value: "4x Shure SM7B + Cloudlifters", arabicValue: "4 ميكروفونات Shure SM7B مع كلاود ليفترز" },
      { label: "Audio Mixer", arabicLabel: "مكسر الصوت", value: "Rodecaster Pro II Console", arabicValue: "مكسر رودكاستر برو II الاحترافي" },
      { label: "Cameras", arabicLabel: "الكاميرات", value: "3x Sony Cinema 4K UHD Setups", arabicValue: "3 كاميرات سوني سينما لاين بدقة 4K" },
      { label: "Lighting", arabicLabel: "الإضاءة", value: "Motorized Astera RGB Tube Array", arabicValue: "منظومة إضاءة Astera RGB قابلة للتحكم اللوني" },
    ],
    amenities: [
      "Dedicated live vision mixer and on-site recording engineer included",
      "Immediate multi-track audio and ISO 4K video delivery via Thunderbolt drive",
      "Professional motorized teleprompter with operator iPad controller",
      "Acoustically tuned sound baffles and custom artisan furniture",
      "Complimentary specialty coffee, espresso bar, and chilled refreshments",
    ],
    arabicAmenities: [
      "مهندس صوت ومخرج فني متواجد طوال فترة الجلسة للإشراف الفني",
      "تسليم فوري لملفات الصوت والفيديو المنفصلة ISO 4K عبر وحدة تخزين فائقة السرعة",
      "تلقين إلكتروني Teleprompter متحرك وسهل القراءة للمذيع والضيوف",
      "عزل صوتي فندقي فاخر وأثاث راقٍ ومريح مخصص للحوارات الطويلة",
      "بار قهوة مختصة وإسبريسو ومشروبات منعشة مجانية للضيوف",
    ],
    idealFor: [
      "C-Suite & Executive interview vodcasts",
      "Top-tier conversational podcasts & YouTube shows",
      "Live LinkedIn & YouTube broadcast streaming",
      "Audiobook & masterclass recorded series",
    ],
    arabicIdealFor: [
      "برامج البودكاست الحوارية للرؤساء التنفيذيين ورواد الأعمال",
      "برامج اليوتيوب والفودكاست الأسبوعية عالية الإنتاج",
      "البث المباشر عبر منصات التواصل ومؤتمرات الويب",
      "تسجيل الكتب الصوتية والدورات التدريبية المتقدمة",
    ],
  },
  {
    id: "nature-grid",
    slug: "nature-grid",
    name: "Nature Grid — Flagship Soundstage & Live Tracking",
    arabicName: "استوديو نيتشر جريد — الاستوديو الرئيسي والتسجيل الحي",
    headline: "Legendary Neve 8078 Console & Pristine Large-Format Acoustics",
    arabicHeadline: "كونسول نيف 8078 الأسطوري وقاعة تسجيل واسعة لعازفي الأوركسترا والفرق",
    category: "music-recording",
    categoryLabel: "Music & Live Recording",
    arabicCategoryLabel: "التسجيل الموسيقي الحي",
    badge: "Flagship Audio Stage",
    arabicBadge: "الاستوديو الموسيقي الرئيسي",
    rate: 850,
    halfDayRate: 3100,
    fullDayRate: 5600,
    capacity: 25,
    areaSqm: 180,
    dimensions: "14m x 12m x 4.8m",
    ceilingHeight: "4.8m Acoustic Canopy",
    power: "Isolated Clean Studio Ground 63A",
    soundIsolation: "STC 70 Absolute Isolation",
    image: "/images/studios/nature-grid.jpg",
    gallery: [
      "/images/studios/nature-grid.jpg",
      "/images/projects/flag-day.jpg",
    ],
    overview:
      "Yas Pro's flagship recording hall designed for orchestral arrangements, live band tracking, and multi-musician recording. Centered around a vintage analog Neve 8078 console paired with Pro Tools HDX 64-channel I/O, Genelec 8351B mastering monitors, and floating timber floors.",
    arabicOverview:
      "قاعة التسجيل الموسيقي الكبرى المصممة لتسجيل الأوركسترا، الفرق الحية، وتأليف الموسيقى التصويرية. تحتضن كونسول نيف 8078 التناظري الأصيل المرتبط بنظام Pro Tools HDX فائق السرعة مع شاشات مراقبة جينليك الاستوديو المرجعية.",
    keyHardware: [
      { label: "Console", arabicLabel: "كونسول الصوت", value: "Vintage Neve 8078 Analog Console", arabicValue: "كونسول نيف 8078 التناظري النادر" },
      { label: "DAW Engine", arabicLabel: "نظام التسجيل", value: "Pro Tools HDX 64-Channel I/O", arabicValue: "نظام Pro Tools HDX بـ 64 مساراً متزامناً" },
      { label: "Monitors", arabicLabel: "المراقبة الصوتية", value: "Genelec 8351B SAM + 7380A Sub", arabicValue: "سماعات Genelec 8351B الذكية مع مضخم 7380A" },
      { label: "Microphones", arabicLabel: "الميكروفونات", value: "Neumann U67, AKG C12, Royer 121", arabicValue: "ميكروفونات كلاسيكية نادرة (Neumann, AKG, Royer)" },
    ],
    amenities: [
      "32-channel personal Aviom headphone monitoring mixers for every musician",
      "Floating isolation iso-booths for simultaneous brass, drums, and vocals",
      "Grand piano Yamaha C7 maintained and tuned before every major session",
      "Client production lounge with glass sightlines into the main live room",
      "Full microphone locker with over 40 matched vintage and modern capsules",
    ],
    arabicAmenities: [
      "أنظمة سماعات شخصية منفصلة 32 قناة لكل عازف وموسيقي",
      "كابينات عزل صوتي منفصلة لتسجيل الطبول والوتريات والصوت البشري بالتزامن",
      "بيانو كونسيرت جراند ياماها C7 مضبوط ومُعاير لكل جلسة تسجيل",
      "استراحة للمنتج والمخرج مع واجهة زجاجية عازلة تطل مباشرة على القاعة",
      "خزينة ميكروفونات تضم أكثر من 40 ميكروفوناً نادراً ومُعايباً",
    ],
    idealFor: [
      "Orchestral film scores & epic compositions",
      "Full live band tracking & ensemble albums",
      "Arabic orchestral traditional recordings",
      "Dolby Atmos music mastering & spatial mixdown",
    ],
    arabicIdealFor: [
      "تسجيل الموسيقى التصويرية للأفلام والمسلسلات الكبرى",
      "ألبومات الفرق الموسيقية والتسجيل الحي الكامل",
      "الأوركسترا الشرقية والآلات الوترية والتراثية",
      "الماسترينج الصوتي بنظام Dolby Atmos المحيطي",
    ],
  },
  {
    id: "dark-walnut",
    slug: "dark-walnut",
    name: "Dark Walnut — Live Band & Acoustic Studio",
    arabicName: "استوديو دارك والنات — استوديو الفرق الموسيقية والتسجيل الحي",
    headline: "SSL AWS Hybrid Console & Natural Walnut Room Diffusion",
    arabicHeadline: "كونسول SSL AWS الهجين مع ناشرات خشب الجوز لصوت دافئ ودقيق",
    category: "music-recording",
    categoryLabel: "Music & Live Recording",
    arabicCategoryLabel: "التسجيل الموسيقي الحي",
    badge: "SSL Hybrid Precision",
    arabicBadge: "دقة كونسول SSL الهجين",
    rate: 700,
    halfDayRate: 2500,
    fullDayRate: 4600,
    capacity: 18,
    areaSqm: 120,
    dimensions: "11m x 10m x 4.2m",
    ceilingHeight: "4.2m Treated Sloped Ceiling",
    power: "Clean Audio Ground 32A",
    soundIsolation: "STC 68 Acoustic Shell",
    image: "/images/studios/dark-walnut.jpg",
    gallery: [
      "/images/studios/dark-walnut.jpg",
    ],
    overview:
      "A versatile live room wrapped in dark American walnut diffusers, delivering tight, punchy low-end and silky high frequencies. Anchored by an SSL AWS 948 Delta console, full custom DW Collectors drum kit, and dedicated guitar isolation cabinets.",
    arabicOverview:
      "قاعة تسجيل حية مكسوة بأخشاب الجوز الأمريكي الفاخرة لتوفير استجابة صوتية دقيقة للترددات المنخفضة ونقاء فائق. يرتكز الاستوديو على كونسول SSL AWS 948 Delta، وطقم طبول DW Collectors، وكبائن عزل مخصصة لمكبرات الجيتار.",
    keyHardware: [
      { label: "Console", arabicLabel: "الكونسول", value: "Solid State Logic AWS 948 Delta", arabicValue: "كونسول SSL AWS 948 Delta الأسطوري" },
      { label: "Drums", arabicLabel: "طقم الطبول", value: "Custom DW Collector's Series Kit", arabicValue: "طقم درامز DW Collector's مخصص" },
      { label: "Outboard", arabicLabel: "المعالجات التناظرية", value: "Tube-Tech CL1B, 1176LN, LA-2A", arabicValue: "معالجات كلاسيكية (Tube-Tech CL1B, 1176, LA-2A)" },
      { label: "Monitors", arabicLabel: "السماعات", value: "ATC SCM45A Pro Active Monitors", arabicValue: "شاشات ATC SCM45A المرجعية النشطة" },
    ],
    amenities: [
      "Custom amp isolation vaults for cranked tube heads with zero bleed",
      "Integrated Pro Tools & Logic Pro X dual control surfaces",
      "Warm ambient lighting with custom brass fixtures and dimming zones",
      "Direct live video link to Luminous Quartz for remote podcast sync",
    ],
    arabicAmenities: [
      "خزائن عزل صوتي منفصلة لمكبرات الجيتار بدون أي تسريب صوتي",
      "محطات تحكم مزدوجة متوافقة مع Pro Tools و Logic Pro X",
      "إضاءة دافئة هادئة وموزعة بنظام تحكم ذكي للتركيز الإبداعي",
      "ربط فيديو مباشر وفوري مع استوديو لومينوس كوارتز للتسجيل المزدوج",
    ],
    idealFor: [
      "Rock, pop, and indie band full album tracking",
      "Acoustic guitar, oud, and percussion multi-mic sessions",
      "Live studio video sessions & YouTube live cuts",
    ],
    arabicIdealFor: [
      "تسجيل ألبومات الروك والبوب والموسيقى البديلة",
      "جلسات الآلات الوترية الفردية (العود، الجيتار، الإيقاعات)",
      "جلسات العزف الحي المصورة لليوتيوب والمنصات",
    ],
  },
  {
    id: "earthy-sand",
    slug: "earthy-sand",
    name: "Earthy Sand — Cyclorama Photo & Video Stage",
    arabicName: "استوديو إيرثي ساند — استوديو التصوير الفوتوغرافي والسايكلو",
    headline: "Endless White Cyclorama with Motorized Seamless Backdrops",
    arabicHeadline: "سايكلو سينمائي أبيض لا متناهٍ مع خلفيات ورقية وقماشية متحركة",
    category: "photo-cyclorama",
    categoryLabel: "Photo & Video Cyc",
    arabicCategoryLabel: "السايكلو والتصوير الفوتوغرافي",
    badge: "Infinite White Cyc",
    arabicBadge: "سايكلو أبيض لانهائي",
    rate: 600,
    halfDayRate: 2200,
    fullDayRate: 3900,
    capacity: 15,
    areaSqm: 110,
    dimensions: "10m x 9m x 4.5m",
    ceilingHeight: "4.5m Motorized Lighting Grid",
    power: "3-Phase 63A Clean Grid",
    soundIsolation: "STC 58 Isolated Stage",
    image: "/images/studios/earthy-sand.jpg",
    gallery: [
      "/images/studios/earthy-sand.jpg",
    ],
    overview:
      "A pristine cyclorama infinity cove engineered for high-fashion, commercial product campaigns, and crisp e-commerce visuals. Equipped with overhead motorized pantographs, Profoto B10X Plus strobes, Aputure continuous daylight lights, and rolling tethered capture carts.",
    arabicOverview:
      "استوديو سايكلو متصل بجدران منحنية بيضاء لا متناهية مخصص للتصوير التجاري، الأزياء الراقية، والإعلانات الدعائية. مزود برافعات إضاءة سقفية متحركة، وفلاشات بروفوتو B10X Plus، وإضاءة مستمرة من أبوتشر، ومحطات تصوير موصولة بالحاسوب.",
    keyHardware: [
      { label: "Cyclorama", arabicLabel: "السايكلو", value: "Seamless Infinite White 2-Wall Cove", arabicValue: "جدار سايكلو أبيض مزدوج الانحناء" },
      { label: "Strobes", arabicLabel: "إضاءة الفلاش", value: "4x Profoto B10X Plus 500Ws Kits", arabicValue: "4 وحدات فلاش بروفوتو B10X Plus بقوة 500 واط" },
      { label: "Continuous", arabicLabel: "الإضاءة المستمرة", value: "2x Aputure 600d Pro + Light Domes", arabicValue: "وحدتا إضاءة أبوتشر 600d برو مع سوفت بوكس عملاق" },
      { label: "Tethering", arabicLabel: "محطة المعاينة", value: "TetherGuard Pro 32” Eizo 4K Color Station", arabicValue: "شاشة إيزو 32 بوصة 4K معايرة لتصوير المباشر" },
    ],
    amenities: [
      "Motorized multi-color seamless paper backdrops (Savage 2.7m rolls)",
      "High-output steam irons, industrial garment racks, and changing screen",
      "Dedicated dual hair & makeup vanity station with 5600K daylight bulbs",
      "Client lounge with high-speed WiFi and real-time live capture screen",
    ],
    arabicAmenities: [
      "خلفيات ورقية وقماشية متعددة الألوان بنظام إنزال كهربائي لاسلكي",
      "مكاوي بخار احترافية، وشماعات ملابس صناعية، وستائر تبديل",
      "جناح مكياج وتصفيف شعر مخصص مع إضاءة مرآة نهارية 5600K",
      "استراحة عملاء مريحة مع شاشة عرض حية لمتابعة اللقطات أثناء التقاطها",
    ],
    idealFor: [
      "Luxury fashion editorial & lookbook shoots",
      "Commercial tabletop & macro product photography",
      "E-commerce catalogue 360-degree capture",
      "Interviews requiring clean, minimalist white backgrounds",
    ],
    arabicIdealFor: [
      "جلسات تصوير الأزياء والمجلات والكتالوجات الراقية",
      "تصوير المنتجات التجارية واللقطات المقربة الماكرو",
      "تصوير منتجات المتاجر الإلكترونية بتقنية 360 درجة",
      "المقابلات التي تتطلب خلفية بيضاء عصرية فائقة النقاء",
    ],
  },
  {
    id: "classic-oak",
    slug: "classic-oak",
    name: "Classic Oak — Voiceover & Sound Isolation Booth",
    arabicName: "استوديو كلاسيك أوك — كابينة التعليق الصوتي والعزل الفائق",
    headline: "Ultra-Quiet Soundproof Isolation for Voiceover, ADR & Audiobooks",
    arabicHeadline: "كابينة عزل صوتي فائقة الهدوء للتعليق الصوتي والدبلجة والكتب الصوتية",
    category: "voiceover",
    categoryLabel: "Voiceover & ADR",
    arabicCategoryLabel: "التعليق الصوتي والدبلجة",
    badge: "Ultra-Low Noise Floor",
    arabicBadge: "أدنى مستوى ضوضاء صوتية",
    rate: 350,
    halfDayRate: 1300,
    fullDayRate: 2300,
    capacity: 6,
    areaSqm: 30,
    dimensions: "5.5m x 4.5m x 3.2m",
    ceilingHeight: "3.2m Sound Isolated Ceiling",
    power: "Filtered Ultra-Quiet 16A",
    soundIsolation: "STC 72 Maximum Silence (-72dB)",
    image: "/images/studios/classic-oak.jpg",
    gallery: [
      "/images/studios/classic-oak.jpg",
    ],
    overview:
      "A pristine, museum-grade acoustic isolation booth purpose-built for Arabic & English voiceovers, animated film dubbing, ADR ADR dialogue replacement, and commercial narration. Featuring a world-standard Neumann U87 Ai microphone and Avalon VT-737sp vacuum tube preamplifier.",
    arabicOverview:
      "كابينة عزل صوتي بمستوى المتاحف والمختبرات الصوتية مخصصة للتعليق الصوتي باللغتين العربية والإنجليزية، ودبلجة أفلام الرسوم المتحركة، واستبدال الحوار السينمائي ADR. تحتوي على ميكروفون نيومان U87 الأسطوري ومضخم أفالون الصمامي VT-737sp.",
    keyHardware: [
      { label: "Microphone", arabicLabel: "الميكروفون", value: "Neumann U87 Ai Multi-Pattern", arabicValue: "ميكروفون نيومان U87 Ai الأصلي متعدد الأنماط" },
      { label: "Preamp", arabicLabel: "مضخم الإشارة", value: "Avalon VT-737sp Class A Tube Preamp", arabicValue: "مضخم أفالون VT-737sp من الفئة A بالصمامات المفرغة" },
      { label: "ADR Sync", arabicLabel: "مزامنة الدبلجة", value: "Soundmaster Frame-Accurate Video Screen", arabicValue: "شاشة عرض سينمائية بمزامنة الإطارات الدقيقة للدبلجة" },
      { label: "Remote Session", arabicLabel: "البث عن بُعد", value: "Source-Connect Pro & Cleanfeed HQ", arabicValue: "ربط رقمي دولي عبر Source-Connect Pro و Cleanfeed" },
    ],
    amenities: [
      "Silent whisper-quiet laminar air ventilation system (NC-15 rating)",
      "Source-Connect Pro certified for live director remote supervision from anywhere in the world",
      "Ergonomic acoustic reading desk with adjustable silent LED script light",
      "Instant WAV stems delivery at 24-bit / 96kHz immediately after recording",
    ],
    arabicAmenities: [
      "نظام تهوية صامت كلياً بتقنية تدفق الهواء الصفائحي (معدل ضوضاء NC-15)",
      "شهادة Source-Connect Pro تتيح للمخرج والمطّلع في أي دولة الإشراف والمتابعة المباشرة",
      "طاولة قراءة صوتية مريحة مع إضاءة نصوص LED صامتة لا تصدر أي طنين",
      "تسليم مباشر لملفات الصوت عالية الدقة WAV 24-bit / 96kHz فور انتهاء الجلسة",
    ],
    idealFor: [
      "National TV & radio commercial voiceovers",
      "International animation, video game & film ADR dubbing",
      "Prestige corporate narrations & brand documentary voiceover",
      "Multi-chapter audiobook productions for Audible & Storytel",
    ],
    arabicIdealFor: [
      "الإعلانات التلفزيونية والإذاعية والحملات الوطنية الكبرى",
      "دبلجة أفلام الأنميشن وألعاب الفيديو والأفلام العالمية",
      "التعليق الصوتي المؤسسي للأفلام الوثائقية والشركات",
      "إنتاج الكتب الصوتية لمنصات ستوريتل وأوديبل",
    ],
    isActive: true,
  },
];

import type { Studio } from "@/db/schema";

/**
 * Merges live Neon PostgreSQL studio records from CMS / Admin into the rich catalog.
 * Any admin edit to hourly rate, name, arabic name, description, image, or active status
 * is immediately reflected across the public showcase and sales page.
 */
export function getDynamicSoundstages(cmsStudios?: Studio[]): SoundstageDetail[] {
  if (!cmsStudios) {
    return SOUNDSTAGES_CATALOG.map((s) => ({ ...s, isActive: true }));
  }

  // Create lookup map of CMS studio records by slug and id
  const cmsMap = new Map<string, Studio>();
  for (const studio of cmsStudios) {
    if (studio.slug) cmsMap.set(studio.slug, studio);
    if (studio.id) cmsMap.set(studio.id, studio);
  }

  // Map known catalog soundstages with live DB overrides
  const result: SoundstageDetail[] = SOUNDSTAGES_CATALOG.flatMap((stage) => {
    const override = cmsMap.get(stage.id) || cmsMap.get(stage.slug);
    if (!override) {
      return [];
    }

    const rateNum = parseFloat(override.hourlyRate);
    const hourlyRate = !isNaN(rateNum) && rateNum > 0 ? rateNum : stage.rate;
    const halfDayRate = Math.round(hourlyRate * 4 * 0.9);
    const fullDayRate = Math.round(hourlyRate * 8 * 0.82);

    return {
      ...stage,
      name: override.name || stage.name,
      arabicName: override.arabicName || stage.arabicName,
      rate: hourlyRate,
      halfDayRate,
      fullDayRate,
      capacity: override.capacity || stage.capacity,
      image: override.imageUrl || stage.image,
      overview: override.description || stage.overview,
      arabicOverview: override.arabicDescription || stage.arabicOverview,
      isActive: override.isActive ?? true,
    };
  });

  // Include any custom soundstages added via the admin panel that are not in the default 6
  for (const studio of cmsStudios) {
    const isKnown = SOUNDSTAGES_CATALOG.some(
      (stage) => stage.id === studio.slug || stage.id === studio.id || stage.slug === studio.slug
    );
    // Ignore legacy alias slugs
    if (isKnown || ["studio-a", "studio-b", "studio-c"].includes(studio.slug)) {
      continue;
    }

    const rateNum = parseFloat(studio.hourlyRate) || 800;
    result.push({
      id: studio.slug || studio.id,
      slug: studio.slug || studio.id,
      name: studio.name,
      arabicName: studio.arabicName || studio.name,
      headline: studio.description || "Certified Soundstage at Iris Bay Dubai",
      arabicHeadline: studio.arabicDescription || "استوديو تصوير مجهز في آيريس باي دبي",
      category: "all",
      categoryLabel: "Custom Soundstage",
      arabicCategoryLabel: "استوديو مخصص",
      badge: "Iris Bay Soundstage",
      arabicBadge: "استوديو آيريس باي",
      rate: rateNum,
      halfDayRate: Math.round(rateNum * 4 * 0.9),
      fullDayRate: Math.round(rateNum * 8 * 0.82),
      capacity: studio.capacity || 20,
      areaSqm: 160,
      dimensions: "14m x 12m x 5m",
      ceilingHeight: "5.0m",
      power: "3-Phase 63A",
      soundIsolation: "STC 60+",
      image: studio.imageUrl || "/images/projects/dmx.jpg",
      gallery: [studio.imageUrl || "/images/projects/dmx.jpg"],
      overview: studio.description || "High-specification soundstage with acoustic isolation.",
      arabicOverview: studio.arabicDescription || "استوديو عالي المواصفات مع عزل صوتي متكامل.",
      keyHardware: [
        { label: "Power", arabicLabel: "الطاقة", value: "3-Phase 63A", arabicValue: "طاقة ثلاثية الطور" },
        { label: "Acoustics", arabicLabel: "العزل الصوتي", value: "STC 60+", arabicValue: "عزل صوتي معتمد" },
      ],
      amenities: (studio.amenities as string[]) || ["Green Room", "High-speed Fiber"],
      arabicAmenities: ["غرفة استراحة", "إنترنت فائق السرعة"],
      idealFor: ["Commercial shoots", "Video Production"],
      arabicIdealFor: ["تصوير تجاري", "إنتاج فيديو"],
      isActive: studio.isActive ?? true,
    });
  }

  return result;
}

