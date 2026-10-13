export interface GovernmentLogo {
  id: string;
  name: string;
  logo: string;
  glowColor: string;
  className?: string;
}

export interface BrandLogoItem {
  id: string;
  name: string;
  logo: string;
  color: string;
  className?: string;
}

export const GOV_LOGOS: readonly GovernmentLogo[] = [
  {
    id: "dubai-gov",
    name: "Government of Dubai",
    logo: "/images/partners/brands/d-3.png",
    glowColor: "rgba(152, 123, 165, 0.45)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[180px] sm:max-w-[220px] lg:max-w-[260px]",
  },
  {
    id: "expo-2020",
    name: "Expo 2020 Dubai",
    logo: "/images/partners/expo-2020.png",
    glowColor: "rgba(152, 123, 165, 0.45)",
    className: "h-11 sm:h-13 lg:h-15 max-w-[150px] sm:max-w-[180px] lg:max-w-[210px]",
  },
  {
    id: "museum-future",
    name: "Museum of the Future",
    logo: "/images/partners/museum-of-the-future.png",
    glowColor: "rgba(255, 255, 255, 0.4)",
    className: "h-11 sm:h-13 lg:h-15 max-w-[170px] sm:max-w-[210px] lg:max-w-[240px]",
  },
  {
    id: "szgmc",
    name: "Sheikh Zayed Grand Mosque Centre",
    logo: "/images/partners/brands/d-1.png",
    glowColor: "rgba(152, 123, 165, 0.45)",
    className: "h-11 sm:h-13 lg:h-15 max-w-[140px] sm:max-w-[170px] lg:max-w-[190px]",
  },
  {
    id: "presidential-affairs",
    name: "Ministry of Presidential Affairs",
    logo: "/images/partners/ministry-of-presidential-affairs.png",
    glowColor: "rgba(152, 123, 165, 0.45)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]",
  },
  {
    id: "dubai-municipality",
    name: "Dubai Municipality",
    logo: "/images/partners/brands/d-2.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-11 sm:h-13 lg:h-15 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "dubai-health",
    name: "Dubai Health Authority",
    logo: "/images/partners/dubai-health-authority.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "dubai-land",
    name: "Dubai Land Department",
    logo: "/images/partners/dubai-land-department.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]",
  },
  {
    id: "icp-identity",
    name: "Federal Authority for Identity & Citizenship",
    logo: "/images/partners/federal-authority-identity.png",
    glowColor: "rgba(152, 123, 165, 0.45)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]",
  },
  {
    id: "womens-union",
    name: "General Women's Union",
    logo: "/images/partners/general-womens-union.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]",
  },
  {
    id: "dubai-sports",
    name: "Dubai Sports Council",
    logo: "/images/partners/dubai-sports-council.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-10 sm:h-12 lg:h-13 max-w-[110px] sm:max-w-[130px] lg:max-w-[140px]",
  },
  {
    id: "family-care",
    name: "Family Care Authority",
    logo: "/images/partners/family-care-authority.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-11 sm:h-13 lg:h-16 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "human-resources",
    name: "Human Resources Department",
    logo: "/images/partners/human-resources-department.png",
    glowColor: "rgba(152, 123, 165, 0.4)",
    className: "h-10 sm:h-12 lg:h-15 max-w-[220px] sm:max-w-[270px] lg:max-w-[320px]",
  },
];

export const BRAND_LOGOS: readonly BrandLogoItem[] = [
  {
    id: "talabat",
    name: "Talabat",
    logo: "/images/partners/talabat.svg",
    color: "#ff5a00",
    className: "h-9 sm:h-11 lg:h-13 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "zain",
    name: "Zain",
    logo: "/images/partners/zain.svg",
    color: "#00a3e0",
    className: "h-10 sm:h-12 lg:h-14 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "orange",
    name: "Orange",
    logo: "/images/partners/orange.svg",
    color: "#ff7900",
    className: "h-9 sm:h-11 lg:h-13 max-w-[90px] sm:max-w-[105px] lg:max-w-[115px]",
  },
  {
    id: "mbc-group",
    name: "MBC Group",
    logo: "/images/partners/brands/c-6.png",
    color: "#ffffff",
    className: "h-10 sm:h-12 lg:h-14 max-w-[150px] sm:max-w-[180px] lg:max-w-[210px]",
  },
  {
    id: "shahid",
    name: "Shahid",
    logo: "/images/partners/brands/c-3.png",
    color: "#22c55e",
    className: "h-11 sm:h-13 lg:h-15 max-w-[130px] sm:max-w-[150px] lg:max-w-[170px]",
  },
  {
    id: "osn",
    name: "OSN+",
    logo: "/images/partners/osn-plus.svg",
    color: "#e11d48",
    className: "h-10 sm:h-12 lg:h-14 max-w-[150px] sm:max-w-[180px] lg:max-w-[200px]",
  },
  {
    id: "vox",
    name: "VOX Cinemas",
    logo: "/images/partners/vox-cinemas.svg",
    color: "#437dbd",
    className: "h-10 sm:h-12 lg:h-14 max-w-[180px] sm:max-w-[210px] lg:max-w-[240px]",
  },
  {
    id: "hbo",
    name: "HBO",
    logo: "/images/partners/hbo.svg",
    color: "#ffffff",
    className: "h-9 sm:h-11 lg:h-13 max-w-[150px] sm:max-w-[180px] lg:max-w-[200px]",
  },
  {
    id: "hulu",
    name: "Hulu",
    logo: "/images/partners/hulu-wordmark.svg",
    color: "#1ce783",
    className: "h-8 sm:h-10 lg:h-12 max-w-[160px] sm:max-w-[190px] lg:max-w-[220px]",
  },
  {
    id: "gitex",
    name: "GITEX Global",
    logo: "/images/partners/gitex-white.png",
    color: "#06b6d4",
    className: "h-10 sm:h-13 lg:h-15 max-w-[170px] sm:max-w-[200px] lg:max-w-[230px]",
  },
  {
    id: "etisalat",
    name: "Etisalat e&",
    logo: "/images/partners/brands/c-1.png",
    color: "#78b833",
    className: "h-10 sm:h-12 lg:h-14 max-w-[180px] sm:max-w-[220px] lg:max-w-[250px]",
  },
  {
    id: "amman-tv",
    name: "Amman TV",
    logo: "/images/partners/brands/c-4.png",
    color: "#ffffff",
    className: "h-10 sm:h-12 lg:h-13 max-w-[110px] sm:max-w-[130px] lg:max-w-[140px]",
  },
  {
    id: "hatta",
    name: "Hatta Dubai",
    logo: "/images/partners/hatta.png",
    color: "#22c55e",
    className: "h-10 sm:h-12 lg:h-13 max-w-[120px] sm:max-w-[140px] lg:max-w-[150px]",
  },
  {
    id: "delos",
    name: "Delos",
    logo: "/images/partners/delos.png",
    color: "#ffffff",
    className: "h-9 sm:h-11 lg:h-13 max-w-[180px] sm:max-w-[210px] lg:max-w-[240px]",
  },
  {
    id: "dmx",
    name: "Dubai Municipality Academy",
    logo: "/images/partners/dmx.png",
    color: "#ffffff",
    className: "h-8 sm:h-10 lg:h-12 max-w-[220px] sm:max-w-[260px] lg:max-w-[290px]",
  },
];
