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
  link?: string;
}

export const YAS_GROUP_COMPANIES: readonly YasGroupCompany[] = [
  {
    id: "media-group",
    name: "YAS PRO Media Group",
    nameAr: "مجموعة ياس برو الإعلامية",
    division: "Holding & Media Network",
    divisionAr: "المجموعة القابضة والشبكة الإعلامية",
    description: "The overarching media umbrella operating world-class production facilities, broadcast networks, and creative enterprises across the UAE and Gulf region.",
    descriptionAr: "المظلة الإعلامية الكبرى التي تدير منشآت الإنتاج العالمية، وشبكات البث التلفزيوني، والشركات الإبداعية في دولة الإمارات والخليج.",
    logo: "/images/group/yas-pro-media-group.png",
    accentColor: "#f59e0b",
    tags: ["Holding", "HQ Dubai", "Media Network"],
  },
  {
    id: "media-production",
    name: "YAS PRO Media Production",
    nameAr: "ياس برو للإنتاج الإعلامي",
    division: "Commercial & Cinema Filming",
    divisionAr: "الإنتاج السينمائي والتجاري",
    description: "End-to-end cinematic film crews, 8K RED and ARRI commercial production, high-profile sovereign campaigns, and post-production color suites.",
    descriptionAr: "طواقم تصوير سينمائي متكاملة، إنتاج إعلانات تجارية بدقة 8K، حملات حكومية وسيادية، وأجنحة مونتاج وتلوين متطورة.",
    logo: "/images/group/yas-pro-media-production.png",
    accentColor: "#fbbf24",
    tags: ["Cinema", "8K Filming", "Commercials"],
  },
  {
    id: "broadcast-studios",
    name: "YAS PRO Broadcast & Studios",
    nameAr: "ياس برو للبث والاستوديوهات",
    division: "Soundstages & OB Van Units",
    divisionAr: "استوديوهات التصوير وعربات البث المباشر",
    description: "State-of-the-art soundstages in Dubai (Business Bay & Iris Bay), SMPTE fiber links, multi-camera 4K podcast hubs, and mobile OB Van broadcast units.",
    descriptionAr: "استوديوهات تصوير متطورة في دبي (الخليج التجاري وبرج آيريس)، ربط ألياف بصرية SMPTE، استوديوهات بودكاست 4K، وعربات بث خارجي متنقلة.",
    logo: "/images/group/yas-pro-broadcast-studios.png",
    accentColor: "#38bdf8",
    tags: ["OB Vans", "Soundstages", "4K Podcast"],
  },
  {
    id: "creative-agency",
    name: "YAS PRO Creative Agency",
    nameAr: "وكالة ياس برو الإبداعية",
    division: "Brand Strategy & Digital Growth",
    divisionAr: "الاستراتيجية الإبداعية والهوية الرقمية",
    description: "Full-service 360° creative agency delivering breakthrough brand identities, experiential marketing, digital growth strategies, and high-impact campaigns.",
    descriptionAr: "وكالة إبداعية متكاملة تقدم هويات بصرية رائدة، تسويقاً تجريبياً، استراتيجيات نمو رقمي، وحملات دعائية مؤثرة.",
    logo: "/images/group/yas-pro-creative-agency.png",
    accentColor: "#ec4899",
    tags: ["Branding", "Creative Direction", "360° Campaigns"],
  },
  {
    id: "stars",
    name: "YAS PRO Stars",
    nameAr: "ياس برو ستارز",
    division: "Celebrity & Influencer Management",
    divisionAr: "إدارة المشاهير والمؤثرين وصناع المحتوى",
    description: "Premier regional talent management representing tier-1 Gulf influencers, actors, athletes, and digital personalities with full Mawthooq ad licensing.",
    descriptionAr: "إدارة مواهب رائدة تمثل نخبة المؤثرين، الممثلين، والرياضيين في الخليج مع ترخيص موثوق الإعلاني المعتمد.",
    logo: "/images/group/yas-pro-stars.png",
    accentColor: "#eab308",
    tags: ["Talent Management", "Mawthooq", "Gulf Creators"],
  },
  {
    id: "records",
    name: "YAS PRO Records",
    nameAr: "تسجيلات ياس برو",
    division: "Music Label & Audio Engineering",
    divisionAr: "الإنتاج الموسيقي وهندسة الصوت",
    description: "Acoustically tuned tracking and mastering rooms, original cinematic score composition, Foley sound design, and full commercial music distribution.",
    descriptionAr: "استوديوهات تسجيل ومعالجة صوتية معزولة، تأليف موسيقى تصويرية سينمائية، تصميم مؤثرات Foley، وتوزيع موسيقي تجاري.",
    logo: "/images/group/yas-pro-records.png",
    accentColor: "#f97316",
    tags: ["Music Label", "Spatial Audio", "Score Composition"],
  },
  {
    id: "originals",
    name: "YAS PRO Originals",
    nameAr: "إنتاجات ياس برو الأصلية",
    division: "Original IP & Docuseries Formats",
    divisionAr: "المحتوى الأصلي والبرامج الوثائقية",
    description: "Proprietary investigative docuseries, high-impact regional podcast IPs, narrative digital formats, and culturally resonant long-form episodic entertainment.",
    descriptionAr: "سلاسل وثائقية استقصائية حصرية، برامج بودكاست كبرى، صيغ رقمية روائية، وبرامج ترفيهية طويلة متجذرة في الهوية العربية.",
    logo: "/images/group/yas-pro-originals.png",
    accentColor: "#a855f7",
    tags: ["Original IP", "Docuseries", "Digital Formats"],
  },
];
