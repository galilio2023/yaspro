export interface DigitalTwinLocation {
  id: string;
  name: string;
  arabicName: string;
  region: string;
  country: string;
  countryFlag: string;
  category: "Giga-Project" | "Heritage & Culture" | "Metropolis" | "Studio Volume";
  description: string;
  unrealEngineVersion: "5.4.4 Nanite & Lumen";
  polyCount: string;
  textureResolution: string;
  image: string;
  defaultTimeOfDay: "golden_hour" | "high_noon" | "cyber_night" | "blue_hour";
  permitSavingsPercentage: number;
  featuredPill: string;
}

export interface EnterpriseCreatorItem {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  avatar: string;
  totalFollowers: string;
  rawFollowers: number;
  niche: string;
  mawthooqStatus: "Verified & Licensed" | "GAMR Registered";
  mawthooqLicenseId: string;
  saudiReachPct: number;
  uaeReachPct: number;
  topAudienceAge: string;
  baseCampaignFeeAED: number;
  flag: string;
}

export interface ObVanTechnicalSpecs {
  model: string;
  broadcastStandard: string;
  camerasCount: string;
  opticalFiberRuns: string;
  replayEngine: string;
  audioInfrastructure: string;
  uplinkLatency: string;
  powerRedundancy: string;
  operationalRadius: string[];
}

export interface EnterprisePackageTier {
  id: string;
  name: string;
  arabicName: string;
  badge?: string;
  targetClientele: string;
  monthlyInvestment: string;
  yearlyInvestment: string;
  currency: string;
  features: string[];
  slaGuarantee: string;
  popular?: boolean;
}
