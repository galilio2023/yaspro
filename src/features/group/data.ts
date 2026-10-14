export interface YasGroupCompany {
  id: string;
  name: string;
  nameAr: string;
  division: string;
  divisionAr: string;
  description: string;
  descriptionAr: string;
  logo: string;
  accentColor: string;
  tags: string[];
  tagsAr?: string[];
  link?: string;
}

export const YAS_GROUP_COMPANIES: readonly YasGroupCompany[] = [
  {
    id: "media-group",
    name: "YAS PRO Media Group",
    nameAr: "مجموعة ياس برو الإعلامية",
    division: "Holding & Media Network",
    divisionAr: "المجموعة القابضة والشبكة الإعلامية",
    description: "The sovereign holding umbrella steering specialized production facilities, broadcast networks, and creative enterprises across the Gulf.",
    descriptionAr: "المظلة القابضة التي تقود منشآت الإنتاج المتخصصة وشبكات البث التلفزيوني والشركات الإبداعية في الخليج العربي.",
    logo: "/images/group/yas-pro-media-group.png",
    accentColor: "#f59e0b",
    tags: ["Holding HQ", "Broadcast Network", "Sovereign Media"],
    tagsAr: ["المقر_الرئيسي", "شبكة_بث", "إعلام_سيادي"],
  },
  {
    id: "media-production",
    name: "YAS PRO Media Production",
    nameAr: "ياس برو للإنتاج الإعلامي",
    division: "Commercial & Cinema Filming",
    divisionAr: "الإنتاج السينمائي والتجاري",
    description: "Full-scale cinematic film crews, 8K commercial production, and post-production color grading suites for tier-one brands.",
    descriptionAr: "طواقم تصوير سينمائي متكاملة، إنتاج إعلانات تجارية بدقة 8K، وأجنحة تلوين احترافية للعلامات الكبرى.",
    logo: "/images/group/yas-pro-media-production.png",
    accentColor: "#fbbf24",
    tags: ["8K Cinema", "Commercials", "Color Grading"],
    tagsAr: ["سينما_8K", "إعلانات_تجارية", "تلوين_رقمي"],
  },
  {
    id: "broadcast-studios",
    name: "YAS PRO Broadcast & Studios",
    nameAr: "ياس برو للبث والاستوديوهات",
    division: "Soundstages & OB Van Units",
    divisionAr: "استوديوهات التصوير وعربات البث المباشر",
    description: "Acoustically certified soundstages, SMPTE fiber control rooms, 4K podcast lounges, and mobile OB-VAN broadcast units.",
    descriptionAr: "استوديوهات معتمدة صوتياً، غرف تحكم بألياف SMPTE، صالات بودكاست 4K، وعربات بث خارجي متنقلة.",
    logo: "/images/group/yas-pro-broadcast-studios.png",
    accentColor: "#38bdf8",
    tags: ["Soundstages", "OB-VAN Fleet", "4K Podcast"],
    tagsAr: ["استوديوهات", "عربات_بث", "بودكاست_4K"],
  },
  {
    id: "creative-agency",
    name: "YAS PRO Creative Agency",
    nameAr: "وكالة ياس برو الإبداعية",
    division: "Brand Strategy & Digital Growth",
    divisionAr: "الاستراتيجية الإبداعية والهوية الرقمية",
    description: "Full-service 360° creative agency delivering high-impact brand identities, experiential marketing, and digital growth campaigns.",
    descriptionAr: "وكالة إبداعية متكاملة تقدم هويات بصرية رائدة، تسويقاً تجريبياً، وحملات نمو رقمي واسعة التأثير.",
    logo: "/images/group/yas-pro-creative-agency.png",
    accentColor: "#ec4899",
    tags: ["Brand Identity", "Creative Direction", "360° Campaigns"],
    tagsAr: ["هوية_بصرية", "إدارة_إبداعية", "حملات_متكاملة"],
  },
  {
    id: "stars",
    name: "YAS PRO Stars",
    nameAr: "ياس برو ستارز",
    division: "Celebrity & Influencer Management",
    divisionAr: "إدارة المشاهير والمؤثرين وصناع المحتوى",
    description: "Premier talent management representing tier-one Gulf influencers, actors, and creators with full Mawthooq ad licensing.",
    descriptionAr: "إدارة مواهب رائدة تمثل نخبة المؤثرين والممثلين وصناع المحتوى في الخليج بترخيص موثوق الإعلاني.",
    logo: "/images/group/yas-pro-stars.png",
    accentColor: "#eab308",
    tags: ["Talent Management", "Mawthooq Certified", "Gulf Creators"],
    tagsAr: ["إدارة_مواهب", "ترخيص_موثوق", "صناع_محتوى"],
  },
  {
    id: "records",
    name: "YAS PRO Records",
    nameAr: "تسجيلات ياس برو",
    division: "Music Label & Audio Engineering",
    divisionAr: "الإنتاج الموسيقي وهندسة الصوت",
    description: "Acoustically tuned tracking and mastering rooms, cinematic orchestral scoring, Foley sound design, and commercial distribution.",
    descriptionAr: "استوديوهات معالجة صوتية متقدمة، تأليف موسيقى تصويرية سينمائية، ومؤثرات صوتية وتوزيع تجاري.",
    logo: "/images/group/yas-pro-records.png",
    accentColor: "#f97316",
    tags: ["Spatial Audio", "Score Composition", "Mastering"],
    tagsAr: ["صوت_مكاني", "موسيقى_تصويرية", "ماسترنج"],
  },
  {
    id: "originals",
    name: "YAS PRO Originals",
    nameAr: "إنتاجات ياس برو الأصلية",
    division: "Original IP & Docuseries Formats",
    divisionAr: "المحتوى الأصلي والبرامج الوثائقية",
    description: "Proprietary investigative docuseries, premium regional podcast IPs, and culturally resonant long-form episodic formats.",
    descriptionAr: "سلاسل وثائقية استقصائية، برامج بودكاست كبرى، وصيغ ترفيهية طويلة متجذرة في الهوية العربية.",
    logo: "/images/group/yas-pro-originals.png",
    accentColor: "#a855f7",
    tags: ["Original IPs", "Docuseries", "Episodic Formats"],
    tagsAr: ["محتوى_أصلي", "سلاسل_وثائقية", "برامج_حوارية"],
  },
];
