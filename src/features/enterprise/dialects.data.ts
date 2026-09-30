export interface DialectPreset {
  id: string;
  name: string;
  arabicName: string;
  flag: string;
  region: string;
  langCode: string;
  targetMarket: string;
  spokenSample: string;
  englishTranslation: string;
  culturalNote: string;
  lipSyncAccuracy: string;
  preferredTones: string[];
}

export const DIALECT_PRESETS: DialectPreset[] = [
  {
    id: "najdi",
    name: "Najdi (Riyadh / Central KSA)",
    arabicName: "اللهجة النجدية (الرياض)",
    flag: "🇸🇦",
    region: "Riyadh & Central Province",
    langCode: "ar-SA",
    targetMarket: "Saudi Vision 2030, Giga-projects & Prime TVCs",
    spokenSample: "طال عمرك، التصوير والإنتاج هنا ما تلقاه بأي مكان ثاني، الجودة تفرَق معك من أول لقطة والإنجاز يرفع الراس!",
    englishTranslation: "May your life be long, this production quality is unmatched anywhere else; the difference shows from the very first frame!",
    culturalNote: "Employs high-prestige Najdi honorifics ('طال عمرك', 'تفرق معك') to build instant trust with Saudi decision-makers.",
    lipSyncAccuracy: "99.8% Neural Phoneme Sync",
    preferredTones: ["Authoritative", "Honorable", "Inspiring"],
  },
  {
    id: "emirati",
    name: "Emirati (Dubai & Abu Dhabi)",
    arabicName: "اللهجة الإماراتية (دبي وأبوظبي)",
    flag: "🇦🇪",
    region: "United Arab Emirates",
    langCode: "ar-AE",
    targetMarket: "Dubai Tourism, Sovereign Summits & Luxury Brands",
    spokenSample: "طال عمرك، الشغل اهني ما عليه كلام، تقنيات عالمية واستوديوهات متطورة تبيّض الويه في كل محفل!",
    englishTranslation: "May your life be long, the craftsmanship here is unquestionable; world-class tech that brings honor on every global stage!",
    culturalNote: "Infused with authentic Gulf vernacular ('اهني', 'ما عليه كلام', 'تبيّض الويه') reflecting Emirati warmth and excellence.",
    lipSyncAccuracy: "99.6% Neural Phoneme Sync",
    preferredTones: ["Warm", "Prestigious", "Forward-looking"],
  },
  {
    id: "hijazi",
    name: "Hijazi (Jeddah & Western KSA)",
    arabicName: "اللهجة الحجازية (جدة ومكة)",
    flag: "🇸🇦",
    region: "Jeddah & Red Sea Coast",
    langCode: "ar-SA",
    targetMarket: "Youth Lifestyle, Entertainment & Red Sea Festivals",
    spokenSample: "يا سيدي، الشغل هنا على أصوله، استوديوهات وكاميرات 4K وإخراج عالمي يفرّح القلب ويخليك مبسوط!",
    englishTranslation: "Respected master, the work here is done to perfection; 4K cameras and world-class direction that delights the heart!",
    culturalNote: "Features relaxed and convivial Western Saudi idioms ('يا سيدي', 'على أصوله') ideal for entertainment and hospitality.",
    lipSyncAccuracy: "99.7% Neural Phoneme Sync",
    preferredTones: ["Approachable", "Energetic", "Culturally Rich"],
  },
  {
    id: "kuwaiti",
    name: "Kuwaiti (Kuwait & Northern Gulf)",
    arabicName: "اللهجة الكويتية",
    flag: "🇰🇼",
    region: "Kuwait & Gulf Coast",
    langCode: "ar-KW",
    targetMarket: "High-Engagement Commercials & Creator Shows",
    spokenSample: "يا طويل العمر، الإنتاج هني حدّه عجيب ومضبوط، لا تحاتي شي فريق Yas Pro يضبط لك كل تفصيلة!",
    englishTranslation: "Respected sir, the production here is extremely impressive and precise; leave your worries aside, Yas Pro covers every detail!",
    culturalNote: "Uses classic Kuwaiti emphasis ('حدّه عجيب', 'لا تحاتي', 'يضبط لك') commanding high youth resonance.",
    lipSyncAccuracy: "99.5% Neural Phoneme Sync",
    preferredTones: ["Punchy", "Witty", "Relatable"],
  },
  {
    id: "egyptian",
    name: "Egyptian (Cairo & Pan-Arab)",
    arabicName: "اللهجة المصرية الفصحى المعتدلة",
    flag: "🇪🇬",
    region: "Cairo & North Africa Hub",
    langCode: "ar-EG",
    targetMarket: "Regional TV Commercials & Pan-Arab Streaming",
    spokenSample: "يا فندم، الإنتاج هنا احترافي لأعلى درجة، أحدث أجهزة سينمائية ومعدات هوليوودية هتوصل رسالتك بأجمل صورة!",
    englishTranslation: "Esteemed client, the production here is professional to the highest standard; Hollywood-grade gear that delivers your message beautifully!",
    culturalNote: "Universally comprehended across 100M+ Arab viewers with crisp phonetic articulation and commercial dynamism.",
    lipSyncAccuracy: "99.9% Neural Phoneme Sync",
    preferredTones: ["Cinematic", "Engaging", "Artistic"],
  },
];
