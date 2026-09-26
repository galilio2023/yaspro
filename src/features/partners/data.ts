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
    id: "presidential-affairs",
    name: "Ministry of Presidential Affairs",
    logo: "/images/partners/ministry-of-presidential-affairs.png",
    glowColor: "rgba(217,151,38,0.5)", // Gold
  },
  {
    id: "dubai-health",
    name: "Dubai Health Authority",
    logo: "/images/partners/dubai-health-authority.png",
    glowColor: "rgba(6,182,212,0.5)", // Cyan
  },
  {
    id: "dubai-land",
    name: "Dubai Land Department",
    logo: "/images/partners/dubai-land-department.png",
    glowColor: "rgba(168,85,247,0.5)", // Purple
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
    glowColor: "rgba(244,114,182,0.5)", // Rose
  },
  {
    id: "dubai-sports",
    name: "Dubai Sports Council",
    logo: "/images/partners/dubai-sports-council.png",
    glowColor: "rgba(59,130,246,0.5)", // Blue
  },
  {
    id: "family-care",
    name: "Family Care Authority",
    logo: "/images/partners/family-care-authority.png",
    glowColor: "rgba(168,85,247,0.5)",
  },
  {
    id: "human-resources",
    name: "Human Resources Department",
    logo: "/images/partners/human-resources-department.png",
    glowColor: "rgba(6,182,212,0.5)",
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
      <circle cx="25" cy="14" r="4" fill="#9333EA"/>
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
    color: "#06b6d4",
    svg: `<svg viewBox="0 0 145 36" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-9 w-auto">
      <defs>
        <linearGradient id="gitex-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06B6D4"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
      </defs>
      <path d="M6 10l8-4 8 4v16l-8 4-8-4V10z" stroke="url(#gitex-g)" stroke-width="2.5" fill="none"/>
      <circle cx="14" cy="18" r="3" fill="#06B6D4"/>
      <text x="30" y="24" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="18" letter-spacing="0.5">GITEX<tspan fill="#06B6D4">.DXB</tspan></text>
    </svg>`,
  },
  {
    id: "dmx",
    name: "DMX Global",
    logo: "/images/partners/dmx.png",
    color: "#a855f7",
  },
  {
    id: "hatta",
    name: "Hatta Dubai",
    logo: "/images/partners/hatta.png",
    color: "#22c55e",
  },
  {
    id: "delos",
    name: "Delos",
    logo: "/images/partners/delos.png",
    color: "#06b6d4",
  },
  {
    id: "c-1",
    name: "Partner Brand 1",
    logo: "/images/partners/brands/c-1.png",
    color: "#eab308",
  },
  {
    id: "c-2",
    name: "Partner Brand 2",
    logo: "/images/partners/brands/c-2.png",
    color: "#3b82f6",
  },
  {
    id: "d-1",
    name: "Partner Brand 3",
    logo: "/images/partners/brands/d-1.png",
    color: "#ec4899",
  },
  {
    id: "f-3",
    name: "Partner Brand 4",
    logo: "/images/partners/brands/f-3.png",
    color: "#06b6d4",
  },
];
