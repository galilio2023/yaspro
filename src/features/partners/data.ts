export interface GovernmentLogo {
  id: string;
  name: string;
  logo: string;
  glowColor: string;
}

export interface BrandLogoItem {
  id: string;
  name: string;
  logo?: string;
  svg?: string;
  color: string;
}

export const GOV_LOGOS: readonly GovernmentLogo[] = [
  {
    id: "expo-2020",
    name: "Expo 2020 Dubai",
    logo: "/images/partners/expo-2020.png",
    glowColor: "rgba(217,151,38,0.5)",
  },
  {
    id: "museum-future",
    name: "Museum of the Future",
    logo: "/images/partners/museum-of-the-future.png",
    glowColor: "rgba(255,255,255,0.4)",
  },
  {
    id: "presidential-affairs",
    name: "Ministry of Presidential Affairs",
    logo: "/images/partners/ministry-of-presidential-affairs.png",
    glowColor: "rgba(217,151,38,0.5)", // Gold
  },
  {
    id: "dubai-health",
    name: "Dubai Health Authority",
    logo: "/images/partners/dubai-health-authority.png",
    glowColor: "rgba(245,158,11,0.4)",
  },
  {
    id: "dubai-land",
    name: "Dubai Land Department",
    logo: "/images/partners/dubai-land-department.png",
    glowColor: "rgba(217,119,6,0.4)",
  },
  {
    id: "icp-identity",
    name: "Federal Authority for Identity & Citizenship",
    logo: "/images/partners/federal-authority-identity.png",
    glowColor: "rgba(217,151,38,0.5)",
  },
  {
    id: "womens-union",
    name: "General Women's Union",
    logo: "/images/partners/general-womens-union.png",
    glowColor: "rgba(245,158,11,0.4)",
  },
  {
    id: "dubai-sports",
    name: "Dubai Sports Council",
    logo: "/images/partners/dubai-sports-council.png",
    glowColor: "rgba(217,119,6,0.4)",
  },
  {
    id: "family-care",
    name: "Family Care Authority",
    logo: "/images/partners/family-care-authority.png",
    glowColor: "rgba(245,158,11,0.4)",
  },
  {
    id: "human-resources",
    name: "Human Resources Department",
    logo: "/images/partners/human-resources-department.png",
    glowColor: "rgba(217,119,6,0.4)",
  },
];

export const BRAND_LOGOS: readonly BrandLogoItem[] = [
  {
    id: "talabat",
    name: "Talabat",
    color: "#ff5a00",
    svg: `<svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
      <rect width="36" height="36" rx="9" fill="#FF5A00"/>
      <path d="M12 11h12v4.5H19.5V25h-5v-9.5H12V11z" fill="#FFFFFF"/>
      <text x="44" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="19" letter-spacing="-0.5">talabat</text>
    </svg>`,
  },
  {
    id: "zain",
    name: "Zain",
    color: "#00a3e0",
    svg: `<svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
      <circle cx="18" cy="18" r="14" stroke="#00A3E0" stroke-width="4"/>
      <circle cx="25" cy="14" r="4" fill="#10B981"/>
      <text x="40" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="20" letter-spacing="1">ZAIN</text>
    </svg>`,
  },
  {
    id: "orange",
    name: "Orange",
    color: "#ff7900",
    svg: `<svg viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
      <rect x="2" y="5" width="26" height="26" rx="5" fill="#FF7900"/>
      <text x="36" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="700" font-size="19" letter-spacing="-0.3">orange</text>
    </svg>`,
  },
  {
    id: "gitex",
    name: "GITEX Global",
    color: "#f59e0b",
    svg: `<svg viewBox="0 0 145 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
      <defs>
        <linearGradient id="gitex-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#d97706"/>
        </linearGradient>
      </defs>
      <path d="M6 10l8-4 8 4v16l-8 4-8-4V10z" stroke="url(#gitex-g)" stroke-width="2.5" fill="none"/>
      <circle cx="14" cy="18" r="3" fill="#f59e0b"/>
      <text x="30" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="18" letter-spacing="0.5">GITEX<tspan fill="#f59e0b">.DXB</tspan></text>
    </svg>`,
  },
  {
    id: "hbo-max",
    name: "HBO Max",
    color: "#5822b4",
    svg: `<svg viewBox="0 0 130 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <path d="M4 10h5.5v6h6V10H21v16h-5.5v-6h-6v6H4V10z" fill="#FFFFFF"/>
      <path d="M26 10h8c4.2 0 6.8 2.2 6.8 5.4 0 2-1.2 3.6-2.9 4.4 2.2.9 3.5 2.6 3.5 5 0 3.7-3.1 6-7.4 6H26V10zm5.6 4.6v3.5h2.4c1.3 0 2.2-.7 2.2-1.8s-.9-1.7-2.2-1.7h-2.4zm0 6v3.9h2.8c1.4 0 2.4-.8 2.4-2s-1-1.9-2.4-1.9h-2.8z" fill="#FFFFFF"/>
      <path d="M51 18c0-4.6 3.7-8.2 8.3-8.2s8.3 3.6 8.3 8.2-3.7 8.2-8.3 8.2-8.3-3.6-8.3-8.2zm11 0c0-2.6-1.1-4.6-2.7-4.6s-2.7 2-2.7 4.6 1.1 4.6 2.7 4.6 2.7-2 2.7-4.6z" fill="#FFFFFF"/>
      <text x="75" y="24" fill="#A855F7" font-family="system-ui, sans-serif" font-weight="900" font-size="17" letter-spacing="1">MAX</text>
    </svg>`,
  },
  {
    id: "hulu",
    name: "Hulu",
    color: "#1ce783",
    svg: `<svg viewBox="0 0 90 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-7 w-auto">
      <text x="2" y="25" fill="#1CE783" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" letter-spacing="-0.8">hulu</text>
    </svg>`,
  },
  {
    id: "osn",
    name: "OSN+",
    color: "#e11d48",
    svg: `<svg viewBox="0 0 105 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <text x="4" y="25" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" letter-spacing="1.5">osn</text>
      <text x="64" y="25" fill="#E11D48" font-family="system-ui, sans-serif" font-weight="900" font-size="22">+</text>
    </svg>`,
  },
  {
    id: "vox",
    name: "VOX Cinemas",
    color: "#fbbf24",
    svg: `<svg viewBox="0 0 145 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <text x="4" y="25" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="21" letter-spacing="2">VOX</text>
      <text x="68" y="24" fill="#9CA3AF" font-family="system-ui, sans-serif" font-weight="600" font-size="12" letter-spacing="3">CINEMAS</text>
    </svg>`,
  },
  {
    id: "dmx",
    name: "DMX Global",
    color: "#f59e0b",
    svg: `<svg viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <text x="4" y="25" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="22" letter-spacing="1">dm</text>
      <text x="48" y="25" fill="#f59e0b" font-family="system-ui, sans-serif" font-weight="900" font-size="22">x</text>
      <text x="70" y="22" fill="#9ca3af" font-family="system-ui, sans-serif" font-weight="700" font-size="10" letter-spacing="1.5">GLOBAL</text>
    </svg>`,
  },
  {
    id: "hatta",
    name: "Hatta Dubai",
    color: "#22c55e",
    svg: `<svg viewBox="0 0 115 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <path d="M10 24L20 8l10 16H10z" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
      <path d="M17 18h6" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
      <text x="36" y="23" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="16" letter-spacing="2.5">HATTA</text>
    </svg>`,
  },
  {
    id: "delos",
    name: "Delos",
    color: "#d97706",
    svg: `<svg viewBox="0 0 115 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
      <circle cx="16" cy="18" r="10" stroke="#FFFFFF" stroke-width="2.5" fill="none"/>
      <path d="M12 18a4 4 0 0 1 8 0" stroke="#d97706" stroke-width="2.5"/>
      <text x="34" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="19" letter-spacing="-0.5">delos</text>
    </svg>`,
  },
];
